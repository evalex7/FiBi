'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type { Todo } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { WithId } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface TodosContextType {
  todos: WithId<Todo>[];
  addTodo: (todo: Omit<Todo, 'id' | 'familyMemberId' | 'completed'>) => void;
  updateTodo: (todo: WithId<Todo>) => void;
  deleteTodo: (id: string) => void;
  isLoading: boolean;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useUser();

  const todosCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'todos');
  }, [firestore, user]);

  const { data: todos, isLoading } = useCollection<Todo>(todosCollectionRef);

  const addTodo = (todoData: Omit<Todo, 'id' | 'familyMemberId' | 'completed'>) => {
    if (!firestore || !user) return;
    const todosCollection = collection(firestore, 'todos');
    const dataWithUser = { ...todoData, familyMemberId: user.uid, completed: false };
    const newDocRef = doc(todosCollection);
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

  const updateTodo = (updatedTodo: WithId<Todo>) => {
    if (!firestore || !user) return;
    if (updatedTodo.familyMemberId !== user.uid) {
      console.warn("Attempted to update a todo by a non-owner.");
      return;
    }
    const todoDocRef = doc(firestore, 'todos', updatedTodo.id);
    const { id, ...todoData } = updatedTodo;
    setDocumentNonBlocking(todoDocRef, todoData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: todoDocRef.path,
            operation: 'update',
            requestResourceData: todoData,
          })
        );
      });
  };

  const deleteTodo = (id: string) => {
    if (!firestore || !user) return;
    const todoDocRef = doc(firestore, 'todos', id);
    deleteDocumentNonBlocking(todoDocRef).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: todoDocRef.path,
            operation: 'delete',
          })
        );
      });
  };

  const value = useMemo(() => ({
    todos: todos || [],
    addTodo,
    updateTodo,
    deleteTodo,
    isLoading,
  }), [todos, isLoading, user]);

  return (
    <TodosContext.Provider value={value}>
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodosContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
};
