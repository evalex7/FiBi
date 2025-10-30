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
  'Продукти': ShoppingCart,
  'Транспорт': Car,
  'Житло': Home,
  'Комунальні послуги': Zap,
  'Розваги': Clapperboard,
  'Харчування поза домом': Utensils,
  'Здоров\'я': Heart,
  'Робота': Briefcase,
  'Освіта': GraduationCap,
  'Подарунки': Gift,
  'Зарплата': Landmark,
  'Інвестиції': TrendingUp,
};

export const expenseCategories: Category[] = [
  { value: 'Groceries', label: 'Продукти', icon: ShoppingCart },
  { value: 'Transport', label: 'Транспорт', icon: Car },
  { value: 'Housing', label: 'Житло', icon: Home },
  { value: 'Utilities', label: 'Комунальні послуги', icon: Zap },
  { value: 'Entertainment', label: 'Розваги', icon: Clapperboard },
  { value: 'Dining Out', label: 'Харчування поза домом', icon: Utensils },
  { value: 'Health', label: 'Здоров\'я', icon: Heart },
  { value: 'Education', label: 'Освіта', icon: GraduationCap },
  { value: 'Gifts', label: 'Подарунки', icon: Gift },
];

export const incomeCategories: Category[] = [
  { value: 'Salary', label: 'Зарплата', icon: Landmark },
  { value: 'Investments', label: 'Інвестиції', icon: TrendingUp },
  { value: 'Gifts', label: 'Подарунки', icon: Gift },
];

export const allCategories: Category[] = [
  ...expenseCategories,
  ...incomeCategories,
];
