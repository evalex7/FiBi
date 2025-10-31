'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { RecurringPayment } from '@/lib/types';
import { mockPayments } from '@/lib/data';

interface PaymentsContextType {
  payments: RecurringPayment[];
  addPayment: (payment: Omit<RecurringPayment, 'id' | 'nextDueDate'> & { nextDueDate: Date }) => void;
  updatePayment: (payment: RecurringPayment) => void;
  deletePayment: (id: string) => void;
  isLoading: boolean;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

const safeJSONParse = (str: string | null) => {
    if (!str) return null;
    try {
        const data = JSON.parse(str);
        // Revive dates
        return data.map((p: any) => ({ ...p, nextDueDate: new Date(p.nextDueDate) }));
    } catch (e) {
        return null;
    }
};


export const PaymentsProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPayments = localStorage.getItem('recurringPayments');
      if (storedPayments) {
        setPayments(safeJSONParse(storedPayments) || mockPayments);
      } else {
        setPayments(mockPayments);
      }
    } catch (error) {
      console.error("Failed to load payments from localStorage", error);
      setPayments(mockPayments);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem('recurringPayments', JSON.stringify(payments));
        } catch (error) {
            console.error("Failed to save payments to localStorage", error);
        }
    }
  }, [payments, isLoading]);


  const addPayment = (paymentData: Omit<RecurringPayment, 'id' | 'nextDueDate'> & { nextDueDate: Date }) => {
    const newPayment: RecurringPayment = {
        ...paymentData,
        id: crypto.randomUUID(),
        nextDueDate: paymentData.nextDueDate,
    };
    setPayments(prevPayments => [...prevPayments, newPayment]);
  };

  const updatePayment = (updatedPayment: RecurringPayment) => {
    setPayments(prevPayments => 
      prevPayments.map(p => p.id === updatedPayment.id ? {...updatedPayment, nextDueDate: new Date(updatedPayment.nextDueDate)} : p)
    );
  };

  const deletePayment = (id: string) => {
    setPayments(prevPayments => prevPayments.filter(p => p.id !== id));
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
