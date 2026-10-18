# Family isolation: a guardian sees only their own child and can't change anything that belongs
# to another child. Rule: any item carrying patientId (or pid) must equal this family's child;
# everything else is closed except the center's public settings.
import json
import re

# Public center settings the family pages need (no children's data in them)
PUBLIC_KEYS = {
	"center",
	"departments",
	"departmentPrograms",
	"sessionPrice",
	"workshops",
	"courses",
	"familyServices",
	"enMin",
	"enCap",
}
# From staff records only the name and department go out (no phone numbers or PINs)
STAFF_FIELDS = ("id", "name", "role", "title", "department", "dept", "specialty", "avatar", "color")

_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def _owner(item):
	if not isinstance(item, dict):
		return None
	owner = item.get("patientId")
	return owner if owner is not None else item.get("pid")


def _linked(value):
	return isinstance(value, list) and any(_owner(x) is not None for x in value)


def filter_value(key, value, patient_id):
	"""What a family may see of one key, or None to hide it."""
	if value is None:
		return None
	if key == "patients":
		return [p for p in value if isinstance(p, dict) and p.get("id") == patient_id] if isinstance(value, list) else None
	if key == "staff":
		return (
			[{f: s[f] for f in STAFF_FIELDS if f in s} for s in value if isinstance(s, dict)]
			if isinstance(value, list)
			else None
		)
	if key in PUBLIC_KEYS:
		return value
	if _linked(value):
		return [x for x in value if _owner(x) == patient_id]
	return None


def filter_set(values, patient_id):
	out = {}
	for key, value in values.items():
		filtered = filter_value(key, value, patient_id)
		if filtered is not None:
			out[key] = filtered
	return out


def merge_in(incoming, current, patient_id):
	"""Accept only this family's own items and merge them into the center's lists untouched.

	Returns (accepted: {key: merged list}, ignored: [keys]).
	"""
	accepted, ignored = {}, []
	for key, value in incoming.items():
		if key in ("patients", "staff") or key in PUBLIC_KEYS or not isinstance(value, list):
			ignored.append(key)
			continue
		server = current.get(key)
		server = server if isinstance(server, list) else []
		if server and not _linked(server) and not _linked(value):
			ignored.append(key)
			continue
		others_ids = {x.get("id") for x in server if isinstance(x, dict) and _owner(x) != patient_id}
		mine = [x for x in value if _owner(x) == patient_id and x.get("id") not in others_ids]
		mine_by_id = {x.get("id"): x for x in mine}
		# keep the center's order: an edited family item stays in place, a removed one is dropped,
		# a new one goes first (the pages add with unshift)
		kept = []
		for x in server:
			if _owner(x) != patient_id:
				kept.append(x)
			elif x.get("id") in mine_by_id:
				kept.append(mine_by_id[x.get("id")])
		server_ids = {x.get("id") for x in server if isinstance(x, dict)}
		merged = [x for x in mine if x.get("id") not in server_ids] + kept
		if _json(merged) != _json(server):
			accepted[key] = merged
	return accepted, ignored


def norm_phone(value):
	"""Compare the last 9 digits so 05…, 9665… and +9665… all match."""
	return re.sub(r"\D", "", str(value or "").translate(_ARABIC_DIGITS))[-9:]


def _json(value):
	return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
