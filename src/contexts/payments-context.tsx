'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { RecurringPayment } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';

interface PaymentsContextType {
  payments: WithId<RecurringPayment>[];
  addPayment: (payment: Omit<RecurringPayment, 'id' | 'familyMemberId'>) => void;
  updatePayment: (payment: WithId<RecurringPayment>) => void;
  deletePayment: (id: string) => void;
  isLoading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export const PaymentsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const paymentsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'payments');
  }, [firestore]);

  const { data: payments, isLoading } = useCollection<RecurringPayment>(paymentsCollectionRef);
  
  const addPayment = (paymentData: Omit<RecurringPayment, 'id' | 'familyMemberId'>) => {
    if (!paymentsCollectionRef || !user) return;
    addDocumentNonBlocking(paymentsCollectionRef, { ...paymentData, familyMemberId: user.uid });
  };

  const updatePayment = (updatedPayment: WithId<RecurringPayment>) => {
    if (!firestore || !user) return;
    if (updatedPayment.familyMemberId !== user.uid) return;
    const paymentDocRef = doc(firestore, 'payments', updatedPayment.id);
    const { id, ...paymentData } = updatedPayment;
    updateDocumentNonBlocking(paymentDocRef, paymentData);
  };

  const deletePayment = (id: string) => {
    if (!firestore || !user) return;
    const paymentDocRef = doc(firestore, 'payments', id);
    deleteDocumentNonBlocking(paymentDocRef);
  };
  
  const value = useMemo(() => ({
    payments: payments || [],
    addPayment,
    updatePayment,
    deletePayment,
    isLoading
  }), [payments, isLoading]);

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentsContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
};
