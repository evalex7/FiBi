import AppLayout from '@/components/AppLayout';
import ReportsTabs from '@/components/reports/ReportsTabs';

export default function ReportsPage() {
  return (
    <AppLayout pageTitle="Звіти">
      <div className="space-y-6">
        <ReportsTabs />
      </div>
    </AppLayout>
  );
}
