/**
 * The picture catalogue.
 *
 * Every object either game can put on screen is listed here once, with the words
 * that get spoken and the category used to build distractors. This file is plain
 * data with no imports so the question banks and the tests can read it directly.
 *
 * `category` is what makes difficulty tiers meaningful: an easy question pairs a
 * cup with a shoe, a hard one pairs a cup with a glass.
 */
export const ITEMS = {
  cup: { label: 'Cup', category: 'kitchen' },
  glass: { label: 'Glass of water', category: 'kitchen' },
  kettle: { label: 'Kettle', category: 'kitchen' },
  spoon: { label: 'Spoon', category: 'kitchen' },
  plate: { label: 'Plate', category: 'kitchen' },
  apple: { label: 'Apple', category: 'food' },
  banana: { label: 'Banana', category: 'food' },
  shoe: { label: 'Shoe', category: 'clothing' },
  spectacles: { label: 'Spectacles', category: 'personal' },
  comb: { label: 'Comb', category: 'personal' },
  toothbrush: { label: 'Toothbrush', category: 'personal' },
  soap: { label: 'Soap', category: 'personal' },
  towel: { label: 'Towel', category: 'personal' },
  clock: { label: 'Clock', category: 'household' },
  lamp: { label: 'Lamp', category: 'household' },
  key: { label: 'Key', category: 'household' },
  umbrella: { label: 'Umbrella', category: 'household' },
  telephone: { label: 'Telephone', category: 'communication' },
  envelope: { label: 'Letter', category: 'communication' },
  book: { label: 'Book', category: 'leisure' },
  ball: { label: 'Ball', category: 'leisure' },
  flower: { label: 'Flower', category: 'nature' },
  sun: { label: 'Sun', category: 'nature' },
  moon: { label: 'Moon', category: 'nature' },
  chair: { label: 'Chair', category: 'furniture' },
  bed: { label: 'Bed', category: 'furniture' },
  medicine: { label: 'Medicine', category: 'health' },
};

export const ITEM_IDS = Object.keys(ITEMS);

export function itemLabel(id) {
  return ITEMS[id] ? ITEMS[id].label : id;
}

export function itemCategory(id) {
  return ITEMS[id] ? ITEMS[id].category : 'other';
}
