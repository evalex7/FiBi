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
import { subMonths, startOfMonth, format, getYear, endOfMonth, differenceInMonths, addMonths, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { FamilyMember } from '@/lib/types';
import TransactionUserAvatar from '../dashboard/TransactionUserAvatar';

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
  const firestore = useFirestore();

  const [period, setPeriod] = useState('0');
  const [categoryPeriod, setCategoryPeriod] = useState('all');
  const [trendPeriod, setTrendPeriod] = useState('monthly');
  const [memberFilter, setMemberFilter] = useState('all');

  const [periodOptions, setPeriodOptions] = useState<{value: string, label: string}[]>([]);
  const [earliestTransactionDate, setEarliestTransactionDate] = useState<Date | null>(null);

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  
  const { data: familyMembers, isLoading: isMembersLoading } = useCollection<FamilyMember>(usersCollectionRef);

  const isLoading = isTransactionsLoading || isCategoriesLoading || isMembersLoading;

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

  const filteredTransactions = useMemo(() => {
      if (memberFilter === 'all') {
          return transactions;
      }
      return transactions.filter(t => t.familyMemberId === memberFilter);
  }, [transactions, memberFilter]);


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

    return Object.values(data).sort((a,b) => {
        const aDate = new Date(a.month.split('. ')[1], uk.localize?.month(uk.locale.match.months.findIndex(m => m.test(a.month.split('. ')[0]))), 1);
        const bDate = new Date(b.month.split('. ')[1], uk.localize?.month(uk.locale.match.months.findIndex(m => m.test(b.month.split('. ')[0]))), 1);
        return aDate.getTime() - bDate.getTime();
    });

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
        const color = COLORS[index % COLORS.length];
        acc[entry.name] = {
            label: entry.name,
            color: color,
        };
        return acc;
    }, {} as ChartConfig);

    return { data: chartData, config };
  }, [filteredTransactions, isLoading, categoryPeriod]);

  const monthlyTrendData = useMemo(() => {
    if (isLoading || filteredTransactions.length < 1) return [];

    if (trendPeriod === 'daily') {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const daysInMonth = eachDayOfInterval({ start, end });

        const data: { [key: string]: { dateLabel: string, income: number, expenses: number, date: Date } } = {};
        
        daysInMonth.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            data[dayKey] = {
                dateLabel: format(day, 'd LLL', { locale: uk }),
                income: 0,
                expenses: 0,
                date: day,
            }
        });
        
        filteredTransactions.forEach(t => {
            const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
            if (transactionDate >= start && transactionDate <= end) {
                const dayKey = format(transactionDate, 'yyyy-MM-dd');
                if (data[dayKey]) {
                    if (t.type === 'income') {
                        data[dayKey].income += t.amount;
                    } else {
                        data[dayKey].expenses += t.amount;
                    }
                }
            }
        });

        return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());

    } else { // monthly
        const data: { [key: string]: { dateLabel: string, income: number, expenses: number, date: Date } } = {};

        filteredTransactions.forEach(t => {
            const transactionDate = t.date && (t.date as Timestamp).toDate ? (t.date as Timestamp).toDate() : new Date(t.date);
            const monthKey = format(transactionDate, 'yyyy-MM');

            if (!data[monthKey]) {
                data[monthKey] = {
                dateLabel: format(transactionDate, 'LLL yy', { locale: uk }),
                income: 0,
                expenses: 0,
                date: startOfMonth(transactionDate),
                };
            }
            if (t.type === 'income') {
                data[monthKey].income += t.amount;
            } else {
                data[monthKey].expenses += t.amount;
            }
        });
        
        return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }, [filteredTransactions, isLoading, trendPeriod]);


  return (
    <div className="w-full space-y-6">
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
               <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Оберіть члена родини" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                        <span>Всі члени родини</span>
                    </div>
                  </SelectItem>
                  {familyMembers?.map(member => (
                     <SelectItem key={member.id} value={member.id}>
                       <div className="flex items-center gap-2">
                        <TransactionUserAvatar userId={member.id} />
                        <span>{member.name}</span>
                       </div>
                     </SelectItem>
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
               <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Оберіть члена родини" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                        <span>Всі члени родини</span>
                    </div>
                  </SelectItem>
                  {familyMembers?.map(member => (
                     <SelectItem key={member.id} value={member.id}>
                       <div className="flex items-center gap-2">
                        <TransactionUserAvatar userId={member.id} />
                        <span>{member.name}</span>
                       </div>
                     </SelectItem>
                  ))}
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
                     <Select value={memberFilter} onValueChange={setMemberFilter}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Оберіть члена родини" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">
                            <div className="flex items-center gap-2">
                                <span>Всі члени родини</span>
                            </div>
                        </SelectItem>
                        {familyMembers?.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                                <TransactionUserAvatar userId={member.id} />
                                <span>{member.name}</span>
                            </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
                {isLoading || monthlyTrendData.length < 2 ? (
                     <div className="text-center text-muted-foreground py-8">
                        Потрібно більше даних для відображення динаміки.
                     </div>
                ) : (
                <ChartContainer config={lineChartConfig} className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={monthlyTrendData}
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
                            <Line
                                dataKey="income"
                                type="monotone"
                                stroke="var(--color-income)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="expenses"
                                type="monotone"
                                stroke="var(--color-expenses)"
                                strokeWidth={2}
                                dot={false}
                            />
                             <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
