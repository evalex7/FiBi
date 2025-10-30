'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Pencil } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { expenseCategories, incomeCategories } from '@/lib/category-icons';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/contexts/transactions-context';
import type { Transaction } from '@/lib/types';


type TransactionFormProps = {
    transaction?: Transaction;
    onSave?: () => void;
};


export default function TransactionForm({ transaction, onSave }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const [type, setType] = useState<Transaction['type']>('expense');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const isEditMode = !!transaction;

  useEffect(() => {
    if (isEditMode) {
        setType(transaction.type);
        setAmount(String(transaction.amount));
        setDescription(transaction.description);
        setCategory(transaction.category);
        setDate(transaction.date);
    }
  }, [transaction, isEditMode]);


  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description || !category || !date) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, заповніть усі поля.',
      });
      return;
    }

    const newTransactionData = {
        id: isEditMode ? transaction.id : crypto.randomUUID(),
        date,
        description,
        amount: parseFloat(amount),
        type,
        category,
    };

    if (isEditMode) {
        updateTransaction(newTransactionData);
        toast({
          title: 'Успіх!',
          description: 'Вашу транзакцію було оновлено.',
        });
    } else {
        addTransaction(newTransactionData);
        toast({
          title: 'Успіх!',
          description: 'Вашу транзакцію було додано.',
        });
    }
    
    onSave?.();

    if (!isEditMode) {
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date());
    }
  };

  return (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Тип</Label>
              <RadioGroup
                defaultValue="expense"
                className="flex"
                value={type}
                onValueChange={(value: 'income' | 'expense') => setType(value)}
              >
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="expense" id="r2" />
                  <span>Витрата</span>
                </Label>
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="income" id="r3" />
                  <span>Дохід</span>
                </Label>
              </RadioGroup>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Сума</Label>
                <Input id="amount" type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Дата</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: uk }) : <span>Оберіть дату</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={uk}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Опис</Label>
              <Input id="description" placeholder="напр., Щотижневі продукти" required value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Категорія</Label>
              <Select required value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.label} value={cat.label}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              {isEditMode ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isEditMode ? 'Зберегти зміни' : 'Додати транзакцію'}
            </Button>
        </form>
  );
}
