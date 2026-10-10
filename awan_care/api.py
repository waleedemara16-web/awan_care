import json

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
