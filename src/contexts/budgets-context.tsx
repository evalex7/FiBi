'use client';

import React, { createContext, useContext, useMemo, ReactNode, useState } from 'react';
import type { Budget } from '@/lib/types';
import { useUser } from '@/firebase';
import { WithId } from '@/firebase/firestore/use-collection';
import { mockBudgets } from '@/lib/data';

interface BudgetsContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'familyMemberId'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  isLoading: boolean;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export const BudgetsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isLoading, setIsLoading] = useState(false);
  
  const addBudget = (budgetData: Omit<Budget, 'id' | 'familyMemberId'>) => {
    if (!user) return;
    const newBudget: Budget = {
        ...budgetData,
        id: new Date().getTime().toString(),
        familyMemberId: user.uid,
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    if (!user || updatedBudget.familyMemberId !== user.uid) return;
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const deleteBudget = (id: string) => {
    if (!user) return;
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const value = useMemo(() => ({
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    isLoading
  }), [budgets, isLoading]);

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
