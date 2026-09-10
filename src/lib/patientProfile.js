/**
 * The patient profile is deliberately separate from the syncable game records.
 * It stays on this device and supplies only the locally generated About Me game.
 */
export const PROFILE_FIELDS = [
  ['name', 'Your name', 'আপোনাৰ নাম', 'text'],
  ['age', 'Your age', 'আপোনাৰ বয়স', 'number'],
  ['gender', 'Your gender', 'আপোনাৰ লিংগ', 'text'],
  ['city', 'Your city or town', 'আপোনাৰ চহৰ বা গাঁও', 'text'],
  ['pastOccupation', 'A past occupation', 'আগৰ এটা পেচা', 'text'],
  ['favouriteFood', 'A favourite food', 'এটা প্ৰিয় খাদ্য', 'text'],
  ['favouriteColour', 'A favourite colour', 'এটা প্ৰিয় ৰং', 'text'],
  ['familyMemberName', 'A family member’s name', 'এজন পৰিয়ালৰ সদস্যৰ নাম', 'text'],
  ['familyMemberRelation', 'Their relation to you', 'আপোনাৰ সৈতে তেওঁলোকৰ সম্পৰ্ক', 'text'],
  ['emergencyContactName', 'Emergency contact name', 'জৰুৰী যোগাযোগৰ নাম', 'text'],
  ['emergencyContactPhone', 'Emergency contact phone', 'জৰুৰী যোগাযোগৰ ফোন নম্বৰ', 'tel'],
].map(([key, label, assameseLabel, type]) => ({ key, label, assameseLabel, type }));

export const PROFILE_KEYS = PROFILE_FIELDS.map((field) => field.key);

const TEXT_MAX = 80;

export function cleanProfile(profile = {}) {
  const clean = {};
  for (const key of PROFILE_KEYS) {
    clean[key] = String(profile[key] ?? '').trim().slice(0, key === 'emergencyContactPhone' ? 30 : TEXT_MAX);
  }
  return clean;
}

export function validateProfileField(key, value) {
  const text = String(value ?? '').trim();
  if (!text) return 'Please add an answer before continuing.';
  if (key === 'age' && (!/^\d{1,3}$/.test(text) || Number(text) < 1 || Number(text) > 120)) {
    return 'Please enter an age from 1 to 120.';
  }
  if (key === 'emergencyContactPhone') {
    const digits = text.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return 'Please enter a phone number with 7 to 15 digits.';
  }
  return '';
}

export function isCompleteProfile(profile) {
  const clean = cleanProfile(profile);
  return PROFILE_KEYS.every((key) => !validateProfileField(key, clean[key]));
}

/** Facts allowed in the game. Emergency details are intentionally excluded. */
export function profileFacts(profile) {
  const clean = cleanProfile(profile);
  return PROFILE_KEYS
    .filter((key) => !key.startsWith('emergencyContact') && clean[key])
    .map((key) => ({ key, value: clean[key] }));
}
