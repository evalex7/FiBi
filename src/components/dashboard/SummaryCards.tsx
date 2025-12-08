'use client';

import { TrendingUp, TrendingDown, Scale, CreditCard, Landmark, Briefcase, PlusCircle, MinusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect, useMemo } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { FamilyMember, Transaction } from '@/lib/types';
import { Button } from '../ui/button';


const formatCurrency = (amount: number) => {
    if (isNaN(amount)) {
      return '0,00 ₴';
    }
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };

type SummaryCardsProps = {
    selectedPeriod: string;
};

export default function SummaryCards({ selectedPeriod }: SummaryCardsProps) {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: familyMember, isLoading: isFamilyMembersLoading } = useDoc<FamilyMember>(userDocRef);

  const isLoading = isTransactionsLoading || isFamilyMembersLoading;

  const {
    incomeInPeriod,
    expensesInPeriod,
    ownFunds,
    creditUsed,
    creditLimit,
    totalBalance,
  } = useMemo(() => {
    if (isLoading) {
      return {
        incomeInPeriod: 0,
        expensesInPeriod: 0,
        ownFunds: 0,
        creditUsed: 0,
        creditLimit: 0,
        totalBalance: 0,
      };
    }

    // Period-specific calculations for income/expenses cards
    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    
    if (selectedPeriod !== 'all') {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      periodStart = startOfMonth(periodDate);
      periodEnd = endOfMonth(periodDate);
    }

    const transactionsInPeriod = transactions.filter(transaction => {
      if (selectedPeriod === 'all') return true;
      const transactionDate = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
      return transactionDate >= periodStart! && transactionDate <= periodEnd!;
    });
    
    const incomeInPeriod = transactionsInPeriod
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesInPeriod = transactionsInPeriod
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // All-time calculations for balances
    const allTimeTransactions = transactions;

    const totalIncomeAllTime = allTimeTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpensesAllTime = allTimeTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const creditLimitTransactions = allTimeTransactions.filter(t => t.type === 'credit_limit').sort((a,b) => (b.date as any).toDate() - (a.date as any).toDate());
    const creditLimit = creditLimitTransactions.length > 0 ? creditLimitTransactions[0].amount : 0;
    
    const pureBalance = totalIncomeAllTime - totalExpensesAllTime;
    
    const ownFunds = Math.max(0, pureBalance);
    const creditUsed = pureBalance < 0 ? Math.abs(pureBalance) : 0;
    
    const totalBalance = ownFunds + (creditLimit - creditUsed);

    return {
      incomeInPeriod,
      expensesInPeriod,
      ownFunds,
      creditUsed,
      creditLimit,
      totalBalance,
    };
  }, [transactions, selectedPeriod, isLoading, familyMember]);


  return (
    <>
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="shadow-glow-gold">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Дохід (за період)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", incomeInPeriod > 0 && "text-green-600")}>{formatCurrency(incomeInPeriod)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-glow-gold">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Витрати (за період)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", expensesInPeriod > 0 && "text-blue-600")}>{formatCurrency(expensesInPeriod)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-glow-gold">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Кредитний ліміт</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", creditLimit > 0 && "text-orange-500")}>{formatCurrency(creditLimit)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-glow-gold">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Використано кредиту</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", creditUsed > 0 && "text-orange-500")}>{formatCurrency(creditUsed)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-glow-gold">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Загальний залишок</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-glow-gold">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Власні кошти</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", ownFunds > 0 && "text-green-600")}>
              {formatCurrency(ownFunds)}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
