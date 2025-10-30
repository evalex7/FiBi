'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { useState } from 'react';


export default function AddTransactionForm() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
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
          <TransactionForm onSave={() => setOpen(false)} />
          <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
