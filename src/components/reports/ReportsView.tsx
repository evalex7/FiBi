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
import { subMonths, startOfMonth, format, getYear, endOfMonth, differenceInMonths, addMonths, subDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { Timestamp } from 'firebase/firestore';

const formatCurrency = (amount: number) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return `${amount}`;
}

const formatCurrencyTooltip = (amount: number) => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

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
  "hsl(150, 70%, 50%)",
  "hsl(300, 75%, 65%)",
];

export default function ReportsView() {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const [period, setPeriod] = useState('0');
  const [categoryPeriod, setCategoryPeriod] = useState('all');
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
      
      options.push({ value: 'last_3_months', label: 'Останні 3 місяці' });
      options.push({ value: 'last_6_months', label: 'Останні 6 місяці' });
      options.push({ value: 'last_12_months', label: 'Останній рік' });
    }
    
    options.push({ value: 'all', label: 'За весь час' });
    setPeriodOptions(options);

  }, [earliestTransactionDate]);

  const incomeVsExpenseData = useMemo(() => {
    if (isLoading || transactions.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfMonth(now);
    let aggregate = false;
    let label = '';
    
    const shouldAggregate = ['all', 'last_3_months', 'last_6_months', 'last_12_months'].includes(period);

    switch (period) {
        case '0':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case 'prev_month':
            const prevMonth = subMonths(now, 1);
            startDate = startOfMonth(prevMonth);
            endDate = endOfMonth(prevMonth);
            break;
        case 'last_3_months':
            startDate = startOfMonth(subMonths(now, 2));
            label = 'Останні 3 місяці';
            break;
        case 'last_6_months':
            startDate = startOfMonth(subMonths(now, 5));
            label = 'Останні 6 місяців';
            break;
        case 'last_12_months':
            startDate = startOfMonth(subMonths(now, 11));
            label = 'Останній рік';
            break;
        case 'all':
            label = 'За весь час';
            break;
    }


    if (shouldAggregate) {
      const totals = transactions
        .filter(t => {
            if (period === 'all') return true;
            const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        })
        .reduce((acc, t) => {
            if (t.type === 'income') {
            acc.income += t.amount;
            } else {
            acc.expenses += t.amount;
            }
            return acc;
        }, { income: 0, expenses: 0 });

      return [{ month: label, income: totals.income, expenses: totals.expenses }];
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

    return Object.values(data).sort((a,b) => {
        const aDate = new Date(a.month.split('. ')[1], uk.localize?.month(uk.locale.match.months.findIndex(m => m.test(a.month.split('. ')[0]))), 1);
        const bDate = new Date(b.month.split('. ')[1], uk.localize?.month(uk.locale.match.months.findIndex(m => m.test(b.month.split('. ')[0]))), 1);
        return aDate.getTime() - bDate.getTime();
    });

  }, [transactions, period, isLoading]);
  
  const { data: categoryData, config: pieChartConfig } = useMemo(() => {
    if (isLoading) return { data: [], config: {} };

    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    switch (categoryPeriod) {
        case '0':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case 'prev_month':
            const prevMonth = subMonths(now, 1);
            startDate = startOfMonth(prevMonth);
            endDate = endOfMonth(prevMonth);
            break;
        case 'all':
        default:
            // No date filtering needed
            break;
    }


    const dataMap: { [key: string]: number } = {};
    transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        if (startDate && endDate) {
             const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
             return transactionDate >= startDate && transactionDate <= endDate;
        }
        return true;
      })
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
  }, [transactions, isLoading, categoryPeriod]);


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
                  {periodOptions.map(option => {
                      let disabled = false;
                      if (earliestTransactionDate) {
                        const totalMonths = differenceInMonths(new Date(), earliestTransactionDate) + 1;
                        if (option.value === 'last_3_months' && totalMonths < 3) disabled = true;
                        if (option.value === 'last_6_months' && totalMonths < 6) disabled = true;
                        if (option.value === 'last_12_months' && totalMonths < 12) disabled = true;
                      } else if (['last_3_months', 'last_6_months', 'last_12_months'].includes(option.value)) {
                        disabled = true;
                      }

                     return <SelectItem key={option.value} value={option.value} disabled={disabled}>{option.label}</SelectItem>
                  })}
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
            <ChartContainer config={barChartConfig} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData} margin={{ left: 0, right: 16 }}>
                    <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} tickMargin={8} width={40} fontSize={12} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelClassName="font-bold"
                          formatter={(value, name, item) => {
                            return (
                                <div className="flex items-center justify-between w-full">
                                    <span className="capitalize">{barChartConfig[name as keyof typeof barChartConfig]?.label}</span>
                                    <span className="font-medium ml-4">{formatCurrencyTooltip(value as number)}</span>
                                </div>
                            )
                          }}
                        />
                      }
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
              Розбивка ваших витрат за обраний період.
            </CardDescription>
             <div className="pt-2">
              <Select value={categoryPeriod} onValueChange={setCategoryPeriod}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Оберіть період" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">За весь час</SelectItem>
                  <SelectItem value="0">Поточний місяць</SelectItem>
                  <SelectItem value="prev_month">Попередній місяць</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {isLoading || categoryData.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Немає даних про витрати для відображення.
              </div>
            ) : (
              <ChartContainer config={pieChartConfig} className="w-full h-[450px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                           formatter={(value, name, item) => (
                            <div>
                              <p className="font-medium">{item.payload.name}</p>
                              <p className="text-muted-foreground">
                                {formatCurrencyTooltip(value as number)}
                              </p>
                            </div>
                          )}
                          nameKey="name"
                        />
                      }
                    />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={80}
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
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
