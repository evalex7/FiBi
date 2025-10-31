import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  date: Date | Timestamp;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  familyMemberId?: string;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  familyMemberId?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  familyMemberId?: string;
  isCommon?: boolean;
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
}
