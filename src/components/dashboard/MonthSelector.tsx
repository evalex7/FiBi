'use client';

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

type MonthSelectorProps = {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
};

// Функція для безпечного конвертування у Date
function toDate(value: Date | Timestamp | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  return value;
}

export default function MonthSelector({ selectedPeriod, onPeriodChange }: MonthSelectorProps) {
  const { transactions, isLoading } = useTransactions();

  const periodOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const existingMonths = new Set<string>();
    const now = new Date();
    
    // Поточний місяць зверху
    const currentMonthValue = format(now, 'yyyy-MM');
    const currentMonthLabel = format(now, 'LLLL yyyy', { locale: uk });
    options.push({ value: currentMonthValue, label: currentMonthLabel });
    existingMonths.add(currentMonthValue);

    // Місяці з транзакцій
    if (transactions.length > 0) {
      transactions.forEach(t => {
        const transactionDate = toDate(t.date);
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

    // Сортування за спаданням
    options.sort((a, b) => b.value.localeCompare(a.value));

    // Опція "За весь час"
    options.push({ value: 'all', label: 'За весь час' });

    return options;
  }, [transactions]);

  // Перевірка валідності обраного періоду
  useEffect(() => {
    if (!isLoading && selectedPeriod && !periodOptions.some(opt => opt.value === selectedPeriod)) {
      onPeriodChange(format(new Date(), 'yyyy-MM'));
    }
  }, [isLoading, selectedPeriod, periodOptions, onPeriodChange]);

  const handlePeriodChange = (value: string) => {
    onPeriodChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={isLoading}>
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
