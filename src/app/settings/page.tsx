'use client';

import AppLayout from '@/components/AppLayout';
import CategoriesSettings from '@/components/settings/CategoriesSettings';
import ChartSettings from '@/components/settings/ChartSettings';
import ThemeSettings from '@/components/settings/ThemeSettings';

export default function SettingsPage() {
  return (
    <AppLayout pageTitle="Налаштування">
      <div className="space-y-6">
        <CategoriesSettings />
        <ThemeSettings />
        <ChartSettings />
      </div>
    </AppLayout>
  );
}
