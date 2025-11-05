'use client';

import { useState, useMemo } from 'react';
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
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { useTransactions } from '@/contexts/transactions-context';
import { Progress } from '../ui/progress';

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
  const { payments, isLoading: isPaymentsLoading, deletePayment } = usePayments();
  const { categories } = useCategories();
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const isLoading = isPaymentsLoading || isTransactionsLoading;

  const [paymentToDelete, setPaymentToDelete] = useState<RecurringPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<RecurringPayment | null>(null);
  
  const paymentsWithSpent = useMemo(() => {
    if (!payments || !transactions) return [];
    
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    return payments.map(payment => {
       const spent = transactions
        .filter(t => {
            const transactionDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
            return t.category === payment.category &&
                   t.type === 'expense' &&
                   transactionDate >= monthStart &&
                   transactionDate <= monthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
        
      const remaining = payment.amount - spent;
      const progress = (spent / payment.amount) * 100;
      
      return { ...payment, spent, remaining, progress };
    }).sort((a, b) => a.description.localeCompare(b.description, 'uk'));
  }, [payments, transactions]);

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
        <CardTitle>Усі регулярні рахунки</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : paymentsWithSpent.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Ще немає регулярних рахунків.
          </div>
        ) : (
          <div className="space-y-4">
            {paymentsWithSpent.map(payment => {
              const categoryInfo = categories.find(c => c.name === payment.category);
              const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;
              const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);

              return (
                <div key={payment.id} className="p-3 rounded-lg border">
                    <div className="flex items-start gap-3">
                        {Icon && <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-secondary rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
                        <div className="flex-grow min-w-0 space-y-1">
                           <div className="flex justify-between items-center">
                                <p className="font-medium truncate pr-2">{payment.description}</p>
                                <p className="font-medium flex-shrink-0">{formatCurrency(payment.amount)}</p>
                           </div>
                           <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{getFrequencyLabel(payment.frequency)}</span>
                                <span>Наст. дата: {format(dueDate, 'dd.MM.yyyy', { locale: uk })}</span>
                           </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
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
                    <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">
                            <p>Сплачено в цьому місяці: <span className="font-medium text-foreground">{formatCurrency(payment.spent)}</span> / {formatCurrency(payment.amount)}</p>
                        </div>
                        <Progress value={payment.progress} />
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
              Цю дію неможливо скасувати. Це назавжди видалить ваш регулярний рахунок.
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
                <DialogTitle>Редагувати рахунок</DialogTitle>
                <DialogDescription>Оновіть деталі вашого регулярного рахунку.</DialogDescription>
            </DialogHeader>
            {paymentToEdit && <PaymentForm payment={paymentToEdit} onSave={() => setPaymentToEdit(null)} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
