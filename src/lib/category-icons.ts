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
  CircleDollarSign,
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
  'Інше': CircleDollarSign,
};

export const expenseCategories: Category[] = [
  { value: 'Продукти', label: 'Продукти', icon: ShoppingCart },
  { value: 'Транспорт', label: 'Транспорт', icon: Car },
  { value: 'Житло', label: 'Житло', icon: Home },
  { value: 'Комунальні послуги', label: 'Комунальні послуги', icon: Zap },
  { value: 'Розваги', label: 'Розваги', icon: Clapperboard },
  { value: 'Харчування поза домом', label: 'Харчування поза домом', icon: Utensils },
  { value: 'Здоров\'я', label: 'Здоров\'я', icon: Heart },
  { value: 'Освіта', label: 'Освіта', icon: GraduationCap },
  { value: 'Подарунки', label: 'Подарунки', icon: Gift },
  { value: 'Інше', label: 'Інше', icon: CircleDollarSign },
];

export const incomeCategories: Category[] = [
  { value: 'Зарплата', label: 'Зарплата', icon: Landmark },
  { value: 'Інвестиції', label: 'Інвестиції', icon: TrendingUp },
  { value: 'Подарунки', label: 'Подарунки', icon: Gift },
  { value: 'Інше', label: 'Інше', icon: CircleDollarSign },
];

export const allCategories: Category[] = [
  ...expenseCategories,
  ...incomeCategories,
].reduce((acc, current) => {
  if (!acc.find((item) => item.value === current.value)) {
    acc.push(current);
  }
  return acc;
}, [] as Category[]);
