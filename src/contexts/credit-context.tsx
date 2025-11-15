'use client';

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTransactions } from './transactions-context';

interface CreditContextType {
  creditLimit: number;
  currentDebt: number;
  setCreditLimit: (limit: number) => Promise<void>;
  isLoading: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();

  const [creditLimit, setCreditLimitState] = useState<number>(0);
  const [currentDebt, setCurrentDebt] = useState<number>(0);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const isLoading = isSettingsLoading || isTransactionsLoading;

  useEffect(() => {
    if (!user || !firestore) {
      setIsSettingsLoading(false);
      return;
    }

    const creditSettingsDocRef = doc(firestore, 'users', user.uid);

    const fetchOrCreateCreditSettings = async () => {
      setIsSettingsLoading(true);
      try {
        const docSnap = await getDoc(creditSettingsDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCreditLimitState(data.creditLimit || 0);
        } else {
          await setDoc(creditSettingsDocRef, { creditLimit: 0 }, { merge: true });
          setCreditLimitState(0);
        }
      } catch (error) {
        console.error("Error fetching or creating credit settings:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    fetchOrCreateCreditSettings();
  }, [user, firestore]);

  useEffect(() => {
    if (isTransactionsLoading) return;

    const debt = transactions.reduce((acc, t) => {
      if (t.type === 'credit_purchase') {
        return acc + t.amount;
      }
      if (t.type === 'credit_payment') {
        return acc - t.amount;
      }
      return acc;
    }, 0);
    setCurrentDebt(debt);

  }, [transactions, isTransactionsLoading]);

  const setCreditLimit = async (limit: number) => {
    if (!user || !firestore) return;
    const creditSettingsDocRef = doc(firestore, 'users', user.uid);
    try {
      await setDoc(creditSettingsDocRef, { creditLimit: limit }, { merge: true });
      setCreditLimitState(limit);
    } catch (error) {
      console.error("Error updating credit limit:", error);
    }
  };

  const value = useMemo(() => ({
    creditLimit,
    currentDebt,
    setCreditLimit,
    isLoading
  }), [creditLimit, currentDebt, isLoading]);

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredit = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
};
