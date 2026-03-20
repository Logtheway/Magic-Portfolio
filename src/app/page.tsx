
'use client';

import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trophy, Users, Sword, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Group, Game } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { localPersistence } from '@/lib/local-persistence';
import { calculateStats } from '@/lib/stats-utils';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  
  const isLocalUser = useMemo(() => user?.uid?.startsWith('user-'), [user]);

  const { data: firebaseGroups } = useCollection<Group>(
    db && !isLocalUser ? collection(db, 'groups') : null
  );
  
  const { data: firebaseGames } = useCollection<Game>(
    db && !isLocalUser ? query(collection(db, 'games'), orderBy('date', 'desc'), limit(10)) : null
  );

  const groups = useMemo(() => {
    if (isLocalUser) {
      return localPersistence.getGroups(user?.uid);
    }
    return firebaseGroups || [];
  }, [firebaseGroups, user?.uid, isLocalUser]);

  const games = useMemo(() => {
    if (isLocalUser) {
      return localPersistence.getGames().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    const all = firebaseGames || [];
    return [...all].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [firebaseGames, isLocalUser]);

  const stats = useMemo(() => calculateStats(user, games, groups), [user, games, groups]);

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-headline font-bold">Magic Toolbox</h2>
              <p className="text-muted-foreground mt-1">Welcome back, Planeswalker. Red theme active.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="border-mtg-red text-mtg-red hover:bg-mtg-red/10">
                <Link href="/tracker">
                  <Plus className="w-4 h-4 mr-2" />
                  Life Tracker
                </Link>
              </Button>
              <Button asChild className="bg-mtg-red text-white hover:bg-mtg-red/90 shadow-lg shadow-mtg-red/20">
                <Link href="/games/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Log New Game
                </Link>
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/50 backdrop-blur border-mtg-red/30">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-mtg-red">
                  <Trophy className="w-4 h-4 mr-1" />
                  Win Rate
                </CardDescription>
                <CardTitle className="text-3xl font-headline">{stats.winRateFormatted}%</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-muted-foreground">
                  <Sword className="w-4 h-4 mr-1" />
                  Battles
                </CardDescription>
                <CardTitle className="text-3xl font-headline">{stats.totalGames}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  Groups
                </CardDescription>
                <CardTitle className="text-3xl font-headline">{stats.activeGroups}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-muted-foreground">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Top Deck
                </CardDescription>
                <CardTitle className="text-xl font-headline truncate">{stats.topCommander}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-mtg-red/20">
              <CardHeader>
                <CardTitle className="font-headline text-mtg-red">Recent Battles</CardTitle>
                <CardDescription>Latest encounters across your playgroups.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No games logged yet.</p>
                  ) : (
                    games.slice(0, 5).map((game) => {
                      const group = groups?.find(g => g.id === game.groupId);
                      const winner = group?.players.find(p => p.id === game.winnerPlayerId);
                      return (
                        <div key={game.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-mtg-red/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              winner?.isUser ? "bg-mtg-red/20 text-mtg-red" : "bg-primary/10 text-primary"
                            )}>
                              <Sword className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{group?.name || 'Unknown Group'}</p>
                              <p className="text-xs text-muted-foreground">{game.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-mtg-red">Winner: {winner?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-muted-foreground">{game.participants.length} Players</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border-mtg-red/10">
                <CardHeader>
                  <CardTitle className="font-headline">Active Groups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groups.map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary transition-colors border border-transparent hover:border-mtg-red/30">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-mtg-red" />
                        <span className="font-medium text-sm">{group.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-mtg-red/20 rounded text-mtg-red font-bold">{group.players.length}</span>
                    </Link>
                  ))}
                  <Button asChild variant="ghost" className="w-full text-mtg-red hover:text-mtg-red hover:bg-mtg-red/10">
                    <Link href="/groups">View All Groups</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
