import frappe
from frappe.model.document import Document


class AwanPatient(Document):
	def validate(self):
		# `data` holds the full child record used by the Awan screens (health, goals, consents, plans…)
		if self.data:
			frappe.parse_json(self.data)
