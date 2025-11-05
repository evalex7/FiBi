'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Pencil } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { categoryIcons } from '@/lib/category-icons';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/contexts/payments-context';
import type { RecurringPayment } from '@/lib/types';
import { useCategories } from '@/contexts/categories-context';


type PaymentFormProps = {
    payment?: RecurringPayment;
    onSave?: () => void;
};


export default function PaymentForm({ payment, onSave }: PaymentFormProps) {
  const { addPayment, updatePayment, payments } = usePayments();
  const { categories } = useCategories();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<RecurringPayment['frequency']>('monthly');

  const isEditMode = !!payment;

  useEffect(() => {
    if (isEditMode && payment) {
        setAmount(String(payment.amount));
        setDescription(payment.description);
        setCategory(payment.category);
        setFrequency(payment.frequency);
        const paymentDate = payment.nextDueDate && (payment.nextDueDate as any).toDate ? (payment.nextDueDate as any).toDate() : new Date(payment.nextDueDate);
        setDate(paymentDate);
    }
  }, [payment, isEditMode]);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description || !category || !date || !frequency) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, заповніть усі поля.',
      });
      return;
    }

    const paymentData = {
        description,
        amount: parseFloat(amount),
        category,
        frequency,
        nextDueDate: date,
    };

    if (isEditMode && payment) {
        updatePayment({ ...payment, ...paymentData });
        toast({
          title: 'Успіх!',
          description: 'Ваш рахунок було оновлено.',
        });
    } else {
        addPayment(paymentData);
        toast({
          title: 'Успіх!',
          description: 'Ваш рахунок було додано.',
        });
    }
    
    onSave?.();

    if (!isEditMode) {
        setAmount('');
        setDescription('');
        setCategory('');
        setFrequency('monthly');
        setDate(new Date());
    }
  };

  const availableCategories = expenseCategories.filter(cat => {
    // In add mode, only show categories that don't have a payment yet.
    if (!isEditMode) {
      return !payments.some(p => p.category === cat.name);
    }
    // In edit mode, show the current category + categories that don't have a payment yet.
    return cat.name === payment?.category || !payments.some(p => p.category === cat.name);
  });


  return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Опис</Label>
              <Input id="description" placeholder="напр., Оренда квартири" required value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Сума</Label>
                <Input id="amount" type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="category">Категорія</Label>
                <Select required value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                    {availableCategories.map((cat) => {
                        const Icon = categoryIcons[cat.icon];
                        return (
                            <SelectItem key={cat.id} value={cat.name}>
                            <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                {cat.name}
                            </div>
                            </SelectItem>
                        );
                    })}
                    </SelectContent>
                </Select>
             </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Наступна дата рахунку</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: uk }) : <span>Оберіть дату</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={uk}
                    />
                  </PopoverContent>
                </Popover>
              </div>
                <div className="grid gap-2">
                    <Label htmlFor="frequency">Частота</Label>
                    <Select required value={frequency} onValueChange={(value: RecurringPayment['frequency']) => setFrequency(value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Оберіть частоту" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Щомісяця</SelectItem>
                            <SelectItem value="quarterly">Щокварталу</SelectItem>
                            <SelectItem value="yearly">Щороку</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          <Button type="submit" className="w-full">
              {isEditMode ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isEditMode ? 'Зберегти зміни' : 'Додати рахунок'}
            </Button>
        </form>
  );
}
