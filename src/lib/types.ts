import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  date: Date;
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
  value: string;
  label: string;
  icon: LucideIcon;
};

export type RecurringPayment = {
  id: string;
  description: string;
  amount: number;
  category: string;
  nextDueDate: Date;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  familyMemberId?: string;
};

export type FamilyMember = {
    id: string;
    name: string;
    email: string;
    color: string;
}
