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
  addCategory: (category: Omit<Category, 'id' | 'familyMemberId' | 'order'>) => void;
  updateCategory: (category: WithId<Category>) => void;
  updateCategoryOrder: (categories: WithId<Category>[]) => void;
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
    return collection(firestore, 'categories');
  }, [firestore, user]);

  const { data: categories, isLoading } = useCollection<Category>(categoriesCollectionRef);

  useEffect(() => {
    if (user && !isLoading && categoriesCollectionRef && firestore && categories?.length === 0) {
      
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
            batch.set(newDocRef, {...category, familyMemberId: user.uid });
          });
          batch.commit().catch(error => {
            console.error("Batch write for default categories failed:", error);
          });
        }
      });
    }
  }, [user, isLoading, categories, firestore, categoriesCollectionRef, toast]);
  
  const addCategory = (categoryData: Omit<Category, 'id' | 'familyMemberId' | 'order'>) => {
    if (!firestore || !user || !categories) return;
    const categoriesCollection = collection(firestore, 'categories');
    const order = (categories.length > 0) ? Math.max(...categories.map(c => c.order)) + 1 : 0;
    const dataWithUser = { ...categoryData, familyMemberId: user.uid, order };
    const newDocRef = doc(categoriesCollection);
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

  const updateCategoryOrder = (reorderedCategories: WithId<Category>[]) => {
    if (!firestore || !user) return;

    const batch = writeBatch(firestore);
    reorderedCategories.forEach((category, index) => {
      if (category.familyMemberId === user.uid) {
        const docRef = doc(firestore, 'categories', category.id);
        batch.update(docRef, { order: index });
      }
    });

    batch.commit().catch(error => {
        // Because this is a batch write, we can't pinpoint the exact failing document.
        // We'll emit a generic error for the collection path. The LLM can inspect the rules.
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'categories/{categoryId}',
            operation: 'update',
          })
        );
        // Also show a toast to the user
        toast({
            variant: 'destructive',
            title: 'Помилка оновлення',
            description: 'Не вдалося зберегти новий порядок. Можливо, у вас немає прав на редагування деяких категорій.',
        });
    });
  };

  const deleteCategory = (id: string) => {
    if (!firestore || !user) return;
    const categoryDocRef = doc(firestore, 'categories', id);
    
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
    updateCategoryOrder,
    deleteCategory,
    isLoading
  }), [categories, isLoading, user]);

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
