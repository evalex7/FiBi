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
    
    if (isLoading) {
      // While loading, show only the current month as a default
      const defaultOptions = [{ value: currentMonthValue, label: format(now, 'LLLL yyyy', { locale: uk }) }];
      if (!periodOptions.some(o => o.value === currentMonthValue)) {
        setPeriodOptions(defaultOptions);
      }
      if (selectedPeriod !== currentMonthValue) {
        onPeriodChange(currentMonthValue);
      }
      return;
    };

    const options: { value: string; label: string }[] = [];
    const existingMonths = new Set<string>();

    // Add current month first to ensure it's always there and at the top
    const currentMonthLabel = format(now, 'LLLL yyyy', { locale: uk });
    options.push({ value: currentMonthValue, label: currentMonthLabel });
    existingMonths.add(currentMonthValue);
    
    // Add months from transactions
    if (transactions.length > 0) {
        transactions.forEach(t => {
            const transactionDate = t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date);
            const monthKey = format(transactionDate, 'yyyy-MM');
            if (!existingMonths.has(monthKey)) {
                options.push({
                    value: monthKey,
                    label: format(transactionDate, 'LLLL yyyy', { locale: uk }),
                });
                existingMonths.add(monthKey);
            }
        });
    }

    // Sort options in descending chronological order
    options.sort((a, b) => b.value.localeCompare(a.value));
    
    // Add "All time" option at the end
    options.push({ value: 'all', label: 'За весь час' });

    setPeriodOptions(options);

    // Set initial period if not set or invalid
    if (!selectedPeriod || !options.some(o => o.value === selectedPeriod)) {
       onPeriodChange(currentMonthValue);
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
