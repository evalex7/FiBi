'use client';

import { TrendingUp, TrendingDown, Scale, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCredit } from '@/contexts/credit-context';

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
  const { creditLimit, currentDebt, isLoading: isCreditLoading } = useCredit();

  const [formattedIncome, setFormattedIncome] = useState('0,00 ₴');
  const [formattedExpenses, setFormattedExpenses] = useState('0,00 ₴');
  const [formattedNetIncome, setFormattedNetIncome] = useState('0,00 ₴');
  const [netIncome, setNetIncome] = useState(0);

  const [formattedCreditUsed, setFormattedCreditUsed] = useState('0,00 ₴');
  const [formattedCreditLimit, setFormattedCreditLimit] = useState('0,00 ₴');
  const [formattedNetBalance, setFormattedNetBalance] = useState('0,00 ₴');
  const [netBalance, setNetBalance] = useState(0);
  
  const isLoading = isTransactionsLoading || isCreditLoading;

  useEffect(() => {
    if (isLoading) return;

    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    
    if (selectedPeriod !== 'all') {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      periodStart = startOfMonth(periodDate);
      periodEnd = endOfMonth(periodDate);
    }

    const { income, expenses } = transactions.reduce(
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
            }
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
      
    const currentNetIncome = income - expenses;
    setNetIncome(currentNetIncome);
    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    setFormattedNetIncome(formatCurrency(currentNetIncome));
    
    const currentNetBalance = income - expenses - currentDebt; // Net income - total debt

    setFormattedCreditUsed(formatCurrency(currentDebt));
    setFormattedCreditLimit(formatCurrency(creditLimit));
    setFormattedNetBalance(formatCurrency(currentNetBalance));
    setNetBalance(currentNetBalance);

  }, [transactions, selectedPeriod, creditLimit, currentDebt, isLoading]);


  return (
    <div className="grid gap-2 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-8">Дохід</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedIncome}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-8">Витрати</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedExpenses}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Кредитний ліміт</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditLimit}</div>
        </CardContent>
      </Card>
       <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-10 flex items-center">Використано кредиту</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold text-orange-500">{formattedCreditUsed}</div>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-8">Власні кошти</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn(
            "text-xl font-bold",
            netIncome > 0 && "text-green-600",
            netIncome < 0 && "text-red-600"
            )}
          >
            {formattedNetIncome}
          </div>
        </CardContent>
      </Card>
       <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-8">Чистий баланс</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
           <div className={cn(
            "text-xl font-bold",
            netBalance > 0 && "text-green-600",
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
