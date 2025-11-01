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
import { useMemo, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subMonths, startOfMonth, format, getYear, endOfMonth, differenceInMonths, addMonths } from 'date-fns';
import { uk } from 'date-fns/locale';
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
  value: { label: "Сума" },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 80%, 70%)",
  "hsl(340, 80%, 70%)",
  "hsl(100, 60%, 50%)",
  "hsl(280, 70%, 60%)",
  "hsl(40, 90%, 60%)",
];

export default function ReportsView() {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const [period, setPeriod] = useState('0');
  const [periodOptions, setPeriodOptions] = useState<{value: string, label: string}[]>([]);
  const [earliestTransactionDate, setEarliestTransactionDate] = useState<Date | null>(null);

  const isLoading = isTransactionsLoading || isCategoriesLoading;

  useEffect(() => {
    if (transactions.length > 0) {
      const earliestDate = transactions.reduce((earliest, t) => {
        const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
        return transactionDate < earliest ? transactionDate : earliest;
      }, new Date());
      setEarliestTransactionDate(startOfMonth(earliestDate));
    }
  }, [transactions]);
  
  useEffect(() => {
    const options = [
      { value: '0', label: 'Поточний місяць' },
      { value: 'prev_month', label: 'Попередній місяць' },
    ];
    
    if (earliestTransactionDate) {
      const now = new Date();
      const totalMonths = differenceInMonths(now, earliestTransactionDate) + 1;
      
      if (totalMonths >= 3) {
        options.push({ value: '2', label: 'Останні 3 місяці' });
      }
      if (totalMonths >= 6) {
        options.push({ value: '5', label: 'Останні 6 місяців' });
      }
      if (totalMonths >= 12) {
        options.push({ value: '11', label: 'Останній рік' });
      }
    }
    
    options.push({ value: 'all', label: 'За весь час' });
    setPeriodOptions(options);

  }, [earliestTransactionDate]);

  const incomeVsExpenseData = useMemo(() => {
    if (isLoading || transactions.length === 0 || !earliestTransactionDate) return [];

    const now = new Date();
    let startDate;
    let endDate = endOfMonth(now);

    if (period === 'prev_month') {
        const prevMonth = subMonths(now, 1);
        startDate = startOfMonth(prevMonth);
        endDate = endOfMonth(prevMonth);
    } else if (period === 'all') {
        startDate = earliestTransactionDate;
    } else {
        const monthsToSubtract = parseInt(period, 10);
        startDate = startOfMonth(subMonths(now, monthsToSubtract));
        if (startDate < earliestTransactionDate) {
          startDate = earliestTransactionDate;
        }
    }

    const data: { [key: string]: { month: string, income: number, expenses: number } } = {};
    
    transactions.forEach(t => {
      const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
      
      if (transactionDate >= startDate && transactionDate <= endDate) {
          const monthKey = format(transactionDate, 'yyyy-MM');
          if (!data[monthKey]) {
            const monthLabel = `${format(transactionDate, 'LLL', {locale: uk})}. ${getYear(transactionDate)}`;
            data[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
          }
          if (t.type === 'income') {
            data[monthKey].income += t.amount;
          } else {
            data[monthKey].expenses += t.amount;
          }
      }
    });

    return Object.values(data).sort((a,b) => a.month.localeCompare(b.month));

  }, [transactions, period, isLoading, earliestTransactionDate]);
  
  const { data: categoryData, config: pieChartConfig } = useMemo(() => {
    if (isLoading) return { data: [], config: {} };
    const dataMap: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dataMap[t.category] = (dataMap[t.category] || 0) + t.amount;
      });

    const chartData = Object.entries(dataMap).map(([name, value]) => ({
      name,
      value,
    })).sort((a, b) => b.value - a.value);
    
    const chartConfig = chartData.reduce((acc, entry, index) => {
        const color = COLORS[index % COLORS.length];
        acc[entry.name] = {
            label: entry.name,
            color: color,
        };
        return acc;
    }, {} as ChartConfig);

    return { data: chartData, config: chartConfig };
  }, [transactions, isLoading]);


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
                  {periodOptions.map(option => (
                     <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            {isLoading || incomeVsExpenseData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Недостатньо даних для відображення графіка.
              </div>
            ) : (
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData} margin={{ left: 0, right: 16 }}>
                    <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} tickMargin={8} width={40} fontSize={12} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                            formatter={(value) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value as number)}
                            indicator="dot" 
                        />}
                    />
                    <Bar dataKey="income" fill="var(--color-income)" radius={4} maxBarSize={60} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} maxBarSize={60} />
                    <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ResponsiveContainer>
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
            {isLoading || categoryData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Немає даних про витрати для відображення.
              </div>
            ) : (
              <ChartContainer config={pieChartConfig} className="w-full h-[400px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value as number)} />} />
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
