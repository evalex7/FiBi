import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { PaymentsProvider } from '@/contexts/payments-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BudgetsProvider } from '@/contexts/budgets-context';
import { CategoriesProvider } from '@/contexts/categories-context';
import { AppThemeProvider } from '@/components/AppThemeProvider';
import { SettingsProvider } from '@/contexts/settings-context';
import ThemeSync from '@/components/ThemeSync';

export const metadata: Metadata = {
  title: 'Сімейні фінанси',
  description: 'Простий спосіб керувати сімейним бюджетом.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'font-body'
        )}
        suppressHydrationWarning
      >
        <AppThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync />
          <FirebaseClientProvider>
            <SettingsProvider>
              <CategoriesProvider>
                <PaymentsProvider>
                  <TransactionsProvider>
                    <BudgetsProvider>
                      {children}
                    </BudgetsProvider>
                  </TransactionsProvider>
                </PaymentsProvider>
              </CategoriesProvider>
            </SettingsProvider>
          </FirebaseClientProvider>
          <Toaster />
        </AppThemeProvider>
      </body>
    </html>
  );
}
