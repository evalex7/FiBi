'use server';
import { ai } from '@/ai/genkit';
import { defineNextJsHandler } from '@genkit-ai/next';
import '@/ai/flows/budget-adjustment-suggestions';

const { GET, POST } = defineNextJsHandler({
  ai,
});

export { GET, POST };
