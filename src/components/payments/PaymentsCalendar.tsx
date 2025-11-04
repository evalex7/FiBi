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

  const DayWithPayments = ({ date }: { date: Date }) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const hasPayments = paymentsByDay.has(dayKey);

    return (
      <div className="relative h-full w-full flex items-center justify-center">
        {format(date, 'd')}
        {hasPayments && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
    );
  };
  
  if (isLoading) {
    return <Card><CardContent className="pt-6">Завантаження календаря...</CardContent></Card>
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
          className="p-3"
          classNames={{
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day: "h-12 w-12 text-base rounded-md",
            head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
            cell: 'w-full',
          }}
          components={{
            Day: ({ date }) => <DayWithPayments date={date} />,
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
