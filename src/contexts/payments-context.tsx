'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { RecurringPayment } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { addMonths, addQuarters, addYears, startOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';


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
    if (!firestore || !user) return null;
    return collection(firestore, 'payments');
  }, [firestore, user]);

  const { data: payments, isLoading } = useCollection<RecurringPayment>(paymentsCollectionRef);
  
  const addPayment = (paymentData: Omit<RecurringPayment, 'id' | 'familyMemberId'>) => {
    if (!firestore || !user) return;
    const paymentsCollection = collection(firestore, 'payments');
    const dataWithUser = { ...paymentData, familyMemberId: user.uid };
    const newDocRef = doc(paymentsCollection);
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

  const updatePayment = (updatedPayment: WithId<RecurringPayment>) => {
    if (!firestore || !user) return;
    if (updatedPayment.familyMemberId !== user.uid) {
      console.warn("Attempted to update a payment by a non-owner.");
      return;
    }
    const paymentDocRef = doc(firestore, 'payments', updatedPayment.id);
    const { id, ...paymentData } = updatedPayment;
    setDocumentNonBlocking(paymentDocRef, paymentData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: paymentDocRef.path,
            operation: 'update',
            requestResourceData: paymentData,
          })
        );
      });
  };

  const deletePayment = (id: string) => {
    if (!firestore || !user) return;
    const paymentDocRef = doc(firestore, 'payments', id);
    deleteDocumentNonBlocking(paymentDocRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: paymentDocRef.path,
            operation: 'delete',
          })
        );
      });
  };
  
  const value = useMemo(() => ({
    payments: payments || [],
    addPayment,
    updatePayment,
    deletePayment,
    isLoading
  }), [payments, isLoading, user]);

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
