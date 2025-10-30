'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { mockTransactions } from '@/lib/data';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date: Date }) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const safeJSONParse = (str: string | null) => {
    if (!str) return null;
    try {
        const data = JSON.parse(str);
        // Revive dates
        return data.map((t: any) => ({ ...t, date: new Date(t.date) }));
    } catch (e) {
        return null;
    }
};


export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(safeJSONParse(storedTransactions) || mockTransactions);
      } else {
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error("Failed to load transactions from localStorage", error);
      setTransactions(mockTransactions);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error("Failed to save transactions to localStorage", error);
        }
    }
  }, [transactions, isLoading]);


  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'date'> & { date: Date }) => {
    const newTransaction: Transaction = {
        ...transactionData,
        id: crypto.randomUUID(),
        date: transactionData.date || new Date(),
    };
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prevTransactions => 
      prevTransactions.map(t => t.id === updatedTransaction.id ? {...updatedTransaction, date: new Date(updatedTransaction.date)} : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
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
