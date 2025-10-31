'use client';

import AppLayout from '@/components/AppLayout';
import AddTransactionForm from '@/components/dashboard/AddTransactionForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SummaryCards from '@/components/dashboard/SummaryCards';

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Панель">
      <div className="space-y-6">
        <SummaryCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
             <RecentTransactions />
          </div>
          <div className="lg:col-span-1 order-1 lg:order-2">
             <AddTransactionForm />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
