'use client';

import { useState } from 'react';
import { usePayments } from '@/contexts/payments-context';
import type { RecurringPayment } from '@/lib/types';
import { categoryIcons } from '@/lib/category-icons';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import PaymentForm from './PaymentForm';
import { useCategories } from '@/contexts/categories-context';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);
  
const getFrequencyLabel = (frequency: RecurringPayment['frequency']) => {
    switch (frequency) {
        case 'monthly': return 'Щомісяця';
        case 'quarterly': return 'Щокварталу';
        case 'yearly': return 'Щороку';
    }
}

export default function PaymentsList() {
  const { payments, isLoading, deletePayment } = usePayments();
  const { categories } = useCategories();

  const [paymentToDelete, setPaymentToDelete] = useState<RecurringPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<RecurringPayment | null>(null);

  const handleDelete = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <div className="flex-grow">
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Усі регулярні платежі</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : payments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Ще немає регулярних платежів.
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => {
              const categoryInfo = categories.find(c => c.name === payment.category);
              const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;
              const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);

              return (
                <div key={payment.id} className="flex items-center gap-4 p-2 rounded-lg border">
                  {Icon && <div className="h-8 w-8 flex items-center justify-center bg-secondary rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
                  <div className="flex-grow font-medium">
                    <p>{payment.description}</p>
                    <p className="text-xs text-muted-foreground">{getFrequencyLabel(payment.frequency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">Наст. дата: {format(dueDate, 'dd.MM.yyyy', { locale: uk })}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Відкрити меню</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPaymentToEdit(payment)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Редагувати</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPaymentToDelete(payment)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Видалити</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={!!paymentToDelete} onOpenChange={(isOpen) => !isOpen && setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію неможливо скасувати. Це назавжди видалить ваш регулярний платіж.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Видалити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!paymentToEdit} onOpenChange={(isOpen) => !isOpen && setPaymentToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Редагувати платіж</DialogTitle>
                <DialogDescription>Оновіть деталі вашого регулярного платежу.</DialogDescription>
            </DialogHeader>
            {paymentToEdit && <PaymentForm payment={paymentToEdit} onSave={() => setPaymentToEdit(null)} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
