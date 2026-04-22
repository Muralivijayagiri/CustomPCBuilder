import { Router } from 'express';
import { checkContext, streamRecommendation } from '../services/gemini';
import { fetchAllCategories } from '../services/supabase';
import { searchKnowledge } from '../services/rag';
import { ChatRequest, Message } from '../types';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.post('/chat', async (req, res) => {
  try {
    // Step A: Validate request body
    const { message, history } = req.body as ChatRequest;
    
    if (typeof message !== 'string' || !Array.isArray(history)) {
      res.status(400).json({ error: 'Invalid request: message must be a string and history must be an array.' });
      return;
    }

    // Step B: Run context check
    const contextResponse = await checkContext(history, message);

    // Step C: Branch on context result
    if (!contextResponse.includes('CONTEXT_COMPLETE')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      res.write(contextResponse);
      res.end();
      return;
    }

    // Extract JSON intent
    let intentData;
    try {
      const parts = contextResponse.split('CONTEXT_COMPLETE:');
      const jsonString = parts[1].trim();
      intentData = JSON.parse(jsonString);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to parse user intent from context.' });
      return;
    }

    // Step D: Parallel data fetch
    let components, knowledge;
    try {
      [components, knowledge] = await Promise.all([
        fetchAllCategories(intentData.budget),
        searchKnowledge(message)
      ]);
    } catch (err: any) {
      res.status(500).json({ error: `Failed to fetch data: ${err.message}` });
      return;
    }

    // Step E: Stream the recommendation
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    try {
      const stream = await streamRecommendation(history, message, components, knowledge, intentData);
      
      for await (const chunk of stream) {
        // Handle getter vs method depending on exact TS type, usually chunk.text in newer @google/genai
        const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
        if (text) {
          res.write(text);
        }
      }
      res.end();
    } catch (streamErr: any) {
      res.write(`\n\n[Error generating response: ${streamErr.message}]`);
      res.end();
    }

  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: `Server error: ${error.message}` });
    } else {
      res.write(`\n\n[Server error: ${error.message}]`);
      res.end();
    }
  }
});

export default router;
