'use client';

import { TrendingUp, TrendingDown, Scale, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCredit } from '@/contexts/credit-context';

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
  const { creditLimit } = useCredit();

  const [formattedIncome, setFormattedIncome] = useState('');
  const [formattedExpenses, setFormattedExpenses] = useState('');
  const [formattedNetIncome, setFormattedNetIncome] = useState('');
  const [netIncome, setNetIncome] = useState(0);

  const [formattedCreditUsed, setFormattedCreditUsed] = useState('');
  const [formattedCreditAvailable, setFormattedCreditAvailable] = useState('');
  const [formattedNetBalance, setFormattedNetBalance] = useState('');
  const [netBalance, setNetBalance] = useState(0);


  useEffect(() => {
    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    
    if (selectedPeriod !== 'all') {
      const periodDate = parseISO(`${selectedPeriod}-01`);
      periodStart = startOfMonth(periodDate);
      periodEnd = endOfMonth(periodDate);
    }
    

    const { income, expenses, creditPurchases, creditPayments } = transactions.reduce(
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
                    acc.creditPurchases += transaction.amount;
                    break;
                case 'credit_payment':
                    acc.creditPayments += transaction.amount;
                    break;
            }
        }
        return acc;
      },
      { income: 0, expenses: 0, creditPurchases: 0, creditPayments: 0 }
    );
      
    const currentNetIncome = income - expenses;
    setNetIncome(currentNetIncome);
    setFormattedIncome(formatCurrency(income));
    setFormattedExpenses(formatCurrency(expenses));
    setFormattedNetIncome(formatCurrency(currentNetIncome));

    const creditUsed = creditPurchases - creditPayments;
    const creditAvailable = creditLimit - creditUsed;
    const currentNetBalance = currentNetIncome - creditUsed;

    setFormattedCreditUsed(formatCurrency(creditUsed));
    setFormattedCreditAvailable(formatCurrency(creditAvailable));
    setFormattedNetBalance(formatCurrency(currentNetBalance));
    setNetBalance(currentNetBalance);

  }, [transactions, selectedPeriod, creditLimit]);


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
          <CardTitle className="text-xs font-medium h-8">Доступний кредит</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedCreditAvailable}</div>
        </CardContent>
      </Card>
       <Card className="p-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium h-8">Використано кредиту</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold">{formattedCreditUsed}</div>
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
