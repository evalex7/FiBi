'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing budget adjustment suggestions based on user spending patterns and financial goals.
 *
 * The flow analyzes user data to recommend changes in budget allocations for optimized savings.
 */

import {ai} from '@/ai/genkit';
import {
  type BudgetAdjustmentSuggestionsInput,
  type BudgetAdjustmentSuggestionsOutput,
  BudgetAdjustmentSuggestionsInputSchema,
  BudgetAdjustmentSuggestionsOutputSchema
} from '@/lib/types-ai';

const budgetAdjustmentSuggestionsPrompt = ai.definePrompt({
  name: 'budgetAdjustmentSuggestionsPrompt',
  model: 'gemini-1.5-flash-latest',
  input: {schema: BudgetAdjustmentSuggestionsInputSchema},
  output: {schema: BudgetAdjustmentSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending patterns and financial goals to provide budget adjustment suggestions.

Spending Patterns: {{{spendingPatterns}}}
Financial Goals: {{{financialGoals}}}

Provide clear and actionable suggestions to help the user save money and optimize their budget allocation. Focus on specific categories and explain the reasoning behind each suggestion.`,
});

export const budgetAdjustmentSuggestionsFlow = ai.defineFlow(
  {
    name: 'budgetAdjustmentSuggestionsFlow',
    inputSchema: BudgetAdjustmentSuggestionsInputSchema,
    outputSchema: BudgetAdjustmentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await budgetAdjustmentSuggestionsPrompt(input);
    return output!;
  }
);

export async function budgetAdjustmentSuggestions(
  input: BudgetAdjustmentSuggestionsInput
): Promise<BudgetAdjustmentSuggestionsOutput> {
  return budgetAdjustmentSuggestionsFlow(input);
}
