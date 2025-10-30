import AppLayout from '@/components/AppLayout';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionDialog from '@/components/dashboard/AddTransactionDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AppLayout pageTitle="Панель">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground/80">Огляд</h2>
            <AddTransactionDialog>
              <Button style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Додати транзакцію
              </Button>
            </AddTransactionDialog>
        </div>
        <SummaryCards />
        <RecentTransactions />
      </div>
    </AppLayout>
  );
}
