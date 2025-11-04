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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, Pencil, LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/contexts/categories-context';
import type { Category } from '@/lib/types';
import { categoryIcons } from '@/lib/category-icons';


type CategoryFormProps = {
    category?: Category;
    onSave?: () => void;
};

export default function CategoryForm({ category, onSave }: CategoryFormProps) {
    const { addCategory, updateCategory } = useCategories();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [type, setType] = useState<Category['type']>('expense');
    const [icon, setIcon] = useState('');
    const [isCommon, setIsCommon] = useState(false);
  
    const isEditMode = !!category;
  
    useEffect(() => {
      if (isEditMode && category) {
          setName(category.name);
          setType(category.type);
          setIcon(category.icon);
          setIsCommon(category.isCommon ?? false);
      }
    }, [category, isEditMode]);
  
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!name || !type || !icon) {
        toast({
          variant: 'destructive',
          title: 'Помилка',
          description: 'Будь ласка, заповніть усі поля.',
        });
        return;
      }
  
      const categoryData = {
          name,
          type,
          icon,
          isCommon,
      };
  
      if (isEditMode && category) {
          updateCategory({ ...categoryData, id: category.id });
          toast({
            title: 'Успіх!',
            description: 'Вашу категорію було оновлено.',
          });
      } else {
          addCategory(categoryData);
          toast({
            title: 'Успіх!',
            description: 'Вашу категорію було додано.',
          });
      }
      
      onSave?.();
  
      if (!isEditMode) {
          setName('');
          setType('expense');
          setIcon('');
          setIsCommon(false);
      }
    };
  
    const iconEntries = Object.entries(categoryIcons);
  
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label>Тип</Label>
                <RadioGroup
                    className="flex gap-4"
                    value={type}
                    onValueChange={(value: 'income' | 'expense') => setType(value)}
                >
                    <Label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="expense" id="type-expense" />
                    <span>Витрата</span>
                    </Label>
                    <Label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="income" id="type-income" />
                    <span>Дохід</span>
                    </Label>
                </RadioGroup>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="name">Назва категорії</Label>
                <Input id="name" placeholder="напр., Продукти" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Іконка</Label>
              <Select required value={icon} onValueChange={setIcon}>
                  <SelectTrigger>
                  <SelectValue placeholder="Оберіть іконку" />
                  </SelectTrigger>
                  <SelectContent>
                  {iconEntries.map(([name, Icon]) => (
                      <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{name}</span>
                      </div>
                      </SelectItem>
                  ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
                <Label>Видимість категорії</Label>
                 <RadioGroup
                    className="flex gap-4"
                    value={isCommon ? 'common' : 'personal'}
                    onValueChange={(value) => setIsCommon(value === 'common')}
                >
                    <Label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="personal" id="visibility-personal" />
                    <span>Особиста (видна тільки мені)</span>
                    </Label>
                    <Label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="common" id="visibility-common" />
                    <span>Спільна (видна всім)</span>
                    </Label>
                </RadioGroup>
            </div>
            <Button type="submit" className="w-full">
                {isEditMode ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isEditMode ? 'Зберегти зміни' : 'Додати категорію'}
            </Button>
        </form>
    );
}
