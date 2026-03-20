
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Heart, 
  Settings,
  ChevronRight,
  Sword,
  LogOut,
  User as UserIcon,
  Search,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { localPersistence } from '@/lib/local-persistence';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Deck Builder', href: '/decks', icon: Layers },
  { name: 'My Stats', href: '/stats', icon: Activity },
  { name: 'Card Search', href: '/search', icon: Search },
  { name: 'Life Tracker', href: '/tracker', icon: Heart },
];

export function Navigation() {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    // Check for local user first
    if (localPersistence.getCurrentUser()) {
      localPersistence.clearUser();
      window.location.reload();
      return;
    }

    if (!auth) return;
    await signOut(auth);
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col sticky top-0 overflow-y-auto hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-headline font-bold text-accent tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sword className="w-5 h-5 text-accent" />
          </div>
          Toolbox
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent")} />
              <span className={cn(isActive ? "text-primary-foreground" : "")}>{item.name}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4 text-primary-foreground" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        {user ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8 border border-accent/20">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.displayName || user.username || user.email?.split('@')[0]}</p>
              <button 
                onClick={handleSignOut}
                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
            <UserIcon className="w-5 h-5" />
            <span>Not Signed In</span>
          </div>
        )}
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-3 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-medium transition-all",
              isActive ? "text-accent" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
