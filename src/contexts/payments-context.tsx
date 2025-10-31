'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { RecurringPayment } from '@/lib/types';
import { useUser } from '@/firebase';
import { WithId } from '@/firebase/firestore/use-collection';
import { mockPayments } from '@/lib/data';

interface PaymentsContextType {
  payments: RecurringPayment[];
  addPayment: (payment: Omit<RecurringPayment, 'id' | 'familyMemberId'>) => void;
  updatePayment: (payment: RecurringPayment) => void;
  deletePayment: (id: string) => void;
  isLoading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export const PaymentsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [payments, setPayments] = useState<RecurringPayment[]>(mockPayments);
  const [isLoading, setIsLoading] = useState(false);
  
  const addPayment = (paymentData: Omit<RecurringPayment, 'id' | 'familyMemberId'>) => {
    if (!user) return;
     const newPayment: RecurringPayment = {
      ...paymentData,
      id: new Date().getTime().toString(),
      familyMemberId: user.uid,
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (updatedPayment: RecurringPayment) => {
    if (!user || updatedPayment.familyMemberId !== user.uid) return;
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  };

  const deletePayment = (id: string) => {
    if (!user) return;
    setPayments(prev => prev.filter(p => p.id !== id));
  };
  
  const value = useMemo(() => ({
    payments,
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
