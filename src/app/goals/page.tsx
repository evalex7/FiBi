'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import GoalList from '@/components/goals/GoalList';
import GoalForm from '@/components/goals/GoalForm';

export default function GoalsPage() {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  return (
    <AppLayout pageTitle="Цілі">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Мої фінансові цілі</h2>
            <Button onClick={() => setIsAddGoalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Додати ціль
            </Button>
        </div>
        <GoalList />
      </div>

       <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Створити нову ціль</DialogTitle>
                <DialogDescription>
                    Поставте собі фінансову ціль і відстежуйте свій прогрес.
                </DialogDescription>
            </DialogHeader>
            <GoalForm onSave={() => setIsAddGoalOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
