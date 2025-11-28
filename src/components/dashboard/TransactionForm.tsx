'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, PlusCircle, Pencil, Calculator, Copy, Lock, Unlock, TrendingUp, TrendingDown, Landmark, CreditCard } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

type TransactionFormProps = {
  transaction?: Transaction;
  onSave?: () => void;
  initialValues?: Partial<Transaction>;
  isCopy?: boolean;
};

type TransactionTypeGroup = 'income' | 'expense' | 'credit';

export default function TransactionForm({
  transaction,
  onSave,
  initialValues,
  isCopy = false,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { categories: availableCategories } = useCategories();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const isEditMode = !!transaction && !isCopy;
  
  const getInitialType = (): Transaction['type'] => {
    if (initialValues?.type) return initialValues.type;
    if (isEditMode && transaction?.type) return transaction.type;
    return 'expense';
  };
  
  const getInitialTypeGroup = (): TransactionTypeGroup => {
    const currentType = getInitialType();
    if (currentType === 'income') return 'income';
    if (currentType === 'expense') return 'expense';
    return 'credit';
  }

  const [type, setType] = useState<Transaction['type']>(getInitialType());
  const [typeGroup, setTypeGroup] = useState<TransactionTypeGroup>(getInitialTypeGroup());
  
  const valuesToSet = isEditMode ? transaction : (isCopy ? transaction : initialValues);

  const [date, setDate] = useState<Date | undefined>(
      valuesToSet?.date instanceof Timestamp ? valuesToSet.date.toDate() : (valuesToSet?.date ? new Date(valuesToSet.date as any) : new Date())
  );
  const [amount, setAmount] = useState(String(valuesToSet?.amount || ''));
  const [description, setDescription] = useState(valuesToSet?.description || '');
  const [category, setCategory] = useState(valuesToSet?.category || '');
  const [isPrivate, setIsPrivate] = useState(valuesToSet?.isPrivate || false);
  
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    // When initialValues are provided, set the type and group
    if (initialValues?.type) {
      setType(initialValues.type);
      if (['credit_purchase', 'credit_payment', 'credit_limit'].includes(initialValues.type)) {
        setTypeGroup('credit');
      } else {
        setTypeGroup(initialValues.type as TransactionTypeGroup);
      }
    }
  }, [initialValues]);

  useEffect(() => {
    // When type group changes, reset specific type and category
    if (isEditMode || isCopy) return;
    
    if (typeGroup === 'credit') {
        setType('credit_purchase'); // Default to credit purchase
    } else {
        setType(typeGroup);
    }
    setCategory('');
  }, [typeGroup, isEditMode, isCopy]);
  
  const categoryTypeMap: Record<Transaction['type'], 'income' | 'expense' | 'credit'> = {
    income: 'income',
    expense: 'expense',
    credit_purchase: 'credit',
    credit_payment: 'credit',
    credit_limit: 'credit',
  };

  const categories = availableCategories
    .filter((c) => c.type === categoryTypeMap[type])
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isCreditLimit = type === 'credit_limit';
    const finalCategory = isCreditLimit ? 'Кредитні операції' : category;

    if (!amount || !description || (!isCreditLimit && !finalCategory) || !date) {
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
      type: type,
      category: finalCategory,
      date,
      isPrivate,
    };

    if (isEditMode && transaction) {
      updateTransaction({
        ...transaction,
        ...transactionData,
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
      return (
        <>
          <Pencil className="mr-2 h-4 w-4" />
          Зберегти зміни
        </>
      );
    }
    if (isCopy) {
      return (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Створити копію
        </>
      );
    }
    return (
      <>
        <PlusCircle className="mr-2 h-4 w-4" />
        Додати транзакцію
      </>
    );
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="flex justify-between items-center">
            <div className="grid gap-2 w-full">
                <Label>Тип</Label>
                <RadioGroup
                className="flex gap-2 sm:gap-4 flex-wrap"
                value={typeGroup}
                onValueChange={(value: TransactionTypeGroup) => setTypeGroup(value)}
                >
                    <Label className="flex items-center space-x-2 cursor-pointer text-sm sm:text-base">
                        <RadioGroupItem value="expense" />
                        <span>Витрата</span>
                    </Label>
                    <Label className="flex items-center space-x-2 cursor-pointer text-sm sm:text-base">
                        <RadioGroupItem value="income" />
                        <span>Дохід</span>
                    </Label>
                    <Label className="flex items-center space-x-2 cursor-pointer text-sm sm:text-base">
                        <RadioGroupItem value="credit" />
                        <span>Кредит</span>
                    </Label>
                </RadioGroup>
            </div>
        </div>

        {typeGroup === 'credit' && (
            <div className="grid gap-2">
                <Label htmlFor="credit-type">Тип кредитної операції</Label>
                <Select required value={type} onValueChange={(value: Transaction['type']) => setType(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Оберіть тип операції" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="credit_purchase">
                           <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span>Покупка в кредит</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="credit_payment">
                             <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span>Погашення боргу</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="credit_limit">
                             <div className="flex items-center gap-2">
                                <Landmark className="h-4 w-4 text-blue-500" />
                                <span>Встановити/Оновити ліміт</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        )}

        <div className="flex items-center space-x-2">
            {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            <Label htmlFor="is-private">Особиста</Label>
            <Switch
            id="is-private"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
            />
        </div>


        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Сума</Label>
            <div className="flex items-center gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
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
            {isMobile === true && (
                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant={'outline'}
                            type="button"
                            onClick={() => setIsCalendarOpen(true)}
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !date && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP', { locale: uk }) : <span>Оберіть дату</span>}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 w-auto" showCloseButton={false}>
                       <DialogHeader className="hidden">
                           <DialogTitle>Оберіть дату</DialogTitle>
                       </DialogHeader>
                        <div className="flex justify-center pt-8">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(selectedDate) => {
                                    setDate(selectedDate);
                                }}
                                initialFocus
                                locale={uk}
                            />
                        </div>
                        <DialogFooter className="p-4 pt-0">
                           <DialogClose asChild>
                                <Button type="button" className="w-full">Готово</Button>
                           </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            {isMobile === false && (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                            onSelect={(selectedDate) => {
                                setDate(selectedDate);
                                setIsCalendarOpen(false);
                            }}
                            initialFocus
                            locale={uk}
                        />
                    </PopoverContent>
                </Popover>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Опис</Label>
          <Input
            id="description"
            placeholder={typeGroup === 'credit' ? 'напр., Монобанк' : 'напр., Щотижневі продукти'}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        
        {type !== 'credit_limit' && (
          <div className="grid gap-2">
            <Label htmlFor="category">Категорія</Label>
            <Select required={type !== 'credit_limit'} value={category} onValueChange={setCategory}>
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
        )}
      </div>

      <Button type="submit" className="w-full">
        {getButtonContent()}
      </Button>
    </form>
  );
}
