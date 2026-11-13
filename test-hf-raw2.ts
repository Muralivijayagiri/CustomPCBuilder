import { config } from './server/config/env';

async function test() {
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-small', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Hello world',
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

test();
