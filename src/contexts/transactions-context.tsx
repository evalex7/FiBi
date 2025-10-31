'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';

interface TransactionsContextType {
  transactions: WithId<Transaction>[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'familyMemberId' | 'createdAt' | 'updatedAt'>) => void;
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

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsCollectionRef);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'familyMemberId'>) => {
    if (!transactionsCollectionRef || !user) return;
    addDocumentNonBlocking(transactionsCollectionRef, { ...transactionData, familyMemberId: user.uid });
  };

  const updateTransaction = (updatedTransaction: WithId<Transaction>) => {
    if (!firestore || !user) return;
    // Ensure only the owner can update
    if (updatedTransaction.familyMemberId !== user.uid) return;
    const transactionDocRef = doc(firestore, 'expenses', updatedTransaction.id);
    const { id, ...transactionData } = updatedTransaction;
    updateDocumentNonBlocking(transactionDocRef, transactionData);
  };

  const deleteTransaction = (id: string) => {
    if (!firestore || !user) return;
    const transactionDocRef = doc(firestore, 'expenses', id);
    // In a real app, you might check ownership on the client side before even attempting,
    // but the security rules are the ultimate enforcer.
    deleteDocumentNonBlocking(transactionDocRef);
  };

  const value = useMemo(() => ({
    transactions: transactions || [],
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
