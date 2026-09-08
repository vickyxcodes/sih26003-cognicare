/**
 * privacy - the one place that decides what a record is allowed to contain.
 *
 * The spec is absolute: no patient names, addresses or medical/diagnostic data
 * anywhere in Firestore. A comment saying so would not survive a hackathon
 * weekend of edits, so it is enforced instead: every write - local *and* remote -
 * goes through `assertSafeRecord`, and a record carrying a forbidden field
 * throws instead of being stored.
 *
 * Dependency-free on purpose, so both the IndexedDB store and the Firestore
 * sync layer can share it and tests can exercise it directly.
 */

/**
 * Field names that must never appear on a stored record. Matched
 * case-insensitively against the whole key, so `patientName`, `patient_name`
 * and `NAME` are all caught.
 */
export const FORBIDDEN_FIELDS = [
  'name',
  'firstname',
  'lastname',
  'fullname',
  'patientname',
  'address',
  'street',
  'city',
  'pincode',
  'postcode',
  'phone',
  'mobile',
  'email',
  'dob',
  'birthdate',
  'age',
  'gender',
  'aadhaar',
  'diagnosis',
  'condition',
  'disease',
  'dementia',
  'mmse',
  'medication',
  'prescription',
  'doctor',
  'hospital',
  'notes',
  'photo',
];

const normalise = (key) => String(key).toLowerCase().replace(/[^a-z]/g, '');

/** True when this field name is one we refuse to store. */
export function isForbiddenField(key) {
  return FORBIDDEN_FIELDS.includes(normalise(key));
}

/**
 * Throws if a record carries personal or medical data, or a value too large to
 * be one of our small numeric/string fields (a free-text blob is exactly how
 * personal data sneaks in). `where` names the store, so the error says where.
 */
export function assertSafeRecord(record, where = 'record') {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error(`${where}: expected a plain object`);
  }
  for (const [key, value] of Object.entries(record)) {
    if (isForbiddenField(key)) {
      throw new Error(`${where}: field "${key}" is personal or medical data and must not be stored`);
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      assertSafeRecord(value, `${where}.${key}`);
    }
    if (typeof value === 'string' && value.length > 120) {
      throw new Error(`${where}: field "${key}" is too long to be anything but free text`);
    }
  }
  return record;
}

/**
 * A pairing code is the only identifier that ever leaves the device: 6 chars,
 * unambiguous alphabet (no O/0/I/1), generated locally, tied to nothing.
 */
export const PAIRING_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PAIRING_CODE_LENGTH = 6;

export function isPairingCode(value) {
  if (typeof value !== 'string' || value.length !== PAIRING_CODE_LENGTH) return false;
  return [...value].every((c) => PAIRING_CODE_ALPHABET.includes(c));
}

export function makePairingCode(rand = Math.random) {
  let out = '';
  for (let i = 0; i < PAIRING_CODE_LENGTH; i += 1) {
    out += PAIRING_CODE_ALPHABET[Math.floor(rand() * PAIRING_CODE_ALPHABET.length)];
  }
  return out;
}
