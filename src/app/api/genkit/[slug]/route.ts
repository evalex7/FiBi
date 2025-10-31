import {genkit} from '@/ai/genkit';
import {defineNextJsHandler} from '@genkit-ai/next';

// This is the easiest way to use Genkit with Next.js.
export const POST = defineNextJsHandler({
  ai: genkit,
});
