import {z} from 'genkit';

export const BudgetAdjustmentSuggestionsInputSchema = z.object({
  spendingPatterns: z
    .string()
    .describe(
      'Детальний опис моделей витрат користувача за різними категоріями.'
    ),
  financialGoals: z
    .string()
    .describe('Заявлені фінансові цілі користувача, напр., заощадження на перший внесок, погашення боргу.'),
});
export type BudgetAdjustmentSuggestionsInput = z.infer<
  typeof BudgetAdjustmentSuggestionsInputSchema
>;

export const BudgetAdjustmentSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Список запропонованих коригувань до категорій бюджету, з поясненнями до кожної пропозиції.'
    ),
});
export type BudgetAdjustmentSuggestionsOutput = z.infer<
  typeof BudgetAdjustmentSuggestionsOutputSchema
>;
