'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useTodos } from '@/contexts/todos-context';

type TodoFormProps = {
  onSave?: () => void;
};

export default function TodoForm({ onSave }: TodoFormProps) {
  const { addTodo } = useTodos();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, введіть назву завдання.',
      });
      return;
    }

    addTodo({
      title,
      dueDate,
    });

    onSave?.();
    setTitle('');
    setDueDate(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        placeholder="Нове завдання..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-9"
      />
       <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            size="icon"
            className={cn(
              'h-9 w-9',
              !dueDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dueDate || undefined}
            onSelect={(date) => setDueDate(date || null)}
            initialFocus
            locale={uk}
          />
           {dueDate && (
             <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setDueDate(null)}>Очистити дату</Button>
             </div>
           )}
        </PopoverContent>
      </Popover>
      <Button type="submit" size="sm" className="h-9">
        Додати
      </Button>
    </form>
  );
}
