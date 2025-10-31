'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';

interface TransactionsContextType {
  transactions: WithId<Transaction>[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: WithId<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'expenses');
  }, [firestore]);

  const { data: transactionsData, isLoading } = useCollection<Transaction>(transactionsCollectionRef);

  const transactions = useMemo(() => {
    if (!transactionsData) return [];
    return transactionsData.map(t => ({
      ...t,
      date: (t.date as any).toDate ? (t.date as any).toDate() : new Date(t.date)
    }));
  }, [transactionsData]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (!transactionsCollectionRef || !user) return;
    addDocumentNonBlocking(transactionsCollectionRef, { ...transactionData, familyMemberId: user.uid });
  };

  const updateTransaction = (updatedTransaction: WithId<Transaction>) => {
    if (!firestore) return;
    const transactionDocRef = doc(firestore, 'expenses', updatedTransaction.id);
    const { id, ...transactionData } = updatedTransaction;
    updateDocumentNonBlocking(transactionDocRef, transactionData);
  };

  const deleteTransaction = (id: string) => {
    if (!firestore) return;
    const transactionDocRef = doc(firestore, 'expenses', id);
    deleteDocumentNonBlocking(transactionDocRef);
  };


  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, isLoading }}>
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
