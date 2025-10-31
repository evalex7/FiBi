'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { useUser } from '@/firebase';
import { mockTransactions } from '@/lib/data';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'familyMemberId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'familyMemberId'>) => {
    if (!user) return;
    const newTransaction: Transaction = {
      ...transactionData,
      id: new Date().getTime().toString(),
      familyMemberId: user.uid,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    if (!user || updatedTransaction.familyMemberId !== user.uid) return;
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (id: string) => {
     if (!user) return;
    // In a real app, you'd check ownership before deleting
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const value = useMemo(() => ({
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading
  }), [transactions, isLoading]);


  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};
