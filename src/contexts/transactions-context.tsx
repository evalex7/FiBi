'use client';

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, onSnapshot, Query, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';

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
        console.error("Error fetching transactions:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();

  }, [firestore]);


  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'familyMemberId'>) => {
    if (!firestore || !user) return;
    const transactionsCollectionRef = collection(firestore, 'expenses');
    addDocumentNonBlocking(transactionsCollectionRef, { ...transactionData, familyMemberId: user.uid });
  };

  const updateTransaction = (updatedTransaction: WithId<Transaction>) => {
    if (!firestore || !user) return;
    if (updatedTransaction.familyMemberId !== user.uid) return;
    const transactionDocRef = doc(firestore, 'expenses', updatedTransaction.id);
    const { id, ...transactionData } = updatedTransaction;
    updateDocumentNonBlocking(transactionDocRef, transactionData);
  };

  const deleteTransaction = (id: string) => {
    if (!firestore) return;
    const transactionDocRef = doc(firestore, 'expenses', id);
    deleteDocumentNonBlocking(transactionDocRef);
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
