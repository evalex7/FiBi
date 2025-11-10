'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useCategories } from '@/contexts/categories-context';
import type { Category } from '@/lib/types';
import { categoryIcons } from '@/lib/category-icons';
import { MoreHorizontal, Pencil, Trash2, User, GripVertical } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export default function CategoryList() {
  const { categories, isLoading, deleteCategory, updateCategoryOrder } = useCategories();
  const { user } = useUser();
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (categories) {
      const newSorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSortedCategories(newSorted);
    }
  }, [categories]);

  const canEditOrDelete = (category: Category) => {
    // A category is considered common if it doesn't have the isPrivate flag or it's false.
    // Common categories can be edited by anyone.
    // Private categories can only be edited by the owner.
    if (!category.isPrivate) {
      return true;
    }
    return category.familyMemberId === user?.uid;
  };
  
  const handleDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    setDragging(true);
    // To make it work on Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };
  
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };
  
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
        setDragging(false);
        dragItem.current = null;
        dragOverItem.current = null;
        return;
    }

    const newCategories = [...sortedCategories];
    const [reorderedItem] = newCategories.splice(dragItem.current, 1);
    newCategories.splice(dragOverItem.current, 0, reorderedItem);

    setSortedCategories(newCategories); // Optimistic update
    updateCategoryOrder(newCategories);

    setDragging(false);
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
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
    <TooltipProvider>
      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedCategories.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border rounded-lg">
          Ще немає категорій.
        </div>
      ) : (
          <div className="space-y-2">
            {sortedCategories.map((category, index) => {
              const Icon = categoryIcons[category.icon];
              const isPersonal = category.isPrivate;
              return (
                <div
                  key={category.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border bg-card cursor-grab active:cursor-grabbing",
                    dragging && dragItem.current === index && "opacity-50"
                  )}
                >
                  <div className="p-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {Icon && <div className="h-8 w-8 flex items-center justify-center bg-secondary rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
                  <div className="flex-grow font-medium flex items-center gap-2">
                    <span>{category.name}</span>
                    {isPersonal && (
                      <Tooltip>
                        <TooltipTrigger>
                          <User className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Особиста категорія</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
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
                        <DropdownMenuItem onClick={() => setCategoryToEdit(category)} disabled={!canEditOrDelete(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Редагувати</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCategoryToDelete(category)} className="text-destructive" disabled={!canEditOrDelete(category)}>
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
    </TooltipProvider>
  );
}
