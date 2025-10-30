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
import { mockTransactions } from '@/lib/data';
import { categoryIcons } from '@/lib/category-icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function RecentTransactions() {
  const transactions = [...mockTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
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
                    {format(transaction.date, 'MMM d, yyyy')}
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
      </CardContent>
    </Card>
  );
}
