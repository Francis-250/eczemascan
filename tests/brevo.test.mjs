import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendEmail, sendEmailOrThrow } from '../lib/brevo.ts';

test('Brevo sends real API payloads and does not report failures as success', async () => {
  const originalFetch = globalThis.fetch;
  const keys = ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'BREVO_SENDER_NAME'];
  const original = keys.map(key => process.env[key]);
  Object.assign(process.env, { BREVO_API_KEY: 'test-key', BREVO_SENDER_EMAIL: 'sender@example.com', BREVO_SENDER_NAME: 'EczemaScan' });
  const message = { to: 'patient@example.com', subject: 'Verification', text: 'Test content' };
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
      assert.equal(options.headers['api-key'], 'test-key');
      assert.deepEqual(JSON.parse(options.body), { sender: { email: 'sender@example.com', name: 'EczemaScan' }, to: [{ email: message.to }], subject: message.subject, textContent: message.text });
      return Response.json({ messageId: 'accepted-id' }, { status: 201 });
    };
    assert.deepEqual(await sendEmailOrThrow(message), { success: true, messageId: 'accepted-id' });
    globalThis.fetch = async () => Response.json({}, { status: 401 });
    await assert.rejects(sendEmailOrThrow(message), /delivery failed/);
    globalThis.fetch = async () => Response.json({});
    assert.equal((await sendEmail(message)).success, false);
    globalThis.fetch = async () => { throw new Error('network'); };
    await assert.rejects(sendEmailOrThrow(message), /Unable to reach/);
    delete process.env.BREVO_API_KEY;
    await assert.rejects(sendEmailOrThrow(message), /not configured/);
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => { if (original[i] === undefined) delete process.env[key]; else process.env[key] = original[i]; });
  }
});
