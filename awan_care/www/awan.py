import frappe

no_cache = 1


def get_context(context):
	csrf_token = frappe.sessions.get_csrf_token()
	# get_csrf_token may create the session token; commit it for this GET request
	frappe.db.commit()
	context.boot = {"csrf_token": csrf_token, "site_name": frappe.local.site}
	return context
