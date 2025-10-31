'use client';

import AppLayout from '@/components/AppLayout';
import UpcomingPayments from '@/components/payments/UpcomingPayments';
import AddPaymentForm from '@/components/payments/AddPaymentForm';

export default function PaymentsPage() {
  return (
    <AppLayout pageTitle="Регулярні платежі">
      <div className="space-y-6">
        <UpcomingPayments />
        <AddPaymentForm />
      </div>
    </AppLayout>
  );
}
