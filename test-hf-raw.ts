import { config } from './server/config/env';

async function test(model: string) {
  console.log('Testing', model);
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 100
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Data:', text.substring(0, 200));
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

async function run() {
  await test('meta-llama/Meta-Llama-3-8B-Instruct');
  await test('mistralai/Mistral-7B-Instruct-v0.3');
  await test('HuggingFaceH4/zephyr-7b-beta');
}

run();
