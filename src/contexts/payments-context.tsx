'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { RecurringPayment } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';

interface PaymentsContextType {
  payments: WithId<RecurringPayment>[];
  addPayment: (payment: Omit<RecurringPayment, 'id'>) => void;
  updatePayment: (payment: WithId<RecurringPayment>) => void;
  deletePayment: (id: string) => void;
  isLoading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export const PaymentsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const paymentsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'payments');
  }, [firestore, user]);

  const { data: paymentsData, isLoading } = useCollection<RecurringPayment>(paymentsCollectionRef);
  
  const payments = useMemo(() => {
    if (!paymentsData) return [];
    return paymentsData.map(p => ({
      ...p,
      nextDueDate: (p.nextDueDate as any).toDate ? (p.nextDueDate as any).toDate() : new Date(p.nextDueDate)
    }));
  }, [paymentsData]);


  const addPayment = (paymentData: Omit<RecurringPayment, 'id'>) => {
    if (!paymentsCollectionRef) return;
    addDocumentNonBlocking(paymentsCollectionRef, { ...paymentData, familyMemberId: user?.uid });
  };

  const updatePayment = (updatedPayment: WithId<RecurringPayment>) => {
    if (!firestore || !user) return;
    const paymentDocRef = doc(firestore, 'users', user.uid, 'payments', updatedPayment.id);
    const { id, ...paymentData } = updatedPayment;
    updateDocumentNonBlocking(paymentDocRef, paymentData);
  };

  const deletePayment = (id: string) => {
    if (!firestore || !user) return;
    const paymentDocRef = doc(firestore, 'users', user.uid, 'payments', id);
    deleteDocumentNonBlocking(paymentDocRef);
  };

  return (
    <PaymentsContext.Provider value={{ payments, addPayment, updatePayment, deletePayment, isLoading }}>
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
