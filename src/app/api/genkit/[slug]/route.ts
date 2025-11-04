'use server';
import { ai } from '@/ai/genkit';
import { defineNextJsHandler } from '@genkit-ai/next';

const { GET, POST } = defineNextJsHandler({
  ai,
  flows: [],
});

export { GET, POST };
