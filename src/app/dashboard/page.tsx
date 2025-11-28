'use client';

import AppLayout from '@/components/AppLayout';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthSelector from '@/components/dashboard/MonthSelector';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TransactionForm from '@/components/dashboard/TransactionForm';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';


export default function DashboardPage() {
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<Transaction['type'] | undefined>(undefined);

  const handleOpenTransactionDialog = (type?: Transaction['type']) => {
    setTransactionType(type);
    setIsAddTransactionOpen(true);
  }

  const handleCloseDialog = () => {
    setIsAddTransactionOpen(false);
    setTransactionType(undefined);
  };

  return (
    <AppLayout pageTitle="Панель" onAddTransaction={() => handleOpenTransactionDialog()}>
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-center gap-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Огляд</h2>
            </div>
            <div className="flex items-center gap-2">
                <MonthSelector selectedPeriod={period} onPeriodChange={setPeriod} />
            </div>
        </div>
        <SummaryCards selectedPeriod={period} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
             <RecentTransactions selectedPeriod={period} onAddTransaction={() => handleOpenTransactionDialog()} />
          </div>
        </div>
      </div>
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Додати транзакцію</DialogTitle>
                <DialogDescription>
                Запишіть новий дохід, витрату або кредитну операцію.
                </DialogDescription>
            </DialogHeader>
            <TransactionForm 
              onSave={handleCloseDialog} 
              initialValues={transactionType ? { type: transactionType } : undefined} 
            />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
