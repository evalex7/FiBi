import AppLayout from '@/components/AppLayout';
import BudgetList from '@/components/budgets/BudgetList';
import AiSuggestions from '@/components/budgets/AiSuggestions';

export default function BudgetsPage() {
  return (
    <AppLayout pageTitle="Бюджети">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BudgetList />
        </div>
        <div className="lg:col-span-1">
          <AiSuggestions />
        </div>
      </div>
    </AppLayout>
  );
}
