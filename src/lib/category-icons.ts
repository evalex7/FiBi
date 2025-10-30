import {
  ShoppingCart,
  Car,
  Home,
  Zap,
  Clapperboard,
  Utensils,
  Heart,
  Briefcase,
  GraduationCap,
  Gift,
  Landmark,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from './types';

export const categoryIcons: { [key: string]: LucideIcon } = {
  Groceries: ShoppingCart,
  Transport: Car,
  Housing: Home,
  Utilities: Zap,
  Entertainment: Clapperboard,
  'Dining Out': Utensils,
  Health: Heart,
  Work: Briefcase,
  Education: GraduationCap,
  Gifts: Gift,
  Salary: Landmark,
  Investments: TrendingUp,
};

export const expenseCategories: Category[] = [
  { value: 'Groceries', label: 'Groceries', icon: ShoppingCart },
  { value: 'Transport', label: 'Transport', icon: Car },
  { value: 'Housing', label: 'Housing', icon: Home },
  { value: 'Utilities', label: 'Utilities', icon: Zap },
  { value: 'Entertainment', label: 'Entertainment', icon: Clapperboard },
  { value: 'Dining Out', label: 'Dining Out', icon: Utensils },
  { value: 'Health', label: 'Health', icon: Heart },
  { value: 'Education', label: 'Education', icon: GraduationCap },
  { value: 'Gifts', label: 'Gifts', icon: Gift },
];

export const incomeCategories: Category[] = [
  { value: 'Salary', label: 'Salary', icon: Landmark },
  { value: 'Investments', label: 'Investments', icon: TrendingUp },
  { value: 'Gifts', label: 'Gifts', icon: Gift },
];

export const allCategories: Category[] = [
  ...expenseCategories,
  ...incomeCategories,
];
