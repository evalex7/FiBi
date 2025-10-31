'use client';

import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryList from '@/components/categories/CategoryList';

export default function CategoriesPage() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  return (
    <AppLayout pageTitle="Категорії">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Ваші категорії</h2>
          <Button onClick={() => setIsAddCategoryOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Додати категорію
          </Button>
        </div>
        <CategoryList />
      </div>
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Додати категорію</DialogTitle>
                <DialogDescription>Створіть нову категорію для ваших транзакцій.</DialogDescription>
            </DialogHeader>
            <CategoryForm onSave={() => setIsAddCategoryOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
