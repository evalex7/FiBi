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
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from './ui/skeleton';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
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
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

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

  const UserAvatar = ({ className }: { className?: string }) => (
    <Avatar className={cn("h-8 w-8", className)}>
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

  const DesktopNav = () => (
     <nav className="hidden md:flex items-center gap-1 rounded-lg bg-muted p-1">
      {menuItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
            getIsActive(item.href) ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const MobileNavSheet = () => (
    <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Відкрити меню</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-[280px] p-0 flex flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold" onClick={() => setIsMobileSheetOpen(false)}>
                  <Logo className="h-6 w-6" />
                  <span>Сімейні фінанси</span>
              </Link>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    getIsActive(item.href) ? "bg-muted text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
             <div className="mt-auto border-t p-4">
                <Link
                  href="/settings"
                  onClick={() => setIsMobileSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                     getIsActive('/settings') && "text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Налаштування
                </Link>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3 mt-2 text-muted-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Вийти
                </Button>
             </div>
        </SheetContent>
    </Sheet>
  );

  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
             {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex flex-col items-center justify-center px-2 hover:bg-muted group",
                    getIsActive(item.href) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
        </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
           <div className="flex items-center gap-2">
              <MobileNavSheet />
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 font-semibold">
                <Logo className="h-6 w-6" />
                <span className="text-lg">Сімейні фінанси</span>
              </Link>
           </div>
           
            <div className="hidden md:flex flex-1 justify-center">
              <DesktopNav />
            </div>

            <div className="flex w-full flex-1 md:w-auto md:flex-initial justify-end items-center gap-2">
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

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
            {children}
        </main>
        {isMobile && <MobileBottomNav />}
    </div>
  );
}

    