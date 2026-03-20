'use client';

import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Plus } from 'lucide-react';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Group, Game } from '@/lib/types';
import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { localPersistence } from '@/lib/local-persistence';

export default function GroupAnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const db = useFirestore();

  const { data: fbGroup, loading: groupLoading } = useDoc<Group>(
    db && id ? doc(db, 'groups', id) : null
  );

  const { data: fbGames, loading: gamesLoading } = useCollection<Game>(
    db && id ? query(collection(db, 'games'), where('groupId', '==', id)) : null
  );

  const group = useMemo(() => {
    if (fbGroup) return fbGroup;
    return localPersistence.getGroups().find(g => g.id === id) || null;
  }, [fbGroup, id]);

  const games = useMemo(() => {
    const localGames = localPersistence.getGames(id);
    return [...(fbGames || []), ...localGames].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fbGames, id]);

  const analytics = useMemo(() => {
    if (!group || games.length === 0) return null;

    const playerWins: Record<string, number> = {};
    const commanderPerformance: Record<string, { games: number; wins: number }> = {};

    games.forEach(g => {
      playerWins[g.winnerPlayerId] = (playerWins[g.winnerPlayerId] || 0) + 1;
      g.participants.forEach(p => {
        if (!commanderPerformance[p.commanderName]) commanderPerformance[p.commanderName] = { games: 0, wins: 0 };
        commanderPerformance[p.commanderName].games++;
        if (g.winnerPlayerId === p.playerId) commanderPerformance[p.commanderName].wins++;
      });
    });

    const sortedPlayers = [...group.players].sort((a, b) => (playerWins[b.id] || 0) - (playerWins[a.id] || 0));
    const topCommander = Object.entries(commanderPerformance).sort((a, b) => (b[1].wins / b[1].games) - (a[1].wins / a[1].games))[0]?.[0] || 'N/A';

    return {
      playerWins,
      commanderPerformance,
      sortedPlayers,
      topCommander
    };
  }, [group, games]);

  if (groupLoading && !group) return <div className="p-10 text-center">Loading group...</div>;
  if (!group) return <div className="p-10 text-center text-muted-foreground">Group not found</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-headline font-bold text-mtg-green">{group.name}</h2>
              <p className="text-muted-foreground mt-1">Group Meta Analysis & Trends</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-mtg-green text-white hover:bg-mtg-green/90 shadow-lg shadow-mtg-green/20">
                <Link href="/games/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Game
                </Link>
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-mtg-green/20 border-mtg-green/30">
              <CardHeader className="pb-2">
                <CardDescription>Top Player</CardDescription>
                <CardTitle className="font-headline text-2xl text-mtg-green">{analytics?.sortedPlayers[0]?.name || 'N/A'}</CardTitle>
                <p className="text-sm text-muted-foreground">{analytics?.playerWins[analytics?.sortedPlayers[0]?.id || ''] || 0} Wins</p>
              </CardHeader>
            </Card>
            <Card className="bg-card border-mtg-green/10">
              <CardHeader className="pb-2">
                <CardDescription>Most Fearsome Commander</CardDescription>
                <CardTitle className="font-headline text-2xl truncate text-mtg-green">{analytics?.topCommander || 'N/A'}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-mtg-green/10">
              <CardHeader className="pb-2">
                <CardDescription>Games Recorded</CardDescription>
                <CardTitle className="font-headline text-2xl text-mtg-green">{games.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-mtg-green/10">
              <CardHeader>
                <CardTitle className="font-headline">Player Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.players.map((player, i) => {
                    const sortedPlayers = analytics?.sortedPlayers || [];
                    const playerIndex = sortedPlayers.findIndex(p => p.id === player.id);
                    const rank = playerIndex !== -1 ? playerIndex + 1 : '-';
                    
                    return (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center font-bold text-mtg-green">#{rank}</div>
                          <span className="font-medium">{player.name}</span>
                          {player.isUser && <span className="text-[10px] bg-mtg-green/40 px-1 rounded font-bold text-mtg-green">YOU</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{analytics?.playerWins[player.id] || 0}</span>
                          <span className="text-xs text-muted-foreground ml-1">Wins</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-mtg-green/10">
              <CardHeader>
                <CardTitle className="font-headline">Meta Breakdown</CardTitle>
                <CardDescription>Commander performance in this group.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics && Object.entries(analytics.commanderPerformance).length > 0 ? (
                    Object.entries(analytics.commanderPerformance).slice(0, 5).map(([name, stats]) => (
                      <div key={name} className="flex items-center justify-between p-2 rounded hover:bg-secondary/20 transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">{stats.games} matches</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-mtg-green">{((stats.wins / stats.games) * 100).toFixed(0)}% Win Rate</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">No battle data yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
