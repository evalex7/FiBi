'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockBudgets } from '@/lib/data';
import { categoryIcons } from '@/lib/category-icons';
import { allCategories } from '@/lib/category-icons';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';

type FormattedBudget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
  progress: number;
  remaining: number;
  formattedAmount: string;
  formattedSpent: string;
  formattedRemaining: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

export default function BudgetList() {
  const { transactions } = useTransactions();
  const [formattedBudgets, setFormattedBudgets] = useState<FormattedBudget[]>([]);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const spentAmounts = transactions.reduce((acc, t) => {
      const transactionDate = new Date(t.date);
      if (t.type === 'expense' && transactionDate >= firstDayOfMonth && transactionDate <= today) {
        const budgetCategory = mockBudgets.find(b => b.category === t.category);
        if (budgetCategory) {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const newFormattedBudgets = mockBudgets.map(budget => {
      const spent = spentAmounts[budget.category] || 0;
      const progress = (spent / budget.amount) * 100;
      const remaining = budget.amount - spent;
      return {
        ...budget,
        spent,
        progress,
        remaining,
        formattedAmount: formatCurrency(budget.amount),
        formattedSpent: formatCurrency(spent),
        formattedRemaining: formatCurrency(remaining),
      };
    });
    setFormattedBudgets(newFormattedBudgets);
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Місячні бюджети</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {formattedBudgets.map((budget) => {
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
                        budget.remaining < 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {budget.formattedSpent}
                    </span>{' '}
                    / {budget.formattedAmount}
                  </div>
                </div>
                <Progress value={budget.progress} />
                <p className="text-right text-xs text-muted-foreground mt-1">
                  {budget.remaining >= 0
                    ? `${budget.formattedRemaining} залишилось`
                    : `${formatCurrency(Math.abs(budget.remaining))} перевищено`}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
