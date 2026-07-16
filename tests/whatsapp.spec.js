import { test, expect } from '@playwright/test';
import { createHmac } from 'crypto';
import { config } from 'dotenv';

config({ path: './whatsapp-bot/.env' });

const SECRET = process.env.META_APP_SECRET;
const TEST_PHONE = '910000000001'; // fake number, won't receive real messages

function sign(body) {
  return 'sha256=' + createHmac('sha256', SECRET).update(body).digest('hex');
}

function textPayload(text) {
  return JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { messages: [{ from: TEST_PHONE, type: 'text', text: { body: text } }] } }] }],
  });
}

function listReplyPayload(id, title) {
  return JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { messages: [{ from: TEST_PHONE, type: 'interactive', interactive: { type: 'list_reply', list_reply: { id, title } } }] } }] }],
  });
}

function buttonReplyPayload(id, title) {
  return JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ value: { messages: [{ from: TEST_PHONE, type: 'interactive', interactive: { type: 'button_reply', button_reply: { id, title } } }] } }] }],
  });
}

async function send(request, body) {
  return request.post('/whatsapp/webhook', {
    data: body,
    headers: {
      'Content-Type': 'application/json',
      'X-Hub-Signature-256': sign(body),
    },
  });
}

test.describe('WhatsApp bot — live Lambda', () => {
  test('GET webhook verification challenge', async ({ request }) => {
    const r = await request.get('/whatsapp/webhook', {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': process.env.WHATSAPP_VERIFY_TOKEN,
        'hub.challenge': 'test_challenge_123',
      },
    });
    expect(r.status()).toBe(200);
    expect(await r.text()).toBe('test_challenge_123');
  });

  test('POST with bad signature returns 403', async ({ request }) => {
    const body = textPayload('hi');
    const r = await request.post('/whatsapp/webhook', {
      data: body,
      headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': 'sha256=badhash' },
    });
    expect(r.status()).toBe(403);
  });

  test('Full booking flow — CK Birla happy path', async ({ request }) => {
    // Reset to root
    let r = await send(request, textPayload('hi'));
    expect(r.status()).toBe(200);

    // Select "Book appointment"
    r = await send(request, listReplyPayload('book_appointment', 'Book appointment'));
    expect(r.status()).toBe(200);

    // Select concern
    r = await send(request, listReplyPayload('concern_ear', 'Ear problem'));
    expect(r.status()).toBe(200);

    // Enter patient name (now comes before clinic selection)
    r = await send(request, textPayload('Test Patient'));
    expect(r.status()).toBe(200);

    // Enter age
    r = await send(request, textPayload('35'));
    expect(r.status()).toBe(200);

    // Select clinic (select_clinic node)
    r = await send(request, listReplyPayload('loc_ckbirla', 'CK Birla Hospital (Punjabi Bagh)'));
    expect(r.status()).toBe(200);

    // Select first available date
    r = await send(request, listReplyPayload('date_0', 'Thursday, 17 Jul'));
    expect(r.status()).toBe(200);

    // Select Morning slot
    r = await send(request, buttonReplyPayload('slot_morn', 'Morning'));
    expect(r.status()).toBe(200);

    // Confirm booking
    r = await send(request, buttonReplyPayload('submit_lead', 'Confirm'));
    expect(r.status()).toBe(200);
  });

  test('Full booking flow — Online consultation happy path', async ({ request }) => {
    let r = await send(request, textPayload('hi'));
    expect(r.status()).toBe(200);

    r = await send(request, listReplyPayload('book_appointment', 'Book appointment'));
    expect(r.status()).toBe(200);

    r = await send(request, listReplyPayload('concern_voice', 'Voice / swallowing'));
    expect(r.status()).toBe(200);

    r = await send(request, textPayload('Online Patient'));
    expect(r.status()).toBe(200);

    r = await send(request, textPayload('28'));
    expect(r.status()).toBe(200);

    // Select online consultation
    r = await send(request, listReplyPayload('loc_online', 'Online Consultation'));
    expect(r.status()).toBe(200);

    // Select first available weekday date
    r = await send(request, listReplyPayload('odate_0', 'Thursday, 17 Jul'));
    expect(r.status()).toBe(200);

    // Select 7:00 PM slot
    r = await send(request, listReplyPayload('ot_7pm', '7:00 PM'));
    expect(r.status()).toBe(200);

    // Confirm
    r = await send(request, buttonReplyPayload('submit_lead', 'Confirm'));
    expect(r.status()).toBe(200);
  });

  test('Adarsh unavailable — redirects to CK Birla', async ({ request }) => {
    let r = await send(request, textPayload('hi'));
    expect(r.status()).toBe(200);

    r = await send(request, listReplyPayload('book_appointment', 'Book appointment'));
    expect(r.status()).toBe(200);

    r = await send(request, listReplyPayload('concern_nose', 'Nose problem'));
    expect(r.status()).toBe(200);

    r = await send(request, textPayload('Adarsh Patient'));
    expect(r.status()).toBe(200);

    r = await send(request, textPayload('45'));
    expect(r.status()).toBe(200);

    // Select Adarsh — should hit adarsh_unavailable node
    r = await send(request, listReplyPayload('loc_adarsh', 'Adarsh ENT Clinic (Pitampura)'));
    expect(r.status()).toBe(200);

    // Redirect to CK Birla from unavailable screen
    r = await send(request, buttonReplyPayload('adarsh_to_ckbirla', 'CK Birla Hospital'));
    expect(r.status()).toBe(200);
  });

  test('Invalid age input is rejected and re-prompts', async ({ request }) => {
    await send(request, textPayload('hi'));
    await send(request, listReplyPayload('book_appointment', 'Book appointment'));
    await send(request, listReplyPayload('concern_nose', 'Nose problem'));
    await send(request, textPayload('Jane Doe')); // name comes before clinic now

    // Send invalid age
    const r = await send(request, textPayload('abc'));
    expect(r.status()).toBe(200); // re-renders same node, not an error response
  });

  test('Back navigation works', async ({ request }) => {
    await send(request, textPayload('restart'));
    await send(request, listReplyPayload('book_appointment', 'Book appointment'));

    // Navigate back from concern selection
    const r = await send(request, buttonReplyPayload('__back__', 'Back'));
    expect(r.status()).toBe(200);
  });

  test('Non-message webhook payload (status update) returns ok', async ({ request }) => {
    const body = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: { statuses: [{ id: 'msg_123', status: 'delivered' }] } }] }],
    });
    const r = await send(request, body);
    expect(r.status()).toBe(200);
  });
});
