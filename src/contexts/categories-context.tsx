'use client';

import React, { createContext, useContext, useMemo, ReactNode, useEffect } from 'react';
import type { Category } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, getDocs, query } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';
import { defaultCategories } from '@/lib/category-icons';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
    if (!firestore) return null;
    return collection(firestore, 'categories');
  }, [firestore]);

  const { data: categories, isLoading } = useCollection<Category>(categoriesCollectionRef);

  useEffect(() => {
    if (user && !isLoading && categoriesCollectionRef && firestore && categories?.length === 0) {
      // First time family setup, let's populate with default categories.
      const q = query(categoriesCollectionRef);
      getDocs(q).then(snapshot => {
        if(snapshot.empty) {
          toast({
            title: 'Вітаємо!',
            description: 'Ми додали для вас стандартний набір категорій, щоб ви могли почати.',
          });
          const batch = writeBatch(firestore);
          defaultCategories.forEach(category => {
            const newDocRef = doc(categoriesCollectionRef);
            batch.set(newDocRef, {...category, familyMemberId: user.uid, isCommon: true});
          });
          batch.commit().catch(error => {
            console.error("Batch write for default categories failed:", error);
            // Optionally emit a generic error
          });
        }
      });
    }
  }, [user, isLoading, categories, firestore, categoriesCollectionRef, toast]);
  
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    if (!categoriesCollectionRef || !user) return;
    const dataWithUser = { ...categoryData, familyMemberId: user.uid, isCommon: false };
    const newDocRef = doc(categoriesCollectionRef);
    setDocumentNonBlocking(newDocRef, dataWithUser, {}).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: dataWithUser,
        })
      );
    });
  };

  const updateCategory = (updatedCategory: WithId<Category>) => {
    if (!firestore || !user) return;
    const categoryDocRef = doc(firestore, 'categories', updatedCategory.id);
    const { id, ...categoryData } = updatedCategory;
    // ensure only owner can update
    if (updatedCategory.familyMemberId !== user.uid) return;
    setDocumentNonBlocking(categoryDocRef, categoryData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: categoryDocRef.path,
            operation: 'update',
            requestResourceData: categoryData,
          })
        );
      });
  };

  const deleteCategory = (id: string) => {
    if (!firestore || !user) return;
    const categoryDocRef = doc(firestore, 'categories', id);
    // In a real app, you'd check ownership before deleting
    deleteDocumentNonBlocking(categoryDocRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: categoryDocRef.path,
            operation: 'delete',
          })
        );
      });
  };

  const value = useMemo(() => ({
    categories: categories || [],
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading
  }), [categories, isLoading]);

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
