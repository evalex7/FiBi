'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useAuth, useUser, useFirestore, errorEmitter } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import type { FamilyMember } from '@/lib/types';
import { FirestorePermissionError } from '@/firebase/errors';

const colors = [
  'hsl(207, 82%, 68%)', // blue
  'hsl(12, 76%, 61%)',  // red
  'hsl(173, 58%, 39%)', // green
  'hsl(43, 74%, 66%)',  // yellow
  'hsl(27, 87%, 67%)',  // orange
  'hsl(260, 65%, 65%)', // purple
  'hsl(320, 60%, 60%)', // pink
  'hsl(190, 70%, 50%)', // teal
  'hsl(30, 90%, 55%)',  // deep orange
  'hsl(230, 75%, 60%)', // indigo
];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [randomColor, setRandomColor] = useState<string | null>(null);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    // Set a random color on component mount on the client side
    setRandomColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  useEffect(() => {
    if (user && !isUserLoading && firestore && fullName && randomColor) {
      const userRef = doc(firestore, 'users', user.uid);
      
      const userData = {
        id: user.uid,
        name: fullName,
        email: user.email,
        color: randomColor,
      };

      setDocumentNonBlocking(userRef, userData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData
          })
        );
      });
      
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, firestore, fullName, randomColor]);

  const showSignupError = (message: string) => {
    setIsSigningUp(false);
    toast({
      variant: 'destructive',
      title: 'Помилка реєстрації',
      description: message,
    });
  }

  useEffect(() => {
    const handleError = (error: FirebaseError) => {
      if (error.code === 'auth/email-already-in-use') {
        showSignupError('Ця електронна пошта вже використовується.');
      } else if (error.code === 'auth/weak-password') {
        showSignupError('Пароль занадто слабкий. Він має містити щонайменше 6 символів.');
      } else {
        showSignupError('Сталася невідома помилка. Спробуйте ще раз.');
      }
    };
    
    errorEmitter.on('auth-error', handleError);

    return () => {
      errorEmitter.off('auth-error', handleError);
    }
  }, [toast]);
  

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    setIsSigningUp(true);
    initiateEmailSignUp(auth, email, password);
  };
  
  if (isUserLoading || !randomColor) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Завантаження...</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignup}>
          <CardHeader>
            <CardTitle className="text-2xl">Реєстрація</CardTitle>
            <CardDescription>
              Створіть обліковий запис, щоб почати керувати своїми фінансами.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Повне ім'я</Label>
              <Input
                id="full-name"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Електронна пошта</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningUp}>
               {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Створити акаунт
            </Button>
          </CardContent>
          <div className="mt-4 text-center text-sm p-6 pt-0">
            Вже є аккаунт?{' '}
            <Link href="/login" className="underline">
              Увійти
            </Link>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
