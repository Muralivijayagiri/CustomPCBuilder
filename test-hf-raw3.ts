import { config } from './server/config/env';

async function test() {
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Hello world',
      })
    });
    console.log('Status HTTP:', res.status);
    const text = await res.text();
    console.log('Raw text:', text);
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

test();
