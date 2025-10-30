'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockBudgets } from '@/lib/data';
import { categoryIcons } from '@/lib/category-icons';
import { allCategories } from '@/lib/category-icons';
import { useTransactions } from '@/contexts/transactions-context';

export default function BudgetList() {
  const { transactions } = useTransactions();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);

  const spentAmounts = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
        const budgetCategory = mockBudgets.find(b => b.category === t.category);
        if (budgetCategory) {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Місячні бюджети</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockBudgets.map((budget) => {
            const spent = spentAmounts[budget.category] || 0;
            const progress = (spent / budget.amount) * 100;
            const remaining = budget.amount - spent;
            const categoryInfo = allCategories.find(c => c.label === budget.category);
            const Icon = categoryInfo ? categoryIcons[categoryInfo.label] : null;

            return (
              <div key={budget.id}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 font-medium">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span>{budget.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span
                      className={`font-semibold ${
                        remaining < 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(spent)}
                    </span>{' '}
                    / {formatCurrency(budget.amount)}
                  </div>
                </div>
                <Progress value={progress} />
                <p className="text-right text-xs text-muted-foreground mt-1">
                  {remaining >= 0
                    ? `${formatCurrency(remaining)} залишилось`
                    : `${formatCurrency(Math.abs(remaining))} перевищено`}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
