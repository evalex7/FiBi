'use client';

import { useTodos } from '@/contexts/todos-context';
import { useMemo, useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { Todo } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import {
  Bell,
  Check,
  CheckCircle2,
  Circle,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import TodoForm from './TodoForm';


export default function HeaderTodos() {
  const { todos, updateTodo, isLoading } = useTodos();
  const [showCompleted, setShowCompleted] = useState(false);

  const { activeTodos, completedTodos, overdueCount } = useMemo(() => {
    const active: Todo[] = [];
    const completed: Todo[] = [];
    let overdue = 0;

    if (isLoading || !todos) {
      return { activeTodos: [], completedTodos: [], overdueCount: 0 };
    }

    const sortedTodos = [...todos].sort((a, b) => {
        const aDate = a.dueDate ? (a.dueDate as Timestamp).toDate() : null;
        const bDate = b.dueDate ? (b.dueDate as Timestamp).toDate() : null;
        if (aDate && bDate) return aDate.getTime() - bDate.getTime();
        if (aDate) return -1;
        if (bDate) return 1;
        return 0;
    });

    sortedTodos.forEach(todo => {
      if (todo.completed) {
        completed.push(todo);
      } else {
        active.push(todo);
        const dueDate = todo.dueDate ? (todo.dueDate as Timestamp).toDate() : null;
        if (dueDate && isPast(dueDate) && !isToday(dueDate)) {
            overdue++;
        }
      }
    });

    return { activeTodos: active, completedTodos: completed, overdueCount };
  }, [todos, isLoading]);

  const handleToggleTodo = (todo: Todo) => {
    updateTodo({ ...todo, completed: !todo.completed });
  };
  
  const [isFormVisible, setIsFormVisible] = useState(false);

  const TodoItem = ({ todo }: { todo: Todo }) => {
    const dueDate = todo.dueDate ? (todo.dueDate as Timestamp).toDate() : null;
    const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && !todo.completed;

    return (
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        className="flex items-start gap-3 focus:bg-transparent cursor-pointer"
        onClick={() => handleToggleTodo(todo)}
      >
        <div className="flex items-center h-5">
            <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => handleToggleTodo(todo)} />
        </div>
        <div className="grid gap-0.5">
          <Label htmlFor={`todo-${todo.id}`} className={cn("font-normal", todo.completed && "line-through text-muted-foreground")}>
            {todo.title}
          </Label>
          {dueDate && (
            <p className={cn("text-xs", 
                isOverdue ? "text-destructive" : "text-muted-foreground",
                todo.completed && "line-through"
             )}>
              {format(dueDate, 'd MMM', { locale: uk })}
            </p>
          )}
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu onOpenChange={(open) => !open && setIsFormVisible(false)}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {overdueCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 inline-flex h-2.5 w-2.5 rounded-full bg-destructive animate-ping" />
              <span className="absolute top-1.5 right-1.5 inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
            </>
          )}
          <Bell className="relative h-5 w-5 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-80 shadow-lg border-0 sm:border" align="end">
        <div className="flex justify-between items-center pr-2">
            <DropdownMenuLabel>Мої завдання</DropdownMenuLabel>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsFormVisible(!isFormVisible)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <DropdownMenuSeparator />
        
        {isFormVisible && (
            <div className="p-2">
                <TodoForm onSave={() => setIsFormVisible(false)} />
                <DropdownMenuSeparator className="my-2" />
            </div>
        )}

        {isLoading ? (
          <DropdownMenuItem>Завантаження...</DropdownMenuItem>
        ) : activeTodos.length === 0 && completedTodos.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p>Завдань немає!</p>
            <p>Додайте перше, щоб почати.</p>
          </div>
        ) : (
          <>
            {activeTodos.length > 0 ? (
              activeTodos.map(t => <TodoItem key={t.id} todo={t} />)
            ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p>Все зроблено!</p>
                </div>
            )}

            {completedTodos.length > 0 && (
                <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="text-xs text-muted-foreground cursor-pointer"
                >
                    {showCompleted ? 'Сховати виконані' : `Показати виконані (${completedTodos.length})`}
                </DropdownMenuItem>
                {showCompleted && completedTodos.map(t => <TodoItem key={t.id} todo={t} />)}
                </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
