'use client';

import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import CategoriesSettings from '@/components/settings/CategoriesSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeSettings from '@/components/settings/ThemeSettings';
import ChartSettings from '@/components/settings/ChartSettings';

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
