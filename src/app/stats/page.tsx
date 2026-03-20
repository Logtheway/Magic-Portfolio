
'use client';

import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Swords, Zap, Palette, BarChart3 } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Game, Group } from '@/lib/types';
import { useMemo } from 'react';
import { localPersistence } from '@/lib/local-persistence';
import { calculateStats } from '@/lib/stats-utils';

export default function StatsPage() {
  const { user } = useUser();
  const db = useFirestore();
  
  const isLocalUser = useMemo(() => user?.uid?.startsWith('user-'), [user]);

  const { data: firebaseGroups } = useCollection<Group>(
    db && !isLocalUser ? collection(db, 'groups') : null
  );
  const { data: firebaseGames } = useCollection<Game>(
    db && !isLocalUser ? collection(db, 'games') : null
  );

  const groups = useMemo(() => {
    if (isLocalUser) {
      return localPersistence.getGroups(user?.uid);
    }
    return firebaseGroups || [];
  }, [firebaseGroups, user?.uid, isLocalUser]);

  const games = useMemo(() => {
    if (isLocalUser) {
      return localPersistence.getGames();
    }
    return firebaseGames || [];
  }, [firebaseGames, isLocalUser]);

  const stats = useMemo(() => calculateStats(user, games, groups), [user, games, groups]);

  if (!user || stats.myGamesCount === 0) return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <Swords className="w-8 h-8 text-mtg-white" />
          </div>
          <p className="text-muted-foreground">Log some games where you participated to see your personal stats!</p>
        </div>
      </main>
      <MobileNav />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h2 className="text-4xl font-headline font-bold text-mtg-white">Personal Grimoire</h2>
            <p className="text-muted-foreground mt-1">White theme active. Individual statistics.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-mtg-white/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-mtg-white">
                  <Trophy className="w-4 h-4 mr-1" />
                  Overall Performance
                </CardDescription>
                <CardTitle className="text-4xl font-headline text-mtg-white">{stats.winRateFormatted}%</CardTitle>
                <p className="text-xs text-muted-foreground">{stats.myWins} victories in {stats.myGamesCount} games</p>
              </CardHeader>
            </Card>
            
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Most Played
                </CardDescription>
                <CardTitle className="text-xl font-headline truncate">{stats.mostPlayedCommander}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center">
                  <Palette className="w-4 h-4 mr-1" />
                  Strongest Color
                </CardDescription>
                <CardTitle className="text-xl font-headline">{stats.strongestColor}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-mtg-white/10">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-mtg-white">
                  <Swords className="w-5 h-5" />
                  Commander Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(stats.commanderPerformance).map(([name, s]) => {
                  const rate = (s.wins / s.games) * 100;
                  return (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-mtg-white font-bold">{rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rate} className="h-2 bg-secondary" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-mtg-white/10">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-mtg-white">
                  <BarChart3 className="w-5 h-5" />
                  Color Set Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(stats.colorPerformance).map(([color, s]) => {
                  const rate = (s.wins / s.games) * 100;
                  return (
                    <div key={color} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{color}</span>
                        <span className="text-mtg-white font-bold">{rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rate} className="h-2 bg-secondary" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
