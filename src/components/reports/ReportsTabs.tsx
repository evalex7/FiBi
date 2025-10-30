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
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart';
import { useTransactions } from '@/contexts/transactions-context';
import { allCategories } from '@/lib/category-icons';
import { useMemo } from 'react';

const formatCurrency = (amount: number) =>
  `${(amount / 1000).toFixed(0)} тис.`;
  
const chartConfig = {
  income: { label: "Дохід", color: "hsl(var(--chart-2))" },
  expenses: { label: "Витрати", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;


export default function ReportsTabs() {
  const { transactions } = useTransactions();

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { month: string; income: number; expenses: number } } = {};
    const monthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
  
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    for (let i = 0; i < 6; i++) {
        const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
        const month = monthNames[date.getMonth()];
        data[month] = { month, income: 0, expenses: 0 };
    }

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate >= sixMonthsAgo) {
        const month = monthNames[transactionDate.getMonth()];
        if (data[month]) {
            if (t.type === 'income') {
                data[month].income += t.amount;
            } else {
                data[month].expenses += t.amount;
            }
        }
      }
    });
  
    return Object.values(data);
  }, [transactions]);
  
  const categoryData = useMemo(() => {
      const data: { [key: string]: number } = {};
      transactions
          .filter(t => t.type === 'expense')
          .forEach(t => {
              data[t.category] = (data[t.category] || 0) + t.amount;
          });
      
      return Object.entries(data).map(([name, value]) => ({ name, value }));
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
              Огляд доходів та витрат за останні 6 місяців.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                Недостатньо даних для відображення графіка.
              </div>
            ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} accessibilityLayer margin={{ left: -20 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} tickMargin={8} width={80} fontSize={12} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                  <Bar
                    dataKey="expenses"
                    fill="var(--color-expenses)"
                    radius={4}
                  />
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
              Розбивка ваших витрат за поточний місяць.
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
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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
                     {categoryData.map((entry, index) => {
                        const chartColorIndex = (index % 5) + 1;
                        return <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${chartColorIndex}))`} />
                     })}
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
