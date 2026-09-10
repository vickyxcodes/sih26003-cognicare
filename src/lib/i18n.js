import { ITEMS } from '../data/catalog.js';
import { REMINDER_WORDING } from '../data/reminders.js';
import { PATTERN_SHAPES } from '../data/patternMatching.js';
import { listWords } from '../data/wording.js';

/**
 * Patient language support is deliberately small and explicit: English plus
 * Assamese, the NER language selected for this prototype. Domain ids, question
 * ids and stored records never pass through this module; it only creates text
 * for the screen and the shared voice adapter.
 */
export const LANGUAGES = {
  en: { code: 'en', label: 'English', locale: 'en-IN' },
  as: { code: 'as', label: 'অসমীয়া', locale: 'as-IN' },
};

export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_SETTING = 'patient-language';

export function isLanguage(value) {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, value);
}

const COPY = {
  en: {
    language: { label: 'Language', english: 'English', assamese: 'অসমীয়া' },
    home: {
      subtitle: 'Small moments of memory, every day',
      eyebrow: 'Ready when you are',
      title: 'Let’s play together',
      intro: 'Choose a gentle activity below. There is no timer to rush you.',
      playAria: "Play today's game",
      memory: 'Memory game',
      memorySub: 'Remember the picture',
      choose: 'Choose an activity',
      activity2: 'Activity 2',
      routine: 'Everyday routines',
      routineSub: 'Match an object to a moment',
      activity3: 'Activity 3',
      words: 'Remember words',
      wordsSub: 'Keep familiar words in mind',
      activity4: 'Activity 4',
      numbers: 'Remember numbers',
      numbersSub: 'Hold a short sequence',
      activity5: 'Activity 5',
      patterns: 'Match patterns',
      patternsSub: 'Remember a row of shapes',
      activity6: 'Activity 6', aboutMe: 'About me', aboutMeSub: 'Remember familiar details', editProfile: 'Edit profile', activity7: 'Activity 7', activity8: 'Activity 8',
      rememberThis: 'Remember This', rememberThisSub: 'Save a thought for later', reminders: 'My reminders', remindersSub: 'Add a gentle reminder',
      caregivers: 'For caregivers',
      caregiverCode: 'Caregiver code',
      preparing: 'Preparing caregiver code…',
      greeting: 'Welcome to CogniCare. When you are ready, tap the big button to play.',
    },
    nav: {
      home: 'Home',
      skip: 'Skip this game',
      skipAria: 'Skip this game and go to the next activity',
      allDone: 'All done',
      playAgain: 'Play again',
    },
    remember: {
      title: 'Remember This', intro: 'Write one thing you would like to remember later.', question: 'What would you like to remember?',
      chooseDelay: 'Choose when to test your memory', placeholder: 'Write it here', save: 'Save for later', saving: 'Saving…',
      history: 'Things waiting to be remembered', noItems: 'Nothing is waiting yet.', pending: 'Waiting', due: 'Ready to recall', completed: 'Completed', dismissed: 'Dismissed',
      duePrompt: 'Do you remember what you wanted to remember?', recallPlaceholder: 'You can write what you remember here', remembered: 'I remembered it', neededHelp: 'I needed help',
      rememberedThanks: 'Nice job remembering!', neededHelpThanks: 'That is okay. Memory takes practice.', dismiss: 'Dismiss', delete: 'Delete', deleteAria: 'Delete this memory',
      tenSeconds: '10 seconds', thirtySeconds: '30 seconds', oneMinute: '1 minute', fiveMinutes: '5 minutes', twoHours: '2 hours', saved: 'Saved. We will ask you later.', formError: 'Please fill in the details and try again.',
    },
    manual: {
      title: 'My reminders', intro: 'Add a simple reminder for this device.', add: 'Add reminder', edit: 'Edit reminder', titleLabel: 'What should we remember?', timeLabel: 'When?', typeLabel: 'What kind of reminder?', noteLabel: 'Note (optional)', formError: 'Please fill in the details and try again.',
      titlePlaceholder: 'For example: Drink water', notePlaceholder: 'Add a short note', save: 'Save reminder', saving: 'Saving…', cancel: 'Cancel', delete: 'Delete', done: 'Done', scheduled: 'Scheduled', due: 'Ready now', completed: 'Completed', noItems: 'No reminders yet.',
      reminderSaved: 'Reminder saved.', type: { medicine: 'Medicine', hydration: 'Water', appointment: 'Appointment', exercise: 'Exercise', custom: 'Other' },
      overlay: 'Reminder: {title}', doneAria: 'Mark reminder as done',
    },
    play: {
      difficulty: 'Difficulty',
      level: 'Level {level} of 3',
      helps: 'How it helps:',
      progress: 'Progress',
      accuracy: 'Accuracy',
      streak: 'Streak',
      right: '{count} right',
      toReset: '{count} to reset',
      currentStats: 'Current game stats',
      progressAndDifficulty: 'progress and difficulty',
      choicesAre: 'The choices are',
    },
    feedback: {
      correct: "Yes, that's right!",
      tricky: 'That one is tricky. Well tried.',
    },
    done: { wellDone: 'Well done!' },
    reminder: { aria: 'Reminder', done: 'Done' },
    tier: { easier: 'Let’s make it a little easier.', harder: 'You are ready for a little more.' },
    domains: {
      memory_recall: {
        name: 'Remember the picture', unit: 'Picture',
        benefit: 'Builds picture recall and gentle recognition.',
        difficulty: {
          1: 'One clear picture with a generous viewing time.',
          2: 'The picture stays for less time.',
          3: 'The choices look more alike, so details matter more.',
        },
        easier: 'The next pictures stay on screen for longer.',
        harder: 'The next pictures are a little quicker.',
        done: 'You remembered {correct} of {asked} pictures today.',
        miss: 'It was the {answer}',
      },
      routine_matching: {
        name: 'Everyday routines', unit: 'Question',
        benefit: 'Practises connecting familiar objects with daily routines.',
        difficulty: {
          1: 'The helpful object is easy to tell apart.',
          2: 'Both choices are familiar everyday objects.',
          3: 'The choices are close neighbours, so the cue matters more.',
        },
        easier: 'The next ones are easier to tell apart.',
        harder: 'The next ones look more alike.',
        done: 'You matched {correct} of {asked} correctly today.',
        miss: 'It was the {answer}',
      },
      word_recall: {
        name: 'Remember the words', unit: 'Word',
        benefit: 'Strengthens short-term memory for familiar words.',
        difficulty: {
          1: 'Remember two words with two choices.',
          2: 'Remember three words and see them for less time.',
          3: 'Remember four words with close word neighbours.',
        },
        easier: 'The next words stay on screen for longer.',
        harder: 'The next rounds show more words, more quickly.',
        done: 'You remembered {correct} of {asked} words today.',
        miss: 'The word was {answer}',
      },
      number_sequence: {
        name: 'Remember the numbers', unit: 'Number',
        benefit: 'Practises holding a short sequence and its order in mind.',
        difficulty: {
          1: 'Recognise a short pair of numbers.',
          2: 'Remember which number came last in a longer run.',
          3: 'Remember which number came first in the longest run.',
        },
        easier: 'The next sequences are shorter and stay for longer.',
        harder: 'The next sequences are longer and go by more quickly.',
        done: 'You remembered {correct} of {asked} numbers today.',
        miss: 'The number was {answer}',
      },
      pattern_matching: {
        name: 'Match the pattern', unit: 'Pattern',
        benefit: 'Builds visual order and pattern recognition.',
        difficulty: {
          1: 'Remember a short row of clearly different shapes.',
          2: 'Rows are longer and differ by only one place.',
          3: 'The same shapes move around, so their order matters.',
        },
        easier: 'The next patterns are shorter and easier to tell apart.',
        harder: 'The next patterns are longer and look more alike.',
        done: 'You matched {correct} of {asked} patterns today.',
        miss: 'The pattern was {answer}',
      },
      about_me: {
        name: 'About me', unit: 'Detail', benefit: 'Practises recalling familiar personal details.',
        difficulty: { 1: 'Choose from two familiar answers.', 2: 'Choose from three familiar answers.', 3: 'Choose from four familiar answers.' },
        easier: 'The next question has fewer choices.', harder: 'The next question has a few more choices.',
        done: 'You answered {correct} of {asked} personal questions today.', miss: 'The answer was {answer}',
      },
    },
  },
  as: {
    language: { label: 'ভাষা', english: 'English', assamese: 'অসমীয়া' },
    home: {
      subtitle: 'প্ৰতিদিনে স্মৃতিৰ সৰু সৰু মুহূৰ্ত', eyebrow: 'আপুনি সাজু হ’লেই',
      title: 'আহক, একেলগে খেলোঁ', intro: 'তলৰ এটা সহজ কাৰ্য বাছক। আপোনাক খৰখেদা কৰাবলৈ কোনো সময়সীমা নাই।',
      playAria: 'আজিৰ খেল খেলক', memory: 'স্মৃতিৰ খেল', memorySub: 'ছবিখন মনত ৰাখক', choose: 'এটা কাৰ্য বাছক',
      activity2: 'কাৰ্য ২', routine: 'দৈনন্দিন কাম', routineSub: 'বস্তুটো সময়ৰ সৈতে মিলাওক',
      activity3: 'কাৰ্য ৩', words: 'শব্দ মনত ৰাখক', wordsSub: 'চিনাকি শব্দ মনত ৰাখক',
      activity4: 'কাৰ্য ৪', numbers: 'সংখ্যা মনত ৰাখক', numbersSub: 'এটা সৰু ক্ৰম মনত ৰাখক',
      activity5: 'কাৰ্য ৫', patterns: 'আৰ্হি মিলাওক', patternsSub: 'আকাৰৰ শাৰী মনত ৰাখক',
      activity6: 'কাৰ্য ৬', aboutMe: 'মোৰ বিষয়ে', aboutMeSub: 'চিনাকি কথা মনত ৰাখক', editProfile: 'প্ৰ’ফাইল সম্পাদনা কৰক', activity7: 'কাৰ্য ৭', activity8: 'কাৰ্য ৮', rememberThis: 'এইটো মনত ৰাখক', rememberThisSub: 'পাছত মনত পেলাবলৈ লিখক', reminders: 'মোৰ সোঁৱৰণী', remindersSub: 'এটা সহজ সোঁৱৰণী যোগ কৰক',
      caregivers: 'অভিভাৱকৰ বাবে', caregiverCode: 'অভিভাৱকৰ ক’ড', preparing: 'অভিভাৱকৰ ক’ড সাজু হৈ আছে…',
      greeting: 'CogniCare লৈ স্বাগতম। সাজু হ’লে ডাঙৰ বুটামটো টিপি খেলক।',
    },
    nav: {
      home: 'ঘৰ', skip: 'এই খেল এৰক', skipAria: 'এই খেল এৰি পৰৱৰ্তী কাৰ্যলৈ যাওক',
      allDone: 'সকলো শেষ', playAgain: 'আকৌ খেলক',
    },
    remember: {
      title: 'এইটো মনত ৰাখক', intro: 'পাছত মনত ৰাখিব বিচৰা এটা কথা লিখক।', question: 'আপুনি কি কথা মনত ৰাখিব বিচাৰে?',
      chooseDelay: 'কেতিয়া স্মৃতি পৰীক্ষা কৰিব বাছক', placeholder: 'ইয়াত লিখক', save: 'পাছৰ বাবে সংৰক্ষণ কৰক', saving: 'সংৰক্ষণ হৈ আছে…',
      history: 'মনত ৰাখিবলৈ অপেক্ষা কৰি থকা কথা', noItems: 'এতিয়া একো অপেক্ষা কৰি থকা নাই।', pending: 'অপেক্ষা কৰি আছে', due: 'মনত পেলোৱাৰ সময়', completed: 'সম্পূৰ্ণ', dismissed: 'আঁতৰোৱা হৈছে',
      duePrompt: 'আপুনি মনত ৰাখিব বিচৰা কথাটো মনত আছেনে?', recallPlaceholder: 'মনত থকা কথাটো ইয়াত লিখিব পাৰে', remembered: 'মনত আছে', neededHelp: 'মোক সহায় লাগিল',
      rememberedThanks: 'মনত ৰখাৰ বাবে বৰ ভাল!', neededHelpThanks: 'ঠিক আছে। স্মৃতিয়ে অনুশীলন বিচাৰে।', dismiss: 'আঁতৰাওক', delete: 'মচক', deleteAria: 'এই স্মৃতিটো মচক',
      tenSeconds: '১০ ছেকেণ্ড', thirtySeconds: '৩০ ছেকেণ্ড', oneMinute: '১ মিনিট', fiveMinutes: '৫ মিনিট', twoHours: '২ ঘণ্টা', saved: 'সংৰক্ষণ কৰা হ’ল। পিছত সোধা হ’ব।', formError: 'অনুগ্ৰহ কৰি তথ্য পূৰ কৰি আকৌ চেষ্টা কৰক।',
    },
    manual: {
      title: 'মোৰ সোঁৱৰণী', intro: 'এই ডিভাইচৰ বাবে এটা সহজ সোঁৱৰণী যোগ কৰক।', add: 'সোঁৱৰণী যোগ কৰক', edit: 'সোঁৱৰণী সম্পাদনা কৰক', titleLabel: 'কি কথা মনত ৰাখিব?', timeLabel: 'কেতিয়া?', typeLabel: 'কি ধৰণৰ সোঁৱৰণী?', noteLabel: 'টোকা (ইচ্ছা কৰিলে)', formError: 'অনুগ্ৰহ কৰি তথ্য পূৰ কৰি আকৌ চেষ্টা কৰক।',
      titlePlaceholder: 'উদাহৰণ: পানী খাওক', notePlaceholder: 'এটা সৰু টোকা লিখক', save: 'সোঁৱৰণী সংৰক্ষণ কৰক', saving: 'সংৰক্ষণ হৈ আছে…', cancel: 'বাতিল', delete: 'মচক', done: 'সম্পূৰ্ণ', scheduled: 'সময় ঠিক কৰা আছে', due: 'এতিয়া সাজু', completed: 'সম্পূৰ্ণ', noItems: 'এতিয়া কোনো সোঁৱৰণী নাই।',
      reminderSaved: 'সোঁৱৰণী সংৰক্ষণ কৰা হ’ল।', type: { medicine: 'দৰৱ', hydration: 'পানী', appointment: 'সাক্ষাৎ', exercise: 'ব্যায়াম', custom: 'অন্যান্য' },
      overlay: 'সোঁৱৰণী: {title}', doneAria: 'সোঁৱৰণী সম্পূৰ্ণ বুলি চিহ্নিত কৰক',
    },
    play: {
      difficulty: 'কঠিনতাৰ স্তৰ', level: '৩ ৰ ভিতৰত স্তৰ {level}', helps: 'ই কেনেকৈ সহায় কৰে:',
      progress: 'অগ্ৰগতি', accuracy: 'শুদ্ধতাৰ হাৰ', streak: 'একেৰাহে শুদ্ধ', right: '{count} টা শুদ্ধ',
      toReset: 'আকৌ আৰম্ভ কৰিবলৈ {count}', currentStats: 'বৰ্তমান খেলৰ তথ্য', progressAndDifficulty: 'অগ্ৰগতি আৰু কঠিনতাৰ স্তৰ',
      choicesAre: 'বাছনিবোৰ হ’ল',
    },
    feedback: { correct: 'হয়, এইটো শুদ্ধ!', tricky: 'এইটো অলপ কঠিন আছিল। ভাল চেষ্টা।' },
    done: { wellDone: 'বৰ ভাল!' }, reminder: { aria: 'সোঁৱৰণী', done: 'সম্পূৰ্ণ' },
    tier: { easier: 'আহক, অলপ সহজ কৰোঁ।', harder: 'আপুনি অলপ বেছি কঠিনতাৰ বাবে সাজু।' },
    domains: {
      memory_recall: { name: 'ছবিখন মনত ৰাখক', unit: 'ছবি', benefit: 'ছবি মনত ৰখা আৰু চিনাক্ত কৰাত সহায় কৰে.', difficulty: { 1: 'এখন স্পষ্ট ছবি অলপ বেছি সময় দেখা যাব।', 2: 'ছবিখন কম সময় দেখা যাব।', 3: 'বাছনিবোৰ একে যেন লাগে, সেয়ে সৰু কথাবোৰ মন কৰক।' }, easier: 'পৰৱৰ্তী ছবিবোৰ বেছি সময় পৰ্দাত থাকিব।', harder: 'পৰৱৰ্তী ছবিবোৰ অলপ সোনকালে সলনি হ’ব।', done: 'আপুনি আজি {asked} টাৰ ভিতৰত {correct} খন ছবি মনত ৰাখিলে।', miss: 'সেইটো আছিল {answer}' },
      routine_matching: { name: 'দৈনন্দিন কাম', unit: 'প্ৰশ্ন', benefit: 'চিনাকি বস্তু দৈনন্দিন কামৰ সৈতে মিলাবলৈ অনুশীলন কৰে.', difficulty: { 1: 'সহায় কৰা বস্তুটো সহজে চিনিব পাৰি।', 2: 'দুয়োটা বাছনি চিনাকি দৈনন্দিন বস্তু।', 3: 'বাছনিবোৰ ওচৰ-চুবুৰীয়া, সেয়ে প্ৰশ্নটো মন কৰক।' }, easier: 'পৰৱৰ্তী কেইটা সহজে পৃথক কৰিব পাৰিব।', harder: 'পৰৱৰ্তী কেইটা আৰু বেছি একে যেন লাগিব।', done: 'আপুনি আজি {asked} টাৰ ভিতৰত {correct} টা সঠিকভাৱে মিলালে।', miss: 'সেইটো আছিল {answer}' },
      word_recall: { name: 'শব্দ মনত ৰাখক', unit: 'শব্দ', benefit: 'চিনাকি শব্দ অলপ সময় মনত ৰখাত সহায় কৰে.', difficulty: { 1: 'দুটা শব্দ আৰু দুটা বাছনি মনত ৰাখক।', 2: 'তিনিটা শব্দ মনত ৰাখক আৰু কম সময়ত চাওক।', 3: 'ওচৰ অৰ্থৰ চাৰিটা শব্দ মনত ৰাখক।' }, easier: 'পৰৱৰ্তী শব্দবোৰ বেছি সময় পৰ্দাত থাকিব।', harder: 'পৰৱৰ্তী পৰ্যায়ত বেছি শব্দ সোনকালে দেখা যাব।', done: 'আপুনি আজি {asked} টাৰ ভিতৰত {correct} টা শব্দ মনত ৰাখিলে।', miss: 'শব্দটো আছিল {answer}' },
      number_sequence: { name: 'সংখ্যা মনত ৰাখক', unit: 'সংখ্যা', benefit: 'এটা সৰু সংখ্যা-ক্ৰম আৰু তাৰ স্থান মনত ৰখাত অনুশীলন কৰে.', difficulty: { 1: 'দুটা সংখ্যাৰ এটা সৰু জোৰা চিনাক্ত কৰক।', 2: 'দীঘল ক্ৰমত কোনটো সংখ্যা শেষত আহিছিল মনত ৰাখক।', 3: 'দীঘল ক্ৰমত কোনটো সংখ্যা প্ৰথমে আহিছিল মনত ৰাখক।' }, easier: 'পৰৱৰ্তী ক্ৰম সৰু আৰু বেছি সময় থাকিব।', harder: 'পৰৱৰ্তী ক্ৰম দীঘল আৰু সোনকালে সলনি হ’ব।', done: 'আপুনি আজি {asked} টাৰ ভিতৰত {correct} টা সংখ্যা মনত ৰাখিলে।', miss: 'সংখ্যাটো আছিল {answer}' },
      pattern_matching: { name: 'আৰ্হি মিলাওক', unit: 'আৰ্হি', benefit: 'দৃশ্য ক্ৰম আৰু আৰ্হি চিনাক্ত কৰাত সহায় কৰে.', difficulty: { 1: 'বেলেগ বেলেগ আকাৰৰ সৰু শাৰী মনত ৰাখক।', 2: 'শাৰী দীঘল আৰু মাত্ৰ এটা ঠাইত বেলেগ।', 3: 'একে আকাৰবোৰ স্থান সলনি কৰে, সেয়ে ক্ৰমটো মন কৰক।' }, easier: 'পৰৱৰ্তী আৰ্হিবোৰ সৰু আৰু সহজে পৃথক কৰিব পাৰি।', harder: 'পৰৱৰ্তী আৰ্হিবোৰ দীঘল আৰু বেছি একে যেন লাগিব।', done: 'আপুনি আজি {asked} টাৰ ভিতৰত {correct} টা আৰ্হি মিলালে।', miss: 'আৰ্হিটো আছিল {answer}' },
      about_me: { name: 'মোৰ বিষয়ে', unit: 'কথা', benefit: 'নিজৰ চিনাকি কথাবোৰ মনত পেলোৱাত অনুশীলন কৰে।', difficulty: { 1: 'দুটা চিনাকি উত্তৰৰ মাজৰ পৰা বাছক।', 2: 'তিনিটা চিনাকি উত্তৰৰ মাজৰ পৰা বাছক।', 3: 'চাৰিটা চিনাকি উত্তৰৰ মাজৰ পৰা বাছক।' }, easier: 'পৰৱৰ্তী প্ৰশ্নত কম বাছনি থাকিব।', harder: 'পৰৱৰ্তী প্ৰশ্নত আৰু কেইটামান বাছনি থাকিব।', done: 'আপুনি আজি {asked} টাৰ ভিতৰত {correct} টা নিজৰ বিষয়ে প্ৰশ্নৰ উত্তৰ দিলে।', miss: 'উত্তৰটো আছিল {answer}' },
    },
  },
};

const ITEM_TRANSLATIONS = {
  cup: 'কাপ', glass: 'পানীৰ গিলাচ', kettle: 'কেটলি', spoon: 'চামুচ', plate: 'থাল', apple: 'আপেল',
  banana: 'কল', shoe: 'জোতা', spectacles: 'চশমা', comb: 'ফণী', toothbrush: 'দাঁত ব্ৰাছ', soap: 'চাবোন',
  towel: 'গামোচা', clock: 'ঘড়ী', lamp: 'বাতি', key: 'চাবি', umbrella: 'ছাতি', telephone: 'টেলিফোন',
  envelope: 'চিঠি', book: 'কিতাপ', ball: 'বল', flower: 'ফুল', sun: 'সূৰ্য', moon: 'জোন', chair: 'চকী',
  bed: 'বিচনা', medicine: 'দৰৱ',
};

/** Caregiver copy is separate from patient copy, but uses the same selector. */
const DASHBOARD_COPY = {
  en: {
    backHome: 'Back to patient home', view: 'Caregiver view', title: 'Caregiver Dashboard', summary: 'Clear, calm summaries of activity on the paired device.',
    reading: 'Reading the recorded activity for the paired device…', paired: 'Paired device', lastSynced: 'Last synced', syncing: 'Syncing', online: 'Online', offline: 'Offline',
    checkingCode: 'Looking for a stored pairing code…', checkAgain: 'Check again', checking: 'Checking…', changeCode: 'Change code', refreshFailed: 'We could not refresh the records for this paired device.',
    noCode: 'Nothing could be read for this code.', noCodeDetail: 'The dashboard shows nothing rather than guessing. Try again, and if it keeps failing, check that the code matches the one on the patient’s device.', reportedReason: 'Reported reason',
    summaryLabel: 'Summary', recentPerformance: 'Recent performance', recentAverage: 'Average across recent recorded game activity.', noSessions: 'No cognitive sessions recorded yet.', playForTrend: 'Play a few sessions to see a trend.',
    noActivity: 'No activity recorded yet.', afterPlayed: 'This activity will appear after it is played.', average: '{value}% average across recorded sessions.', session: '{count} session{suffix}', best: 'best {value}%',
    recentActivity: 'Recent activity', sessionsAvailable: 'Recorded game sessions available to review.', reminderCompletion: 'Reminder completion', completionNote: 'Recorded as completed, not proof that a task happened.', noReminder: 'No reminder activity recorded.', reminderWillAppear: 'Reminder activity will appear here.',
    completedMissed: '{done} completed · {missed} missed', trendsPrompt: 'Play a few sessions to see performance trends here. Reminder activity will appear separately.', performanceOverTime: 'Performance over time', cognitivePerformance: 'Cognitive performance', lineHelp: 'Each line is a game score. Gaps mean that activity was not played.',
    atAGlance: 'At a glance', comparison: 'Activity comparison', averageByActivity: 'Average recorded score by activity.', noCompare: 'No activity to compare yet.', playForActivity: 'Play a few sessions to see each activity here.', plainReading: 'Plain-language reading', insights: 'Trends and insights', readingsOnly: 'These describe recorded performance only, not health.', noTrend: 'No trend yet.', trendNeedHistory: 'A few recorded sessions are needed before a pattern can be described.',
    reminderActivity: 'Reminder activity', reminders: 'Reminders', events: '{count} recorded reminder event{suffix}', latestRecords: 'Latest records', knownRecords: 'Sessions and reminders the system knows about.', noRecent: 'No recent activity recorded.', explore: 'Explore by activity', detail: 'Domain detail', dynamic: 'All activities are listed dynamically from the game catalogue.', latest: 'Latest', averageLabel: 'Average', bestRecent: 'Best recent', sessionsLabel: 'Sessions', lastPlayed: 'Last played', notPlayed: 'Not played yet',
    reminder: 'Reminder', status: 'Status', when: 'When', completed: 'Completed', missed: 'Missed', completion: 'Completion', statusCompleted: 'Recorded as completed', statusMissed: 'Recorded as missed', noReminderDetail: 'Reminder events will appear here after the patient responds to a reminder.', completionWarning: 'Completion means the reminder was recorded as completed in the app; it does not prove that a medicine or task was carried out.', noData: 'Nothing to chart yet.',
    noCognitive: 'No cognitive sessions recorded yet.', chartPrompt: 'Play a few sessions to see performance trends here.', chartUnavailable: 'The chart is unavailable on this device.', chartFallback: 'The session scores are still available in the domain details below.', score: 'Score', answers: 'Answers correct', difficulty: 'Difficulty', difficultyLevel: 'Difficulty level', chartAria: 'Cognitive performance by game over time',
    disclaimer: 'These are scores from a practice game on the patient’s device. They are not a medical measurement and they do not diagnose anything. Share them with a doctor rather than reading a condition into them.', decline: 'Consider a check-in with a doctor', notDiagnosis: 'This is not a diagnosis.', improving: 'Improving', declining: 'Declining', stable: 'Stable', building: 'Building history', none: 'No activity yet',
  },
  as: {
    backHome: 'ৰোগীৰ ঘৰলৈ উভতি যাওক', view: 'অভিভাৱকৰ দৃশ্য', title: 'অভিভাৱকৰ ডেশ্বব’ৰ্ড', summary: 'যোৰা লগোৱা ডিভাইচৰ কাৰ্যৰ শান্ত আৰু স্পষ্ট সাৰাংশ।', reading: 'যোৰা লগোৱা ডিভাইচৰ ৰেকৰ্ড কৰা কাৰ্য পঢ়ি থকা হৈছে…', paired: 'যোৰা লগোৱা ডিভাইচ', lastSynced: 'শেষবাৰ ছিংক', syncing: 'ছিংক হৈ আছে', online: 'অনলাইন', offline: 'অফলাইন',
    checkingCode: 'সংৰক্ষিত যোৰা ক’ড বিচাৰি থকা হৈছে…', checkAgain: 'আকৌ চাওক', checking: 'চাই থকা হৈছে…', changeCode: 'ক’ড সলনি কৰক', refreshFailed: 'এই যোৰা লগোৱা ডিভাইচৰ ৰেকৰ্ড সতেজ কৰিব পৰা নগ’ল।', noCode: 'এই ক’ডৰ বাবে একো পঢ়িব পৰা নগ’ল।', noCodeDetail: 'ডেশ্বব’ৰ্ডে অনুমান নকৰে। আকৌ চেষ্টা কৰক আৰু একে সমস্যা থাকিলে ক’ডটো ৰোগীৰ ডিভাইচৰ ক’ডৰ সৈতে মিলিছে নে চাওক।', reportedReason: 'জনোৱা কাৰণ',
    summaryLabel: 'সাৰাংশ', recentPerformance: 'শেহতীয়া ফলাফল', recentAverage: 'শেহতীয়াকৈ ৰেকৰ্ড কৰা খেলৰ গড়।', noSessions: 'এতিয়াও কোনো স্মৃতিৰ ছেছন ৰেকৰ্ড হোৱা নাই।', playForTrend: 'ট্ৰেণ্ড চাবলৈ কেইটামান ছেছন খেলক।', noActivity: 'এতিয়াও কোনো কাৰ্য ৰেকৰ্ড হোৱা নাই।', afterPlayed: 'এই কাৰ্য খেলাৰ পাছত ইয়াত দেখা যাব।', average: 'ৰেকৰ্ড কৰা ছেছনৰ গড় {value}%', session: '{count} টা ছেছন', best: 'সৰ্বোত্তম {value}%',
    recentActivity: 'শেহতীয়া কাৰ্য', sessionsAvailable: 'চাব পৰা ৰেকৰ্ড কৰা খেলৰ ছেছন।', reminderCompletion: 'সোঁৱৰণী সম্পূৰ্ণ কৰাৰ হাৰ', completionNote: 'এপত সম্পূৰ্ণ বুলি ৰেকৰ্ড কৰা হৈছে; কামটো সঁচাকৈ হোৱা বুলি প্ৰমাণ নহয়।', noReminder: 'এতিয়াও কোনো সোঁৱৰণী কাৰ্য ৰেকৰ্ড হোৱা নাই।', reminderWillAppear: 'সোঁৱৰণীৰ কাৰ্য ইয়াত দেখা যাব।', completedMissed: '{done} টা সম্পূৰ্ণ · {missed} টা বাদ পৰিল', trendsPrompt: 'ফলাফলৰ ট্ৰেণ্ড চাবলৈ কেইটামান ছেছন খেলক। সোঁৱৰণীৰ কাৰ্য পৃথকে দেখা যাব।', performanceOverTime: 'সময়ৰ সৈতে ফলাফল', cognitivePerformance: 'স্মৃতিৰ ফলাফল', lineHelp: 'প্ৰতিটো ৰেখা এটা খেলৰ স্ক’ৰ। ফাঁক মানে সেই কাৰ্য খেলা হোৱা নাই।',
    atAGlance: 'এটা চকুত', comparison: 'কাৰ্যৰ তুলনা', averageByActivity: 'প্ৰতিটো কাৰ্যৰ ৰেকৰ্ড কৰা গড় স্ক’ৰ।', noCompare: 'তুলনা কৰিবলৈ এতিয়াও কোনো কাৰ্য নাই।', playForActivity: 'প্ৰতিটো কাৰ্য চাবলৈ কেইটামান ছেছন খেলক।', plainReading: 'সহজ ভাষাৰ পঢ়নি', insights: 'ট্ৰেণ্ড আৰু বুজাবুজি', readingsOnly: 'এইবোৰে কেৱল ৰেকৰ্ড কৰা ফলাফল বৰ্ণনা কৰে, স্বাস্থ্য নহয়।', noTrend: 'এতিয়াও কোনো ট্ৰেণ্ড নাই।', trendNeedHistory: 'এটা ধাৰা বৰ্ণনা কৰিবলৈ কেইটামান ৰেকৰ্ড কৰা ছেছন লাগে।',
    reminderActivity: 'সোঁৱৰণীৰ কাৰ্য', reminders: 'সোঁৱৰণী', events: '{count} টা ৰেকৰ্ড কৰা সোঁৱৰণীৰ ঘটনা', latestRecords: 'শেহতীয়া ৰেকৰ্ড', knownRecords: 'চিষ্টেমে জনা ছেছন আৰু সোঁৱৰণী।', noRecent: 'এতিয়াও কোনো শেহতীয়া কাৰ্য ৰেকৰ্ড হোৱা নাই।', explore: 'কাৰ্য অনুসৰি চাওক', detail: 'ডমেইনৰ বিৱৰণ', dynamic: 'খেলৰ তালিকাৰ পৰা সকলো কাৰ্য নিজে তালিকাভুক্ত হয়।', latest: 'শেহতীয়া', averageLabel: 'গড়', bestRecent: 'শেহতীয়া সৰ্বোত্তম', sessionsLabel: 'ছেছন', lastPlayed: 'শেষবাৰ খেলা', notPlayed: 'এতিয়াও খেলা হোৱা নাই',
    reminder: 'সোঁৱৰণী', status: 'স্থিতি', when: 'সময়', completed: 'সম্পূৰ্ণ', missed: 'বাদ পৰিল', completion: 'সম্পূৰ্ণ', statusCompleted: 'সম্পূৰ্ণ বুলি ৰেকৰ্ড কৰা হৈছে', statusMissed: 'বাদ পৰা বুলি ৰেকৰ্ড কৰা হৈছে', noReminderDetail: 'ৰোগীয়ে সোঁৱৰণীত সঁহাৰি দিয়াৰ পাছত ঘটনা ইয়াত দেখা যাব।', completionWarning: 'সম্পূৰ্ণ মানে এপত সোঁৱৰণী সম্পূৰ্ণ বুলি ৰেকৰ্ড কৰা হৈছে; দৰৱ বা কাম সঁচাকৈ কৰা বুলি প্ৰমাণ নহয়।', noData: 'এতিয়াও চাৰ্ট কৰিবলৈ তথ্য নাই।',
    noCognitive: 'এতিয়াও কোনো স্মৃতিৰ ছেছন ৰেকৰ্ড হোৱা নাই।', chartPrompt: 'ফলাফলৰ ট্ৰেণ্ড চাবলৈ কেইটামান ছেছন খেলক।', chartUnavailable: 'এই ডিভাইচত চাৰ্ট দেখা নাযায়।', chartFallback: 'ডমেইনৰ বিৱৰণত ছেছনৰ স্ক’ৰ এতিয়াও চাব পাৰিব।', score: 'স্ক’ৰ', answers: 'শুদ্ধ উত্তৰ', difficulty: 'কঠিনতাৰ স্তৰ', difficultyLevel: 'কঠিনতাৰ স্তৰ', chartAria: 'সময়ৰ সৈতে খেলৰ স্মৃতিৰ ফলাফল',
    disclaimer: 'এইবোৰ ৰোগীৰ ডিভাইচৰ অনুশীলনৰ খেলৰ স্ক’ৰ। এইবোৰ চিকিৎসা মাপ নহয় আৰু কোনো ৰোগ নিৰ্ণয় নকৰে। কোনো চিকিৎসকৰ সৈতে ভাগ কৰক।', decline: 'চিকিৎসকৰ সৈতে কথা পতাৰ কথা ভাবক', notDiagnosis: 'এইটো কোনো ৰোগ নিৰ্ণয় নহয়।', improving: 'উন্নতি হৈছে', declining: 'কমি আছে', stable: 'স্থিৰ', building: 'ইতিহাস গঢ়ি আছে', none: 'এতিয়াও কোনো কাৰ্য নাই',
  },
};

export function dashboardText(language, key, values) {
  const selected = isLanguage(language) ? language : DEFAULT_LANGUAGE;
  return interpolate(DASHBOARD_COPY[selected][key] ?? DASHBOARD_COPY.en[key] ?? key, values);
}

export function localizedTrendLabel(direction, language) {
  const key = { up: 'improving', down: 'declining', steady: 'stable', single: 'building', none: 'none' }[direction] || 'none';
  return dashboardText(language, key);
}

export function localizedReading(metric, language) {
  if (language === 'en') return metric.reading;
  const name = localizeBank(metric.bank, language).name;
  const reading = metric.reading;
  if (!reading.sessions) return { headline: `${name} ${language === 'as' ? 'এতিয়াও খেলা হোৱা নাই।' : 'has not been played yet.'}`, detail: dashboardText(language, 'trendNeedHistory') };
  if (reading.sessions === 1) return { headline: `${name} ${language === 'as' ? 'এতিয়ালৈকে এবাৰ খেলা হৈছে।' : 'has been played once so far.'}`, detail: dashboardText(language, 'trendNeedHistory') };
  const span = reading.sessions === 2
    ? (language === 'as' ? 'বৰ্তমানৰ দুটা ছেছনত' : 'across the two sessions so far')
    : (language === 'as' ? `শেষৰ ${reading.sessions} টা ছেছনত` : `across the last ${reading.sessions} sessions`);
  const averageLine = language === 'as'
    ? `শেহতীয়া ছেছনৰ গড় প্ৰায় ${reading.recent}% আৰু তাৰ আগৰ ছেছনত প্ৰায় ${reading.earlier}%।`
    : `The most recent sessions averaged about ${reading.recent}% of the answers correct, against about ${reading.earlier}% before that.`;
  const suffix = language === 'as' ? '' : ` ${span}.`;
  const verb = reading.direction === 'up' ? (language === 'as' ? 'উন্নতি হৈছে' : 'has been improving') : reading.direction === 'down' ? (language === 'as' ? 'কমি আছে' : 'has declined') : (language === 'as' ? 'স্থিৰ হৈ আছে' : 'has been steady');
  return { headline: language === 'as' ? `${span} ${name} ${verb}।` : `${name} ${verb} ${span}.`, detail: averageLine };
}

const WORD_TRANSLATIONS = {
  cup: 'কাপ', dog: 'কুকুৰ', hat: 'টুপি', sun: 'সূৰ্য', bed: 'বিচনা', car: 'গাড়ী', key: 'চাবি', rain: 'বৰষুণ',
  fish: 'মাছ', tree: 'গছ', milk: 'গাখীৰ', shoe: 'জোতা', bird: 'চৰাই', door: 'দুৱাৰ', salt: 'নিমখ', bread: 'ৰুটি',
  moon: 'জোন', bus: 'বাছ', chair: 'চকী', rice: 'চাউল', star: 'তৰা', road: 'পথ', tea: 'চাহ', house: 'ঘৰ',
  water: 'পানী', letter: 'চিঠি', soap: 'চাবোন', flower: 'ফুল', spoon: 'চামুচ', table: 'মেজ', garden: 'বাগিচা',
  light: 'পোহৰ', towel: 'গামোচা', morning: 'পুৱা', phone: 'ফোন', toast: 'টোষ্ট', watch: 'হাতঘড়ী', cap: 'টুপি',
  snow: 'বৰফ', cat: 'মেকুৰী', fork: 'কাঁটা-চামুচ', window: 'খিৰিকী', coffee: 'কফি', street: 'ৰাস্তা', lamp: 'বাতি',
  lock: 'তলা', train: 'ৰেলগাড়ী', evening: 'সন্ধিয়া', home: 'ঘৰ', sugar: 'চেনি', foot: 'ভৰি', gate: 'দুৱাৰ',
  van: 'ভেন', pillow: 'গাৰু', hand: 'হাত',
};

const DIGIT_WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };
const DIGIT_WORDS_AS = { 1: 'এক', 2: 'দুই', 3: 'তিনি', 4: 'চাৰি', 5: 'পাঁচ', 6: 'ছয়', 7: 'সাত', 8: 'আঠ', 9: 'নয়' };
const DIGITS_AS = { 1: '১', 2: '২', 3: '৩', 4: '৪', 5: '৫', 6: '৬', 7: '৭', 8: '৮', 9: '৯' };
const SHAPE_TRANSLATIONS = { circle: 'বৃত্ত', square: 'বৰ্গ', triangle: 'ত্ৰিভুজ', diamond: 'হীৰা' };

const ROUTINE_CUES_AS = {
  'rm-1': 'দাঁত ব্ৰাছ কৰাৰ সময় হৈছে।', 'rm-2': 'আপুনি চাহৰ বাবে পানী উতলাব বিচাৰে।', 'rm-3': 'দৰৱ খোৱাৰ সময় হৈছে।',
  'rm-4': 'আপুনি বহি কিতাপ পঢ়িব বিচাৰে।', 'rm-5': 'বাহিৰত বৰষুণ দি আছে।', 'rm-6': 'আপুনি চুপ খাবলৈ গৈ আছে।',
  'rm-7': 'আপুনি খোজ কাঢ়িবলৈ বাহিৰলৈ যাব।', 'rm-8': 'ৰাতি হৈছে আৰু শুবৰ সময় হৈছে।', 'rm-9': 'আপুনি হাত ধুব বিচাৰে।',
  'rm-10': 'আপুনি আপোনাৰ জীয়েকক ফোন কৰিব বিচাৰে।', 'rm-11': 'আপুনি বন্ধুলৈ এখন টোকা পঠাব বিচাৰে।', 'rm-12': 'আজি সন্ধিয়া কোঠাটো আন্ধাৰ।',
  'rm-13': 'আখৰবোৰ পঢ়িবলৈ বৰ সৰু।', 'rm-14': 'আপুনি ওলাই যাব আৰু তলা মাৰিব লাগিব।', 'rm-15': 'ধোৱাৰ পাছত আপোনাৰ মুখখন তিতা।',
  'rm-16': 'আপুনি সময়টো জানিব বিচাৰে।', 'rm-17': 'আপুনি অলপ গৰম চাহ বিচাৰে।', 'rm-18': 'আপুনি পিয়াহ লাগিছে আৰু ঠাণ্ডা কিবা বিচাৰে।',
  'rm-19': 'দাঁত পৰিষ্কাৰ কৰাৰ সময় হৈছে।', 'rm-20': 'আপুনি চুলি আঁচুৰিব বিচাৰে।', 'rm-21': 'আপুনি চাহ লৰাব বিচাৰে।',
  'rm-22': 'খোৱা বস্তু থ’বলৈ আপোনাক এখন ঠাই লাগে।', 'rm-23': 'আপুনি ভাগৰুৱা আৰু শুব বিচাৰে।', 'rm-24': 'আপুনি বহি খাব বিচাৰে।',
};

function interpolate(value, values = {}) {
  return String(value ?? '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export function t(language, key, values) {
  const selected = isLanguage(language) ? language : DEFAULT_LANGUAGE;
  const get = (source) => key.split('.').reduce((part, name) => part?.[name], source);
  return interpolate(get(COPY[selected]) ?? get(COPY.en) ?? key, values);
}

export function listWordsLocalized(words, language) {
  if (language !== 'as') return listWords(words);
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} আৰু ${words[words.length - 1]}`;
}

export function itemText(id, language) {
  if (language === 'as') return ITEM_TRANSLATIONS[id] || ITEMS[id]?.label || id;
  return ITEMS[id]?.label || id;
}

export function wordText(word, language) {
  if (language === 'as') return WORD_TRANSLATIONS[String(word).toLowerCase()] || word;
  return word;
}

export function digitWord(digit, language) {
  return language === 'as' ? DIGIT_WORDS_AS[digit] || String(digit) : DIGIT_WORDS[digit] || String(digit);
}

export function digitText(digit, language) {
  return language === 'as' ? DIGITS_AS[digit] || String(digit) : String(digit);
}

export function shapeText(shape, language) {
  return language === 'as' ? SHAPE_TRANSLATIONS[shape] || shape : PATTERN_SHAPES[shape]?.label || shape;
}

export function localizeCards(cards = [], language) {
  return cards.map((card) => {
    if (card.shape) return { ...card };
    const digit = /^\d+$/.test(String(card.text)) ? Number(card.text) : null;
    return { ...card, text: digit ? digitText(digit, language) : wordText(card.text, language) };
  });
}

export function localizeOption(option, language) {
  if (option.item) {
    const label = itemText(option.item, language);
    return { ...option, text: label, label };
  }
  if (option.cards) {
    const labels = option.cards.map((card) => shapeText(card.shape, language));
    return { ...option, cards: localizeCards(option.cards, language), label: listWordsLocalized(labels, language) };
  }
  const digit = /^\d+$/.test(String(option.text)) ? Number(option.text) : null;
  if (digit) return { ...option, text: digitText(digit, language), label: digitWord(digit, language) };
  const text = wordText(option.text, language);
  return { ...option, text, label: text };
}

export function localizeQuestion(bank, question, language) {
  if (!question) return question;
  const domain = bank.domain;
  const cards = localizeCards(question.studyCards, language);
  let studyPrompt = question.studyPrompt;
  let prompt = question.prompt;
  if (domain === 'about_me' && question.translations) {
    prompt = question.translations[language]?.prompt || question.translations.en?.prompt || prompt;
  } else if (language === 'as') {
    if (domain === 'memory_recall') {
      studyPrompt = `এই ${itemText(question.studyItem, language)} ছবিখন চাওক। মনত ৰাখিবলৈ চেষ্টা কৰক।`;
      prompt = 'আপুনি এতিয়াই কোনখন ছবি দেখিছিল?';
    } else if (domain === 'routine_matching') {
      studyPrompt = null;
      prompt = `${ROUTINE_CUES_AS[question.id] || question.prompt} কোনটো আপোনাক লাগে?`;
    } else if (domain === 'word_recall') {
      studyPrompt = `এই শব্দবোৰ মনত ৰাখক: ${listWordsLocalized(cards.map((card) => card.text), language)}।`;
      prompt = 'আপুনি এতিয়াই কোনটো শব্দ দেখিছিল?';
    } else if (domain === 'number_sequence') {
      studyPrompt = `এই সংখ্যাবোৰ মনত ৰাখক: ${listWordsLocalized(question.studyCards.map((card) => digitWord(Number(card.text), language)), language)}।`;
      prompt = question.tier === 1 ? 'আপুনি এতিয়াই কোনটো সংখ্যা দেখিছিল?' : question.tier === 2 ? 'কোনটো সংখ্যা শেষত আহিছিল?' : 'কোনটো সংখ্যা প্ৰথমে আহিছিল?';
    } else if (domain === 'pattern_matching') {
      const labels = question.studyCards.map((card) => shapeText(card.shape, language));
      studyPrompt = `এই আৰ্হিটো মনত ৰাখক: ${listWordsLocalized(labels, language)}।`;
      prompt = 'আপুনি এতিয়াই কোনটো আৰ্হি দেখিছিল?';
    }
  }
  return { ...question, studyPrompt, prompt, studyCards: cards, options: question.options.map((option) => localizeOption(option, language)) };
}

export function localizeBank(bank, language) {
  if (language === 'en') return bank;
  const copy = COPY.as.domains[bank.domain];
  return {
    ...bank,
    name: copy.name,
    unitLabel: copy.unit,
    benefit: copy.benefit,
    difficultyGuide: copy.difficulty,
    tierDetail: { easier: copy.easier, harder: copy.harder },
  };
}

export function localizeDone(domain, correct, asked, language) {
  return t(language, `domains.${domain}.done`, { correct, asked });
}

export function localizeMiss(domain, answer, language) {
  return t(language, `domains.${domain}.miss`, { answer });
}

export function localizeReminder(slot, language) {
  const base = REMINDER_WORDING[slot?.type];
  if (!base) return null;
  if (language !== 'as') return base;
  const lines = {
    medicine: 'আপোনাৰ দৰৱ খোৱাৰ সময় হৈছে।',
    hydration: 'অনুগ্ৰহ কৰি অলপ পানী খাওক।',
    appointment: 'আজি আপোনাৰ এটা সাক্ষাৎ আছে। কোনোবাই আপোনাক সাজু হোৱাত সহায় কৰিব।',
  };
  return { ...base, line: lines[slot.type] || base.line };
}
