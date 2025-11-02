'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ReceiptCalculatorProps = {
    onDone: (total: number) => void;
    initialAmount?: number;
};

type Operator = '+' | '-';

export default function ReceiptCalculator({ onDone, initialAmount = 0 }: ReceiptCalculatorProps) {
  const [currentValue, setCurrentValue] = useState('0');
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
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('7')}>7</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('8')}>8</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('9')}>9</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleOperatorClick('+')}>+</Button>
            
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('4')}>4</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('5')}>5</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('6')}>6</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleOperatorClick('-')}>-</Button>

            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('1')}>1</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('2')}>2</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('3')}>3</Button>
            <Button variant="destructive" className="h-10 text-lg" onClick={handleAllClear}>AC</Button>
            
            <Button variant="outline" className="h-10 text-lg" onClick={() => handleNumberClick('0')}>0</Button>
            <Button variant="outline" className="h-10 text-lg" onClick={handleDecimalClick}>,</Button>
            <Button className="h-10 text-lg" onClick={handleEquals}>=</Button>
            <Button className="h-10 text-lg" onClick={handleDone}>OK</Button>
        </div>
    </div>
  );
}
