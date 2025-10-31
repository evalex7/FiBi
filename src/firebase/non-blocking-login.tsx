'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirebaseError } from 'firebase/app';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error: FirebaseError) => {
    errorEmitter.emit('auth-error', error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error: FirebaseError) => {
    errorEmitter.emit('auth-error', error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error: FirebaseError) => {
    errorEmitter.emit('auth-error', error);
  });
}

/** Initiate password reset email (non-blocking). */
export function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  // Firebase's sendPasswordResetEmail resolves even if the email doesn't exist
  // to prevent email enumeration attacks. We will not emit errors here.
  // The UI will just inform the user that an email has been sent if an account exists.
  return sendPasswordResetEmail(authInstance, email);
}
