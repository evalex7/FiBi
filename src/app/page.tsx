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
          <span className="font-bold text-xl">Family Finances</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Take Control of Your Family's Finances
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our intuitive budgeting app helps you track spending, create
                    budgets, and achieve your financial goals together.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                    <Link href="/signup">Get Started for Free</Link>
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
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need to Succeed
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From simple expense tracking to AI-powered insights, we've got
                  you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              <div className="grid gap-1">
                 <div className="flex items-center gap-3">
                  <PiggyBank className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Expense Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Easily record income and expenses. Categorize everything for ultimate clarity.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Budget Creation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set monthly budgets for different categories and stay on track with your goals.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <BarChart className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Financial Reports</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visualize your financial health with insightful charts and graphs.
                </p>
              </div>
              <div className="grid gap-1 lg:col-start-2">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">AI-Powered Insights</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get smart suggestions to optimize your budget and save more money, effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Family Finances. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
