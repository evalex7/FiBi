'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };

type SummaryCardsProps = {
    selectedDate: Date;
};

export default function SummaryCards({ selectedDate }: SummaryCardsProps) {
  const { transactions } = useTransactions();
  const [formattedIncome, setFormattedIncome] = useState('');
  const [formattedExpenses, setFormattedExpenses] = useState('');
  const [formattedBalance, setFormattedBalance] = useState('');

  useEffect(() => {
    // End of the selected period is the end of the selected month.
    const periodEnd = endOfMonth(selectedDate);
    // Start of the period is 30 days before the end date.
    const periodStart = startOfMonth(periodEnd);

    const { income, expenses } = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
        
        // Check if the transaction is within the 30-day window ending on periodEnd
        const thirtyDaysBeforeEnd = subDays(periodEnd, 30);
        if (transactionDate >= thirtyDaysBeforeEnd && transactionDate <= periodEnd) {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expenses += transaction.amount;
            }
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
      
    const balance = transactions.reduce((acc, t) => {
        if (t.type === 'income') {
            return acc + t.amount;
        }
        return acc - t.amount;
    }, 0);

    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    setFormattedBalance(formatCurrency(balance));
  }, [transactions, selectedDate]);


  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Дохід за 30 днів</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedIncome}</div>
          <p className="text-xs text-muted-foreground">за останні 30 днів</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Витрати за 30 днів</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedExpenses}</div>
          <p className="text-xs text-muted-foreground">за останні 30 днів</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Загальний залишок</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedBalance}</div>
          <p className="text-xs text-muted-foreground">Поточний залишок</p>
        </CardContent>
      </Card>
    </div>
  );
}
