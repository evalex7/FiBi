'use client';

import AppLayout from '@/components/AppLayout';
import ReportsView from '@/components/reports/ReportsView';

export default function ReportsPage() {
  return (
    <AppLayout pageTitle="Звіти">
      <ReportsView />
    </AppLayout>
  );
}
