import { test } from 'node:test';
import assert from 'node:assert/strict';
import { predictEczemaCondition } from '../lib/groq.ts';



test('sends each uploaded image, preserves returned results, and rejects failed assessments', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-only';
  const requests = [];
  let result = { imageAssessment: 'NO_VISIBLE_LESION', condition: 'OTHER', confidenceScore: 0.8, explanation: 'No visible lesion.' };
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return Response.json({ choices: [{ message: { content: JSON.stringify(result) } }] });
  };
  try {
    const first = await predictEczemaCondition({ imageUrl: 'data:image/jpeg;base64,Zmlyc3Q=' });
    result = { imageAssessment: 'ASSESSABLE', condition: 'ECZEMA', confidenceScore: 0.7, explanation: 'Visible scaly patches.' };
    const second = await predictEczemaCondition({ imageUrl: 'data:image/jpeg;base64,c2Vjb25k' });
    assert.equal(first.condition, 'OTHER');
    assert.equal(requests[0].max_completion_tokens, 512);
    assert.equal(requests[0].reasoning_effort, "none");
    assert.equal(second.condition, 'ECZEMA');
    assert.notEqual(requests[0].messages[1].content[1].image_url.url, requests[1].messages[1].content[1].image_url.url);
    assert.equal(requests[0].messages[1].content[0].text, requests[1].messages[1].content[0].text);
    result = { ...result, imageAssessment: 'UNASSESSABLE', condition: 'OTHER' };
    await assert.rejects(predictEczemaCondition({ imageUrl: 'data:image/jpeg;base64,eA==' }), /could not be assessed/);
    result = { ...result, imageAssessment: 'ASSESSABLE', confidenceScore: 2 };
    await assert.rejects(predictEczemaCondition({ imageUrl: 'data:image/jpeg;base64,eA==' }), /invalid result/);
    globalThis.fetch = async () => Response.json({ error: { code: "json_validate_failed" } }, { status: 400 });
    await assert.rejects(predictEczemaCondition({ imageUrl: "data:image/jpeg;base64,eA==" }), /complete result/);
    globalThis.fetch = async () => Response.json({}, { status: 429 });
    await assert.rejects(predictEczemaCondition({ imageUrl: 'data:image/jpeg;base64,eA==' }), /usage limit/);
    globalThis.fetch = async () => Response.json({}, { status: 503 });
    await assert.rejects(predictEczemaCondition({ imageUrl: 'data:image/jpeg;base64,eA==' }), /unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalKey;
  }
});
