import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
};

export type Category = {
  value: string;
  label: string;
  icon: LucideIcon;
};
