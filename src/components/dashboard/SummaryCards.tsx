'use client';

import { TrendingUp, TrendingDown, Scale, CreditCard, PiggyBank, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const [formattedIncome, setFormattedIncome] = useState('0,00 ₴');
  const [formattedExpenses, setFormattedExpenses] = useState('0,00 ₴');
  
  const [formattedOwnFunds, setFormattedOwnFunds] = useState('0,00 ₴');
  const [formattedCreditUsed, setFormattedCreditUsed] = useState('0,00 ₴');
  const [formattedCreditLimit, setFormattedCreditLimit] = useState('0,00 ₴');
  const [netBalance, setNetBalance] = useState(0);
  const [formattedNetBalance, setFormattedNetBalance] = useState('0,00 ₴');
  
  const isLoading = isTransactionsLoading;

  useEffect(() => {
    if (isLoading) return;

    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    
    if (selectedPeriod !== 'all') {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      periodStart = startOfMonth(periodDate);
      periodEnd = endOfMonth(periodDate);
    }

    const { income, expenses, creditPurchase, creditPayment } = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
        
        const inPeriod = !periodStart || !periodEnd || (transactionDate >= periodStart && transactionDate <= periodEnd);

        if (inPeriod) {
            switch(transaction.type) {
                case 'income':
                    acc.income += transaction.amount;
                    break;
                case 'expense':
                    acc.expenses += transaction.amount;
                    break;
                case 'credit_purchase':
                    acc.creditPurchase += transaction.amount;
                    break;
                case 'credit_payment':
                    acc.creditPayment += transaction.amount;
                    break;
            }
        }
        return acc;
      },
      { income: 0, expenses: 0, creditPurchase: 0, creditPayment: 0 }
    );
    
    const creditLimit = creditPurchase - creditPayment;
    const ownFunds = Math.max(0, income - creditLimit - expenses);
    const creditUsed = Math.max(0, expenses - Math.max(0, income - creditLimit));
    const totalAvailable = ownFunds + (creditLimit - creditUsed);
    
    setNetBalance(totalAvailable);
    setFormattedNetBalance(formatCurrency(totalAvailable));

    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    
    setFormattedOwnFunds(formatCurrency(ownFunds));
    setFormattedCreditUsed(formatCurrency(creditUsed));
    setFormattedCreditLimit(formatCurrency(creditLimit));

  }, [transactions, selectedPeriod, isLoading]);


  return (
    <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Дохід</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedIncome}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Витрати</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedExpenses}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Кредитний ліміт</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditLimit}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Використано кредиту</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditUsed}</div>
        </CardContent>
      </Card>
       <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Власні кошти</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn("text-xl font-bold text-green-600")}>
            {formattedOwnFunds}
          </div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Загальний баланс</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}
