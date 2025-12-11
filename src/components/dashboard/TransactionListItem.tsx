'use client';

import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { categoryIcons } from '@/lib/category-icons';
import type { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

// Хелпер — гарантує, що в формат() передається Date
function toDate(value: Date | Timestamp | undefined | null): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if ('toDate' in value) return value.toDate();
  return new Date(value);
}

type Props = {
  transaction: Transaction;
  onClick?: () => void;
};

export default function TransactionListItem({ transaction, onClick }: Props) {
  const {
    description,
    amount,
    type,
    category,
    date,
    isPrivate,
  } = transaction;

  const Icon = categoryIcons[transaction.icon || 'other'];

  const formattedDate = format(toDate(date), 'dd.MM.yy', { locale: uk });

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between py-3 px-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/30 transition"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-primary" />}

        <div className="overflow-hidden">
          <p className="font-medium truncate flex items-center gap-1">
            {description}
            {isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
          </p>

          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className={cn(
            "font-semibold",
            type === 'income' && "text-green-600",
            type === 'expense' && "text-red-600",
            type === 'credit_limit' && "text-blue-600"
          )}
        >
          {type === 'expense' ? '-' : '+'}
          {amount.toFixed(2)}
        </p>

        {category && type !== 'credit_limit' && (
          <p className="text-xs text-muted-foreground">{category}</p>
        )}
      </div>
    </div>
  );
}
