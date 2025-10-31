'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentForm from './PaymentForm';
import { useState } from 'react';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';


export default function AddPaymentForm() {
    const [open, setOpen] = useState(false);
  return (
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Додати платіж
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати новий платіж</DialogTitle>
           <DialogDescription>
            Запишіть новий регулярний платіж.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm onSave={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
