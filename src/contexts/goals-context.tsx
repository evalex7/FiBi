'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type { Goal } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface GoalsContextType {
  goals: WithId<Goal>[];
  addGoal: (goal: Omit<Goal, 'id' | 'familyMemberId' | 'createdAt'>) => void;
  updateGoal: (goal: WithId<Goal>) => void;
  deleteGoal: (id: string) => void;
  isLoading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const goalsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'goals');
  }, [firestore]);
  
  const { data: goals, isLoading } = useCollection<Goal>(goalsCollectionRef);

  const addGoal = (goalData: Omit<Goal, 'id' | 'familyMemberId' | 'createdAt'>) => {
    if (!firestore || !user) return;
    const goalsCollection = collection(firestore, 'goals');
    const dataWithUser = { ...goalData, familyMemberId: user.uid, createdAt: serverTimestamp() };
    const newDocRef = doc(goalsCollection);
    setDocumentNonBlocking(newDocRef, dataWithUser, {}).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: dataWithUser,
        })
      );
    });
  };

  const updateGoal = (updatedGoal: WithId<Goal>) => {
    if (!firestore || !user) return;
    
    if (updatedGoal.familyMemberId !== user.uid) {
      console.warn("Attempted to update a goal by a non-owner.");
      return;
    }
    const goalDocRef = doc(firestore, 'goals', updatedGoal.id);
    const { id, ...goalData } = updatedGoal;
    setDocumentNonBlocking(goalDocRef, goalData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: goalDocRef.path,
            operation: 'update',
            requestResourceData: goalData,
          })
        );
      });
  };

  const deleteGoal = (id: string) => {
    if (!firestore || !user) return;
    const goalDocRef = doc(firestore, 'goals', id);
    
    deleteDocumentNonBlocking(goalDocRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: goalDocRef.path,
            operation: 'delete',
          })
        );
      });
  };

  const value = useMemo(() => ({
    goals: goals || [],
    addGoal,
    updateGoal,
    deleteGoal,
    isLoading
  }), [goals, isLoading, user]);

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
