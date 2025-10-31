'use client';

import AppLayout from '@/components/AppLayout';
import UpcomingPayments from '@/components/payments/UpcomingPayments';
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
import PaymentForm from '@/components/payments/PaymentForm';


export default function PaymentsPage() {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  return (
    <AppLayout pageTitle="Регулярні платежі">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Майбутні платежі</h2>
            <Button onClick={() => setIsAddPaymentOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Додати платіж
            </Button>
        </div>
        <UpcomingPayments />
      </div>

       <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Додати регулярний платіж</DialogTitle>
                <DialogDescription>
                    Створіть новий повторюваний платіж, щоб відстежувати його.
                </DialogDescription>
            </DialogHeader>
            <PaymentForm onSave={() => setIsAddPaymentOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
