# Awan platform backend on Frappe.
#
# The Awan engine (frontend/src/legacy/js) has a built-in "server mode": shared data, live sync
# between devices, a family portal and server-side AI keys. frontend/src/legacy/bridge.js maps
# that mode's /api/* calls to the methods here, so the engine's own sync logic (three-way merge,
# conflict retry, family view, admin page) runs unchanged against Frappe.
#
# Storage:
#   - children (state key "patients")  -> Awan Patient, one document per child (with version history)
#   - every other shared key            -> Awan State Entry, one row per key with a revision
#   - a global revision counter          -> the Awan State Entry row "__rev__", row-locked on every write
# Each write is logged in Awan Change Log.
import base64
import hashlib
import hmac
import json
import re
import time

import frappe
import requests
from frappe.utils.password import get_encryption_key, update_password

from awan_care import family as fam

ENTRY = "Awan State Entry"
LOG = "Awan Change Log"
PATIENT = "Awan Patient"
SETTINGS = "Awan Settings"
COUNTER = "__rev__"
PATIENTS = "patients"

KEY_RE = re.compile(r"^[A-Za-z0-9_$-]{1,64}$")
MAX_BYTES = 25 * 1024 * 1024
FAMILY_COOKIE = "awan_family"
FAMILY_TTL = 90 * 24 * 3600
LEASE_TTL = 75

# Frappe role -> Awan role (first match wins)
ROLE_MAP = [
	("Awan Management", "management"),
	("System Manager", "management"),
	("Awan Supervisor", "supervisor"),
	("Awan Reception", "reception"),
	("Awan Staff", "staff"),
]
AWAN_TO_FRAPPE = {
	"management": "Awan Management",
	"supervisor": "Awan Supervisor",
	"reception": "Awan Reception",
	"staff": "Awan Staff",
}

# Center configuration only management may change. Other roles' edits to these keys are
# rejected on the server and their devices are rolled back to the server copy.
MANAGEMENT_KEYS = {"center", "rolePermissions", "departments", "departmentPrograms", "sessionPrice"}

# Patient columns kept on Awan Patient for lists/search; the full record lives in `data`
PATIENT_COLUMNS = {
	"name": "patient_name",
	"file": "file_no",
	"status": "status",
	"age": "age",
	"need": "need",
	"program": "program",
	"school": "school",
	"guardian": "guardian",
	"phone": "phone",
	"code": "family_code",
	"schoolCode": "school_code",
}


# ======================================================================
# Who is calling
# ======================================================================
def _staff_actor(user):
	roles = set(frappe.get_roles(user))
	role = next((awan for frappe_role, awan in ROLE_MAP if frappe_role in roles), None)
	if not role:
		return None
	info = frappe.db.get_value("User", user, ["full_name", "username", "awan_staff_id"], as_dict=True) or {}
	return {
		"kind": "staff",
		"id": user,
		"user": user,
		"role": role,
		"name": info.get("full_name") or user,
		"username": info.get("username") or user,
		"staffId": info.get("awan_staff_id") or None,
	}


def _actor():
	user = frappe.session.user
	if user and user != "Guest":
		return _staff_actor(user)
	return _family_from_cookie()


def _require(kind=None, roles=None):
	actor = _actor()
	if not actor:
		_status(401)
		return None
	if kind and actor["kind"] != kind:
		_status(403)
		return None
	if roles and actor.get("role") not in roles:
		_status(403)
		return None
	return actor


def _status(code):
	frappe.local.response.http_status_code = code


def _err(code, message):
	_status(code)
	return {"error": message}


def _public_user(actor):
	if actor["kind"] == "family":
		return {"role": "family", "code": actor["code"], "name": actor["name"]}
	return {k: actor[k] for k in ("id", "name", "username", "role", "staffId")}


# ======================================================================
# Family session: a signed cookie (survives cache clears and restarts)
# ======================================================================
def _sign(payload):
	return hmac.new(get_encryption_key().encode(), payload.encode(), hashlib.sha256).hexdigest()


def _phone_tag(phone):
	return hashlib.sha256(("awan:" + fam.norm_phone(phone)).encode()).hexdigest()[:16]


def _family_token(patient_id, code, phone):
	body = json.dumps({"p": patient_id, "c": code, "h": _phone_tag(phone), "e": int(time.time()) + FAMILY_TTL})
	payload = base64.urlsafe_b64encode(body.encode()).decode().rstrip("=")
	return payload + "." + _sign(payload)


def _family_from_cookie():
	token = (frappe.request.cookies.get(FAMILY_COOKIE) if frappe.request else None) or ""
	if "." not in token:
		return None
	payload, sig = token.rsplit(".", 1)
	if not hmac.compare_digest(sig, _sign(payload)):
		return None
	try:
		data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
	except Exception:
		return None
	if data.get("e", 0) < time.time() or not _family_portal_on():
		return None
	# The child must still exist with the same code and phone (changing either logs the family out)
	row = frappe.db.get_value(PATIENT, data.get("p"), ["family_code", "phone", "guardian", "patient_name", "archived"], as_dict=True)
	if not row or row.archived or (row.family_code or "").upper() != data.get("c") or _phone_tag(row.phone) != data.get("h"):
		return None
	return {
		"kind": "family",
		"patient_id": data["p"],
		"code": data["c"],
		"name": row.guardian or ("ولي أمر " + (row.patient_name or "")),
		"role": "family",
	}


def _family_portal_on():
	# on unless management switched it off in Awan Settings
	row = frappe.db.sql("SELECT `value` FROM `tabSingles` WHERE `doctype`=%s AND `field`='family_portal'", SETTINGS)
	return not row or frappe.utils.cint(row[0][0]) == 1


def _set_family_cookie(token, max_age):
	frappe.local.cookie_manager.set_cookie(FAMILY_COOKIE, token, max_age=max_age, httponly=True, samesite="Lax")


# ======================================================================
# Storage
# ======================================================================
def _dumps(value):
	return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def _lock_counter():
	"""Serialize all writes on the counter row; returns the current global revision.

	The lock is the first statement of a fresh transaction: everything read after it sees the
	latest committed data (a snapshot taken earlier in the request could miss another device's
	write, and MariaDB would refuse the update with error 1020).
	"""
	frappe.db.commit()  # nothing written yet in this request
	sql = f"SELECT `revision` FROM `tab{ENTRY}` WHERE `name`=%s FOR UPDATE"
	row = frappe.db.sql(sql, COUNTER)
	if not row:
		try:
			frappe.get_doc({"doctype": ENTRY, "state_key": COUNTER, "revision": 0}).db_insert()
		except frappe.DuplicateEntryError:
			pass
		row = frappe.db.sql(sql, COUNTER)
	return int(row[0][0] or 0)


def _set_counter(rev):
	frappe.db.sql(f"UPDATE `tab{ENTRY}` SET `revision`=%s WHERE `name`=%s", (rev, COUNTER))


def _current_revision():
	return int(frappe.db.get_value(ENTRY, COUNTER, "revision") or 0)


def _entries():
	"""{key: {revision, client, data(str|None)}} for every shared key except the counter."""
	rows = frappe.get_all(ENTRY, fields=["name", "revision", "client", "data"], filters={"name": ["!=", COUNTER]}, limit_page_length=0)
	return {r.name: r for r in rows}


def _load_patients():
	rows = frappe.get_all(PATIENT, fields=["patient_id", "data", "archived"], order_by="creation asc", limit_page_length=0)
	out = []
	for r in rows:
		rec = frappe.parse_json(r.data) if r.data else {}
		rec["id"] = r.patient_id
		rec["archived"] = bool(r.archived)
		out.append(rec)
	return out


def _value(key, entry):
	if key == PATIENTS:
		return _load_patients()
	return json.loads(entry.data) if entry.data else None


def _all_data(entries=None):
	entries = _entries() if entries is None else entries
	data = {}
	for key, entry in entries.items():
		value = _value(key, entry)
		if value is not None:
			data[key] = value
	if PATIENTS not in data and frappe.db.count(PATIENT):
		data[PATIENTS] = _load_patients()
	return data


def _write_patients(records, allow_delete=True):
	"""Upsert changed children and delete removed ones; returns (changed_ids, deleted_ids, kept_ids).

	Without allow_delete, children missing from `records` stay on the server (kept_ids).
	"""
	existing = {}
	for r in frappe.get_all(PATIENT, fields=["name", "data", "archived"], limit_page_length=0):
		# the record exactly as _load_patients hands it out, to compare by content (not JSON formatting)
		rec = frappe.parse_json(r.data) if r.data else {}
		rec["id"], rec["archived"] = r.name, bool(r.archived)
		existing[r.name] = rec
	changed, seen = [], set()
	for rec in records or []:
		if not isinstance(rec, dict):
			continue
		pid = str(rec.get("id") or "").strip()
		if not pid or not rec.get("name"):
			continue
		seen.add(pid)
		if existing.get(pid) == rec:
			continue
		data = _dumps(rec)
		values = {col: str(rec.get(key) or "")[:140] for key, col in PATIENT_COLUMNS.items()}
		values["family_code"] = values["family_code"].upper()
		values["archived"] = 1 if rec.get("archived") else 0
		values["data"] = data
		if pid in existing:
			doc = frappe.get_doc(PATIENT, pid)
			doc.update(values)
			doc.save(ignore_permissions=True)
		else:
			frappe.get_doc({"doctype": PATIENT, "patient_id": pid, **values}).insert(ignore_permissions=True)
		changed.append(pid)
	missing = [pid for pid in existing if pid not in seen]
	if not allow_delete:
		return changed, [], missing
	for pid in missing:
		frappe.delete_doc(PATIENT, pid, ignore_permissions=True)
	return changed, missing, []


def _write_key(key, value, rev, client, entries, allow_delete=True):
	"""Store one key at revision `rev`. Returns child ids touched (for patients) for the log."""
	touched = None
	if key == PATIENTS:
		if value is None:
			return None  # never wipe all children through a deleted key
		changed, deleted, kept = _write_patients(value, allow_delete)
		touched = {"changed": changed, "deleted": deleted, "kept": kept}
		data = None
	else:
		data = None if value is None else _dumps(value)
	if key in entries:
		frappe.db.set_value(ENTRY, key, {"revision": rev, "client": client, "data": data}, update_modified=True)
	else:
		frappe.get_doc({"doctype": ENTRY, "state_key": key, "revision": rev, "client": client, "data": data}).insert(ignore_permissions=True)
	return touched


def _sanitize(key, value):
	"""Keep API keys out of the shared data: the server holds them (Awan Settings)."""
	if key == "ai" and isinstance(value, dict) and value.get("key") not in (None, "", "server"):
		value = {**value, "key": "server"}
	if key == "rdCfg" and isinstance(value, dict) and value.get("gkey") not in (None, "", "server"):
		value = {**value, "gkey": "server"}
	return value


def _log(action, actor, key=None, revision=None, client=None, patient_id=None, details=None):
	frappe.get_doc(
		{
			"doctype": LOG,
			"action": action,
			"state_key": key,
			"actor": (actor or {}).get("user") or ("family:" + (actor or {}).get("patient_id", "")) if actor else None,
			"role": (actor or {}).get("role"),
			"revision": revision,
			"client": client,
			"patient_id": patient_id,
			"details": details if details is None or isinstance(details, str) else _dumps(details),
		}
	).insert(ignore_permissions=True)


def _broadcast(rev, client):
	# Only the revision number goes out; each device then pulls what it's allowed to see
	frappe.publish_realtime("awan_state", {"v": rev, "by": client}, room="website", after_commit=True)


def _staff_users():
	roles = [r for r, _ in ROLE_MAP]
	users = frappe.get_all("Has Role", filters={"role": ["in", roles], "parenttype": "User"}, pluck="parent", distinct=True)
	enabled = set(frappe.get_all("User", filters={"name": ["in", users or [""]], "enabled": 1}, pluck="name"))
	return [u for u in users if u in enabled and u != "Guest"]


def _notify_staff(title, body):
	for user in _staff_users():
		frappe.publish_realtime("awan_notify", {"title": title, "body": body}, user=user, after_commit=True)


def _notify_new_messages(before, after, actor):
	if actor["kind"] != "family" or not isinstance(after, list):
		return
	old = {m.get("id") for m in (before or []) if isinstance(m, dict)}
	for m in after[:50]:
		if isinstance(m, dict) and m.get("id") not in old:
			_notify_staff("رسالة من " + actor["name"], str(m.get("text") or "")[:180])


# ======================================================================
# Health, session
# ======================================================================
@frappe.whitelist(allow_guest=True)
def health():
	entries = frappe.db.count(ENTRY, {"name": ["!=", COUNTER]})
	return {
		"name": "awan",
		"backend": "frappe",
		"users": len(_staff_users()),
		"empty": entries == 0 and frappe.db.count(PATIENT) == 0,
		"features": _features(),
		"pushKey": None,
	}


@frappe.whitelist(allow_guest=True)
def me():
	actor = _actor()
	if not actor:
		return _err(401, "لازم تسجّل دخول")
	return {"user": _public_user(actor)}


# Guessing protection: 10 wrong attempts per IP lock the family sign-in for 15 minutes.
# Only failures count, so a center iPad can sign in many families in a row.
FAIL_LIMIT = 10
FAIL_WINDOW = 15 * 60


def _fail_key():
	return "awan_family_fail:" + (frappe.local.request_ip or "?")


@frappe.whitelist(allow_guest=True, methods=["POST"])
def family_login(code=None, phone=None):
	if not _family_portal_on():
		return _err(403, "بوابة الأسر مقفولة حالياً")
	fails = frappe.cache.get_value(_fail_key()) or 0
	if fails >= FAIL_LIMIT:
		return _err(429, "محاولات كتير غلط — استنى ربع ساعة")
	code = str(code or "").strip().upper()
	phone_norm = fam.norm_phone(phone)
	rows = []
	if code and len(phone_norm) >= 9:
		rows = frappe.get_all(PATIENT, filters={"family_code": code, "archived": 0}, fields=["name", "family_code", "phone", "guardian", "patient_name"])
	row = next((r for r in rows if (r.family_code or "").upper() == code and fam.norm_phone(r.phone) == phone_norm), None)
	if not row:
		frappe.cache.set_value(_fail_key(), fails + 1, expires_in_sec=FAIL_WINDOW)
		return _err(401, "الكود أو رقم الجوال مش مطابقين لبيانات المركز")
	frappe.cache.delete_value(_fail_key())
	_set_family_cookie(_family_token(row.name, code, row.phone), FAMILY_TTL)
	actor = {"kind": "family", "patient_id": row.name, "code": code, "role": "family", "name": row.guardian or ("ولي أمر " + row.patient_name)}
	_log("family-login", actor, patient_id=row.name)
	return {"user": _public_user(actor)}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def family_logout():
	_set_family_cookie("", 0)
	return {"ok": True}


# ======================================================================
# Shared data and sync
# ======================================================================
@frappe.whitelist(allow_guest=True)
def get_state(since=None):
	actor = _require()
	if not actor:
		return {"error": "لازم تسجّل دخول"}
	rev = _current_revision()
	entries = _entries()
	if since not in (None, ""):
		since = int(since or 0)
		changed = {}
		for key, entry in entries.items():
			if int(entry.revision or 0) > since:
				changed[key] = _value(key, entry)
		if actor["kind"] == "family":
			changed = fam.filter_set(changed, actor["patient_id"])
		return {"keys": list(changed), "set": changed, "v": rev}
	data = _all_data(entries)
	if actor["kind"] == "family":
		data = fam.filter_set(data, actor["patient_id"])
	return {"data": data, "v": rev}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def patch_state(base=None, client=None, set=None):  # noqa: A002 - the engine sends `set`
	# Under load MariaDB may abort one of two waiting writes (deadlock); the whole write is then
	# retried here instead of failing on the device. Rollback also drops the queued realtime events.
	for attempt in range(4):
		try:
			return _patch_state(base, client, set)
		except (frappe.QueryDeadlockError, frappe.QueryTimeoutError):
			frappe.db.rollback()
			if attempt == 3:
				raise
			time.sleep(0.05 * (attempt + 1))


def _patch_state(base, client, set):  # noqa: A002
	actor = _require()
	if not actor:
		return {"error": "لازم تسجّل دخول"}
	values = frappe.parse_json(set) if isinstance(set, str) else set
	if not isinstance(values, dict):
		return _err(400, "بيانات غير صالحة")
	if len(_dumps(values).encode()) > MAX_BYTES:
		return _err(413, "البيانات أكبر من المسموح")
	client = str(client or "")[:40] or "anon"
	values = {k: v for k, v in values.items() if KEY_RE.match(k) and k != COUNTER}
	try:
		base = int(base or 0)
	except (TypeError, ValueError):
		base = 0

	rev = _lock_counter()
	entries = _entries()

	if actor["kind"] == "family":
		current = _all_data(entries)
		accepted, ignored = fam.merge_in(values, current, actor["patient_id"])
		if ignored:
			_log("rejected", actor, revision=rev, client=client, patient_id=actor["patient_id"], details={"keys": ignored})
		if not accepted:
			return {"v": rev}
		rev += 1
		for key, value in accepted.items():
			_write_key(key, value, rev, client, entries)
		_set_counter(rev)
		_log("family", actor, key=",".join(accepted)[:140], revision=rev, client=client, patient_id=actor["patient_id"])
		_notify_new_messages(current.get("messages"), accepted.get("messages"), actor)
		_broadcast(rev, client)
		return {"v": rev}

	# Staff: another device changed the same key since this device last synced -> hand back the newer copy,
	# the engine merges both edits and sends again
	clash = [k for k in values if k in entries and int(entries[k].revision or 0) > base and entries[k].client != client]
	if clash:
		_status(409)
		return {"set": {k: _value(k, entries[k]) for k in clash}, "v": rev}

	base_rev = rev
	allowed = {k: v for k, v in values.items() if actor["role"] == "management" or k not in MANAGEMENT_KEYS}
	refused = [k for k in values if k not in allowed]
	if not allowed and not refused:
		return {"v": rev}

	if allowed:
		rev += 1
		for key, value in allowed.items():
			# only management may delete a child's file
			touched = _write_key(key, _sanitize(key, value), rev, client, entries, allow_delete=actor["role"] == "management")
			if touched:
				for pid in touched["changed"]:
					_log("change", actor, key=PATIENTS, revision=rev, client=client, patient_id=pid)
				for pid in touched["deleted"]:
					_log("change", actor, key=PATIENTS, revision=rev, client=client, patient_id=pid, details="deleted")
				if touched["kept"]:
					refused.append(PATIENTS)
					_log("rejected", actor, key=PATIENTS, revision=rev, client=client, details={"delete": touched["kept"][:50]})
		others = [k for k in allowed if k != PATIENTS]
		if others:
			_log("change", actor, key=",".join(others)[:140], revision=rev, client=client)
	reply = {"v": rev}
	if refused:
		# Hand this device the server copy of what it may not change; legacy/bridge.js puts it back
		# on the device (a plain re-sync would let the engine's merge keep the local edit).
		# (a key the server never had stays as the device has it)
		reply["revert"] = {k: _value(k, entries.get(k)) for k in dict.fromkeys(refused) if k in entries or k == PATIENTS}
		_log("rejected", actor, key=",".join(dict.fromkeys(refused))[:140], revision=rev, client=client)
		frappe.publish_realtime(
			"awan_notify",
			{"title": "مش مسموح", "body": "التعديل ده للإدارة بس، ورجع زي ما كان."},
			user=actor["user"],
			after_commit=True,
		)

	if rev != base_rev:
		_set_counter(rev)
		_broadcast(rev, client)
	return reply


@frappe.whitelist(allow_guest=True, methods=["POST"])
def init_state(data=None):
	actor = _require("staff", roles=["management"])
	if not actor:
		return {"error": "للإدارة بس"}
	data = frappe.parse_json(data) if isinstance(data, str) else data
	if not isinstance(data, dict):
		return _err(400, "بيانات غير صالحة")
	rev = _lock_counter()
	entries = _entries()
	if entries or frappe.db.count(PATIENT):
		return _err(409, "السيرفر عليه بيانات بالفعل")
	rev += 1
	for key, value in data.items():
		if KEY_RE.match(key) and key != COUNTER:
			_write_key(key, _sanitize(key, value), rev, "init", entries)
	_set_counter(rev)
	_log("init", actor, revision=rev, details={"keys": len(data)})
	_broadcast(rev, "init")
	return {"v": rev}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def lease(client=None, name=None):
	"""Only one device in the center runs the automatic agents at a time."""
	actor = _require("staff")
	if not actor:
		return {"error": "غير مسموح"}
	client = str(client or "")[:40]
	now = time.time()
	cur = frappe.cache.get_value("awan_lease") or {}
	if client and (cur.get("until", 0) < now or cur.get("client") == client):
		cur = {"client": client, "name": str(name or actor["name"])[:80], "until": now + LEASE_TTL}
		frappe.cache.set_value("awan_lease", cur, expires_in_sec=LEASE_TTL)
	return {"leader": bool(client) and cur.get("client") == client, "holder": cur.get("name", "") if cur.get("until", 0) >= now else ""}


# ======================================================================
# Admin page ("السيرفر والحسابات") — accounts are Frappe users with Awan roles
# ======================================================================
def _awan_role_of(user):
	roles = set(frappe.get_roles(user))
	return next((awan for frappe_role, awan in ROLE_MAP if frappe_role in roles), None)


@frappe.whitelist(allow_guest=True)
def admin_users():
	if not _require("staff", roles=["management"]):
		return {"error": "للإدارة بس"}
	names = frappe.get_all("Has Role", filters={"role": ["in", [r for r, _ in ROLE_MAP]], "parenttype": "User"}, pluck="parent", distinct=True)
	rows = frappe.get_all("User", filters={"name": ["in", names or [""]]}, fields=["name", "full_name", "username", "enabled", "awan_staff_id"])
	return {
		"users": [
			{
				"id": r.name,
				"name": r.full_name or r.name,
				"username": r.username or r.name,
				"role": _awan_role_of(r.name),
				"staffId": r.awan_staff_id or None,
				"disabled": not r.enabled,
			}
			for r in rows
			if r.name not in ("Guest",)
		]
	}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def admin_user_add(name=None, username=None, role=None, password=None, staffId=None):  # noqa: N803
	actor = _require("staff", roles=["management"])
	if not actor:
		return {"error": "للإدارة بس"}
	username = str(username or "").strip().lower()
	if not re.match(r"^[a-z0-9._@-]{3,}$", username):
		return _err(400, "اسم المستخدم ٣ حروف إنجليزي على الأقل")
	if role not in AWAN_TO_FRAPPE:
		return _err(400, "دور غير معروف")
	if len(str(password or "")) < 8:
		return _err(400, "كلمة السر ٨ حروف على الأقل")
	email = username if "@" in username else f"{username}@awan.local"
	short = username.split("@")[0]
	if frappe.db.exists("User", email) or frappe.db.exists("User", {"username": short}):
		return _err(400, "اسم المستخدم ده موجود")
	user = frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"username": short,
			"first_name": str(name or short)[:80],
			"enabled": 1,
			"send_welcome_email": 0,
			"awan_staff_id": staffId or None,
			"roles": [{"role": AWAN_TO_FRAPPE[role]}],
		}
	)
	user.flags.ignore_permissions = True
	user.insert()
	update_password(user.name, password)
	_log("user", actor, details={"add": user.name, "role": role})
	return {"user": {"id": user.name, "name": user.full_name, "username": short, "role": role}}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def admin_user_set(id=None, password=None, disabled=None, role=None, name=None, staffId=None):  # noqa: A002, N803
	actor = _require("staff", roles=["management"])
	if not actor:
		return {"error": "للإدارة بس"}
	if not id or not frappe.db.exists("User", id) or id in ("Guest", "Administrator"):
		return _err(404, "الحساب مش موجود أو محمي")
	user = frappe.get_doc("User", id)
	disabled = frappe.parse_json(disabled) if isinstance(disabled, str) else disabled
	if disabled is True:
		if id == actor["user"]:
			return _err(400, "مينفعش توقف حسابك")
		managers = [u for u in _staff_users() if _awan_role_of(u) == "management"]
		if _awan_role_of(id) == "management" and len(managers) <= 1:
			return _err(400, "ده آخر حساب إدارة — مينفعش يتوقف")
	if password is not None:
		if len(str(password)) < 8:
			return _err(400, "كلمة السر ٨ حروف على الأقل")
		update_password(id, password, logout_all_sessions=id != actor["user"])
	if disabled is not None:
		user.enabled = 0 if disabled else 1
	if name:
		user.first_name, user.last_name = str(name)[:80], ""
	if staffId is not None:
		user.awan_staff_id = staffId or None
	if role in AWAN_TO_FRAPPE:
		user.set("roles", [r for r in user.roles if r.role not in AWAN_TO_FRAPPE.values()])
		user.append("roles", {"role": AWAN_TO_FRAPPE[role]})
	user.flags.ignore_permissions = True
	user.save()
	if disabled:
		frappe.sessions.clear_sessions(user=id, force=True)
	_log("user", actor, details={"edit": id, "fields": [k for k, v in {"password": password, "disabled": disabled, "role": role, "name": name}.items() if v is not None]})
	return {"ok": True}


def _settings():
	return frappe.get_single(SETTINGS)


def _secret(field):
	return _settings().get_password(field, raise_exception=False) or ""


def _features():
	return {"ai": bool(_secret("openai_api_key")), "places": bool(_secret("google_places_key")), "wa": False, "voice": False, "push": False}


@frappe.whitelist(allow_guest=True)
def admin_secrets():
	if not _require("staff", roles=["management"]):
		return {"error": "للإدارة بس"}
	note = "متاح على سيرفر Node بس — لسه متنقلش لـ Frappe"
	return {
		"openai": bool(_secret("openai_api_key")),
		"google": bool(_secret("google_places_key")),
		"wa": {"phoneId": "", "template": "", "lang": "ar", "token": False, "verify": False, "appSecret": False},
		"voice": {"enabled": False, "twilio": False, "human": "", "hours": "", "voice": "", "model": ""},
		"webhook": note,
		"voiceUrl": note,
	}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def admin_secrets_save(openai=None, google=None, **kwargs):
	actor = _require("staff", roles=["management"])
	if not actor:
		return {"error": "للإدارة بس"}
	doc = _settings()
	if openai:
		doc.openai_api_key = str(openai).strip()
	if google:
		doc.google_places_key = str(google).strip()
	doc.flags.ignore_permissions = True
	doc.save()
	_log("settings", actor, details={"saved": [k for k, v in {"openai": openai, "google": google}.items() if v]})
	return admin_secrets()


@frappe.whitelist(allow_guest=True)
def backup():
	actor = _require("staff", roles=["management"])
	if not actor:
		frappe.throw("للإدارة بس", frappe.PermissionError)
	_log("settings", actor, details="backup-download")
	payload = {"app": "awan", "backend": "frappe", "createdAt": frappe.utils.now(), "v": _current_revision(), "data": _all_data()}
	frappe.response.filename = f"awan-backup-{frappe.utils.today()}.json"
	frappe.response.filecontent = _dumps(payload)
	frappe.response.type = "download"


# ======================================================================
# OpenAI and Google pass-through: the keys stay on the server
# ======================================================================
OPENAI_PATH = re.compile(r"^[A-Za-z0-9_./-]{1,120}$")


@frappe.whitelist(allow_guest=True, methods=["POST"])
def ai_proxy(path=None, method="POST", body=None, multipart=None, content_type=None):
	if not _require("staff"):
		return {"error": {"message": "لازم تسجّل دخول"}}
	path = str(path or "")
	if not OPENAI_PATH.match(path) or ".." in path:
		return _err(400, "مسار غير صالح")
	key = _secret("openai_api_key")
	if not key:
		return {"status": 503, "content_type": "application/json", "body": _dumps({"error": {"message": "مفتاح OpenAI مش متسجل — حطه في Awan Settings"}})}
	method = str(method or "POST").upper()
	headers = {"Authorization": "Bearer " + key}
	kwargs = {}
	if multipart:
		mp = frappe.parse_json(multipart) if isinstance(multipart, str) else multipart
		kwargs["data"] = [(f["name"], f["value"]) for f in mp.get("fields", [])]
		kwargs["files"] = [
			(f["name"], (f.get("filename") or "file", base64.b64decode(f["b64"]), f.get("type") or "application/octet-stream"))
			for f in mp.get("files", [])
		]
	elif body is not None:
		headers["Content-Type"] = content_type or "application/json"
		kwargs["data"] = body.encode() if isinstance(body, str) else _dumps(body).encode()
	try:
		r = requests.request(method, "https://api.openai.com/v1/" + path, headers=headers, timeout=110, **kwargs)
	except requests.RequestException as e:
		return {"status": 502, "content_type": "application/json", "body": _dumps({"error": {"message": "تعذّر الوصول لـ OpenAI: " + str(e)}})}
	return {"status": r.status_code, "content_type": r.headers.get("Content-Type", "application/json"), "body": r.text}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def places_search(body=None, field_mask=None):
	if not _require("staff"):
		return {"error": {"message": "لازم تسجّل دخول"}}
	key = _secret("google_places_key")
	if not key:
		return {"status": 503, "content_type": "application/json", "body": _dumps({"error": {"message": "مفتاح Google Places مش متسجل — حطه في Awan Settings"}})}
	headers = {"X-Goog-Api-Key": key, "Content-Type": "application/json"}
	if field_mask:
		headers["X-Goog-FieldMask"] = str(field_mask)[:500]
	try:
		r = requests.post(
			"https://places.googleapis.com/v1/places:searchText",
			headers=headers,
			data=(body if isinstance(body, str) else _dumps(body or {})).encode(),
			timeout=30,
		)
	except requests.RequestException as e:
		return {"status": 502, "content_type": "application/json", "body": _dumps({"error": {"message": str(e)}})}
	return {"status": r.status_code, "content_type": r.headers.get("Content-Type", "application/json"), "body": r.text}
