'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };

export default function SummaryCards() {
  const { transactions } = useTransactions();
  const [formattedIncome, setFormattedIncome] = useState('');
  const [formattedExpenses, setFormattedExpenses] = useState('');
  const [formattedBalance, setFormattedBalance] = useState('');

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { income, expenses } = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
        if (transactionDate >= firstDayOfMonth && transactionDate <= today) {
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
  }, [transactions]);


  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Загальний дохід</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedIncome}</div>
          <p className="text-xs text-muted-foreground">Цього місяця</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Загальні витрати</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedExpenses}</div>
          <p className="text-xs text-muted-foreground">Цього місяця</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Залишок</CardTitle>
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
