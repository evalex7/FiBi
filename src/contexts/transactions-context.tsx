'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';
import { mockTransactions } from '@/lib/data';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prevTransactions => [...prevTransactions, transaction]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction }}>
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
