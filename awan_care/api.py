import json
import re

import frappe
from frappe.rate_limiter import rate_limit

# Columns kept on the DocType for search/lists; everything else of the record lives in `data`
COLUMNS = {
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


def _require_user():
	if frappe.session.user == "Guest":
		frappe.throw("سجّل الدخول الأول", frappe.PermissionError)


@frappe.whitelist()
def get_patients():
	_require_user()
	frappe.has_permission("Awan Patient", "read", throw=True)
	rows = frappe.get_all(
		"Awan Patient", fields=["patient_id", "data", "archived"], order_by="creation asc", limit_page_length=0
	)
	out = []
	for r in rows:
		rec = frappe.parse_json(r.data) if r.data else {}
		rec["id"] = r.patient_id
		rec["archived"] = bool(r.archived)
		out.append(rec)
	return out


@frappe.whitelist(methods=["POST"])
def save_patients(changed=None, deleted=None):
	"""Upsert changed child records and delete removed ones, in one transaction."""
	_require_user()
	changed = frappe.parse_json(changed) or []
	deleted = frappe.parse_json(deleted) or []
	saved = []
	for rec in changed:
		pid = str(rec.get("id") or "").strip()
		if not pid or not rec.get("name"):
			continue
		values = {col: str(rec.get(key) or "")[:140] for key, col in COLUMNS.items()}
		values["archived"] = 1 if rec.get("archived") else 0
		values["data"] = json.dumps(rec, ensure_ascii=False)
		if frappe.db.exists("Awan Patient", pid):
			doc = frappe.get_doc("Awan Patient", pid)
			doc.update(values)
			doc.save()
		else:
			doc = frappe.get_doc({"doctype": "Awan Patient", "patient_id": pid, **values})
			doc.insert()
		saved.append(pid)
	removed = []
	for pid in deleted:
		if frappe.db.exists("Awan Patient", pid):
			frappe.delete_doc("Awan Patient", pid)
			removed.append(pid)
	return {"saved": saved, "deleted": removed}


CENTER_STATE_NAME = "center"
CENTER_STATE_PRIVATE_KEYS = {
	"patients",
	"ai",
	"facilities",
	"role",
	"view",
	"portal",
	"parentTab",
	"patientId",
	"currentStaffId",
	"staffSection",
	"familySession",
	"facilitySession",
	"lang",
	"theme",
	"ai_local",
}
CENTER_STATE_PRIVATE_FIELD = re.compile(r"(password|secret|token|api.?key|credential|authorization)", re.I)
CENTER_STATE_MAX_BYTES = 12 * 1024 * 1024


def _contains_private_state(value):
	if isinstance(value, dict):
		return any(
			key in CENTER_STATE_PRIVATE_KEYS
			or CENTER_STATE_PRIVATE_FIELD.search(str(key))
			or _contains_private_state(item)
			for key, item in value.items()
		)
	if isinstance(value, list):
		return any(_contains_private_state(item) for item in value)
	return False


def _center_state_data(doc):
	return frappe.parse_json(doc.data) if doc and doc.data else {}


def _get_center_state_doc(create=False):
	if frappe.db.exists("Awan Center State", CENTER_STATE_NAME):
		return frappe.get_doc("Awan Center State", CENTER_STATE_NAME)
	if not create:
		return None
	try:
		return frappe.get_doc(
			{
				"doctype": "Awan Center State",
				"state_id": CENTER_STATE_NAME,
				"revision": 0,
				"data": "{}",
			}
		).insert(ignore_permissions=True)
	except frappe.DuplicateEntryError:
		return frappe.get_doc("Awan Center State", CENTER_STATE_NAME)


@frappe.whitelist()
def get_center_state():
	"""Return the current Frappe site's shared operating data."""
	_require_user()
	frappe.has_permission("Awan Center State", "read", throw=True)
	doc = _get_center_state_doc()
	if not doc:
		return {"revision": 0, "data": {}}
	return {"revision": int(doc.revision or 0), "data": _center_state_data(doc)}


@frappe.whitelist(methods=["POST"])
def save_center_state(base_revision=None, changed=None):
	"""Save changed top-level operating keys with optimistic concurrency control."""
	_require_user()
	frappe.has_permission("Awan Center State", "write", throw=True)
	try:
		base_revision = int(base_revision or 0)
	except (TypeError, ValueError):
		frappe.throw("إصدار مزامنة غير صالح")
	if base_revision < 0:
		frappe.throw("إصدار مزامنة غير صالح")
	changed = frappe.parse_json(changed) or {}
	if not isinstance(changed, dict):
		frappe.throw("بيانات المزامنة غير صالحة")
	if _contains_private_state(changed):
		frappe.throw("تحتوي المزامنة على بيانات محلية أو حساسة")
	if len(json.dumps(changed, ensure_ascii=False).encode("utf-8")) > CENTER_STATE_MAX_BYTES:
		frappe.throw("بيانات المزامنة أكبر من الحد المسموح")

	_get_center_state_doc(create=True)
	frappe.db.sql(
		"SELECT `name` FROM `tabAwan Center State` WHERE `name` = %s FOR UPDATE",
		CENTER_STATE_NAME,
	)
	doc = frappe.get_doc("Awan Center State", CENTER_STATE_NAME)
	current_revision = int(doc.revision or 0)
	current_data = _center_state_data(doc)
	if base_revision != current_revision:
		return {"conflict": True, "revision": current_revision, "data": current_data}

	next_data = dict(current_data)
	for key, value in changed.items():
		if value is None:
			next_data.pop(key, None)
		else:
			next_data[key] = value
	if len(json.dumps(next_data, ensure_ascii=False).encode("utf-8")) > CENTER_STATE_MAX_BYTES:
		frappe.throw("بيانات المركز أكبر من الحد المسموح")

	doc.revision = current_revision + 1
	doc.data = json.dumps(next_data, ensure_ascii=False, separators=(",", ":"))
	doc.save(ignore_permissions=True)
	return {"conflict": False, "revision": int(doc.revision)}


# ---------------- Sign-in ----------------
# Frappe roles → the Awan workspace role (decides which screens the platform shows)
AWAN_ROLES = [
	("Awan Management", "management"),
	("System Manager", "management"),
	("Awan Supervisor", "supervisor"),
	("Awan Reception", "reception"),
	("Awan Staff", "staff"),
]


def _me():
	user = frappe.session.user
	roles = set(frappe.get_roles(user))
	awan_role = next((r for frappe_role, r in AWAN_ROLES if frappe_role in roles), "staff")
	full_name = frappe.db.get_value("User", user, "full_name") or user
	return {"user": user, "full_name": full_name, "email": user, "awan_role": awan_role}


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=10, seconds=60)
def login(usr, pwd):
	"""Sign in with a Frappe account and return the Awan profile for that user."""
	frappe.form_dict.usr = usr
	frappe.form_dict.pwd = pwd
	result = frappe.local.login_manager.login()
	if result is False:
		# two-factor or forced password reset: Frappe already set the response message
		return {"pending": frappe.local.response.get("message") or "2FA"}
	return _me()


@frappe.whitelist()
def me():
	_require_user()
	return _me()
