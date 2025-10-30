'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';

export default function SummaryCards() {
  const { transactions } = useTransactions();
  const [formattedIncome, setFormattedIncome] = useState('');
  const [formattedExpenses, setFormattedExpenses] = useState('');
  const [formattedBalance, setFormattedBalance] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };
  
  useEffect(() => {
    const { income, expenses, balance } = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        acc.balance = acc.income - acc.expenses;
        return acc;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
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
          <CardTitle className="text-sm font-medium">Баланс</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedBalance}</div>
          <p className="text-xs text-muted-foreground">Поточний баланс</p>
        </CardContent>
      </Card>
    </div>
  );
}
