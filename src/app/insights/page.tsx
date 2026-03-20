"use client"

import { useState } from 'react';
import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Zap, Target, Loader2, Info } from 'lucide-react';
import { aiStrategicInsight, AiStrategicInsightOutput } from '@/ai/flows/ai-strategic-insight';
import { MOCK_GAMES, MOCK_GROUPS } from '@/lib/mock-data';

export default function InsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AiStrategicInsightOutput | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Map mock data to AI input format
      const history = MOCK_GAMES.map(g => {
        const group = MOCK_GROUPS.find(gr => gr.id === g.groupId);
        return {
          gameId: g.id,
          winnerPlayerName: group?.players.find(p => p.id === g.winnerPlayerId)?.name || 'Unknown',
          players: g.participants.map(p => ({
            playerName: group?.players.find(pl => pl.id === p.playerId)?.name || 'Unknown',
            commanderName: p.commanderName,
            colorIdentity: p.colorIdentity,
            isUser: p.playerId === 'p1'
          }))
        };
      });

      const result = await aiStrategicInsight({
        userName: 'Alex',
        gameHistory: history
      });
      setInsights(result);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-headline font-bold">Arcane Insights</h2>
              <p className="text-muted-foreground mt-1">AI-driven analysis of your battlefield history.</p>
            </div>
            {!insights && (
              <Button 
                onClick={generateInsights} 
                disabled={loading}
                className="bg-accent text-background hover:bg-accent/90"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Analyze My Games
              </Button>
            )}
          </header>

          {!insights && !loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold">Ready for Analysis</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Click the button above to have our AI analyze your playgroups, commanders, and winning patterns.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-accent animate-pulse" />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <p className="text-muted-foreground animate-bounce">Consulting the Elders of the Multiverse...</p>
            </div>
          )}

          {insights && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent text-lg">
                      <Target className="w-5 h-5" />
                      Strategic Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/90">{insights.strategicSuggestions}</p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary-foreground text-lg">
                      <Zap className="w-5 h-5" />
                      Commander Synergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/90">{insights.commanderSynergies}</p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                      <Info className="w-5 h-5" />
                      Tactical Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/90">{insights.tacticalPatterns}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setInsights(null)}>
                  Clear Analysis
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
