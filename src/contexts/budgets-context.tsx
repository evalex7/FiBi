'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type { Budget } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';

interface BudgetsContextType {
  budgets: WithId<Budget>[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
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
    return collection(firestore, 'users', user.uid, 'budgets');
  }, [firestore, user]);

  const { data: budgets, isLoading } = useCollection<Budget>(budgetsCollectionRef);
  
  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    if (!budgetsCollectionRef || !user) return;
    addDocumentNonBlocking(budgetsCollectionRef, { ...budgetData, familyMemberId: user.uid });
  };

  const updateBudget = (updatedBudget: WithId<Budget>) => {
    if (!firestore || !user) return;
    const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', updatedBudget.id);
    const { id, ...budgetData } = updatedBudget;
    updateDocumentNonBlocking(budgetDocRef, budgetData);
  };

  const deleteBudget = (id: string) => {
    if (!firestore || !user) return;
    const budgetDocRef = doc(firestore, 'users', user.uid, 'budgets', id);
    deleteDocumentNonBlocking(budgetDocRef);
  };

  const value = useMemo(() => ({
    budgets: budgets || [],
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading
  }), [budgets, isLoading, user, firestore]);

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
