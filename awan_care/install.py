import frappe

AWAN_ROLES = ["Awan Management", "Awan Supervisor", "Awan Reception", "Awan Staff"]


def after_migrate():
	for role in AWAN_ROLES:
		if not frappe.db.exists("Role", role):
			frappe.get_doc({"doctype": "Role", "role_name": role, "desk_access": 0}).insert(ignore_permissions=True)
