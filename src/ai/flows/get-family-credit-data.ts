'use server';

/**
 * @fileOverview A Genkit flow to securely fetch and aggregate family credit data.
 * This flow is designed to be called from the client-side to get total credit
 * limits and usage without exposing individual user data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { FamilyMember } from '@/lib/types';
import { FamilyCreditDataSchema, type FamilyCreditData } from '@/lib/types-ai';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();

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
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
      const user = doc.data() as FamilyMember;
      if (user.creditLimit && typeof user.creditLimit === 'number') {
        totalCreditLimit += user.creditLimit;
      }
    });

    // 2. Fetch all transactions to calculate credit usage and old-style limits
    const transactionsSnapshot = await db.collection('expenses').get();
    const { creditPurchase, creditPayment } = transactionsSnapshot.docs.reduce(
      (acc, doc) => {
        const transaction = doc.data() as any; // Using any to avoid type conflicts with Transaction type from client
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
    
    // An old way of setting credit limit was creating a credit_payment transaction.
    // Let's add it to the total limit to support both ways.
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
