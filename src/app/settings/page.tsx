'use client';

import AppLayout from '@/components/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';
import CategoriesSettings from '@/components/settings/CategoriesSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <AppLayout pageTitle="Налаштування">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профіль</TabsTrigger>
          <TabsTrigger value="categories">Категорії</TabsTrigger>
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
      </Tabs>
    </AppLayout>
  );
}
