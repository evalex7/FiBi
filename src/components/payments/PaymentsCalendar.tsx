'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { usePayments } from '@/contexts/payments-context';
import type { RecurringPayment } from '@/lib/types';
import { format, startOfMonth } from 'date-fns';
import { uk } from 'date-fns/locale';
import { categoryIcons } from '@/lib/category-icons';
import { useCategories } from '@/contexts/categories-context';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

export default function PaymentsCalendar() {
  const { payments, isLoading } = usePayments();
  const { categories } = useCategories();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  const paymentsByDay = useMemo(() => {
    const map = new Map<string, RecurringPayment[]>();
    if (!payments) return map;

    payments.forEach(payment => {
      const dueDate = payment.nextDueDate instanceof Timestamp ? payment.nextDueDate.toDate() : new Date(payment.nextDueDate);
      const dayKey = format(dueDate, 'yyyy-MM-dd');
      const dayPayments = map.get(dayKey) || [];
      dayPayments.push(payment);
      map.set(dayKey, dayPayments);
    });

    return map;
  }, [payments]);

  const selectedDayPayments = useMemo(() => {
    if (!selectedDay) return [];
    const dayKey = format(selectedDay, 'yyyy-MM-dd');
    return paymentsByDay.get(dayKey) || [];
  }, [selectedDay, paymentsByDay]);

  const paymentDays = useMemo(() => {
      const days: Date[] = [];
      paymentsByDay.forEach((_, dayKey) => {
          // Adjust for timezone differences by creating date in UTC
          const date = new Date(dayKey + 'T00:00:00');
          days.push(date);
      });
      return days;
  }, [paymentsByDay]);
  
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardContent className="p-4">
                <Skeleton className="h-[320px] w-full" />
            </CardContent>
        </Card>
        <Card>
            <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={uk}
          className="p-0 sm:p-3 w-full"
          modifiers={{ hasPayment: paymentDays }}
          modifiersClassNames={{
            hasPayment: 'bg-accent/50 rounded-full',
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4 w-full",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-full justify-center flex font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
              "[&:has([aria-selected])]:bg-accent",
              "[&:has([aria-selected].day-outside)]:bg-accent/50",
              "[&:has([aria-selected].day-range-end)]:rounded-r-md"
            ),
             day: cn(
              "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground"
            ),
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-muted text-foreground",
          }}
        />
      </Card>
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">
            {selectedDay ? format(selectedDay, 'd MMMM yyyy', { locale: uk }) : 'Оберіть дату'}
          </h3>
          <div className="space-y-4">
            {selectedDayPayments.length > 0 ? (
              selectedDayPayments.map(payment => {
                const categoryInfo = categories.find(c => c.name === payment.category);
                const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;
                return (
                  <div key={payment.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    {Icon && <div className="p-2 bg-secondary rounded-lg"><Icon className="h-5 w-5 text-muted-foreground"/></div>}
                    <div className="flex-grow min-w-0">
                      <p className="font-medium truncate">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">На цей день платежів немає.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
