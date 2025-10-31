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
import { useState, FormEvent, useEffect } from 'react';
import { useAuth, useUser, errorEmitter } from '@/firebase';
import { initiateEmailSignIn, initiatePasswordReset } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const showLoginError = () => {
    setIsSigningIn(false);
    toast({
      variant: 'destructive',
      title: 'Помилка входу',
      description: 'Неправильна електронна пошта або пароль. Спробуйте ще раз.',
    });
  };

  useEffect(() => {
    const handleError = (error: FirebaseError) => {
      if (error.code === 'auth/invalid-credential') {
        showLoginError();
      }
    };
    
    errorEmitter.on('auth-error', handleError);

    return () => {
      errorEmitter.off('auth-error', handleError);
    }
  }, [toast]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSigningIn(true);
    initiateEmailSignIn(auth, email, password);
  };
  
  const handlePasswordReset = (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    initiatePasswordReset(auth, resetEmail).then(() => {
      setIsPasswordResetOpen(false);
      setResetEmail('');
      toast({
        title: 'Перевірте вашу пошту',
        description:
          'Якщо обліковий запис із цією електронною адресою існує, на нього буде надіслано посилання для відновлення пароля.',
      });
    });
  };

  if (isUserLoading) {
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
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">Вхід</CardTitle>
            <CardDescription>
              Введіть свою електронну пошту нижче, щоб увійти до свого облікового запису.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Пароль</Label>
                <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
                  <DialogTrigger asChild>
                     <Button type="button" variant="link" className="ml-auto inline-block text-sm underline">
                        Забули пароль?
                     </Button>
                  </DialogTrigger>
                   <DialogContent>
                    <form onSubmit={handlePasswordReset}>
                        <DialogHeader>
                            <DialogTitle>Скинути пароль</DialogTitle>
                            <DialogDescription>
                                Введіть свою електронну пошту, щоб отримати посилання для відновлення пароля.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reset-email">Електронна пошта</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Скасувати</Button>
                            </DialogClose>
                            <Button type="submit">Надіслати посилання</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                </Dialog>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Увійти
            </Button>
          </CardContent>
          <div className="mt-4 text-center text-sm p-6 pt-0">
            Не маєте облікового запису?{' '}
            <Link href="/signup" className="underline">
              Зареєструватися
            </Link>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
