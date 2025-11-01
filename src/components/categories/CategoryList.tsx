'use client';

import { useState, useMemo } from 'react';
import { useCategories } from '@/contexts/categories-context';
import type { Category } from '@/lib/types';
import { categoryIcons } from '@/lib/category-icons';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import CategoryForm from './CategoryForm';
import { Badge } from '../ui/badge';

export default function CategoryList() {
  const { categories, isLoading, deleteCategory } = useCategories();
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    
    const otherCategories = categories.filter(c => c.name.startsWith('Інше'));
    const regularCategories = categories.filter(c => !c.name.startsWith('Інше'));

    regularCategories.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    otherCategories.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    
    return [...regularCategories, ...otherCategories];
  }, [categories]);

  const handleDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <div className="flex-grow">
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedCategories.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border rounded-lg">
          Ще немає категорій.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedCategories.map(category => {
            const Icon = categoryIcons[category.icon];
            return (
              <div key={category.id} className="flex items-center gap-4 p-2 rounded-lg border">
                {Icon && <div className="h-8 w-8 flex items-center justify-center bg-secondary rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
                <div className="flex-grow font-medium">
                  {category.name}
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={category.type === 'expense' ? 'destructive' : 'default'} className="bg-opacity-20 text-foreground hidden sm:inline-flex">
                      {category.type === 'expense' ? 'Витрата' : 'Дохід'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Відкрити меню</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setCategoryToEdit(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Редагувати</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryToDelete(category)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Видалити</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <AlertDialog open={!!categoryToDelete} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію неможливо скасувати. Це назавжди видалить вашу категорію.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Видалити</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!categoryToEdit} onOpenChange={(isOpen) => !isOpen && setCategoryToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Редагувати категорію</DialogTitle>
                <DialogDescription>Оновіть деталі вашої категорії.</DialogDescription>
            </DialogHeader>
            {categoryToEdit && <CategoryForm category={categoryToEdit} onSave={() => setCategoryToEdit(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
