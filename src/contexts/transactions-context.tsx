'use client';

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react';
import type { RecurringPayment, Transaction } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface TransactionsContextType {
  transactions: WithId<Transaction>[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'familyMemberId'>) => void;
  updateTransaction: (transaction: WithId<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'expenses');
  }, [firestore, user]);
  
  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsCollectionRef);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'familyMemberId'>) => {
    if (!firestore || !user) return;
    const transactionsCollection = collection(firestore, 'expenses');
    const dataWithUser = { ...transactionData, familyMemberId: user.uid };
    const newDocRef = doc(transactionsCollection);
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

  const updateTransaction = (updatedTransaction: WithId<Transaction>) => {
    if (!firestore || !user) return;

    const transactionDocRef = doc(firestore, 'expenses', updatedTransaction.id);
    const { id, ...transactionData } = updatedTransaction;
    setDocumentNonBlocking(transactionDocRef, transactionData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: transactionDocRef.path,
            operation: 'update',
            requestResourceData: transactionData,
          })
        );
      });
  };

  const deleteTransaction = (id: string) => {
    if (!firestore || !user) return;
    const transactionDocRef = doc(firestore, 'expenses', id);
    // We need to fetch the document first to check ownership before deleting
    const transactionToDelete = transactions?.find(t => t.id === id);
    if (transactionToDelete?.familyMemberId !== user.uid) {
      console.warn("Attempted to delete a transaction by a non-owner.");
      return;
    }
    deleteDocumentNonBlocking(transactionDocRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: transactionDocRef.path,
            operation: 'delete',
          })
        );
      });
  };

  const value = useMemo(() => ({
    transactions: transactions || [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [transactions, isLoading, user]);


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
