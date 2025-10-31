
import AppLayout from '@/components/AppLayout';
import AddTransactionForm from '@/components/dashboard/AddTransactionForm';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ReportsTabs from '@/components/reports/ReportsTabs';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Repeat } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Панель">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="transactions">Транзакції</TabsTrigger>
          <TabsTrigger value="payments">
             <Link href="/payments" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Платежі
            </Link>
          </TabsTrigger>
          <TabsTrigger value="reports">Звіти</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <div className="space-y-6">
                <SummaryCards />
                <div className="block md:hidden">
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
          <ReportsTabs />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
