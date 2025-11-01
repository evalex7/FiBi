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
  Settings,
  X,
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
import { Avatar, AvatarFallback } from './ui/avatar';
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

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const UserAvatar = ({ large = false }: { large?: boolean }) => (
    <Avatar className={cn(large ? "h-16 w-16" : "h-8 w-8")}>
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

  const SidebarMenuContent = () => (
    <>
      <SidebarHeader className="p-0">
          <div className="flex flex-col items-start gap-3 p-4 bg-gradient-to-br from-green-400 to-green-600 text-white">
            <UserAvatar large />
            <div className="flex flex-col">
              <span className="font-semibold text-lg">{familyMember?.name || 'Користувач'}</span>
              <span className="text-sm opacity-90">Мій гаманець</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-white text-gray-800 flex-1">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={getIsActive(item.href)}
                    tooltip={item.label}
                    className="text-gray-600 hover:bg-gray-100 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-600"
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
        <SidebarFooter className="bg-white mt-auto p-4 border-t border-gray-200">
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={getIsActive('/settings')}
                    tooltip="Налаштування"
                     className="text-gray-600 hover:bg-gray-100"
                  >
                    <Link href="/settings">
                      <Settings />
                      <span>Налаштування</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} className="text-gray-600 hover:bg-gray-100">
                        <LogOut />
                        <span>Вийти</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
        </SidebarFooter>
    </>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        
        <Sidebar className="hidden md:flex !bg-white !border-r !border-gray-200">
            <SidebarMenuContent />
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-x-hidden">
          <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{pageTitle}</h1>
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
          
          <main className="flex-1 p-4 md:p-6 mb-16 md:mb-0">
              {children}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-10 md:hidden">
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
