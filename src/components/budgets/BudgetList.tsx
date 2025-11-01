'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categoryIcons } from '@/lib/category-icons';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { useBudgets } from '@/contexts/budgets-context';
import type { Budget, Category } from '@/lib/types';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import BudgetForm from './BudgetForm';
import { Skeleton } from '../ui/skeleton';
import { useCategories } from '@/contexts/categories-context';
import { format, startOfMonth, startOfQuarter, startOfYear, endOfMonth, endOfQuarter, endOfYear, addMonths, addQuarters, addYears } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useUser } from '@/firebase';
import { Timestamp } from 'firebase/firestore';

type FormattedBudget = Budget & {
  spent: number;
  progress: number;
  remaining: number;
  formattedAmount: string;
  formattedSpent: string;
  formattedRemaining: string;
  periodLabel: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

const getPeriodDates = (budget: Budget) => {
    const rawStartDate = budget.startDate;
    let budgetStartDate: Date;

    if (rawStartDate instanceof Timestamp) {
        budgetStartDate = rawStartDate.toDate();
    } else if (rawStartDate && typeof rawStartDate === 'object' && 'seconds' in rawStartDate) {
        budgetStartDate = new Date((rawStartDate as any).seconds * 1000);
    } else if (rawStartDate instanceof Date) {
        budgetStartDate = rawStartDate;
    } else {
        console.warn(`Invalid or missing startDate for budget ${budget.id}`);
        budgetStartDate = new Date();
    }

    let start = budgetStartDate;
    let end: Date;

    switch (budget.period) {
        case 'quarterly':
            end = endOfQuarter(start);
            break;
        case 'yearly':
            end = endOfYear(start);
            break;
        case 'monthly':
        default:
            end = endOfMonth(start);
            break;
    }
    
    // Check if the current date is past the end date
    const now = new Date();
    if (now > end) {
        switch (budget.period) {
            case 'quarterly':
                start = startOfQuarter(now);
                end = endOfQuarter(now);
                break;
            case 'yearly':
                start = startOfYear(now);
                end = endOfYear(now);
                break;
            case 'monthly':
            default:
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
        }
    }
    
    return { start, end };
}

export default function BudgetList() {
  const { transactions } = useTransactions();
  const { budgets, isLoading, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const { user } = useUser();
  const [formattedBudgets, setFormattedBudgets] = useState<FormattedBudget[]>([]);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  useEffect(() => {
    if(!budgets || !transactions) return;

    const newFormattedBudgets = budgets.map(budget => {
      const { start, end } = getPeriodDates(budget);

      const spent = transactions.reduce((acc, t) => {
        const transactionDate = t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date);
        if (t.type === 'expense' && t.category === budget.category && transactionDate >= start && transactionDate <= end) {
          acc += t.amount;
        }
        return acc;
      }, 0);

      const progress = (spent / budget.amount) * 100;
      const remaining = budget.amount - spent;
      let periodLabel = '';
      switch (budget.period) {
          case 'quarterly':
              periodLabel = `${format(start, 'QQQ', { locale: uk })} квартал`;
              break;
          case 'yearly':
              periodLabel = `${format(start, 'yyyy')} рік`;
              break;
          case 'monthly':
          default:
              periodLabel = format(start, 'LLLL yyyy', { locale: uk });
      }

      return {
        ...budget,
        spent,
        progress,
        remaining,
        formattedAmount: formatCurrency(budget.amount),
        formattedSpent: formatCurrency(spent),
        formattedRemaining: formatCurrency(remaining),
        periodLabel,
      };
    }).sort((a, b) => a.category.localeCompare(b.category));

    setFormattedBudgets(newFormattedBudgets);
  }, [transactions, budgets]);

  const handleDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
    }
  }

  const canEditOrDelete = (budget: Budget) => {
    return budget.familyMemberId === user?.uid;
  };
  
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
                      <span className="text-xs text-muted-foreground">({budget.periodLabel})</span>
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
                    {canEditOrDelete(budget) && (
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
                    )}
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
