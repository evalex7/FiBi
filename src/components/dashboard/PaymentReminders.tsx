'use client';

import { usePayments } from '@/contexts/payments-context';
import { useMemo } from 'react';
import { startOfDay, isBefore, isToday, addDays, format, differenceInDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { RecurringPayment } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CalendarClock, CalendarCheck2 } from 'lucide-react';
import { useCategories } from '@/contexts/categories-context';
import { categoryIcons } from '@/lib/category-icons';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

export default function PaymentReminders() {
  const { payments, isLoading } = usePayments();
  const { categories } = useCategories();

  const { overdue, upcoming } = useMemo(() => {
    const overdue: RecurringPayment[] = [];
    const upcoming: RecurringPayment[] = [];

    if (isLoading || !payments) {
      return { overdue, upcoming };
    }

    const today = startOfDay(new Date());
    const upcomingLimit = addDays(today, 7);

    payments.forEach(payment => {
      const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);
      const dueDateStartOfDay = startOfDay(dueDate);

      if (isBefore(dueDateStartOfDay, today)) {
        overdue.push(payment);
      } else if (isBefore(dueDateStartOfDay, upcomingLimit) || isToday(dueDateStartOfDay)) {
        upcoming.push(payment);
      }
    });
    
    // Sort by due date
    overdue.sort((a,b) => (a.nextDueDate as Timestamp).toDate().getTime() - (b.nextDueDate as Timestamp).toDate().getTime());
    upcoming.sort((a,b) => (a.nextDueDate as Timestamp).toDate().getTime() - (b.nextDueDate as Timestamp).toDate().getTime());

    return { overdue, upcoming };
  }, [payments, isLoading]);
  
  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Нагадування про платежі</CardTitle>
                  <CardDescription>Ваші найближчі та протерміновані рахунки.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="text-center text-muted-foreground py-4">Завантаження...</div>
              </CardContent>
          </Card>
      )
  }

  if (overdue.length === 0 && upcoming.length === 0) {
    return (
       <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-green-500" />
            <span>Все сплачено!</span>
          </CardTitle>
          <CardDescription>У вас немає найближчих або протермінованих платежів.</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
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
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Нагадування про платежі</CardTitle>
            <CardDescription>Ваші найближчі та протерміновані рахунки.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {overdue.length > 0 && (
                <div>
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Протерміновані платежі
                    </h3>
                    <div className="space-y-2">
                        {overdue.map(payment => {
                            const categoryInfo = categories.find(c => c.name === payment.category);
                            const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;
                            const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);
                            return (
                                <div key={payment.id} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/10">
                                    {Icon && <div className="p-2 bg-background/50 rounded-lg"><Icon className="h-5 w-5 text-destructive"/></div>}
                                    <div className="flex-grow">
                                        <p className="font-medium">{payment.description}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-destructive">{getDaysLabel(dueDate)}</p>
                                        <p className="text-xs text-muted-foreground">{format(dueDate, 'd MMM', {locale: uk})}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
             {upcoming.length > 0 && (
                <div>
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-primary">
                        <CalendarClock className="h-5 w-5" />
                        Найближчі платежі
                    </h3>
                    <div className="space-y-2">
                        {upcoming.map(payment => {
                            const categoryInfo = categories.find(c => c.name === payment.category);
                            const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;
                            const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);
                             const isDueSoon = differenceInDays(dueDate, startOfDay(new Date())) <= 2;
                            return (
                                <div key={payment.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                     {Icon && <div className="p-2 bg-secondary rounded-lg"><Icon className="h-5 w-5 text-muted-foreground"/></div>}
                                    <div className="flex-grow">
                                        <p className="font-medium">{payment.description}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${isDueSoon ? 'text-amber-600' : 'text-foreground'}`}>{getDaysLabel(dueDate)}</p>
                                        <p className="text-xs text-muted-foreground">{format(dueDate, 'd MMM', {locale: uk})}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  )
}
