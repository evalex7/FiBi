'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ReceiptCalculatorProps = {
    onDone: (total: number) => void;
    initialAmount?: number;
};

type Operator = '+' | '-';

export default function ReceiptCalculator({ onDone, initialAmount = 0 }: ReceiptCalculatorProps) {
  const [currentValue, setCurrentValue] = useState(String(initialAmount));
  const [total, setTotal] = useState(initialAmount);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(true);

  const handleNumberClick = (num: string) => {
    if (isNewEntry) {
      setCurrentValue(num);
      setIsNewEntry(false);
    } else if (currentValue === '0' && num !== '.') {
      setCurrentValue(num);
    } else {
      // Limit to 2 decimal places
      const parts = currentValue.split('.');
      if (parts.length > 1 && parts[1].length >= 2) return;
      setCurrentValue(currentValue + num);
    }
  };

  const handleDecimalClick = () => {
    if (isNewEntry) {
      setCurrentValue('0.');
      setIsNewEntry(false);
    } else if (!currentValue.includes('.')) {
      setCurrentValue(currentValue + '.');
    }
  };
  
  const performCalculation = () => {
    const current = parseFloat(currentValue);
    if (operator === '+') {
      return total + current;
    }
    if (operator === '-') {
      return total - current;
    }
    return current;
  };

  const handleOperatorClick = (op: Operator) => {
    if (!isNewEntry) {
      const newTotal = performCalculation();
      setTotal(newTotal);
      setCurrentValue(String(newTotal));
    }
    setOperator(op);
    setIsNewEntry(true);
  };
  
  const handleEquals = () => {
    if(operator && !isNewEntry) {
        const newTotal = performCalculation();
        setTotal(newTotal);
        setCurrentValue(String(newTotal));
        setOperator(null);
        setIsNewEntry(true);
    }
  };

  const handleAllClear = () => {
    setCurrentValue('0');
    setTotal(0);
    setOperator(null);
    setIsNewEntry(true);
  };
  
  const handleDone = () => {
    let finalTotal = total;
     if (operator && !isNewEntry) {
        finalTotal = performCalculation();
    } else if (isNewEntry) {
        finalTotal = total;
    }
     else {
        finalTotal = parseFloat(currentValue);
    }
    onDone(finalTotal);
  };


  return (
    <div className="space-y-2 p-2 w-[220px]">
        <div className="rounded-lg bg-muted p-3 text-right">
        <div className="text-xs text-muted-foreground truncate h-4">
            {operator && !isNewEntry ? `${total.toLocaleString('uk-UA')} ${operator}` : ''}
        </div>
        <div className="text-3xl font-bold">{parseFloat(currentValue).toLocaleString('uk-UA', {minimumFractionDigits: 0, maximumFractionDigits: 2})}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('7')} type="button">7</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('8')} type="button">8</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('9')} type="button">9</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleOperatorClick('+')} type="button">+</Button>
            
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('4')} type="button">4</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('5')} type="button">5</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('6')} type="button">6</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleOperatorClick('-')} type="button">-</Button>

            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('1')} type="button">1</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('2')} type="button">2</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('3')} type="button">3</Button>
            <Button variant="destructive" className="h-10 text-lg" onClick={handleAllClear} type="button">AC</Button>
            
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('0')} type="button">0</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={handleDecimalClick} type="button">,</Button>
            <Button className="h-10 text-lg" onClick={handleEquals} type="button">=</Button>
            <Button className="h-10 text-lg" onClick={handleDone} type="button">OK</Button>
        </div>
    </div>
  );
}
