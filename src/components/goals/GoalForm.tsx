'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, PiggyBank } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGoals } from '@/contexts/goals-context';
import type { Goal } from '@/lib/types';

type GoalFormProps = {
    goal?: Goal;
    onSave?: () => void;
};

export default function GoalForm({ goal, onSave }: GoalFormProps) {
  const { addGoal, updateGoal } = useGoals();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const isEditMode = !!goal;

  useEffect(() => {
    if (isEditMode && goal) {
        setName(goal.name);
        setTargetAmount(String(goal.targetAmount));
        setCurrentAmount(String(goal.currentAmount));
    }
  }, [goal, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!name || !targetAmount || target <= 0) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, введіть назву та коректну суму цілі.',
      });
      return;
    }
    
    if (current > target) {
        toast({
            variant: 'destructive',
            title: 'Помилка',
            description: 'Поточна сума не може бути більшою за цільову.',
        });
        return;
    }

    const goalData = {
        name,
        targetAmount: target,
        currentAmount: current,
    };

    if (isEditMode && goal) {
        updateGoal({ ...goal, ...goalData });
        toast({
          title: 'Успіх!',
          description: 'Вашу ціль було оновлено.',
        });
    } else {
        addGoal(goalData);
        toast({
          title: 'Успіх!',
          description: 'Нову ціль створено.',
        });
    }
    
    onSave?.();

    if (!isEditMode) {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="name">Назва цілі</Label>
            <Input 
                id="name" 
                placeholder="напр., Відпустка в Італії" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="targetAmount">Цільова сума</Label>
                <Input 
                    id="targetAmount" 
                    type="number" 
                    placeholder="50000" 
                    required 
                    value={targetAmount} 
                    onChange={(e) => setTargetAmount(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="currentAmount">Початкова сума</Label>
                <Input 
                    id="currentAmount" 
                    type="number" 
                    placeholder="0" 
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    disabled={isEditMode}
                />
                 {isEditMode && <p className="text-xs text-muted-foreground">Редагувати поточну суму можна через кнопку "Поповнити".</p>}
            </div>
        </div>
        <Button type="submit" className="w-full">
            {isEditMode ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            {isEditMode ? 'Зберегти зміни' : 'Створити ціль'}
        </Button>
    </form>
  );
}
