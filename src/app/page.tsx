import Link from 'next/link';
import Image from 'next/image';
import {
  Activity,
  BarChart,
  BrainCircuit,
  PiggyBank,
  Target,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { placeholderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = placeholderImages.find(p => p.id === 'hero-image');
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Сімейні фінанси</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
            <Link href="/dashboard">Почати</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                    Візьміть під контроль фінанси вашої родини
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Наш інтуїтивно зрозумілий додаток для бюджетування допоможе вам відстежувати витрати, створювати
                    бюджети та досягати фінансових цілей разом.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                    <Link href="/dashboard">Почати</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={heroImage.imageHint}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Ключові риси
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                  Все, що вам потрібно для успіху
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Від простого відстеження витрат до аналітики на основі штучного інтелекту, ми вас
                  прикрили.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <div className="grid gap-1">
                 <div className="flex items-center gap-3">
                  <PiggyBank className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Відстеження витрат</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Легко записуйте доходи та витрати. Категоризуйте все для максимальної ясності.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Створення бюджету</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Встановлюйте щомісячні бюджети для різних категорій і дотримуйтесь своїх цілей.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <BarChart className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Фінансові звіти</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Візуалізуйте своє фінансове здоров'я за допомогою проникливих діаграм та графіків.
                </p>
              </div>
              <div className="grid gap-1 lg:col-start-2">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Аналітика на основі ШІ</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Отримуйте розумні пропозиції, щоб оптимізувати свій бюджет і заощаджувати більше грошей, без зусиль.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Сімейні фінанси. Всі права захищено.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Умови обслуговування
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Конфіденційність
          </Link>
        </nav>
      </footer>
    </div>
  );
}
