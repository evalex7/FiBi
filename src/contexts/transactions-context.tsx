'use client';

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
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
  const [transactions, setTransactions] = useState<WithId<Transaction>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const transactionsCollectionRef = collection(firestore, 'expenses');
    
    const unsubscribe = onSnapshot(transactionsCollectionRef, (snapshot) => {
        const newTransactions = snapshot.docs.map(doc => ({ ...doc.data() as Transaction, id: doc.id }));
        setTransactions(newTransactions);
        setIsLoading(false);
    }, (error) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: transactionsCollectionRef.path,
            operation: 'list',
          })
        );
        setIsLoading(false);
    });

    return () => unsubscribe();

  }, [firestore]);


  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'familyMemberId'>) => {
    if (!firestore || !user) return;
    const transactionsCollectionRef = collection(firestore, 'expenses');
    const dataWithUser = { ...transactionData, familyMemberId: user.uid };
    const newDocRef = doc(transactionsCollectionRef);
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
    if (updatedTransaction.familyMemberId !== user.uid) {
        console.warn("Attempted to update a transaction by a non-owner.");
        return;
    }
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
    if (!firestore) return;
    const transactionDocRef = doc(firestore, 'expenses', id);
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
