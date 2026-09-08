import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDoctorRole, isPatientProfileComplete } from '../lib/onboarding.ts';

test('only complete patient demographics allow onboarding to finish', () => {
  assert.equal(isPatientProfileComplete(null), false);
  assert.equal(isPatientProfileComplete({ dateOfBirth: null, sex: 'Male' }), false);
  assert.equal(isPatientProfileComplete({ dateOfBirth: new Date('2000-01-01'), sex: '' }), false);
  assert.equal(isPatientProfileComplete({ dateOfBirth: new Date('2999-01-01'), sex: 'Male' }), false);
  assert.equal(isPatientProfileComplete({ dateOfBirth: new Date('2000-01-01'), sex: 'Prefer not to say' }), true);
});

test('doctor role supports existing dermatologists without accepting other roles', () => {
  assert.equal(isDoctorRole('DOCTOR'), false);
  assert.equal(isDoctorRole('DERMATOLOGIST'), true);
  for (const role of ['PATIENT', 'ADMIN', 'doctor', null]) assert.equal(isDoctorRole(role), false);
});
