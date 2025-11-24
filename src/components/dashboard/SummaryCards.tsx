'use client';

import { TrendingUp, TrendingDown, Scale, CreditCard, Landmark, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect, useMemo } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { FamilyMember } from '@/lib/types';


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

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: familyMembers, isLoading: isFamilyMembersLoading } = useCollection<FamilyMember>(usersCollectionRef);

  const [formattedIncome, setFormattedIncome] = useState('0,00 ₴');
  const [formattedExpenses, setFormattedExpenses] = useState('0,00 ₴');
  
  const [formattedOwnFunds, setFormattedOwnFunds] = useState('0,00 ₴');
  const [formattedCreditUsed, setFormattedCreditUsed] = useState('0,00 ₴');
  const [formattedCreditLimit, setFormattedCreditLimit] = useState('0,00 ₴');
  const [netBalance, setNetBalance] = useState(0);
  const [formattedNetBalance, setFormattedNetBalance] = useState('0,00 ₴');
  
  const isLoading = isTransactionsLoading || isFamilyMembersLoading;

  useEffect(() => {
    if (isLoading) return;

    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    
    if (selectedPeriod !== 'all') {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      periodStart = startOfMonth(periodDate);
      periodEnd = endOfMonth(periodDate);
    }

    const relevantTransactions = transactions.filter(transaction => {
      if (selectedPeriod === 'all') return true;
      const transactionDate = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
      return transactionDate >= periodStart! && transactionDate <= periodEnd!;
    });

    const income = relevantTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = relevantTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const ownFunds = Math.max(0, income - expenses);
    
    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    setFormattedOwnFunds(formatCurrency(ownFunds));

    // Calculate credit data
    let totalCreditLimit = 0;
    if (familyMembers) {
        totalCreditLimit = familyMembers.reduce((sum, member) => sum + (member.creditLimit || 0), 0);
    }
    
    const { creditPurchase, creditPayment } = transactions.reduce(
        (acc, t) => {
            if (t.type === 'credit_purchase') acc.creditPurchase += t.amount;
            if (t.type === 'credit_payment') acc.creditPayment += t.amount;
            return acc;
        }, { creditPurchase: 0, creditPayment: 0 }
    );

    totalCreditLimit += creditPayment; // Old logic for credit limit
    const totalCreditUsed = Math.max(0, creditPurchase - creditPayment);
    const netBalance = ownFunds + (totalCreditLimit - totalCreditUsed);
    
    setNetBalance(netBalance);
    setFormattedNetBalance(formatCurrency(netBalance));
    setFormattedCreditUsed(formatCurrency(totalCreditUsed));
    setFormattedCreditLimit(formatCurrency(totalCreditLimit));


  }, [transactions, selectedPeriod, isLoading, familyMembers]);


  return (
    <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Дохід</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-teal-600">{formattedIncome}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Витрати</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-blue-600">{formattedExpenses}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Кредитний ліміт</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditLimit}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Використано кредиту</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditUsed}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Загальний баланс</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn(
            "text-xl font-bold",
            netBalance >= 0 && "text-green-600",
            netBalance < 0 && "text-red-600"
            )}
          >
            {formattedNetBalance}
          </div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Власні кошти</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn("text-xl font-bold text-green-600")}>
            {formattedOwnFunds}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
