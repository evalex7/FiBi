'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { FamilyMember } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SettingsForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: familyMember, isLoading: isMemberLoading } = useDoc<FamilyMember>(userDocRef);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (familyMember) {
            setName(familyMember.name);
            setEmail(familyMember.email);
        }
    }, [familyMember]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !name) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Не вдалося зберегти профіль. Будь ласка, спробуйте ще раз.',
            });
            return;
        }

        setIsSaving(true);
        const updatedData = {
            name,
        };

        const userRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userRef, updatedData, { merge: true })
            .then(() => {
                toast({
                    title: 'Успіх!',
                    description: 'Ваш профіль було оновлено.',
                });
            })
            .catch(error => {
                console.error("Error updating profile: ", error);
                toast({
                    variant: 'destructive',
                    title: 'Помилка',
                    description: 'Сталася помилка під час збереження. Спробуйте ще раз.',
                });
            })
            .finally(() => {
                setIsSaving(false);
            });
    };
    
    if (isMemberLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <div className="grid gap-2">
                <Label htmlFor="name">Повне ім'я</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Електронна пошта</Label>
                <Input id="email" type="email" value={email} disabled />
                 <p className="text-xs text-muted-foreground">Електронну пошту не можна змінити.</p>
            </div>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Зберегти зміни
            </Button>
        </form>
    );
}
