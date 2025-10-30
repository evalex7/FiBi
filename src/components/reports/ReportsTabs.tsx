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
  Tooltip,
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
  type ChartConfig
} from '@/components/ui/chart';
import { mockTransactions } from '@/lib/data';

const formatCurrency = (amount: number) =>
  `$${(amount / 1000).toFixed(1)}k`;
  
const aggregateMonthlyData = () => {
  const data: { [key: string]: { month: string; income: number; expenses: number } } = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  mockTransactions.forEach(t => {
    const month = monthNames[t.date.getMonth()];
    if (!data[month]) {
      data[month] = { month, income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      data[month].income += t.amount;
    } else {
      data[month].expenses += t.amount;
    }
  });

  return Object.values(data);
};

const aggregateCategoryData = () => {
    const data: { [key: string]: number } = {};
    mockTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            data[t.category] = (data[t.category] || 0) + t.amount;
        });
    
    return Object.entries(data).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${Object.keys(data).indexOf(name) + 1}))` }));
};


const chartConfig = {
  income: { label: "Income", color: "hsl(var(--chart-2))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;


export default function ReportsTabs() {
  const monthlyData = aggregateMonthlyData();
  const categoryData = aggregateCategoryData();
  const pieChartConfig = categoryData.reduce((acc, entry, index) => {
    acc[entry.name] = { label: entry.name, color: `hsl(var(--chart-${index + 1}))`};
    return acc;
  }, {} as ChartConfig);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Income vs. Expense</TabsTrigger>
        <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Income vs. Expense</CardTitle>
            <CardDescription>
              A summary of your total income and expenses this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} accessibilityLayer>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
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
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>
              A breakdown of your spending by category for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                  <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
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
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs fill-foreground"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
              </ResponsiveContainer>
              </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
