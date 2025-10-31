'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categoryIcons } from '@/lib/category-icons';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { useBudgets } from '@/contexts/budgets-context';
import type { Budget } from '@/lib/types';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import BudgetForm from './BudgetForm';
import { Skeleton } from '../ui/skeleton';
import { useCategories } from '@/contexts/categories-context';

type FormattedBudget = Budget & {
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
  const { budgets, isLoading, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const [formattedBudgets, setFormattedBudgets] = useState<FormattedBudget[]>([]);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  useEffect(() => {
    if(!budgets) return;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const spentAmounts = transactions.reduce((acc, t) => {
      const transactionDate = new Date(t.date);
      if (t.type === 'expense' && transactionDate >= firstDayOfMonth && transactionDate <= today) {
        const budgetCategory = budgets.find(b => b.category === t.category);
        if (budgetCategory) {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const newFormattedBudgets = budgets.map(budget => {
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
  }, [transactions, budgets]);

  const handleDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
    }
  }
  
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-end">
                <Skeleton className="h-4 w-28" />
            </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : formattedBudgets.length === 0 ? (
           <div className="text-center text-muted-foreground py-8">
            Ще немає бюджетів. Додайте перший!
          </div>
        ) : (
          <div className="space-y-6">
            {formattedBudgets.map((budget) => {
              const categoryInfo = categories.find(c => c.name === budget.category);
              const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;

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
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground mt-1">
                      {budget.remaining >= 0
                        ? `${budget.formattedRemaining} залишилось`
                        : `${formatCurrency(Math.abs(budget.remaining))} перевищено`}
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Відкрити меню</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setBudgetToEdit(budget)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Редагувати</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setBudgetToDelete(budget)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Видалити</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <AlertDialog open={!!budgetToDelete} onOpenChange={(isOpen) => !isOpen && setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію неможливо скасувати. Це назавжди видалить ваш бюджет.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Видалити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!budgetToEdit} onOpenChange={(isOpen) => !isOpen && setBudgetToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Редагувати бюджет</DialogTitle>
                <DialogDescription>Оновіть деталі вашого бюджету.</DialogDescription>
            </DialogHeader>
            {budgetToEdit && <BudgetForm budget={budgetToEdit} onSave={() => setBudgetToEdit(null)} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
