'use client';

import { usePayments } from '@/contexts/payments-context';
import { useMemo } from 'react';
import { startOfDay, isBefore, isToday, addDays, format, differenceInDays, startOfMonth, endOfMonth, addMonths, addQuarters, addYears } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { RecurringPayment } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import {
  AlertCircle,
  Bell,
  CalendarCheck2,
  CalendarClock,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/contexts/transactions-context';
import { Progress } from '../ui/progress';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

type HeaderPaymentRemindersProps = {
    onPayClick: (payment: Partial<RecurringPayment & { remainingAmount: number }>) => void;
}

export default function HeaderPaymentReminders({ onPayClick }: HeaderPaymentRemindersProps) {
  const { payments, isLoading: isPaymentsLoading } = usePayments();
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const firestore = useFirestore();
  const isLoading = isPaymentsLoading || isTransactionsLoading;

  const { overdue, upcoming, totalReminders } = useMemo(() => {
    let overdue: (RecurringPayment & { spent: number; remaining: number })[] = [];
    let upcoming: (RecurringPayment & { spent: number; remaining: number })[] = [];

    if (isLoading || !payments) {
      return { overdue, upcoming, totalReminders: 0 };
    }
    
    const today = startOfDay(new Date());
    const upcomingLimit = addDays(today, 7);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    payments.forEach(payment => {
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

      const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);
      if (remaining <= 0 && firestore && isBefore(startOfDay(dueDate), today)) { // If fully paid, check if we need to update the due date
             let nextDueDate: Date;
             switch(payment.frequency) {
                case 'quarterly':
                    nextDueDate = addQuarters(dueDate, 1);
                    break;
                case 'yearly':
                    nextDueDate = addYears(dueDate, 1);
                    break;
                case 'monthly':
                default:
                    nextDueDate = addMonths(dueDate, 1);
                    break;
             }
             const paymentDocRef = doc(firestore, 'payments', payment.id);
             updateDocumentNonBlocking(paymentDocRef, { nextDueDate: Timestamp.fromDate(nextDueDate) });
          return;
      };

      const dueDateStartOfDay = startOfDay(dueDate);
      
      const paymentWithInfo = { ...payment, spent, remaining };

      if (isBefore(dueDateStartOfDay, today) && remaining > 0) {
        overdue.push(paymentWithInfo);
      } else if (
        (isBefore(dueDateStartOfDay, upcomingLimit) ||
        isToday(dueDateStartOfDay)) && remaining > 0
      ) {
        upcoming.push(paymentWithInfo);
      }
    });

    overdue.sort(
      (a, b) =>
        (a.nextDueDate as Timestamp).toDate().getTime() -
        (b.nextDueDate as Timestamp).toDate().getTime()
    );
    upcoming.sort(
      (a, b) =>
        (a.nextDueDate as Timestamp).toDate().getTime() -
        (b.nextDueDate as Timestamp).toDate().getTime()
    );
    
    const totalReminders = overdue.length + upcoming.length;

    return { overdue, upcoming, totalReminders };
  }, [payments, transactions, isLoading, firestore]);

  const getDaysLabel = (dueDate: Date) => {
    const today = startOfDay(new Date());
    const daysDiff = differenceInDays(dueDate, today);

    if (daysDiff < 0) {
      return `Протерміновано ${Math.abs(daysDiff)} дн.`;
    }
    if (daysDiff === 0) {
      return 'Сьогодні';
    }
    if (daysDiff === 1) {
      return 'Завтра';
    }
    return `Через ${daysDiff} дн.`;
  };

  const ReminderItem = ({
    payment,
    isOverdue = false,
  }: {
    payment: RecurringPayment & { spent: number; remaining: number };
    isOverdue?: boolean;
  }) => {
    const dueDate =
      payment.nextDueDate instanceof Timestamp
        ? payment.nextDueDate.toDate()
        : new Date(payment.nextDueDate);
        
    const progress = (payment.spent / payment.amount) * 100;

    return (
      <DropdownMenuItem className="flex flex-col items-start gap-2 focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
        <div className="w-full space-y-2">
            <div className="flex w-full justify-between items-start">
                <div className="space-y-0.5">
                    <p className="font-semibold">{payment.description}</p>
                    <p className={cn("text-sm", isOverdue ? "text-destructive" : "text-amber-600")}>
                        {getDaysLabel(dueDate)}
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => onPayClick({ ...payment, remainingAmount: payment.remaining })}>
                    Сплачено
                </Button>
            </div>
             <div className="text-xs text-muted-foreground">
                <p>Залишилось: <span className="font-medium text-foreground">{formatCurrency(payment.remaining)}</span> з {formatCurrency(payment.amount)}</p>
             </div>
             <Progress value={progress} className="h-2" />
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {totalReminders > 0 && (
            <>
              <span className="absolute inline-flex h-full w-full rounded-full bg-destructive animate-ping" />
              <span className="absolute inline-flex rounded-full h-full w-full bg-destructive" />
            </>
          )}
          <Bell className="relative h-5 w-5 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-80 shadow-lg border-0 sm:border" align="end">
        <DropdownMenuLabel>Нагадування про рахунки</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem>Завантаження...</DropdownMenuItem>
        ) : totalReminders === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            <CalendarCheck2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p>Все сплачено!</p>
            <p>Немає найближчих рахунків.</p>
          </div>
        ) : (
          <>
            {overdue.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Протерміновані</span>
                </DropdownMenuLabel>
                {overdue.map(p => <ReminderItem key={p.id} payment={p} isOverdue />)}
              </>
            )}
            {upcoming.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2 text-amber-600">
                  <CalendarClock className="h-4 w-4" />
                  <span>Найближчі (7 днів)</span>
                </DropdownMenuLabel>
                 {upcoming.map(p => <ReminderItem key={p.id} payment={p} />)}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
