'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from './Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from './ui/skeleton';

const menuItems = [
  { href: '/dashboard', label: 'Панель', icon: LayoutDashboard },
  { href: '/budgets', label: 'Бюджети', icon: Target },
  { href: '/payments', label: 'Платежі', icon: Repeat },
];

export default function AppLayout({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle: string;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  const getIsActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };
  
  // Render a skeleton layout until we know the screen size
  if (isMobile === null) {
      return (
        <div className="flex min-h-screen w-full">
            <div className="hidden md:flex flex-col w-[256px] border-r">
                <div className="p-3 h-16 border-b flex items-center"><Skeleton className="h-8 w-3/4" /></div>
                <div className="p-3 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="flex flex-col flex-1">
                 <div className="flex h-16 items-center border-b px-6 "><Skeleton className="h-8 w-1/4" /></div>
                 <main className="flex-1 p-4 md:p-6"><Skeleton className="w-full h-full" /></main>
                 <div className="md:hidden h-16 border-t"><Skeleton className="w-full h-full" /></div>
            </div>
        </div>
      )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="w-7 h-7 text-primary" />
              <span className="text-xl font-semibold">Сімейні фінанси</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={getIsActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1">
          {/* Mobile and Desktop Header */}
          <header className="flex h-16 items-center justify-between border-b px-6 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="md:hidden" />
               <div className="flex items-center gap-2 md:hidden">
                 <Logo className="w-7 h-7 text-primary" />
                 <span className="text-xl font-semibold">Сімейні фінанси</span>
               </div>
              <h1 className="hidden md:block text-2xl font-semibold font-headline">{pageTitle}</h1>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 mb-16 md:mb-0">
              {children}
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-10 md:hidden">
            <div className="flex justify-around items-center h-full">
              {menuItems.map((item) => {
                const isActive = getIsActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 w-full h-full",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
}