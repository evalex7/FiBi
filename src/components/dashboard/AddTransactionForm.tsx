'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { useState } from 'react';


export default function AddTransactionForm() {
  const [open, setOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState<number | undefined>();

  const handleOpen = (amount?: number) => {
    setInitialAmount(amount);
    setOpen(true);
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" onClick={() => handleOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Додати транзакцію
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Додати транзакцію</DialogTitle>
            <DialogDescription>
              Запишіть новий дохід або витрату до вашого рахунку.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            onSave={() => setOpen(false)} 
            initialAmount={initialAmount} 
          />
          <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
