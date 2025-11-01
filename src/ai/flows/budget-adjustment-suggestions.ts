'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing budget adjustment suggestions based on user spending patterns and financial goals.
 *
 * The flow analyzes user data to recommend changes in budget allocations for optimized savings.
 */

import {ai} from '@/ai/genkit';
import {
  BudgetAdjustmentSuggestionsInputSchema,
  BudgetAdjustmentSuggestionsOutputSchema,
  type BudgetAdjustmentSuggestionsInput,
  type BudgetAdjustmentSuggestionsOutput,
} from '@/lib/types-ai';

const budgetAdjustmentSuggestionsPrompt = ai.definePrompt({
  name: 'budgetAdjustmentSuggestionsPrompt',
  model: 'gemini-pro',
  input: {schema: BudgetAdjustmentSuggestionsInputSchema},
  output: {schema: BudgetAdjustmentSuggestionsOutputSchema},
  prompt: `Ви — особистий фінансовий консультант. Проаналізуйте моделі витрат користувача та фінансові цілі, щоб надати пропозиції щодо коригування бюджету.

Моделі витрат: {{{spendingPatterns}}}
Фінансові цілі: {{{financialGoals}}}

Надайте чіткі та дієві пропозиції, які допоможуть користувачеві заощадити гроші та оптимізувати розподіл бюджету. Зосередьтеся на конкретних категоріях і поясніть причину кожної пропозиції. Відповідайте українською мовою.`,
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
