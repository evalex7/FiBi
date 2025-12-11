'use client';

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore'; // якщо використовуєш Firestore

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
          options.push(
