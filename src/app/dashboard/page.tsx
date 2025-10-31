

import AppLayout from '@/components/AppLayout';
import AddTransactionForm from '@/components/dashboard/AddTransactionForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SummaryCards from '@/components/dashboard/SummaryCards';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Repeat, AreaChart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Панель">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="reports" asChild>
            <Link href="/reports" className="flex items-center gap-2">
                <AreaChart className="h-4 w-4" />
                Звіти
            </Link>
          </TabsTrigger>
           <TabsTrigger value="transactions" className="hidden md:inline-flex">Транзакції</TabsTrigger>
          <TabsTrigger value="payments" className="hidden md:inline-flex">
             <Link href="/payments" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Платежі
            </Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <div className="space-y-6">
                <SummaryCards />
                <div className="block lg:hidden">
                    <AddTransactionForm />
                </div>
                <RecentTransactions />
            </div>
        </TabsContent>
        <TabsContent value="transactions">
          <div className="space-y-6">
              <AddTransactionForm />
              <RecentTransactions />
          </div>
        </TabsContent>
         <TabsContent value="payments">
          {/* Content will be on the /payments page */}
        </TabsContent>
        <TabsContent value="reports">
          {/* Content is on the /reports page now */}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
