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
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceArea,
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
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subMonths, startOfMonth, format, getYear, endOfMonth, differenceInMonths, addMonths, subDays, eachDayOfInterval, startOfDay, endOfDay, eachMonthOfInterval, getDaysInMonth } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import AppLayout from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

const lineChartConfig = {
  income: { label: "Дохід", color: "hsl(var(--chart-2))" },
  expenses: { label: "Витрати", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(260, 80%, 70%)",
  "hsl(340, 80%, 70%)",
  "hsl(190, 70%, 50%)",
  "hsl(220, 80%, 70%)",
  "hsl(30, 90%, 60%)",
  "hsl(100, 60%, 50%)",
  "hsl(300, 75%, 65%)",
  "hsl(20, 85%, 60%)",
  "hsl(210, 80%, 65%)",
  "hsl(140, 60%, 55%)",
  "hsl(280, 70%, 60%)",
];

type CustomTooltipPayload = {
  category: string;
  amount: number;
  top: number;
  left: number;
};

export default function ReportsPage() {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const isMobile = useIsMobile();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const [period, setPeriod] = useState('0');
  const [categoryPeriod, setCategoryPeriod] = useState('all');
  const [trendPeriod, setTrendPeriod] = useState('monthly');
  const [categoryTrendPeriod, setCategoryTrendPeriod] = useState('last_6_months');
  const [activeTooltip, setActiveTooltip] = useState<CustomTooltipPayload | null>(null);

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
      options.push({ value: 'last_3_months', label: 'Останні 3 місяці' });
      options.push({ value: 'last_6_months', label: 'Останні 6 місяців' });
      options.push({ value: 'last_12_months', label: 'Останній рік' });
    }
    
    options.push({ value: 'all', label: 'За весь час' });
    setPeriodOptions(options);

  }, [earliestTransactionDate]);

  const filteredTransactions = transactions;


  const incomeVsExpenseData = useMemo(() => {
    if (isLoading || filteredTransactions.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfMonth(now);
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
            if (earliestTransactionDate) {
              startDate = earliestTransactionDate;
            } else {
              startDate = new Date(0); // fallback
            }
            break;
        default:
            startDate = startOfMonth(now);
    }


    if (shouldAggregate) {
      const totals = filteredTransactions
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
    
    filteredTransactions.forEach(t => {
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

    const monthOrder = (monthStr: string) => {
        const [monthName, year] = monthStr.split('. ');
        const monthIndex = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'].indexOf(monthName);
        return new Date(parseInt(year), monthIndex).getTime();
    };

    return Object.values(data).sort((a,b) => monthOrder(a.month) - monthOrder(b.month));

  }, [filteredTransactions, period, isLoading, earliestTransactionDate]);
  
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
    filteredTransactions
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
    
    const config = chartData.reduce((acc, entry, index) => {
        const categoryDetails = categories.find(c => c.name === entry.name);
        const color = categoryDetails ? `hsl(var(--chart-${(index % 5) + 1}))` : COLORS[index % COLORS.length];
        acc[entry.name] = {
            label: entry.name,
            color: color,
        };
        return acc;
    }, {} as ChartConfig);

    return { data: chartData, config };
  }, [filteredTransactions, isLoading, categoryPeriod, categories]);

  const trendData = useMemo(() => {
    if (isLoading || transactions.length < 1) return [];

    let startDate: Date;
    let endDate: Date;
    let intervalDays: Date[];

    if (trendPeriod === 'daily') {
      const now = new Date();
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    } else { // monthly
      startDate = earliestTransactionDate ? startOfMonth(earliestTransactionDate) : startOfMonth(new Date());
      endDate = endOfMonth(new Date());
       intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    }

    const dailyTotals: { [key: string]: { income: number, expenses: number } } = {};
    
    transactions.forEach(t => {
      const transactionDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      const dayKey = format(transactionDate, 'yyyy-MM-dd');

      if (!dailyTotals[dayKey]) {
        dailyTotals[dayKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        dailyTotals[dayKey].income += t.amount;
      } else {
        dailyTotals[dayKey].expenses += t.amount;
      }
    });

    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;
    
    const chartData = intervalDays.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        if (dailyTotals[dayKey]) {
            cumulativeIncome += dailyTotals[dayKey].income;
            cumulativeExpenses += dailyTotals[dayKey].expenses;
        }

        let dateLabel: string;
         if (trendPeriod === 'daily') {
            dateLabel = format(day, 'd LLL', { locale: uk });
        } else {
             dateLabel = format(day, 'LLL yy', { locale: uk });
        }

        return {
            date: day,
            dateLabel,
            income: cumulativeIncome,
            expenses: cumulativeExpenses,
        };
    });

    if (trendPeriod === 'monthly') {
        const monthlyData: { [key: string]: (typeof chartData[0]) } = {};
        chartData.forEach(data => {
            const monthKey = format(data.date, 'yyyy-MM');
            monthlyData[monthKey] = data; // Keep only the last entry for each month
        });
        return Object.values(monthlyData).sort((a,b) => a.date.getTime() - b.date.getTime());
    }

    return chartData;
}, [transactions, isLoading, trendPeriod, earliestTransactionDate]);

const { data: categoryTrendData, config: categoryTrendConfig, categories: categoryTrendCategories } = useMemo(() => {
    if (isLoading || isCategoriesLoading) return { data: [], config: {}, categories: [] };
    
    const now = new Date();
    let startDate: Date;
    switch (categoryTrendPeriod) {
        case 'last_12_months':
            startDate = startOfMonth(subMonths(now, 11));
            break;
        case 'last_3_months':
            startDate = startOfMonth(subMonths(now, 2));
            break;
        case 'last_6_months':
        default:
            startDate = startOfMonth(subMonths(now, 5));
            break;
    }
    const endDate = endOfMonth(now);
  
    const dataByMonth: { [month: string]: { date: Date, values: { [category: string]: number } } } = {};
    const allCategoriesInPeriod = new Set<string>();

    // Initialize all months in the period
    eachMonthOfInterval({ start: startDate, end: endDate }).forEach(monthDate => {
        const monthKey = format(monthDate, 'yyyy-MM');
        dataByMonth[monthKey] = { date: monthDate, values: {} };
    });
  
    filteredTransactions.forEach(t => {
        if (t.type === 'expense') {
            const transactionDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
            if (transactionDate >= startDate && transactionDate <= endDate) {
                const monthKey = format(transactionDate, 'yyyy-MM');
                if (dataByMonth[monthKey]) {
                    dataByMonth[monthKey].values[t.category] = (dataByMonth[monthKey].values[t.category] || 0) + t.amount;
                    allCategoriesInPeriod.add(t.category);
                }
            }
        }
    });
  
    const chartData = Object.values(dataByMonth)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, values }) => ({
          month: format(date, 'LLL yy', { locale: uk }),
          ...values
      }));
  
    const sortedCategories = Array.from(allCategoriesInPeriod).sort((a,b) => a.localeCompare(b));
  
    const config: ChartConfig = {};
    sortedCategories.forEach((categoryName, index) => {
      const color = COLORS[index % COLORS.length];
      config[categoryName] = {
        label: categoryName,
        color: color,
      };
    });
  
    return { data: chartData, config, categories: sortedCategories };
}, [filteredTransactions, isLoading, isCategoriesLoading, categories, categoryTrendPeriod]);

const { dailyVaseData, dailyVaseConfig, dailyBudget, maxDailyValue } = useMemo(() => {
    if (isLoading || isCategoriesLoading) return { dailyVaseData: [], dailyVaseConfig: {}, dailyBudget: 0, maxDailyValue: 0 };

    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const numDaysInMonth = getDaysInMonth(now);

    const totalIncomeThisMonth = transactions
        .filter(t => {
            const transactionDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
            return t.type === 'income' && transactionDate >= startDate && transactionDate <= endDate;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const dailyBudget = totalIncomeThisMonth > 0 ? totalIncomeThisMonth / numDaysInMonth : 0;

    const config: ChartConfig = {};
    const categoryNames = new Set<string>();
    categories.forEach(category => {
        categoryNames.add(category.name);
    });

    Array.from(categoryNames).sort().forEach((name, index) => {
        const color = COLORS[index % COLORS.length];
        config[name] = {
            label: name,
            color: color,
        };
    });

    let maxTotal = 0;

    const data = daysInMonth.map(day => {
        const expensesForDay = transactions
            .filter(t => {
                const transactionDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
                return t.type === 'expense' && startOfDay(transactionDate).getTime() === startOfDay(day).getTime();
            });

        const dailyExpensesByCategory = expensesForDay.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as { [category: string]: number });
        
        const total = expensesForDay.reduce((sum, t) => sum + t.amount, 0);

        if (total > maxTotal) {
            maxTotal = total;
        }

        const segments = Object.entries(dailyExpensesByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => ({
                category,
                amount,
                color: config[category]?.color || '#8884d8'
            }));
        
        return {
            date: day,
            total,
            segments,
        };
    }).sort((a,b) => b.date.getTime() - a.date.getTime());

    const maxDailyValue = Math.max(maxTotal, dailyBudget) * 1.1; 
    
    return { dailyVaseData: data, dailyVaseConfig: config, dailyBudget, maxDailyValue };
}, [transactions, isLoading, categories, isCategoriesLoading]);


  const incomeVsExpenseChart = (
    <Card>
      <CardHeader>
        <CardTitle>Дохід vs. Витрати</CardTitle>
        <CardDescription>
          Огляд доходів та витрат за обраний період.
        </CardDescription>
        <div className="pt-2 flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Оберіть період" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => {
                return <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
                  content={<ChartTooltipContent />}
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
  );

  const categoryChart = (
     <Card>
      <CardHeader>
        <CardTitle>Витрати по категоріях</CardTitle>
        <CardDescription>
          Розбивка ваших витрат за обраний період.
        </CardDescription>
        <div className="pt-2 flex flex-wrap gap-2">
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-muted-foreground">
                            {formatCurrencyTooltip(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
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
                {categoryData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={pieChartConfig[entry.name]?.color} />
                ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center" />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );

  const trendChart = (
    <Card>
        <CardHeader>
            <CardTitle>Динаміка доходів та витрат</CardTitle>
            <CardDescription>
            Порівняння ваших доходів та витрат.
            </CardDescription>
            <div className="pt-2 flex flex-wrap gap-2">
                <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                    <SelectTrigger className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Оберіть деталізацію" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">По місяцях (за весь час)</SelectItem>
                        <SelectItem value="daily">По днях (поточний місяць)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
            {isLoading || trendData.length < 2 ? (
                <div className="text-center text-muted-foreground py-8">
                    Потрібно більше даних для відображення динаміки.
                </div>
            ) : (
            <ChartContainer config={lineChartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={trendData}
                        margin={{ left: 0, right: 16 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="dateLabel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                            interval={trendPeriod === 'daily' ? 6 : 'preserveStartEnd'}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={40}
                            fontSize={12}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                                    <div className="font-medium">{label}</div>
                                    {payload.map(item => (
                                    <div key={item.dataKey} className="flex w-full items-center gap-2">
                                        <div
                                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                        style={{ backgroundColor: item.color }}
                                        />
                                        <div className="flex flex-1 justify-between">
                                        <span className="text-muted-foreground">
                                            {lineChartConfig[item.dataKey as keyof typeof lineChartConfig]?.label || item.name}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrencyTooltip(item.value as number)}
                                        </span>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                );
                            }
                            return null;
                            }}
                        />
                         <defs>
                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="income"
                            type="monotone"
                            fill="url(#fillIncome)"
                            stroke="var(--color-income)"
                            stackId="1"
                        />
                         <Area
                            dataKey="expenses"
                            type="monotone"
                            fill="url(#fillExpenses)"
                             stroke="var(--color-expenses)"
                            stackId="2"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartContainer>
            )}
        </CardContent>
    </Card>
  );
  
const categoryTrendChart = (
    <Card>
      <CardHeader>
        <CardTitle>Динаміка витрат по категоріях</CardTitle>
        <CardDescription>
          Порівняння витрат по категоріях за останні місяці.
        </CardDescription>
        <div className="pt-2 flex flex-wrap gap-2">
          <Select value={categoryTrendPeriod} onValueChange={setCategoryTrendPeriod}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Оберіть період" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_3_months">Останні 3 місяці</SelectItem>
              <SelectItem value="last_6_months">Останні 6 місяців</SelectItem>
              <SelectItem value="last_12_months">Останні 12 місяців</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        {isLoading || categoryTrendData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Недостатньо даних для відображення графіка.
          </div>
        ) : (
          <ChartContainer config={categoryTrendConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
              <BarChart data={categoryTrendData} margin={{ left: 0, right: 16 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} tickMargin={8} width={40} fontSize={12}/>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: categoryTrendConfig[name as keyof typeof categoryTrendConfig]?.color }}
                      />
                      <div className="flex flex-1 justify-between">
                        <span className="text-muted-foreground">{categoryTrendConfig[name as keyof typeof categoryTrendConfig]?.label}</span>
                        <span className="font-bold">{formatCurrencyTooltip(value as number)}</span>
                      </div>
                    </div>
                  )} />}
                />
                 <ChartLegend content={<ChartLegendContent className="flex-wrap justify-center" />} />
                {categoryTrendCategories.map((category, index) => (
                   <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={categoryTrendConfig[category]?.color || COLORS[index % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
  
const dailyVaseExpenseChart = (
    <Card>
      <CardHeader>
        <CardTitle>Щоденні витрати</CardTitle>
        <CardDescription>
          Аналіз витрат по днях за поточний місяць відносно середнього бюджету. 
          {dailyBudget > 0 && <span> Ваш денний бюджет на цей місяць: <b>{formatCurrencyTooltip(dailyBudget)}</b></span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="pr-0" ref={chartContainerRef}>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Завантаження даних...
          </div>
        ) : dailyVaseData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Немає даних про витрати цього місяця.
          </div>
        ) : (
          <div
            className="relative"
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="grid grid-cols-[2rem_1fr] items-center">
              <div className="flex flex-col-reverse">
                {dailyVaseData.map((dayData) => (
                  <div
                    key={dayData.date.toISOString()}
                    className="h-4 flex items-center justify-end pr-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      {format(dayData.date, 'd')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative h-full">
                {/* Budget Bar */}
                {dailyBudget > 0 && (
                  <div
                    className="absolute top-0 h-full w-24 bg-destructive/20"
                    style={{
                      width: `${Math.min(100, (dailyBudget / maxDailyValue) * 100)}%`
                    }}
                     onMouseMove={(e) => {
                        const rect = chartContainerRef.current?.getBoundingClientRect();
                        if (rect) {
                            setActiveTooltip({
                                category: 'Денний бюджет',
                                amount: dailyBudget,
                                top: e.clientY - rect.top,
                                left: e.clientX - rect.left,
                            });
                        }
                    }}
                  />
                )}

                <div className="relative flex flex-col-reverse w-full">
                  {dailyVaseData.map((dayData) => (
                    <div
                      key={dayData.date.toISOString()}
                      className="h-4 flex justify-center py-px"
                    >
                      {dayData.total > 0 && (
                        <div
                          className="flex h-full relative"
                          style={{
                            width: `${Math.min(
                              100,
                              (dayData.total / maxDailyValue) * 100
                            )}%`,
                          }}
                        >
                          {dayData.segments.map((segment, index) => (
                            <div
                              key={index}
                              className="h-full"
                              style={{
                                width: `${
                                  (segment.amount / dayData.total) * 100
                                }%`,
                                backgroundColor: segment.color,
                              }}
                              onMouseMove={(e) => {
                                const rect = chartContainerRef.current?.getBoundingClientRect();
                                if (rect) {
                                  setActiveTooltip({
                                    category: segment.category,
                                    amount: segment.amount,
                                    top: e.clientY - rect.top,
                                    left: e.clientX - rect.left,
                                  });
                                }
                              }}
                              onClick={(e) => {
                                const rect = chartContainerRef.current?.getBoundingClientRect();
                                if (rect) {
                                  setActiveTooltip({
                                    category: segment.category,
                                    amount: segment.amount,
                                    top: e.clientY - rect.top,
                                    left: e.clientX - rect.left,
                                  });
                                }
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {activeTooltip && (
              <div
                className="absolute z-10 pointer-events-none transform -translate-y-1/2 -translate-x-1/2"
                style={{
                  top: activeTooltip.top,
                  left: activeTooltip.left,
                }}
              >
                <div className="bg-popover text-popover-foreground rounded-md border shadow-lg px-3 py-1.5 text-sm">
                  <p className="font-bold">{activeTooltip.category}</p>
                  <p>{formatCurrencyTooltip(activeTooltip.amount)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
);



  return (
    <AppLayout pageTitle="Звіти">
      <div className="w-full space-y-6">
        {incomeVsExpenseChart}
        {dailyVaseExpenseChart}
        {categoryChart}
        {trendChart}
        {categoryTrendChart}
      </div>
    </AppLayout>
  );
}
