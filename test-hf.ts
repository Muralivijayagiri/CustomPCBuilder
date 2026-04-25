import { HfInference } from '@huggingface/inference';
import { config } from './server/config/env';

const hf = new HfInference(config.hfToken);

async function test() {
  try {
    const response = await hf.chatCompletion({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 100,
    });
    console.log('Response:', response);
  } catch (error: any) {
    console.error('Error detail:', error.message);
  }
}

test();
