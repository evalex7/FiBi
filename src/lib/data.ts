import type { Transaction, Budget, RecurringPayment } from './types';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 1),
    description: 'Місячна зарплата',
    amount: 75000,
    type: 'income',
    category: 'Зарплата',
  },
  {
    id: '2',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 2),
    description: 'Орендна плата',
    amount: 15000,
    type: 'expense',
    category: 'Житло',
  },
  {
    id: '3',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 3),
    description: 'Щотижневі продукти',
    amount: 2500,
    type: 'expense',
    category: 'Продукти',
  },
  {
    id: '4',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 4),
    description: 'Рахунок за газ',
    amount: 800,
    type: 'expense',
    category: 'Комунальні послуги',
  },
  {
    id: '5',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 5),
    description: 'Вечеря з друзями',
    amount: 1200,
    type: 'expense',
    category: 'Харчування поза домом',
  },
  {
    id: '6',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 6),
    description: 'Проїзний на поїзд',
    amount: 500,
    type: 'expense',
    category: 'Транспорт',
  },
  {
    id: '7',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 8),
    description: 'Вечір кіно',
    amount: 400,
    type: 'expense',
    category: 'Розваги',
  },
  {
    id: '8',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 10),
    description: 'Щотижневі продукти',
    amount: 2200,
    type: 'expense',
    category: 'Продукти',
  },
  {
    id: '9',
    date: new Date(new Date().setDate(today.getDate() - 15)),
    description: 'Дивіденди з акцій (минулий місяць)',
    amount: 3500,
    type: 'income',
    category: 'Інвестиції',
  },
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Продукти', amount: 10000 },
  { id: '2', category: 'Транспорт', amount: 3000 },
  { id: '3', category: 'Житло', amount: 15000 },
  { id: '4', category: 'Комунальні послуги', amount: 2000 },
  { id: '5', category: 'Розваги', amount: 3000 },
  { id: '6', category: 'Харчування поза домом', amount: 4000 },
  { id: '7', category: 'Здоров\'я', amount: 2000 },
];

const getNextDate = (day: number) => {
    const date = new Date();
    date.setDate(day);
    if (date < today) {
        date.setMonth(date.getMonth() + 1);
    }
    return date;
}


export const mockPayments: RecurringPayment[] = [
    {
        id: '1',
        description: 'Орендна плата',
        amount: 15000,
        category: 'Житло',
        nextDueDate: getNextDate(1),
        frequency: 'monthly',
    },
    {
        id: '2',
        description: 'Підписка на Netflix',
        amount: 300,
        category: 'Розваги',
        nextDueDate: getNextDate(15),
        frequency: 'monthly',
    },
     {
        id: '3',
        description: 'Рахунок за інтернет',
        amount: 250,
        category: 'Комунальні послуги',
        nextDueDate: getNextDate(20),
        frequency: 'monthly',
    }
];
