'use client';
import AppLayout from '@/components/AppLayout';
import BudgetList from '@/components/budgets/BudgetList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import BudgetForm from '@/components/budgets/BudgetForm';

export default function BudgetsPage() {
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);

  return (
    <AppLayout pageTitle="Бюджети">
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Місячні бюджети</h2>
              <Button onClick={() => setIsAddBudgetOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Додати бюджет
              </Button>
            </div>
            <BudgetList />
          </div>
      <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Додати бюджет</DialogTitle>
                <DialogDescription>Створіть новий бюджет для відстеження витрат.</DialogDescription>
            </DialogHeader>
            <BudgetForm onSave={() => setIsAddBudgetOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
