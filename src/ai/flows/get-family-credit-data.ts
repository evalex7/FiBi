'use server';

/**
 * @fileOverview A Genkit flow to securely fetch and aggregate family credit data.
 * This flow is designed to be called from the client-side to get total credit
 * limits and usage without exposing individual user data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  collection,
  getDocs,
  getFirestore,
  initializeFirestore,
} from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import type { FamilyMember, Transaction } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export const FamilyCreditDataSchema = z.object({
  totalCreditLimit: z.number(),
  totalCreditUsed: z.number(),
});
export type FamilyCreditData = z.infer<typeof FamilyCreditDataSchema>;

const getFamilyCreditDataFlow = ai.defineFlow(
  {
    name: 'getFamilyCreditDataFlow',
    inputSchema: z.void(),
    outputSchema: FamilyCreditDataSchema,
  },
  async () => {
    let totalCreditLimit = 0;
    let totalCreditUsed = 0;

    // 1. Fetch all user documents to sum up their individual credit limits
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach(doc => {
      const user = doc.data() as FamilyMember;
      // Add the limit from the user's profile if it exists
      if (user.creditLimit && typeof user.creditLimit === 'number') {
        totalCreditLimit += user.creditLimit;
      }
    });

    // 2. Fetch all transactions to calculate credit usage and old-style limits
    const transactionsSnapshot = await getDocs(collection(db, 'expenses'));
    const { creditPurchase, creditPayment } = transactionsSnapshot.docs.reduce(
      (acc, doc) => {
        const transaction = doc.data() as Transaction;
        switch (transaction.type) {
          case 'credit_purchase':
            acc.creditPurchase += transaction.amount;
            break;
          case 'credit_payment':
            acc.creditPayment += transaction.amount;
            break;
        }
        return acc;
      },
      { creditPurchase: 0, creditPayment: 0 }
    );
    
    // An old way of setting credit limit was creating a credit_payment transaction
    // Let's add it to the total limit to support both ways.
    // The new way is to set `creditLimit` on the user document.
    totalCreditLimit += creditPayment;
    
    totalCreditUsed = Math.max(0, creditPurchase - creditPayment);

    return {
      totalCreditLimit,
      totalCreditUsed,
    };
  }
);

export async function getFamilyCreditData(): Promise<FamilyCreditData> {
  return getFamilyCreditDataFlow();
}
