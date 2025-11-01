'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBudgets } from '@/contexts/budgets-context';
import type { Budget } from '@/lib/types';
import { useCategories } from '@/contexts/categories-context';
import { categoryIcons } from '@/lib/category-icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

type BudgetFormProps = {
    budget?: Budget;
    onSave?: () => void;
};

export default function BudgetForm({ budget, onSave }: BudgetFormProps) {
  const { addBudget, updateBudget, budgets } = useBudgets();
  const { categories: expenseCategories } = useCategories();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [period, setPeriod] = useState<Budget['period']>('monthly');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  const isEditMode = !!budget;

  useEffect(() => {
    if (isEditMode && budget) {
        setAmount(String(budget.amount));
        setCategory(budget.category);
        setPeriod(budget.period);
        if (budget.startDate) {
          const budgetStartDate = budget.startDate instanceof Timestamp
            ? budget.startDate.toDate()
            : new Date(budget.startDate);
          setStartDate(budgetStartDate);
        }
    }
  }, [budget, isEditMode]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !period || !startDate) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, заповніть усі поля.',
      });
      return;
    }
    
    // Check for duplicate budget for the same category and period
    if (!isEditMode && budgets.find(b => b.category === category && b.period === period)) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: `Бюджет для категорії "${category}" на цей період вже існує.`,
      });
      return;
    }

    const budgetData = {
        amount: parseFloat(amount),
        category,
        period,
        startDate: Timestamp.fromDate(startDate),
    };

    if (isEditMode && budget) {
        updateBudget({ ...budget, ...budgetData });
        toast({
          title: 'Успіх!',
          description: 'Ваш бюджет було оновлено.',
        });
    } else {
        addBudget(budgetData);
        toast({
          title: 'Успіх!',
          description: 'Ваш бюджет було додано.',
        });
    }
    
    onSave?.();

    if (!isEditMode) {
        setAmount('');
        setCategory('');
        setPeriod('monthly');
        setStartDate(new Date());
    }
  };

  const availableCategories = expenseCategories.filter(
    (cat) => (isEditMode || !budgets.some((b) => b.category === cat.name)) && cat.type === 'expense'
  );

  return (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="category">Категорія</Label>
                <Select required value={category} onValueChange={setCategory} disabled={isEditMode}>
                    <SelectTrigger>
                        <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                    {isEditMode && budget ? (
                        <SelectItem key={budget.category} value={budget.category}>
                            {budget.category}
                        </SelectItem>
                    ) : (
                        availableCategories.map((cat) => {
                          const Icon = categoryIcons[cat.icon];
                          return (
                            <SelectItem key={cat.id} value={cat.name}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{cat.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })
                    )}
                    </SelectContent>
                </Select>
             </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Сума</Label>
                <Input id="amount" type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="period">Період</Label>
                    <Select required value={period} onValueChange={(value: Budget['period']) => setPeriod(value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Оберіть період" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Щомісяця</SelectItem>
                            <SelectItem value="quarterly">Щокварталу</SelectItem>
                            <SelectItem value="yearly">Щорічно</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="date">Дата початку</Label>
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground'
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP', { locale: uk }) : <span>Оберіть дату</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        locale={uk}
                        />
                    </PopoverContent>
                    </Popover>
                </div>
             </div>
          </div>
          <Button type="submit" className="w-full">
              {isEditMode ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isEditMode ? 'Зберегти зміни' : 'Додати бюджет'}
            </Button>
        </form>
  );
}