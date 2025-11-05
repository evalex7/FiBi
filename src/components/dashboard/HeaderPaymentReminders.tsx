'use client';

import { usePayments } from '@/contexts/payments-context';
import { useMemo } from 'react';
import { startOfDay, isBefore, isToday, addDays, format, differenceInDays } from 'date-fns';
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

type HeaderPaymentRemindersProps = {
    onPayClick: (payment: RecurringPayment) => void;
}

export default function HeaderPaymentReminders({ onPayClick }: HeaderPaymentRemindersProps) {
  const { payments, isLoading } = usePayments();
  const { addTransaction } = useTransactions();

  const { overdue, upcoming, totalReminders } = useMemo(() => {
    const overdue: RecurringPayment[] = [];
    const upcoming: RecurringPayment[] = [];

    if (isLoading || !payments) {
      return { overdue, upcoming, totalReminders: 0 };
    }

    const today = startOfDay(new Date());
    const upcomingLimit = addDays(today, 7);

    payments.forEach(payment => {
      const dueDate =
        payment.nextDueDate instanceof Timestamp
          ? payment.nextDueDate.toDate()
          : new Date(payment.nextDueDate);
      const dueDateStartOfDay = startOfDay(dueDate);

      if (isBefore(dueDateStartOfDay, today)) {
        overdue.push(payment);
      } else if (
        isBefore(dueDateStartOfDay, upcomingLimit) ||
        isToday(dueDateStartOfDay)
      ) {
        upcoming.push(payment);
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
  }, [payments, isLoading]);

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
    payment: RecurringPayment;
    isOverdue?: boolean;
  }) => {
    const dueDate =
      payment.nextDueDate instanceof Timestamp
        ? payment.nextDueDate.toDate()
        : new Date(payment.nextDueDate);

    return (
      <DropdownMenuItem className="flex flex-col items-start gap-2 focus:bg-transparent">
        <div className="flex w-full justify-between items-start">
            <div className="space-y-1">
                <p className="font-semibold">{payment.description}</p>
                <p className={cn("text-sm", isOverdue ? "text-destructive" : "text-amber-600")}>
                    {getDaysLabel(dueDate)}
                </p>
                <p className="text-xs text-muted-foreground">{formatCurrency(payment.amount)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={(e) => {
                e.preventDefault();
                onPayClick(payment);
            }}>
                Сплачено
            </Button>
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalReminders > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Нагадування про платежі</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem>Завантаження...</DropdownMenuItem>
        ) : totalReminders === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            <CalendarCheck2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p>Все сплачено!</p>
            <p>Немає найближчих платежів.</p>
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
