import test from 'node:test';
import assert from 'node:assert/strict';
import { createAboutMeBank } from '../src/data/aboutMe.js';
import { isCompleteProfile, profileFacts, validateProfileField } from '../src/lib/patientProfile.js';
import { answerQuestion, continueSession, startSession } from '../src/lib/sessionEngine.js';

const profile = {
  name: 'Rina', age: '70', gender: 'Woman', city: 'Guwahati', pastOccupation: 'Teacher',
  favouriteFood: 'Rice', favouriteColour: 'Blue', familyMemberName: 'Maya', familyMemberRelation: 'Daughter',
  emergencyContactName: 'Amit', emergencyContactPhone: '98765 43210',
};

test('profile validation is gentle but requires each onboarding answer and a plausible phone', () => {
  assert.equal(isCompleteProfile(profile), true);
  assert.match(validateProfileField('name', ''), /Please add/);
  assert.match(validateProfileField('emergencyContactPhone', '12'), /7 to 15/);
});

test('About Me generates personal questions only, with one correct answer and tiered choices', () => {
  const bank = createAboutMeBank(profile);
  assert.equal(bank.domain, 'about_me');
  assert.equal(bank.questions.length, profileFacts(profile).length);
  assert.ok(bank.questions.every((question) => !question.id.includes('Amit') && !question.id.includes('98765')));
  assert.ok(!bank.questions.some((question) => question.id.includes('emergency')));
  for (const question of bank.questions) {
    assert.equal(question.options.length, question.tier + 1);
    assert.equal(question.options.filter((option) => option.id === question.answerId).length, 1);
    assert.equal(new Set(question.options.map((option) => option.text.toLowerCase())).size, question.options.length);
  }
});

test('About Me runs through the shared engine and logs its stable domain and question id', () => {
  const bank = createAboutMeBank(profile);
  let session = startSession({ bank, rand: () => 0 });
  const first = answerQuestion(session, session.question.answerId, 10);
  assert.equal(first.record.domain, 'about_me');
  assert.match(first.record.questionId, /^am-/);
  session = continueSession(first.state, { bank, now: 20, rand: () => 0 });
  assert.ok(['ask', 'tier', 'done'].includes(session.phase));
});
