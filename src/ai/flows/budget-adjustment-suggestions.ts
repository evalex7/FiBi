'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing budget adjustment suggestions based on user spending patterns and financial goals.
 *
 * The flow analyzes user data to recommend changes in budget allocations for optimized savings.
 *
 * @interface BudgetAdjustmentSuggestionsInput - Input data schema for the budget adjustment suggestions flow.
 * @interface BudgetAdjustmentSuggestionsOutput - Output data schema for the budget adjustment suggestions flow.
 * @function getBudgetAdjustmentSuggestions - The main function to trigger the budget adjustment suggestions flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BudgetAdjustmentSuggestionsInputSchema = z.object({
  spendingPatterns: z
    .string()
    .describe(
      'A detailed description of the user spending patterns across different categories.'
    ),
  financialGoals: z
    .string()
    .describe('The stated financial goals of the user, e.g., saving for a down payment, paying off debt.'),
});
export type BudgetAdjustmentSuggestionsInput = z.infer<typeof BudgetAdjustmentSuggestionsInputSchema>;

const BudgetAdjustmentSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of suggested adjustments to the budget categories, with explanations for each suggestion.'
    ),
});
export type BudgetAdjustmentSuggestionsOutput = z.infer<typeof BudgetAdjustmentSuggestionsOutputSchema>;

export async function getBudgetAdjustmentSuggestions(
  input: BudgetAdjustmentSuggestionsInput
): Promise<BudgetAdjustmentSuggestionsOutput> {
  return budgetAdjustmentSuggestionsFlow(input);
}

const budgetAdjustmentSuggestionsPrompt = ai.definePrompt({
  name: 'budgetAdjustmentSuggestionsPrompt',
  input: {schema: BudgetAdjustmentSuggestionsInputSchema},
  output: {schema: BudgetAdjustmentSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending patterns and financial goals to provide budget adjustment suggestions.

Spending Patterns: {{{spendingPatterns}}}
Financial Goals: {{{financialGoals}}}

Provide clear and actionable suggestions to help the user save money and optimize their budget allocation. Focus on specific categories and explain the reasoning behind each suggestion.`,
});

const budgetAdjustmentSuggestionsFlow = ai.defineFlow(
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
