'use client';

import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { categoryIcons } from '@/lib/category-icons';
import TransactionUserAvatar from './TransactionUserAvatar';
import type { Transaction } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { startOfDay } from 'date-fns';
import { useCategories } from '@/contexts/categories-context';

type Props = {
  transaction: Transaction;
  children?: React.ReactNode;   // ← ДОДАНО
};

function toDate(value: Date | Timestamp | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  return value;
}

export default function TransactionListItem({ transaction, children }: Props) {
  const { categories } = useCategories();

  // ===== Обробка приватності =====
  const isMasked = transaction.isPrivate;
  const description = isMasked ? '***' : transaction.description;
  const categoryName = isMasked ? null : transaction.category;

  const categoryInfo = categoryName
    ? categories.find((c) => c.name === categoryName)
    : null;

  const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;

  const formattedDate = format(toDate(transaction.date), 'd MMM yyyy', {
    locale: uk,
  });

  const formattedAmount = new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(transaction.amount);

  const amountPrefix =
    transaction.type === 'income'
      ? '+'
      : transaction.type === 'expense'
      ? '-'
      : '';

  const amountColor =
    transaction.type === 'income'
      ? 'text-green-600'
      : transaction.type === 'expense'
      ? 'text-blue-600'
      : 'text-orange-600';

  return (
    <div className="p-3 border rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <TransactionUserAvatar userId={transaction.familyMemberId!} />

        <div>
          <div className="font-medium">{description}</div>

          {categoryName && Icon && (
            <Badge variant="outline" className="flex items-center gap-1 mt-1 w-fit">
              <Icon className="h-3 w-3" />
              {categoryName}
            </Badge>
          )}

          {isMasked && (
            <Badge variant="outline" className="mt-1">
              ***
            </Badge>
          )}

          <div className="text-xs text-muted-foreground mt-1">
            {formattedDate}
          </div>
        </div>
      </div>

      <div className="text-right flex flex-col items-end">
        <div
          className={cn(
            'font-medium',
            !isMasked && amountColor,
            isMasked && 'font-mono'
          )}
        >
          {!isMasked && amountPrefix}
          {isMasked ? '***' : formattedAmount}
        </div>

        {/* ↓↓↓ ДІЇ (меню) ПЕРЕДАЮТЬСЯ ЧЕРЕЗ CHILDREN ↓↓↓ */}
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}
