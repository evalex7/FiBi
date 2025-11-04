'use client';

import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };

type SummaryCardsProps = {
    selectedPeriod: string;
};

export default function SummaryCards({ selectedPeriod }: SummaryCardsProps) {
  const { transactions } = useTransactions();
  const [formattedIncome, setFormattedIncome] = useState('');
  const [formattedExpenses, setFormattedExpenses] = useState('');
  const [formattedNetIncome, setFormattedNetIncome] = useState('');
  const [netIncome, setNetIncome] = useState(0);

  useEffect(() => {
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
        
        // If period is not 'all', filter by date
        if (periodStart && periodEnd) {
          if (transactionDate >= periodStart && transactionDate <= periodEnd) {
            if (transaction.type === 'income') {
                acc.income += transaction.amount;
            } else {
                acc.expenses += transaction.amount;
            }
          }
        } else { // if period is 'all', sum everything up
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
      
    const currentNetIncome = income - expenses;
    setNetIncome(currentNetIncome);
    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    setFormattedNetIncome(formatCurrency(currentNetIncome));
  }, [transactions, selectedPeriod]);


  return (
    <div className="grid gap-2 md:grid-cols-3">
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Дохід</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedIncome}</div>
          <p className="text-xs text-muted-foreground">за обраний період</p>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Витрати</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedExpenses}</div>
          <p className="text-xs text-muted-foreground">за обраний період</p>
        </CardContent>
      </Card>
      <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium">Чистий дохід</CardTitle>
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
          <p className="text-xs text-muted-foreground">за обраний період</p>
        </CardContent>
      </Card>
    </div>
  );
}
