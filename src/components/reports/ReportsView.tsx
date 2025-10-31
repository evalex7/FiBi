
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig
} from '@/components/ui/chart';
import { useTransactions } from '@/contexts/transactions-context';
import { useCategories } from '@/contexts/categories-context';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subMonths, startOfDay } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

const formatCurrency = (amount: number) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return `${amount}`;
}

const barChartConfig = {
  income: { label: "Дохід", color: "hsl(var(--chart-2))" },
  expenses: { label: "Витрати", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(260, 70%, 50%)",
  "hsl(300, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(0, 0%, 50%)",
];

export default function ReportsView() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [period, setPeriod] = useState('1'); // Default to 1 month

  const incomeVsExpenseData = useMemo(() => {
    const monthsToSubtract = parseInt(period);
    const startDate = startOfDay(subMonths(new Date(), monthsToSubtract));

    const { income, expenses } = transactions.reduce(
      (acc, t) => {
        const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
        if (transactionDate >= startDate) {
          if (t.type === 'income') {
            acc.income += t.amount;
          } else {
            acc.expenses += t.amount;
          }
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    return [{ name: 'vs', income, expenses }];
  }, [transactions, period]);
  
  const { data: categoryData, config: pieChartConfig } = useMemo(() => {
    const dataMap: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dataMap[t.category] = (dataMap[t.category] || 0) + t.amount;
      });

    const chartData = Object.entries(dataMap).map(([name, value]) => ({
      name,
      value,
    }));
    
    const chartConfig = chartData.reduce((acc, entry, index) => {
        acc[entry.name] = {
            label: entry.name,
            color: COLORS[index % COLORS.length],
        };
        return acc;
    }, {} as ChartConfig);

    return { data: chartData, config: chartConfig };
  }, [transactions]);


  return (
    <div className="w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Дохід vs. Витрати</CardTitle>
            <CardDescription>
              Огляд доходів та витрат за обраний період.
            </CardDescription>
            <div className="pt-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Оберіть період" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Останній місяць</SelectItem>
                  <SelectItem value="3">Останні 3 місяці</SelectItem>
                  <SelectItem value="6">Останні 6 місяців</SelectItem>
                  <SelectItem value="12">Останній рік</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            {transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Недостатньо даних для відображення графіка.
              </div>
            ) : (
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <BarChart data={incomeVsExpenseData} margin={{ left: 0, right: 16 }} maxBarSize={120}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tick={() => null} />
                <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} tickMargin={8} width={30} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
      
        <Card>
          <CardHeader>
            <CardTitle>Витрати по категоріях</CardTitle>
            <CardDescription>
              Розбивка ваших витрат за весь час.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {categoryData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Немає даних про витрати для відображення.
              </div>
            ) : (
              <ChartContainer config={pieChartConfig} className="w-full h-[400px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={2}
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          percent > 0.05 ? (
                          <text
                            x={x}
                            y={y}
                            fill="hsl(var(--card-foreground))"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs fill-foreground font-medium"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                          ) : null
                        );
                      }}
                    >
                    {categoryData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />
                    ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center" />} />
              </ChartContainer>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
