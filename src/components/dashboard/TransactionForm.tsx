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
import { Calendar as CalendarIcon, PlusCircle, Pencil, Calculator, Copy, Lock, Unlock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { categoryIcons } from '@/lib/category-icons';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/contexts/transactions-context';
import type { Transaction } from '@/lib/types';
import { useCategories } from '@/contexts/categories-context';
import { Timestamp } from 'firebase/firestore';
import ReceiptCalculator from './ReceiptCalculator';
import { Switch } from '../ui/switch';


type TransactionFormProps = {
    transaction?: Transaction;
    onSave?: () => void;
    initialAmount?: number;
    isCopy?: boolean;
};


export default function TransactionForm({ transaction, onSave, initialAmount, isCopy = false }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { categories: availableCategories } = useCategories();
  const [type, setType] = useState<Transaction['type']>('expense');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const isEditMode = !!transaction && !isCopy;

  useEffect(() => {
    if (transaction) {
        setType(transaction.type);
        setAmount(String(transaction.amount));
        setDescription(transaction.description);
        setCategory(transaction.category);
        setIsPrivate(transaction.isPrivate || false);
        
        if (isCopy) {
            setDate(new Date());
        } else if (transaction.date) {
            const transactionDate = transaction.date instanceof Timestamp 
                ? transaction.date.toDate() 
                : new Date(transaction.date);
            setDate(transactionDate);
        }
    } else if (initialAmount) {
        setAmount(String(initialAmount));
        setType('expense');
    }
  }, [transaction, isEditMode, initialAmount, isCopy]);


  const categories = availableCategories.filter(c => c.type === type);

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

    const transactionData = {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date,
        isPrivate,
    };

    if (isEditMode && transaction) {
        updateTransaction({ 
            ...transaction,
            ...transactionData 
        });
        toast({
          title: 'Успіх!',
          description: 'Вашу транзакцію було оновлено.',
        });
    } else {
        addTransaction(transactionData);
        toast({
          title: 'Успіх!',
          description: `Вашу ${isCopy ? 'скопійовану ' : ''}транзакцію було додано.`,
        });
    }
    
    onSave?.();

    if (!isEditMode) {
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date());
        setIsPrivate(false);
    }
  };
  
  const getButtonContent = () => {
    if (isEditMode) {
        return <><Pencil className="mr-2 h-4 w-4" />Зберегти зміни</>;
    }
    if (isCopy) {
        return <><Copy className="mr-2 h-4 w-4" />Створити копію</>;
    }
    return <><PlusCircle className="mr-2 h-4 w-4" />Додати транзакцію</>;
  }


  return (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center">
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
              <div className="flex items-center space-x-2">
                {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                <Label htmlFor="is-private">Особиста</Label>
                <Switch 
                    id="is-private" 
                    checked={isPrivate} 
                    onCheckedChange={setIsPrivate} 
                />
             </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Сума</Label>
                <div className="flex items-center gap-2">
                    <Input id="amount" type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <Popover open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" type="button">
                                <Calculator className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <ReceiptCalculator
                                initialAmount={parseFloat(amount) || 0}
                                onDone={(total) => {
                                    setAmount(total.toFixed(2));
                                    setIsCalculatorOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Дата</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      type="button"
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
                  {categories.map((cat) => {
                    const Icon = categoryIcons[cat.icon];
                    return (
                        <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            {cat.name}
                        </div>
                        </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            {getButtonContent()}
          </Button>
        </form>
  );
}
