'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { FamilyMember, Transaction } from '@/lib/types';
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TransactionForm from '../dashboard/TransactionForm';

export default function CreditLimitSettings() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: familyMember, isLoading: isMemberLoading } = useDoc<FamilyMember>(userDocRef);
    
    const [creditLimit, setCreditLimit] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
    const [formInitialValues, setFormInitialValues] = useState<Partial<Transaction> | undefined>();

    useEffect(() => {
        if (familyMember && familyMember.creditLimit !== undefined) {
            setCreditLimit(String(familyMember.creditLimit));
        }
    }, [familyMember]);

    const handleSave = () => {
        if (!user || !firestore) return;

        setIsSaving(true);
        const limit = parseFloat(creditLimit);
        if (isNaN(limit) || limit < 0) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Будь ласка, введіть дійсне число.',
            });
            setIsSaving(false);
            return;
        }

        const updatedData = { creditLimit: limit };
        
        setDocumentNonBlocking(userDocRef!, updatedData, { merge: true })
            .then(() => {
                toast({
                    title: 'Успіх!',
                    description: 'Ваш кредитний ліміт було оновлено.',
                });
            })
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                      path: userDocRef!.path,
                      operation: 'update',
                      requestResourceData: updatedData,
                    })
                );
            })
            .finally(() => {
                setIsSaving(false);
            });
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    const handleCreditAction = (type: 'credit_purchase' | 'credit_payment') => {
        setFormInitialValues({ type, category: 'Кредитна операція' });
        setIsTransactionFormOpen(true);
    };
    
    if (isMemberLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Кредитний ліміт</CardTitle>
                    <CardDescription>Керуйте своїм кредитним лімітом та операціями.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Кредитний ліміт</CardTitle>
                <CardDescription>Керуйте своїм кредитним лімітом та операціями.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4 max-w-sm">
                    <div className="grid gap-2">
                        <Label htmlFor="credit-limit">Ваш кредитний ліміт</Label>
                        <Input 
                            id="credit-limit"
                            type="number"
                            value={creditLimit} 
                            onChange={(e) => setCreditLimit(e.target.value)} 
                            placeholder="0.00"
                            required 
                        />
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Зберегти ліміт
                    </Button>
                </form>
            </CardContent>
        </Card>
        <Dialog open={isTransactionFormOpen} onOpenChange={setIsTransactionFormOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Кредитна операція</DialogTitle>
                    <DialogDescription>
                        Запишіть операцію з вашим кредитним боргом.
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm
                    onSave={() => setIsTransactionFormOpen(false)}
                    initialValues={formInitialValues}
                />
            </DialogContent>
        </Dialog>
        </>
    );
}
