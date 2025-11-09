'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { format, startOfMonth, differenceInMonths, addMonths, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

type MonthSelectorProps = {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
};

export default function MonthSelector({ selectedPeriod, onPeriodChange }: MonthSelectorProps) {
  const { transactions, isLoading } = useTransactions();
  const [periodOptions, setPeriodOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const now = new Date();
    const currentMonthValue = format(now, 'yyyy-MM');
    
    if (isLoading) return;

    if (transactions.length > 0) {
      const earliestDate = transactions.reduce((earliest, t) => {
        const transactionDate = t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date);
        return transactionDate < earliest ? transactionDate : earliest;
      }, new Date());
      
      const options: { value: string; label: string }[] = [];
      const startDate = startOfMonth(earliestDate);
      const endDate = startOfMonth(now);
      let monthsDifference = differenceInMonths(endDate, startDate);

      // Ensure we have at least one month if earliestDate is in the future
      if (monthsDifference < 0) monthsDifference = 0;
      
      for (let i = monthsDifference; i >= 0; i--) {
        const date = addMonths(startDate, i);
        options.push({
          value: format(date, 'yyyy-MM'),
          label: format(date, 'LLLL yyyy', { locale: uk }),
        });
      }
      
      // If there are no transactions for the current month yet, add it manually
      if (!options.some(opt => opt.value === currentMonthValue)) {
          options.unshift({
              value: currentMonthValue,
              label: format(now, 'LLLL yyyy', { locale: uk })
          })
      }

      // Add "All time" option
      options.push({ value: 'all', label: 'За весь час' });

      setPeriodOptions(options);

      // This was the bug. It was not correctly setting the initial period.
      if (!selectedPeriod || !options.some(o => o.value === selectedPeriod)) {
         onPeriodChange(options.length > 1 && options[0].value !== 'all' ? options[0].value : currentMonthValue);
      }

    } else {
        const defaultOptions = [
            { value: currentMonthValue, label: format(now, 'LLLL yyyy', { locale: uk }) },
            { value: 'all', label: 'За весь час' },
        ];
        setPeriodOptions(defaultOptions);
        if (!selectedPeriod) {
            onPeriodChange(currentMonthValue);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, isLoading]);
  
  const handlePeriodChange = (value: string) => {
      onPeriodChange(value);
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Оберіть період" />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
