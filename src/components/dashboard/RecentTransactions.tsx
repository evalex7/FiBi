'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '../ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import EditTransactionSheet from './EditTransactionSheet';
import type { Transaction } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';

type FormattedTransaction = Transaction & { formattedAmount: string };

export default function RecentTransactions() {
  const { transactions, deleteTransaction, isLoading } = useTransactions();
  const [sortedTransactions, setSortedTransactions] = useState<FormattedTransaction[]>([]);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  useEffect(() => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount);
    };

    if (transactions) {
      const newSorted = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(t => ({...t, formattedAmount: formatCurrency(t.amount)}));
      
      setSortedTransactions(newSorted);
    }

  }, [transactions]);


  const handleDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  }

  const TransactionActions = ({ transaction }: { transaction: Transaction }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Відкрити меню</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Редагувати</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTransactionToDelete(transaction)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Видалити</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-2 rounded-lg border">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Останні транзакції</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : sortedTransactions.length === 0 ? (
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
                      {format(new Date(transaction.date), 'd MMM, yyyy', { locale: uk })}
                    </p>
                  </div>
                   <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'text-right font-medium text-lg',
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {transaction.formattedAmount}
                    </div>
                    <TransactionActions transaction={transaction} />
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
                <TableHead className="w-[50px]"></TableHead>
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
                      {format(new Date(transaction.date), 'd MMM, yyyy', { locale: uk })}
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
                      {transaction.formattedAmount}
                    </TableCell>
                    <TableCell>
                      <TransactionActions transaction={transaction} />
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
      {editingTransaction && (
          <EditTransactionSheet 
            transaction={editingTransaction}
            open={!!editingTransaction}
            onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}
          />
      )}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(isOpen) => !isOpen && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію неможливо скасувати. Це назавжди видалить вашу транзакцію.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Видалити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
