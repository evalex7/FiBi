'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGoals } from '@/contexts/goals-context';
import type { Goal } from '@/lib/types';
import { MoreHorizontal, Pencil, Trash2, PlusCircle, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import GoalForm from './GoalForm';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import TransactionUserAvatar from '../dashboard/TransactionUserAvatar';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);

const AddToGoalDialog = ({ goal, onSave }: { goal: Goal, onSave: () => void }) => {
    const { updateGoal } = useGoals();
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const handleAdd = () => {
        const value = parseFloat(amount);
        if (!value || value <= 0) {
            toast({ variant: 'destructive', title: 'Введіть коректну суму' });
            return;
        }

        const newAmount = goal.currentAmount + value;
        if (newAmount > goal.targetAmount) {
             toast({ variant: 'destructive', title: 'Сума перевищує ціль', description: 'Ви не можете додати більше, ніж потрібно для досягнення цілі.' });
            return;
        }
        
        updateGoal({ ...goal, currentAmount: newAmount });
        toast({ title: 'Успіх!', description: 'Вашу ціль поповнено.' });
        onSave();
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Поповнити скарбничку</DialogTitle>
                <DialogDescription>Додайте кошти до вашої цілі "{goal.name}".</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input 
                    type="number" 
                    placeholder="Сума поповнення" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                />
            </div>
            <DialogFooter>
                 <Button onClick={handleAdd}><PiggyBank className="mr-2 h-4 w-4" /> Поповнити</Button>
            </DialogFooter>
        </DialogContent>
    );
};


export default function GoalList() {
  const { goals, isLoading, deleteGoal } = useGoals();
  const { user } = useUser();
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToAdd, setGoalToAdd] = useState<Goal | null>(null);

  const canEditOrDelete = (goal: Goal) => {
    return goal.familyMemberId === user?.uid;
  };

  const handleDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between mt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      {goals.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
          <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Немає цілей</h3>
          <p className="mt-1 text-sm text-gray-500">Почніть з додавання нової фінансової цілі.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.sort((a, b) => b.targetAmount - a.targetAmount).map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader>
                   <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{goal.name}</CardTitle>
                            <CardDescription>Створено <TransactionUserAvatar userId={goal.familyMemberId} /></CardDescription>
                        </div>
                        {canEditOrDelete(goal) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Відкрити меню</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setGoalToEdit(goal)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Редагувати</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setGoalToDelete(goal)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Видалити</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                   </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                   <p className="text-sm font-medium text-center mt-2">
                        {progress >= 100 ? "🎉 Ціль досягнуто! 🎉" : `${formatCurrency(goal.targetAmount - goal.currentAmount)} залишилось`}
                   </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="secondary" onClick={() => setGoalToAdd(goal)} disabled={progress >= 100}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Поповнити
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      <AlertDialog open={!!goalToDelete} onOpenChange={(isOpen) => !isOpen && setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію неможливо скасувати. Це назавжди видалить вашу ціль та прогрес.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Видалити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!goalToEdit} onOpenChange={(isOpen) => !isOpen && setGoalToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Редагувати ціль</DialogTitle>
                <DialogDescription>Оновіть деталі вашої фінансової цілі.</DialogDescription>
            </DialogHeader>
            {goalToEdit && <GoalForm goal={goalToEdit} onSave={() => setGoalToEdit(null)} />}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!goalToAdd} onOpenChange={(isOpen) => !isOpen && setGoalToAdd(null)}>
            {goalToAdd && <AddToGoalDialog goal={goalToAdd} onSave={() => setGoalToAdd(null)} />}
      </Dialog>
    </>
  );
}
