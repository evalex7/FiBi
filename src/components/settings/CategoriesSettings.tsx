'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CategoryForm from '@/components/categories/CategoryForm';
import CategoryList from '@/components/categories/CategoryList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function CategoriesSettings() {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Категорії витрат та доходів</CardTitle>
              <CardDescription>Керуйте своїми категоріями для транзакцій.</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="reorder-mode"
                  checked={isReorderMode}
                  onCheckedChange={setIsReorderMode}
                />
                <Label htmlFor="reorder-mode">Режим сортування</Label>
              </div>
              <Button onClick={() => setIsAddCategoryOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Додати категорію
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CategoryList isReorderMode={isReorderMode} />
        </CardContent>
      </Card>

      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Додати категорію</DialogTitle>
            <DialogDescription>Створіть нову категорію для ваших транзакцій.</DialogDescription>
          </DialogHeader>
          <CategoryForm onSave={() => setIsAddCategoryOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
