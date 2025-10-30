'use client';

import { runFlow } from '@genkit-ai/next/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { getBudgetAdjustmentSuggestions } from '@/ai/flows/budget-adjustment-suggestions';
import { mockTransactions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function AiSuggestions() {
  const [financialGoals, setFinancialGoals] = useState(
    'Назбирати на перший внесок за будинок та створити резервний фонд.'
  );
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions(null);

    const spendingPatterns = mockTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const spendingPatternsText = Object.entries(spendingPatterns)
      .map(([category, amount]) => `${category}: ${amount.toFixed(2)} грн`)
      .join(', ');

    try {
      const response = await runFlow(getBudgetAdjustmentSuggestions, {
        spendingPatterns: spendingPatternsText,
        financialGoals,
      });
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося отримати пропозиції від ШІ. Будь ласка, спробуйте ще раз.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div>
                <CardTitle>ШІ-помічник з бюджету</CardTitle>
                <CardDescription>Отримуйте розумні поради щодо економії.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="financial-goals">Ваші фінансові цілі</Label>
          <Textarea
            id="financial-goals"
            value={financialGoals}
            onChange={(e) => setFinancialGoals(e.target.value)}
            placeholder="напр., Накопичити на відпустку, погасити борг..."
            rows={3}
          />
        </div>
        {suggestions && (
          <Alert>
            <AlertTitle>Пропозиції</AlertTitle>
            <AlertDescription>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br />') }} />
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Аналізуємо...
            </>
          ) : (
            'Отримати пропозиції'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
