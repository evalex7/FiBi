'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryList from '@/components/categories/CategoryList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoriesSettings() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Категорії витрат та доходів</CardTitle>
                    <CardDescription>Керуйте своїми категоріями для транзакцій.</CardDescription>
                </div>
                <Button onClick={() => setIsAddCategoryOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Додати категорію
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <CategoryList />
        </CardContent>

        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Додати категорію</DialogTitle>
                    <DialogDescription>Створіть нову категорію для ваших транзакцій.</DialogDescription>
                </DialogHeader>
                <CategoryForm onSave={() => setIsAddCategoryOpen(false)} />
            </DialogContent>
        </Dialog>
    </Card>
  );
}
