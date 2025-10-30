'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { allCategories } from '@/lib/category-icons';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subMonths, startOfDay } from 'date-fns';

const formatCurrency = (amount: number) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return `${amount}`;
}

const chartConfig = {
  income: { label: "Дохід", color: "hsl(var(--chart-2))" },
  expenses: { label: "Витрати", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;


export default function ReportsTabs() {
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState('3'); // Default to 3 months

  const incomeVsExpenseData = useMemo(() => {
    const monthsToSubtract = parseInt(period);
    const startDate = startOfDay(subMonths(new Date(), monthsToSubtract));

    const { income, expenses } = transactions.reduce(
      (acc, t) => {
        if (new Date(t.date) >= startDate) {
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
  
  const categoryData = useMemo(() => {
      const data: { [key: string]: number } = {};
      transactions
          .filter(t => t.type === 'expense')
          .forEach(t => {
              data[t.category] = (data[t.category] || 0) + t.amount;
          });
      
      return Object.entries(data).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${(Object.keys(data).indexOf(name) % 5) + 1}))` }));
  }, [transactions]);
  
  const pieChartConfig = useMemo(() => categoryData.reduce((acc, entry, index) => {
    const categoryInfo = allCategories.find(c => c.label === entry.name);
    const chartColorIndex = (index % 5) + 1; // Cycle through 5 chart colors
    acc[entry.name] = { label: categoryInfo ? categoryInfo.label : entry.name, color: `hsl(var(--chart-${chartColorIndex}))`};
    return acc;
  }, {} as ChartConfig), [categoryData]);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Дохід vs. Витрати</TabsTrigger>
        <TabsTrigger value="categories">Витрати по категоріях</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Дохід vs. Витрати</CardTitle>
            <CardDescription>
              Огляд доходів та витрат за обраний період.
            </CardDescription>
             <div className="pt-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
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
          <CardContent className="pl-0">
            {transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Недостатньо даних для відображення графіка.
              </div>
            ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData} accessibilityLayer margin={{ left: -20, right: 16 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tick={() => null} />
                  <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} tickMargin={8} width={40} fontSize={12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={4} maxBarSize={60} />
                  <Bar
                    dataKey="expenses"
                    fill="var(--color-expenses)"
                    radius={4}
                    maxBarSize={60}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>Витрати по категоріях</CardTitle>
            <CardDescription>
              Розбивка ваших витрат за весь час.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {transactions.filter(t => t.type === 'expense').length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Немає даних про витрати для відображення.
              </div>
            ) : (
          <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                  <ChartTooltipContent hideLabel />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
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
                       <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                     ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
              </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
