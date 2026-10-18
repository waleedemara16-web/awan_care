import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

AWAN_ROLES = ["Awan Management", "Awan Supervisor", "Awan Reception", "Awan Staff"]


def after_migrate():
	for role in AWAN_ROLES:
		if not frappe.db.exists("Role", role):
			frappe.get_doc({"doctype": "Role", "role_name": role, "desk_access": 0}).insert(ignore_permissions=True)

	# Links a Frappe account to its staff record in the Awan data (state.staff[].id)
	create_custom_fields(
		{
			"User": [
				{
					"fieldname": "awan_staff_id",
					"fieldtype": "Data",
					"label": "Awan Staff ID",
					"insert_after": "username",
					"description": "رقم الموظف في منصة أوان (للربط بملفه)",
				}
			]
		},
		update=True,
	)

	# The Awan sign-in accepts "email or username"
	if not frappe.db.get_single_value("System Settings", "allow_login_using_user_name"):
		frappe.db.set_single_value("System Settings", "allow_login_using_user_name", 1)
