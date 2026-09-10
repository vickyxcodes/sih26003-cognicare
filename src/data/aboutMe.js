import { profileFacts } from '../lib/patientProfile.js';

export const ABOUT_ME = {
  domain: 'about_me',
  name: 'About me',
  path: '/play/about-me',
  unitLabel: 'Detail',
  benefit: 'Practises recalling familiar personal details.',
  difficultyGuide: {
    1: 'Choose from two familiar answers.',
    2: 'Choose from three familiar answers.',
    3: 'Choose from four familiar answers.',
  },
  tierDetail: { easier: 'The next question has fewer choices.', harder: 'The next question has a few more choices.' },
  doneLine: (correct, asked) => `You answered ${correct} of ${asked} personal questions today.`,
  missLine: (words) => `The answer was ${words}`,
  questions: [],
};

const DISTRACTORS = {
  name: ['Anita', 'Ravi', 'Maya', 'Sanjay'], age: ['62', '68', '72', '76'], gender: ['Woman', 'Man', 'Another identity', 'Prefer not to say'],
  city: ['Guwahati', 'Jorhat', 'Tezpur', 'Dibrugarh'], pastOccupation: ['Teacher', 'Farmer', 'Shopkeeper', 'Nurse'],
  favouriteFood: ['Rice', 'Tea', 'Fish', 'Fruit'], favouriteColour: ['Blue', 'Green', 'Red', 'Yellow'],
  familyMemberName: ['Rina', 'Amit', 'Mina', 'Rahul'], familyMemberRelation: ['Daughter', 'Son', 'Sister', 'Brother'],
};

const PROMPTS = {
  name: ['What is your name?', 'আপোনাৰ নাম কি?'], age: ['How old are you?', 'আপোনাৰ বয়স কিমান?'],
  gender: ['Which answer describes your gender?', 'কোনটো উত্তৰে আপোনাৰ লিংগ বুজায়?'], city: ['Which city or town did you tell us about?', 'আপুনি কোনখন চহৰ বা গাঁৱৰ কথা কৈছিল?'],
  pastOccupation: ['What work did you do?', 'আপুনি কি কাম কৰিছিল?'], favouriteFood: ['Which food do you like?', 'আপোনাৰ কোনটো খাদ্য ভাল লাগে?'],
  favouriteColour: ['Which colour do you like?', 'আপোনাৰ কোনটো ৰং ভাল লাগে?'], familyMemberName: ['Which family member did you tell us about?', 'আপুনি কোনজন পৰিয়ালৰ সদস্যৰ কথা কৈছিল?'],
  familyMemberRelation: ['What is that family member’s relation to you?', 'সেই পৰিয়ালৰ সদস্যজন আপোনাৰ কি হয়?'],
};

const tiers = [1, 1, 1, 2, 2, 2, 3, 3, 3];
const equal = (left, right) => left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();

export function createAboutMeBank(profile) {
  const questions = profileFacts(profile).map(({ key, value }, index) => {
    const tier = tiers[index] || 3;
    const choices = tier + 1;
    const distractors = (DISTRACTORS[key] || []).filter((item) => !equal(item, value)).slice(0, choices - 1);
    const options = [value, ...distractors].map((text, optionIndex) => ({ id: `am-${key}-${optionIndex}`, item: null, text }));
    const [englishPrompt, assamesePrompt] = PROMPTS[key] || ['Which answer did you share?', 'আপুনি কোনটো উত্তৰ দিছিল?'];
    return {
      id: `am-${key}`,
      tier,
      studyItem: null,
      studyMs: 0,
      studyPrompt: null,
      prompt: englishPrompt,
      translations: { en: { prompt: englishPrompt }, as: { prompt: assamesePrompt } },
      answerId: `am-${key}-0`,
      options,
    };
  });
  return { ...ABOUT_ME, questions };
}
