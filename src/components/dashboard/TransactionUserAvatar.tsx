'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { FamilyMember } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User } from 'lucide-react';

type TransactionUserAvatarProps = {
    userId?: string;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
}

export default function TransactionUserAvatar({ userId }: TransactionUserAvatarProps) {
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);
    
    const { data: member } = useDoc<FamilyMember>(userDocRef);

    if (!userId || !member) {
        return (
            <Avatar className="h-8 w-8">
                <AvatarFallback>
                    <User className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
        );
    }
    
    return (
        <Avatar className="h-8 w-8 border-2" style={{ borderColor: member.color }}>
            <AvatarFallback style={{ backgroundColor: member.color }} className="text-white text-xs font-bold">
                {getInitials(member.name)}
            </AvatarFallback>
        </Avatar>
    );
}
