'use client';
import { config } from 'dotenv';
config();

import { budgetAdjustmentSuggestionsFlow } from '@/ai/flows/budget-adjustment-suggestions';

// This is the entry point for the Genkit developer UI.
// You can edit this file to add and remove flows to be developed.
export default {
  flows: [budgetAdjustmentSuggestionsFlow],
};
