'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import TransactionForm from './TransactionForm';
import type { Transaction } from '@/lib/types';

type EditTransactionSheetProps = {
    transaction: Transaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function EditTransactionSheet({ transaction, open, onOpenChange }: EditTransactionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
          <SheetHeader>
            <SheetTitle>Редагувати транзакцію</SheetTitle>
            <SheetDescription>
              Оновіть деталі вашої транзакції.
            </SheetDescription>
          </SheetHeader>
          <TransactionForm transaction={transaction} onSave={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
