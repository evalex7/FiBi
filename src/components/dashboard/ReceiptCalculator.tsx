'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ReceiptCalculatorProps = {
    onDone: (total: number) => void;
    initialAmount?: number;
};

export default function ReceiptCalculator({ onDone, initialAmount = 0 }: ReceiptCalculatorProps) {
  const [currentValue, setCurrentValue] = useState('0');
  const [total, setTotal] = useState(initialAmount);

  const handleNumberClick = (num: string) => {
    if (currentValue === '0' && num !== '.') {
      setCurrentValue(num);
    } else {
      setCurrentValue(currentValue + num);
    }
  };

  const handleDecimalClick = () => {
    if (!currentValue.includes('.')) {
      setCurrentValue(currentValue + '.');
    }
  };

  const handleAdd = () => {
    if (currentValue !== '0') {
      setTotal(total + parseFloat(currentValue));
      setCurrentValue('0');
    }
  };

  const handleClear = () => {
    setCurrentValue('0');
  };

  const handleAllClear = () => {
    setCurrentValue('0');
    setTotal(0);
  };
  
  const handleDone = () => {
    const finalTotal = total + parseFloat(currentValue);
    onDone(finalTotal);
  };

  const calculatorButtons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '.',
  ];

  return (
    <div className="space-y-4 p-4">
        <div className="rounded-lg bg-muted p-4 text-right">
        <div className="text-sm text-muted-foreground">Загальна сума: {total.toFixed(2)} грн</div>
        <div className="text-3xl font-bold">{currentValue}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
        {calculatorButtons.slice(0, 3).map((btn) => (
            <Button key={btn} variant="outline" className="h-14 text-xl" onClick={() => handleNumberClick(btn)}>{btn}</Button>
        ))}
        <Button variant="outline" className="h-14 text-xl" onClick={handleAdd}>+</Button>
        
        {calculatorButtons.slice(3, 6).map((btn) => (
            <Button key={btn} variant="outline" className="h-14 text-xl" onClick={() => handleNumberClick(btn)}>{btn}</Button>
        ))}
        <Button variant="destructive" className="h-14" onClick={handleClear}>C</Button>

        {calculatorButtons.slice(6, 9).map((btn) => (
            <Button key={btn} variant="outline" className="h-14 text-xl" onClick={() => handleNumberClick(btn)}>{btn}</Button>
        ))}
        <Button variant="destructive" className="h-14" onClick={handleAllClear}>AC</Button>

        <Button variant="outline" className="h-14 text-xl" onClick={() => handleNumberClick('0')}>0</Button>
        <Button variant="outline" className="h-14 text-xl" onClick={handleDecimalClick}>.</Button>
        <Button className="h-14 col-span-2" onClick={handleDone}>Готово</Button>
        </div>
    </div>
  );
}
