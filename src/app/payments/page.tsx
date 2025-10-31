import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentsPage() {
  return (
    <AppLayout pageTitle="Регулярні платежі">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Майбутні платежі</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Тут буде список ваших майбутніх регулярних платежів.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Додати новий платіж</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
              Тут буде форма для додавання нових регулярних платежів.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
