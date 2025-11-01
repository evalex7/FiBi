'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Repeat,
  AreaChart,
  LogOut,
  Loader2,
  User as UserIcon,
  Settings
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
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect } from 'react';
import { Button } from './ui/button';
import { doc } from 'firebase/firestore';
import type { FamilyMember } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuItems = [
  { href: '/dashboard', label: 'Панель', icon: LayoutDashboard },
  { href: '/budgets', label: 'Бюджети', icon: Target },
  { href: '/payments', label: 'Платежі', icon: Repeat },
  { href: '/reports', label: 'Звіти', icon: AreaChart },
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
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: familyMember } = useDoc<FamilyMember>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth.signOut();
  };
  
  const getIsActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };
  
  // Skeleton layout to prevent flicker during initial render
  if (isMobile === null) {
      return (
        <div className="flex min-h-screen w-full">
            <div className="hidden md:flex flex-col w-[256px] border-r bg-sidebar">
                <div className="p-3 h-16 border-b flex items-center"><Skeleton className="h-8 w-3/4 bg-sidebar-accent" /></div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                  <Skeleton className="h-10 w-full bg-sidebar-accent" />
                </div>
            </div>
            <div className="flex flex-col flex-1">
                 <div className="flex h-16 items-center border-b px-6 "><Skeleton className="h-8 w-1/4" /></div>
                 <main className="flex-1 p-4 md:p-6"><Skeleton className="w-full h-full" /></main>
                 <div className="md:hidden h-16 border-t"><Skeleton className="w-full h-full" /></div>
            </div>
        </div>
      )
  }

  // Main loader while waiting for user authentication
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const UserAvatar = () => (
    <Avatar className="h-8 w-8">
      {familyMember ? (
        <AvatarFallback style={{ backgroundColor: familyMember.color }} className="text-white font-bold">
          {getInitials(familyMember.name)}
        </AvatarFallback>
      ) : (
        <AvatarFallback>
          <UserIcon className="h-5 w-5" />
        </AvatarFallback>
      )}
    </Avatar>
  );

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
               <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={getIsActive('/settings')}
                    tooltip="Налаштування"
                  >
                    <Link href="/settings">
                      <Settings />
                      <span>Налаштування</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-3 px-2 h-12 text-base">
                  <UserAvatar />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{familyMember?.name || 'User'}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="start">
                <DropdownMenuLabel>{familyMember?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Налаштування</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Вийти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-x-hidden">
          {/* Mobile and Desktop Header */}
          <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl md:text-2xl font-semibold font-headline">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                       <UserAvatar />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                        <p>{familyMember?.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">{familyMember?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Налаштування</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Вийти</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
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
