'use client';

import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import CategoriesSettings from '@/components/settings/CategoriesSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeSettings from '@/components/settings/ThemeSettings';
import ChartSettings from '@/components/settings/ChartSettings';

export default function SettingsPage() {
  return (
    <AppLayout pageTitle="Налаштування">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профіль</TabsTrigger>
          <TabsTrigger value="categories">Категорії</TabsTrigger>
          <TabsTrigger value="appearance">Вигляд</TabsTrigger>
          <TabsTrigger value="charts">Графіки</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
              <CardHeader>
                  <CardTitle>Профіль</CardTitle>
                  <CardDescription>Керуйте налаштуваннями вашого профілю.</CardDescription>
              </CardHeader>
              <CardContent>
                  <SettingsForm />
              </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
            <CategoriesSettings />
        </TabsContent>
        <TabsContent value="appearance">
          <ThemeSettings />
        </TabsContent>
         <TabsContent value="charts">
          <ChartSettings />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
