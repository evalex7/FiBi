
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import TransactionUserAvatar from './TransactionUserAvatar';
import { useUser } from '@/firebase';

type TransactionListItemProps = {
  transaction: Transaction & { formattedAmount: string };
  onEdit: (transaction: Transaction) => void;
  onCopy: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  children: React.ReactNode;
};

export default function TransactionListItem({
  transaction,
  children,
}: TransactionListItemProps) {
  const { user } = useUser();
  const date = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
  const [memberColor, setMemberColor] = useState('hsl(var(--primary))');
  
  const isOwner = transaction.familyMemberId === user?.uid;
  const { description, amountDisplay, isMasked } = getTransactionInfo(transaction);

  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-blue-600';
      case 'credit_limit':
        return 'text-orange-500';
      default:
        return 'text-foreground';
    }
  };

  function getTransactionInfo(transaction: Transaction & { formattedAmount: string }) {
    if (transaction.isPrivate && transaction.familyMemberId !== user?.uid) {
      return {
        description: '***',
        category: null,
        amountDisplay: '***',
        isMasked: true
      };
    }
    return {
      description: transaction.description,
      category: transaction.category,
      amountDisplay: transaction.formattedAmount,
      isMasked: false
    };
  };

  // Convert HSL string to H, S, L values for CSS variables
  const hslValues = memberColor.match(/\d+/g)?.join(', ');

  return (
    <div
      className="relative flex items-center gap-3 px-1 sm:px-3 py-3 rounded-lg border bg-card/50 backdrop-blur-sm transition-all"
      style={{
        // @ts-ignore
        '--glow-color': hslValues,
        boxShadow: '0 0 15px 1px hsla(var(--glow-color), 0.3)',
        borderColor: 'hsla(var(--glow-color), 0.4)',
      }}
    >
      <TransactionUserAvatar userId={transaction.familyMemberId} onColorLoad={setMemberColor} />
      <div className="flex-grow space-y-1 min-w-0">
        <p className="font-medium truncate">{description}</p>
        <p className="text-xs text-muted-foreground">
          {format(date, 'dd.MM.yy', { locale: uk })}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className={cn(
            'font-medium text-base whitespace-nowrap',
            !isMasked && getAmountColor(transaction.type),
            isMasked && 'font-mono'
          )}
        >
          {!isMasked && (transaction.type === 'income' ? '+' : (transaction.type === 'expense' ? '-' : ''))}
          {amountDisplay}
        </div>
        {children}
      </div>
    </div>
  );
}
