'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TransactionFormProps {
  onSave: () => void;
  initialAmount?: number; // <- додано, щоб уникнути помилки типів
}

export default function TransactionForm({ onSave, initialAmount }: TransactionFormProps) {
  const [amount, setAmount] = useState<number | undefined>(initialAmount);
  const [description, setDescription] = useState<string>('');

  // Якщо initialAmount змінюється зовні, оновлюємо стан
  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Тут можна додати логіку збереження транзакції
    console.log('Збережено:', { amount, description });
    onSave();
    setAmount(undefined);
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        type="number"
        value={amount ?? ''}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Сума"
        required
      />
      <Input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Опис"
      />
      <Button type="submit" className="mt-2">
        Зберегти
      </Button>
    </form>
  );
}
