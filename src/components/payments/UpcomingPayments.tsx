'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayments } from '@/contexts/payments-context';
import type { RecurringPayment } from '@/lib/types';
import { categoryIcons } from '@/lib/category-icons';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import PaymentForm from './PaymentForm';
import { useCategories } from '@/contexts/categories-context';

type FormattedPayment = RecurringPayment & { formattedAmount: string, formattedDate: string };

export default function UpcomingPayments() {
  const { payments, isLoading, deletePayment } = usePayments();
  const { categories } = useCategories();
  const [sortedPayments, setSortedPayments] = useState<FormattedPayment[]>([]);
  const [paymentToDelete, setPaymentToDelete] = useState<RecurringPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<RecurringPayment | null>(null);

  useEffect(() => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount);
    };

    if (payments) {
      const newSorted = [...payments]
        .sort((a, b) => {
            const dateA = a.nextDueDate && (a.nextDueDate as any).toDate ? (a.nextDueDate as any).toDate() : new Date(a.nextDueDate);
            const dateB = b.nextDueDate && (b.nextDueDate as any).toDate ? (b.nextDueDate as any).toDate() : new Date(b.nextDueDate);
            return dateA.getTime() - dateB.getTime();
        })
        .map(p => {
            const date = p.nextDueDate && (p.nextDueDate as any).toDate ? (p.nextDueDate as any).toDate() : new Date(p.nextDueDate);
            return {
                ...p,
                formattedAmount: formatCurrency(p.amount),
                formattedDate: format(date, 'd MMMM yyyy', { locale: uk }),
            }
        });
      setSortedPayments(newSorted);
    }
  }, [payments]);

  const handleDelete = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Майбутні платежі</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : sortedPayments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Ще немає регулярних платежів.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPayments.map(payment => {
              const categoryInfo = categories.find(c => c.name === payment.category);
              const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;

              return (
                <div key={payment.id} className="flex items-center gap-4 p-2 rounded-lg border">
                  {Icon && <Icon className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                  <div className="flex-grow">
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Наступна оплата: {payment.formattedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right font-medium text-lg">
                      {payment.formattedAmount}
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
