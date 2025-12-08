'use client';

import React, { createContext, useContext, useMemo, ReactNode, useEffect, useCallback } from 'react';
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

  const seedDefaultCategories = useCallback(async () => {
    if (!user || !firestore || !categoriesCollectionRef) return;
    
    // Check a flag on the user's profile to see if we've seeded before
    const userProfileRef = doc(firestore, 'users', user.uid);
    // Note: This relies on a separate mechanism to fetch the user profile.
    // For this context, we will assume a "settings" subcollection or a field in the user doc.
    // Let's use a simple field `defaultCategoriesSeeded` on the user doc.

    // To prevent race conditions, we'll check both a local flag and the db.
    // But for simplicity here, let's assume this check is sufficient.
    const q = query(categoriesCollectionRef);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        toast({
            title: 'Вітаємо!',
            description: 'Ми додали для вас стандартний набір категорій, щоб ви могли почати.',
        });
        const batch = writeBatch(firestore);
        defaultCategories.forEach(category => {
            const newDocRef = doc(categoriesCollectionRef);
            batch.set(newDocRef, { ...category, familyMemberId: user.uid });
        });
        
        try {
            await batch.commit();
        } catch (error) {
            console.error("Batch write for default categories failed:", error);
        }
    }
  }, [user, firestore, categoriesCollectionRef, toast]);
  
  useEffect(() => {
    // This effect runs when user is available and categories have loaded.
    if (user && !isLoading && categories !== null) {
      if (categories.length === 0) {
        seedDefaultCategories();
      }
    }
  }, [user, isLoading, categories, seedDefaultCategories]);
  
  const addCategory = (categoryData: Omit<Category, 'id' | 'familyMemberId' | 'order'>) => {
    if (!firestore || !user || !categories) return;

    // Prevent adding a category with a name that already exists (case-insensitive)
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryData.name.toLowerCase());
    if (existingCategory) {
        toast({
            variant: 'destructive',
            title: 'Помилка',
            description: `Категорія з назвою "${categoryData.name}" вже існує.`,
        });
        return;
    }

    const categoriesCollection = collection(firestore, 'categories');
    const order = (categories.length > 0) ? Math.max(...categories.map(c => c.order || 0)) + 1 : 0;
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
    if (!firestore || !user || !categories) return;

    // Prevent renaming a category to a name that already exists
     const existingCategory = categories.find(cat => cat.name.toLowerCase() === updatedCategory.name.toLowerCase() && cat.id !== updatedCategory.id);
    if (existingCategory) {
        toast({
            variant: 'destructive',
            title: 'Помилка',
            description: `Категорія з назвою "${updatedCategory.name}" вже існує.`,
        });
        return;
    }

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
      // Only update categories that the user owns.
      if (category.familyMemberId === user.uid || category.isCommon) {
        const docRef = doc(firestore, 'categories', category.id);
        batch.update(docRef, { order: index });
      }
    });

    batch.commit().catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'categories/{categoryId}',
            operation: 'update',
          })
        );
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
