'use client';

import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Тема</CardTitle>
        <CardDescription>
          Оберіть тему для застосунку.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div>
            <RadioGroupItem value="light" id="light" className="peer sr-only" />
            <Label
              htmlFor="light"
              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
                <div className="w-full flex justify-center py-2">
                    <div className="w-16 h-8 rounded-sm bg-white border border-gray-300" />
                </div>
              Світла
            </Label>
          </div>
          <div>
            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
            <Label
              htmlFor="dark"
              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
               <div className="w-full flex justify-center py-2">
                    <div className="w-16 h-8 rounded-sm bg-gray-800 border border-gray-600" />
                </div>
              Темна
            </Label>
          </div>
          <div>
            <RadioGroupItem value="system" id="system" className="peer sr-only" />
            <Label
              htmlFor="system"
              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="w-full flex justify-center py-2">
                <div className="w-16 h-8 rounded-sm border border-gray-300 dark:border-gray-600 flex items-center">
                    <div className="h-full w-1/2 bg-white "/>
                    <div className="h-full w-1/2 bg-gray-800 "/>
                </div>
              </div>
              Системна
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
