'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentForm from './PaymentForm';


export default function AddPaymentForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Додати новий платіж</CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentForm />
      </CardContent>
    </Card>
  );
}
