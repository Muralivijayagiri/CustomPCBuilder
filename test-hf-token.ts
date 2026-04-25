import { HfInference } from '@huggingface/inference';
import { config } from './server/config/env';

const hf = new HfInference(config.hfToken);

async function test(model: string) {
  try {
    const response = await hf.chatCompletion({
      model: model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 20,
    });
    console.log('SUCCESS:', model);
  } catch (error: any) {
    console.log('FAIL:', model, error.message);
  }
}

async function run() {
  await test('meta-llama/Meta-Llama-3-8B-Instruct');
  await test('mistralai/Mistral-7B-Instruct-v0.2');
  await test('01-ai/Yi-1.5-34B-Chat');
  await test('microsoft/Phi-3-mini-4k-instruct');
  await test('Qwen/Qwen2.5-Coder-32B-Instruct');
  await test('HuggingFaceH4/zephyr-7b-beta');
}

run();
