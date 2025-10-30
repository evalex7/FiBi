import type { Transaction, Budget } from './types';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 1),
    description: 'Monthly Salary',
    amount: 5000,
    type: 'income',
    category: 'Salary',
  },
  {
    id: '2',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 2),
    description: 'Rent Payment',
    amount: 1500,
    type: 'expense',
    category: 'Housing',
  },
  {
    id: '3',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 3),
    description: 'Weekly Groceries',
    amount: 120,
    type: 'expense',
    category: 'Groceries',
  },
  {
    id: '4',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 4),
    description: 'Gas Bill',
    amount: 80,
    type: 'expense',
    category: 'Utilities',
  },
  {
    id: '5',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 5),
    description: 'Dinner with friends',
    amount: 65,
    type: 'expense',
    category: 'Dining Out',
  },
  {
    id: '6',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 6),
    description: 'Train pass',
    amount: 100,
    type: 'expense',
    category: 'Transport',
  },
  {
    id: '7',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 8),
    description: 'Movie night',
    amount: 40,
    type: 'expense',
    category: 'Entertainment',
  },
  {
    id: '8',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 10),
    description: 'Weekly Groceries',
    amount: 95,
    type: 'expense',
    category: 'Groceries',
  },
  {
    id: '9',
    date: new Date(firstDayOfMonth.getTime() + 86400000 * 12),
    description: 'Stock dividends',
    amount: 250,
    type: 'income',
    category: 'Investments',
  },
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Groceries', amount: 500 },
  { id: '2', category: 'Transport', amount: 150 },
  { id: '3', category: 'Housing', amount: 1500 },
  { id: '4', category: 'Utilities', amount: 200 },
  { id: '5', category: 'Entertainment', amount: 150 },
  { id: '6', category: 'Dining Out', amount: 200 },
  { id: '7', category: 'Health', amount: 100 },
];
