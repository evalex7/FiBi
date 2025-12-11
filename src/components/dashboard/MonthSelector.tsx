'use client';

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { format, startOfMonth, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

type MonthSelectorProps = {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
};

export default function MonthSelector({ selectedPeriod, onPeriodChange }: MonthSelectorProps) {
  const { transactions, isLoading } = useTransactions();

  const periodOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const existingMonths = new Set<string>();
    const now = new Date();
    
    // Add current month first to ensure it's always there and at the top
    const currentMonthValue = format(now, 'yyyy-MM');
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

    return options;
  }, [transactions]);
  
  // Effect to ensure the parent's state is valid after options are calculated
  useEffect(() => {
    if (!isLoading && selectedPeriod && !periodOptions.some(opt => opt.value === selectedPeriod)) {
      onPeriodChange(format(new Date(), 'yyyy-MM'));
    }
  }, [isLoading, selectedPeriod, periodOptions, onPeriodChange]);


  const handlePeriodChange = (value: string) => {
      onPeriodChange(value);
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={isLoading}>
        <SelectTrigger className="w-full md:w-[180px]">
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

    