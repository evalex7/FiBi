'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCredit } from '@/contexts/credit-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreditSettings() {
  const { creditLimit, setCreditLimit, isLoading } = useCredit();
  const [localLimit, setLocalLimit] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      setLocalLimit(String(creditLimit));
    }
  }, [creditLimit, isLoading]);

  const handleSave = async () => {
    const newLimit = parseFloat(localLimit);
    if (isNaN(newLimit) || newLimit < 0) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, введіть дійсне додатне число.',
      });
      return;
    }
    
    setIsSaving(true);
    await setCreditLimit(newLimit);
    setIsSaving(false);
    
    toast({
      title: 'Успіх!',
      description: 'Ваш кредитний ліміт було оновлено.',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Кредитний ліміт</CardTitle>
          <CardDescription>Встановіть ваш особистий кредитний ліміт.</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Кредитний ліміт</CardTitle>
        <CardDescription>Встановіть ваш особистий кредитний ліміт.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <Label htmlFor="credit-limit">Сума ліміту</Label>
            <Input
              id="credit-limit"
              type="number"
              placeholder="0.00"
              value={localLimit}
              onChange={(e) => setLocalLimit(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving || String(creditLimit) === localLimit} className="self-end">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Зберегти
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
