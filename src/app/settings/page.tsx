'use client';

import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <AppLayout pageTitle="Налаштування">
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Профіль</CardTitle>
                <CardDescription>Керуйте налаштуваннями вашого профілю.</CardDescription>
            </CardHeader>
            <CardContent>
                <SettingsForm />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
