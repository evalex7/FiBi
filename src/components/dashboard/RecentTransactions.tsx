'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryIcons } from '@/lib/category-icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useTransactions } from '@/contexts/transactions-context';

export default function RecentTransactions() {
  const { transactions } = useTransactions();
  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Останні транзакції</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
           <div className="text-center text-muted-foreground py-8">
            Ще немає транзакцій. Додайте першу!
          </div>
        ) : (
        <>
        {/* Mobile View */}
        <div className="md:hidden">
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => {
              const Icon = categoryIcons[transaction.category];
              return (
                <div key={transaction.id} className="flex items-center gap-4 p-2 rounded-lg border">
                  {Icon && <Icon className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                  <div className="flex-grow">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(transaction.date, 'd MMM, yyyy', { locale: uk })}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'text-right font-medium text-lg',
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Опис</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Сума</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category];
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-2 w-fit">
                        {Icon && <Icon className="h-3 w-3" />}
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(transaction.date, 'd MMM, yyyy', { locale: uk })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}
