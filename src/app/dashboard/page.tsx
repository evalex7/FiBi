
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
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Транзакції</TabsTrigger>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <AddTransactionForm />
            </div>
            <div className="space-y-6">
              <RecentTransactions />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="overview">
          <SummaryCards />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
