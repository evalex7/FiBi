'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { format, startOfMonth, differenceInMonths, addMonths } from 'date-fns';
import { uk } from 'date-fns/locale';

type MonthSelectorProps = {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
};

export default function MonthSelector({ selectedPeriod, onPeriodChange }: MonthSelectorProps) {
  const { transactions } = useTransactions();
  const [periodOptions, setPeriodOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (transactions.length > 0) {
      const earliestDate = transactions.reduce((earliest, t) => {
        const transactionDate = t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date);
        return transactionDate < earliest ? transactionDate : earliest;
      }, new Date());
      
      const options: { value: string; label: string }[] = [{ value: 'all', label: 'За весь час' }];
      const now = new Date();
      const startDate = startOfMonth(earliestDate);
      const monthsDifference = differenceInMonths(now, startDate);
      
      for (let i = 0; i <= monthsDifference; i++) {
        const date = addMonths(startDate, i);
        options.unshift({
          value: format(date, 'yyyy-MM'),
          label: format(date, 'LLLL yyyy', { locale: uk }),
        });
      }
      
      setPeriodOptions(options);

      // Set default to current month if available
      const currentMonthValue = format(now, 'yyyy-MM');
      if (options.some(opt => opt.value === currentMonthValue)) {
        onPeriodChange(currentMonthValue);
      } else if (options.length > 1) {
        onPeriodChange(options[1].value); // Default to the latest month with transactions
      } else {
        onPeriodChange('all');
      }

    } else {
        const now = new Date();
        setPeriodOptions([
            { value: 'all', label: 'За весь час' },
            { value: format(now, 'yyyy-MM'), label: format(now, 'LLLL yyyy', { locale: uk }) },
        ]);
        onPeriodChange(format(now, 'yyyy-MM'));
    }
  // We run this only once on transactions load to build the list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);
  
  // Find current selected label
  const selectedLabel = periodOptions.find(opt => opt.value === selectedPeriod)?.label;
  
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
