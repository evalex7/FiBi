'use client';

import AppLayout from '@/components/AppLayout';
import AddTransactionForm from '@/components/dashboard/AddTransactionForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthSelector from '@/components/dashboard/MonthSelector';
import { useState } from 'react';
import ReceiptCalculator from '@/components/dashboard/ReceiptCalculator';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <AppLayout pageTitle="Панель">
      <div className="space-y-6">
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
             <AddTransactionForm />
             <ReceiptCalculator />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
