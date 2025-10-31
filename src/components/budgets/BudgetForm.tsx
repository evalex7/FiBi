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
import { PlusCircle, Pencil } from 'lucide-react';
import { expenseCategories } from '@/lib/category-icons';
import { useToast } from '@/hooks/use-toast';
import { useBudgets } from '@/contexts/budgets-context';
import type { Budget } from '@/lib/types';


type BudgetFormProps = {
    budget?: Budget;
    onSave?: () => void;
};


export default function BudgetForm({ budget, onSave }: BudgetFormProps) {
  const { addBudget, updateBudget, budgets } = useBudgets();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const isEditMode = !!budget;

  useEffect(() => {
    if (isEditMode && budget) {
        setAmount(String(budget.amount));
        setCategory(budget.category);
    }
  }, [budget, isEditMode]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, заповніть усі поля.',
      });
      return;
    }

    if (!isEditMode && budgets.find(b => b.category === category)) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: `Бюджет для категорії "${category}" вже існує.`,
      });
      return;
    }


    const budgetData = {
        amount: parseFloat(amount),
        category,
    };

    if (isEditMode && budget) {
        updateBudget({ ...budgetData, id: budget.id });
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
    }
  };

  const availableCategories = expenseCategories.filter(
    (cat) => isEditMode || !budgets.some((b) => b.category === cat.label)
  );


  return (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                        availableCategories.map((cat) => (
                            <SelectItem key={cat.label} value={cat.label}>
                            <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                            </div>
                            </SelectItem>
                        ))
                    )}
                    </SelectContent>
                </Select>
             </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Сума</Label>
                <Input id="amount" type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
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
