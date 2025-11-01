'use server';
import { ai } from '@/ai/genkit';
import { defineNextJsHandler } from '@genkit-ai/next';
import { budgetAdjustmentSuggestionsFlow } from '@/ai/flows/budget-adjustment-suggestions';

const { GET, POST } = defineNextJsHandler({
  ai,
  flows: [budgetAdjustmentSuggestionsFlow],
});

export { GET, POST };
