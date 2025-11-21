'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryIcons } from '@/lib/category-icons';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, parseISO, startOfDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useTransactions } from '@/contexts/transactions-context';
import { Button } from '../ui/button';
import { MoreHorizontal, Pencil, Trash2, Copy, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TransactionForm from './TransactionForm';

import type { Transaction, FamilyMember } from '@/lib/types';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useCategories } from '@/contexts/categories-context';
import TransactionUserAvatar from './TransactionUserAvatar';
import { Input } from '../ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '@/components/ui/calendar';


type FormattedTransaction = Transaction & { formattedAmount: string };

type RecentTransactionsProps = {
  selectedPeriod: string;
  onAddTransaction: () => void;
};

export default function RecentTransactions({ selectedPeriod, onAddTransaction }: RecentTransactionsProps) {
  const { transactions, deleteTransaction, isLoading } = useTransactions();
  const { categories } = useCategories();
  const { user } = useUser();
  const isMobile = useIsMobile();
  
  const [sortedTransactions, setSortedTransactions] = useState<FormattedTransaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToCopy, setTransactionToCopy] = useState<Transaction | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>();

  const canEditOrDelete = (transaction: Transaction) => {
    return transaction.familyMemberId === user?.uid;
  };

  const getTransactionInfo = (transaction: Transaction) => {
    const isOwner = transaction.familyMemberId === user?.uid;
    if (transaction.isPrivate && !isOwner) {
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

  useEffect(() => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount);
    };

    if (transactions) {
      let formatted = transactions.map(t => ({ ...t, formattedAmount: formatCurrency(t.amount) }));

      // 1. Filter by Period (Month or All)
      let filteredByPeriod = formatted.filter(t => {
        if (selectedPeriod === 'all') return true;
        
        const periodDate = parseISO(`${selectedPeriod}-01`);
        const periodStart = startOfMonth(periodDate);
        const periodEnd = endOfMonth(periodDate);

        const transactionDate = t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date);
        return transactionDate >= periodStart && transactionDate <= periodEnd;
      });

      // 2. Filter by Search Term
      let filteredBySearch = filteredByPeriod.filter(t => {
        const { description } = getTransactionInfo(t);
        return description.toLowerCase().includes(searchTerm.toLowerCase())
      });

      // 3. Filter by Category
      if (filterCategory !== 'all') {
        filteredBySearch = filteredBySearch.filter(t => t.category === filterCategory);
      }

      // 4. Filter by Date
      if (filterDate) {
        const dayStart = startOfDay(filterDate);
        filteredBySearch = filteredBySearch.filter(t => {
          const transactionDate = t.date && (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date);
          return startOfDay(transactionDate).getTime() === dayStart.getTime();
        });
      }


      const newSorted = [...filteredBySearch]
        .sort((a, b) => {
            const dateA = a.date && (a.date as any).toDate ? (a.date as any).toDate() : new Date(a.date);
            const dateB = b.date && (b.date as any).toDate ? (b.date as any).toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
      setSortedTransactions(newSorted);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, selectedPeriod, searchTerm, user, filterCategory, filterDate]);

  const handleDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };
  
  const handleCopy = (transaction: Transaction) => {
    setTransactionToCopy(transaction);
    setEditingTransaction(null);
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionToCopy(null);
  }
  
  const closeForms = () => {
    setEditingTransaction(null);
    setTransactionToCopy(null);
  }

  const TransactionActions = ({ transaction }: { transaction: Transaction }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <span className="sr-only">Відкрити меню</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleCopy(transaction)}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Копіювати</span>
          </DropdownMenuItem>
          {canEditOrDelete(transaction) && (
            <>
              <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Редагувати</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransactionToDelete(transaction)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Видалити</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-2 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
  
  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-blue-600';
      case 'credit_purchase':
        return 'text-red-600';
      case 'credit_payment':
        return 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Транзакції</CardTitle>
                <CardDescription>Огляд ваших доходів та витрат.</CardDescription>
            </div>
             {isMobile ? (
                <Button onClick={onAddTransaction} size="icon">
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Додати транзакцію</span>
                </Button>
             ) : (
                <Button onClick={onAddTransaction}>
                    <PlusCircle />
                    Додати транзакцію
                </Button>
             )}
        </div>
        <div className="pt-4 space-y-2">
            <Input 
                placeholder="Пошук за описом..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex w-full flex-row gap-2">
                <div className="w-1/2">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Категорія" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Всі категорії</SelectItem>
                            {categories.sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-1/2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !filterDate && 'text-muted-foreground'
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterDate ? format(filterDate, 'PPP', { locale: uk }) : <span>Фільтр по даті</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={filterDate}
                                onSelect={setFilterDate}
                                initialFocus
                                locale={uk}
                            />
                            <div className="p-2 border-t">
                                <Button variant="ghost" className="w-full" onClick={() => setFilterDate(undefined)}>Очистити</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : sortedTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchTerm ? `Нічого не знайдено за запитом "${searchTerm}"` : 'За цей період транзакцій немає.'}
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden">
              <div className="space-y-2">
                {sortedTransactions.map((transaction) => {
                  const date = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);
                  const { description, amountDisplay, isMasked } = getTransactionInfo(transaction);
                  return (
                    <div key={transaction.id} className="flex items-center gap-3 px-1 sm:px-3 py-3 rounded-lg border">
                      <TransactionUserAvatar userId={transaction.familyMemberId} />
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
                            {!isMasked && (transaction.type === 'income' ? '+' : '-')}
                            {amountDisplay}
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
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Опис</TableHead>
                    <TableHead>Категорія</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Сума</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => {
                     const { description, category, amountDisplay, isMasked } = getTransactionInfo(transaction);
                     const categoryInfo = category ? categories.find(c => c.name === category) : null;
                     const Icon = categoryInfo ? categoryIcons[categoryInfo.icon] : null;
                    const date = transaction.date && (transaction.date as any).toDate ? (transaction.date as any).toDate() : new Date(transaction.date);

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <TransactionUserAvatar userId={transaction.familyMemberId} />
                        </TableCell>
                        <TableCell className="font-medium">{description}</TableCell>
                        <TableCell>
                          {category && Icon && (
                            <Badge variant="outline" className="flex items-center gap-2 w-fit">
                              <Icon className="h-3 w-3" />
                              {category}
                            </Badge>
                          )}
                           {isMasked && <Badge variant="outline">***</Badge>}
                        </TableCell>
                        <TableCell>
                          {format(date, 'd MMM, yyyy', { locale: uk })}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            !isMasked && getAmountColor(transaction.type),
                            isMasked && 'font-mono'
                          )}
                        >
                          {!isMasked && (transaction.type === 'income' ? '+' : '-')}
                          {amountDisplay}
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
      
      <Dialog open={!!editingTransaction || !!transactionToCopy} onOpenChange={(isOpen) => !isOpen && closeForms()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingTransaction ? 'Редагувати' : 'Копіювати'} транзакцію</DialogTitle>
                    <DialogDescription>
                    {editingTransaction ? 'Оновіть деталі вашої транзакції.' : 'Створіть нову транзакцію на основі існуючої.'}
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm
                    transaction={editingTransaction || transactionToCopy || undefined}
                    onSave={closeForms}
                    isCopy={!!transactionToCopy}
                />
            </DialogContent>
      </Dialog>
      
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
