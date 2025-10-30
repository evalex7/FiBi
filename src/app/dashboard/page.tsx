
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

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Панель">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="transactions">Транзакції</TabsTrigger>
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
      </Tabs>
    </AppLayout>
  );
}
