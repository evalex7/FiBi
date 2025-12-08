'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Transaction, FamilyMember } from '@/lib/types';
import TransactionUserAvatar from './TransactionUserAvatar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

type TransactionListItemProps = {
  transaction: Transaction & { formattedAmount: string };
  children: React.ReactNode;
};

export default function TransactionListItem({
  transaction,
  children,
}: TransactionListItemProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const memberDocRef = useMemoFirebase(() => {
    if (!firestore || !transaction.familyMemberId) return null;
    return doc(firestore, 'users', transaction.familyMemberId);
  }, [firestore, transaction.familyMemberId]);

  const { data: member } = useDoc<FamilyMember>(memberDocRef);

  const isOwner = transaction.familyMemberId === user?.uid;

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


  return (
    <div
      className="relative flex items-center gap-3 px-1 sm:px-3 py-3 rounded-lg border bg-card/50 backdrop-blur-sm transition-all shadow-glow"
      style={{
        // @ts-ignore
        '--glow-color': member?.color || 'hsl(var(--primary))',
      }}
    >
      <TransactionUserAvatar member={member} />
      <div className="flex-grow space-y-1 min-w-0">
        <p className="font-medium truncate">{description}</p>
        <p className="text-xs text-muted-foreground">
          {format(transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date), 'dd.MM.yy', { locale: uk })}
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
