import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './Logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
      <div className="mb-6 flex items-center gap-2 text-foreground">
        <Logo className="h-7 w-7" />
        <span className="text-2xl font-bold">Сімейні фінанси</span>
      </div>
      {children}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-primary">
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
}
