'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, PlusCircle } from 'lucide-react';
import TransactionForm from './TransactionForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function ReceiptCalculator() {
  const [currentValue, setCurrentValue] = useState('0');
  const [total, setTotal] = useState(0);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const handleNumberClick = (num: string) => {
    if (currentValue === '0') {
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
  
  const handleCreateTransaction = () => {
    if (total > 0) {
      setIsTransactionModalOpen(true);
    }
  };

  const calculatorButtons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '.',
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle>Калькулятор чеків</CardTitle>
              <CardDescription>Підсумуйте кілька чеків перед додаванням.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-right">
            <div className="text-sm text-muted-foreground">Загальна сума: {total.toFixed(2)} грн</div>
            <div className="text-3xl font-bold">{currentValue}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {calculatorButtons.map((btn) => (
              <Button
                key={btn}
                variant="outline"
                className="h-14 text-xl"
                onClick={() => (btn === '.' ? handleDecimalClick() : handleNumberClick(btn))}
              >
                {btn}
              </Button>
            ))}
            <Button variant="outline" className="h-14" onClick={handleClear}>C</Button>
            <Button className="h-14 text-xl col-span-2" onClick={handleAdd}>+</Button>
            <Button variant="destructive" className="h-14 col-span-3" onClick={handleAllClear}>Очистити все</Button>
          </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full" disabled={total === 0} onClick={handleCreateTransaction}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Створити транзакцію з суми
            </Button>
        </CardFooter>
      </Card>

      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Додати підсумовану транзакцію</DialogTitle>
                <DialogDescription>
                    Створіть одну транзакцію з вашої загальної суми.
                </DialogDescription>
            </DialogHeader>
            <TransactionForm
                onSave={() => {
                    setIsTransactionModalOpen(false);
                    handleAllClear();
                }}
                initialAmount={total}
            />
        </DialogContent>
      </Dialog>
    </>
  );
}
