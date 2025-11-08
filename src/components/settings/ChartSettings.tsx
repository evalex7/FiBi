'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/settings-context';
import type { ChartSettings as TChartSettings } from '@/contexts/settings-context';

const chartLabels: Record<keyof TChartSettings, string> = {
  incomeVsExpense: 'Дохід vs. Витрати',
  dailyVaseExpense: 'Щоденні витрати',
  category: 'Витрати по категоріях',
  trend: 'Динаміка доходів та витрат',
  categoryTrend: 'Динаміка витрат по категоріях',
};

export default function ChartSettings() {
  const { chartSettings, setChartSettings } = useSettings();

  const handleToggle = (chartId: keyof TChartSettings) => {
    setChartSettings(prev => ({
      ...prev,
      [chartId]: !prev[chartId],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Налаштування графіків</CardTitle>
        <CardDescription>
          Виберіть, які графіки відображати на сторінці "Звіти".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(chartLabels).map(([id, label]) => (
          <div key={id} className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor={id} className="flex-1">
              {label}
            </Label>
            <Switch
              id={id}
              checked={chartSettings[id as keyof TChartSettings]}
              onCheckedChange={() => handleToggle(id as keyof TChartSettings)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
