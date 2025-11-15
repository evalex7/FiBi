import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  date: Date | Timestamp;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'credit_purchase' | 'credit_payment';
  category: string;
  familyMemberId?: string;
  isPrivate?: boolean;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date | Timestamp;
  familyMemberId?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'credit';
  familyMemberId?: string;
  isCommon?: boolean;
  isPrivate?: boolean;
  order: number;
};

export type RecurringPayment = {
  id: string;
  description: string;
  amount: number;
  category: string;
  nextDueDate: Date | Timestamp;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  familyMemberId?: string;
};

export type FamilyMember = {
    id: string;
    name: string;
    email: string;
    color: string;
    creditLimit?: number;
}

export type CreditSettings = {
    id: string;
    familyMemberId: string;
    creditLimit: number;
}
