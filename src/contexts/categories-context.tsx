'use client';

import React, { createContext, useContext, useMemo, ReactNode, useEffect } from 'react';
import type { Category } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';
import { defaultCategories } from '@/lib/category-icons';
import { useToast } from '@/hooks/use-toast';

interface CategoriesContextType {
  categories: WithId<Category>[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: WithId<Category>) => void;
  deleteCategory: (id: string) => void;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const categoriesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [firestore, user]);

  const { data: categories, isLoading } = useCollection<Category>(categoriesCollectionRef);

  useEffect(() => {
    if (user && !isLoading && categories && categories.length === 0) {
      // First time user, let's populate with default categories.
      toast({
        title: 'Вітаємо!',
        description: 'Ми додали для вас стандартний набір категорій, щоб ви могли почати.',
      });
      defaultCategories.forEach(category => {
        addCategory(category);
      });
    }
  }, [user, isLoading, categories]);
  
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    if (!categoriesCollectionRef || !user) return;
    addDocumentNonBlocking(categoriesCollectionRef, { ...categoryData, familyMemberId: user.uid, isCommon: false });
  };

  const updateCategory = (updatedCategory: WithId<Category>) => {
    if (!firestore || !user) return;
    const categoryDocRef = doc(firestore, 'users', user.uid, 'categories', updatedCategory.id);
    const { id, ...categoryData } = updatedCategory;
    updateDocumentNonBlocking(categoryDocRef, categoryData);
  };

  const deleteCategory = (id: string) => {
    if (!firestore || !user) return;
    const categoryDocRef = doc(firestore, 'users', user.uid, 'categories', id);
    deleteDocumentNonBlocking(categoryDocRef);
  };

  const value = useMemo(() => ({
    categories: categories || [],
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading
  }), [categories, isLoading, user, firestore]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
