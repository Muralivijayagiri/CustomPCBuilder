import { HfInference } from '@huggingface/inference';
import { config } from './server/config/env';

const hf = new HfInference(config.hfToken);

async function test(model: string) {
  console.log('Testing', model);
  try {
    const response = await hf.chatCompletion({
      model: model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 100,
    });
    console.log('Response:', response.choices[0].message.content);
  } catch (error: any) {
    console.error('Error detail:', error.message);
  }
}

async function run() {
  await test('meta-llama/Llama-3.2-3B-Instruct');
  await test('mistralai/Mistral-7B-Instruct-v0.3');
  await test('HuggingFaceH4/zephyr-7b-beta');
  await test('mistralai/Mixtral-8x7B-Instruct-v0.1');
}

run();
