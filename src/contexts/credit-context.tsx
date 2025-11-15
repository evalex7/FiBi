'use client';

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface CreditContextType {
  creditLimit: number;
  setCreditLimit: (limit: number) => Promise<void>;
  isLoading: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const [creditLimit, setCreditLimitState] = useState<number>(0);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const isLoading = isSettingsLoading;

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
          setCreditLimitState(data.creditLimit || 10000);
        } else {
          // Set default credit limit to 10000 on first load for the user
          await setDoc(creditSettingsDocRef, { creditLimit: 10000 }, { merge: true });
          setCreditLimitState(10000);
        }
      } catch (error) {
        console.error("Error fetching or creating credit settings:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };

    fetchOrCreateCreditSettings();
  }, [user, firestore]);

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
    setCreditLimit,
    isLoading
  }), [creditLimit, isLoading]);

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
