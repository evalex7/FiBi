'use server';
import { ai } from '@/ai/genkit';
import { defineNextJsHandler } from '@genkit-ai/next';
import { budgetAdjustmentSuggestionsFlow } from '@/ai/flows/budget-adjustment-suggestions';
import { getFamilyCreditData } from '@/ai/flows/get-family-credit-data';

const { GET, POST } = defineNextJsHandler({
  ai,
  flows: [budgetAdjustmentSuggestionsFlow, getFamilyCreditData],
});

export { GET, POST };
