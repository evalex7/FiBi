'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { uk } from 'date-fns/locale';

type MonthSelectorProps = {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
};

export default function MonthSelector({ selectedDate, onDateChange }: MonthSelectorProps) {

  const handlePrevMonth = () => {
    onDateChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(selectedDate, 1));
  };

  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-32 text-center capitalize">
            {format(selectedDate, 'LLLL yyyy', { locale: uk })}
        </span>
        <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8" disabled={isCurrentMonth}>
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div>
  );
}
