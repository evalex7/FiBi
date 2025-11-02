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


export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  return (
    <AppLayout pageTitle="Панель">
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Огляд</h2>
            <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
        <SummaryCards selectedDate={selectedDate} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
             <RecentTransactions />
          </div>
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
             <div className="sticky top-20">
                <Button className="w-full" onClick={() => setIsAddTransactionOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Додати транзакцію
                </Button>
             </div>
          </div>
        </div>
      </div>
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Додати транзакцію</DialogTitle>
                <DialogDescription>
                Запишіть новий дохід або витрату до вашого рахунку.
                </DialogDescription>
            </DialogHeader>
            <TransactionForm onSave={() => setIsAddTransactionOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
