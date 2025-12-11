'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type { Budget } from '@/lib/types';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface BudgetsContextType {
  budgets: WithId<Budget>[];
  addBudget: (budget: Omit<Budget, 'id' | 'familyMemberId'>) => void;
  updateBudget: (budget: WithId<Budget>) => void;
  deleteBudget: (id: string) => void;
  isLoading: boolean;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export const BudgetsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const budgetsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'budgets');
  }, [firestore, user]);
  
  const { data: budgets, isLoading } = useCollection<Budget>(budgetsCollectionRef);

  const addBudget = (budgetData: Omit<Budget, 'id' | 'familyMemberId'>) => {
    if (!firestore || !user) return;
    const budgetsCollection = collection(firestore, 'budgets');
    const dataWithUser = { ...budgetData, familyMemberId: user.uid };
    const newDocRef = doc(budgetsCollection);
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

  const updateBudget = (updatedBudget: WithId<Budget>) => {
    if (!firestore || !user) return;
    
    if (updatedBudget.familyMemberId !== user.uid) {
      console.warn("Attempted to update a budget by a non-owner.");
      return;
    }
    const budgetDocRef = doc(firestore, 'budgets', updatedBudget.id);
    const { id, ...budgetData } = updatedBudget;
    setDocumentNonBlocking(budgetDocRef, budgetData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: budgetDocRef.path,
            operation: 'update',
            requestResourceData: budgetData,
          })
        );
      });
  };

  const deleteBudget = (id: string) => {
    if (!firestore || !user) return;
    const budgetDocRef = doc(firestore, 'budgets', id);
    
    deleteDocumentNonBlocking(budgetDocRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: budgetDocRef.path,
            operation: 'delete',
          })
        );
      });
  };

  const value = useMemo(() => ({
    budgets: budgets || [],
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading
  }), [budgets, isLoading, user]);

  return (
    <BudgetsContext.Provider value={value}>
      {children}
    </BudgetsContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return context;
};
