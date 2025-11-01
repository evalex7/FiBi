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
      'Детальний опис моделей витрат користувача за різними категоріями.'
    ),
  financialGoals: z
    .string()
    .describe('Заявлені фінансові цілі користувача, напр., заощадження на перший внесок, погашення боргу.'),
});
export type BudgetAdjustmentSuggestionsInput = z.infer<typeof BudgetAdjustmentSuggestionsInputSchema>;

const BudgetAdjustmentSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Список запропонованих коригувань до категорій бюджету, з поясненнями до кожної пропозиції.'
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