"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, MobileNav } from '@/components/Navigation';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Settings2,
  Skull
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PlayerLife {
  id: number;
  name: string;
  life: number;
  color: string;
  isOut: boolean;
}

const COLORS = [
  'bg-mtg-red', 'bg-mtg-blue', 'bg-mtg-green', 'bg-amber-600', 
  'bg-purple-600', 'bg-mtg-white', 'bg-slate-400', 'bg-emerald-600'
];

export default function LifeTrackerPage() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [startLife, setStartLife] = useState(40);
  const [players, setPlayers] = useState<PlayerLife[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(true);

  const initPlayers = () => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      life: startLife,
      color: COLORS[i % COLORS.length],
      isOut: false
    }));
    setPlayers(newPlayers);
    setIsConfiguring(false);
  };

  const updateLife = (id: number, delta: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id && !p.isOut) {
        return { ...p, life: p.life + delta };
      }
      return p;
    }));
  };

  const killPlayer = (id: number) => {
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, isOut: true } : p
    ));
  };

  const resetGame = () => {
    setPlayers(prev => prev.map(p => ({ ...p, life: startLife, isOut: false })));
  };

  if (isConfiguring) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 p-6 md:p-10 flex items-center justify-center">
          <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-mtg-blue shadow-2xl shadow-mtg-blue/10 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold text-mtg-blue">Life Tracker Setup</h2>
              <p className="text-muted-foreground">Blue theme active.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Starting Life</Label>
                <RadioGroup 
                  value={startLife.toString()} 
                  onValueChange={(v) => setStartLife(parseInt(v))}
                  className="grid grid-cols-3 gap-2"
                >
                  {[20, 30, 40].map(val => (
                    <Label 
                      key={val} 
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-all",
                        startLife === val 
                          ? "border-mtg-blue bg-mtg-blue/20 text-white shadow-lg shadow-mtg-blue/10" 
                          : "border-muted bg-popover text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <RadioGroupItem value={val.toString()} className="sr-only" />
                      <span className="text-lg font-bold">{val}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Number of Players</Label>
                <div className="flex items-center justify-between bg-secondary p-4 rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setNumPlayers(Math.max(2, numPlayers - 1))}>
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="text-2xl font-headline font-bold">{numPlayers}</span>
                  <Button variant="ghost" size="icon" onClick={() => setNumPlayers(Math.min(8, numPlayers + 1))}>
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <Button className="w-full h-12 text-lg bg-mtg-blue text-white font-bold hover:bg-mtg-blue/90" onClick={initPlayers}>
                Enter Battlefield
              </Button>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden flex-col md:flex-row">
      <div className="hidden md:block">
        <Navigation />
      </div>
      
      <main className="flex-1 relative flex flex-wrap h-full w-full">
        {players.map((p, idx) => {
          const isLeftSide = idx % 2 === 0;
          
          return (
            <div 
              key={p.id} 
              className={cn(
                "relative flex-1 min-w-[50%] h-1/2 md:h-auto md:flex-[1_1_33%] border border-white/5 flex flex-col items-center justify-center transition-all duration-500 group overflow-hidden",
                p.isOut ? "bg-zinc-900 grayscale" : p.color,
                numPlayers === 4 && idx === 0 && "rotate-180 md:rotate-0",
                numPlayers === 4 && idx === 1 && "rotate-180 md:rotate-0"
              )}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              
              {!p.isOut && (
                <>
                  <button 
                    className="absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center text-6xl opacity-0 active:opacity-100 active:bg-white/10 transition-opacity"
                    onClick={() => updateLife(p.id, 1)}
                  >
                    <Plus className="w-12 h-12" />
                  </button>
                  
                  <button 
                    className="absolute bottom-0 left-0 right-0 h-1/2 flex items-center justify-center text-6xl opacity-0 active:opacity-100 active:bg-black/20 transition-opacity"
                    onClick={() => updateLife(p.id, -1)}
                  >
                    <Minus className="w-12 h-12" />
                  </button>
                </>
              )}
              
              <div className="z-10 text-center pointer-events-none select-none">
                <span className="text-sm font-medium opacity-70 mb-2 block">{p.name} {p.isOut && "(OUT)"}</span>
                <span className={cn(
                  "text-8xl md:text-9xl font-headline font-bold drop-shadow-2xl text-white transition-opacity",
                  p.isOut ? "opacity-30" : "opacity-100"
                )}>
                  {p.life}
                </span>
              </div>

              {p.life <= 0 && !p.isOut && (
                <Button 
                  variant="destructive"
                  size="lg"
                  className={cn(
                    "absolute z-30 top-4 rounded-full h-14 w-14 p-0 shadow-2xl animate-pulse",
                    isLeftSide ? "left-4" : "right-4"
                  )}
                  onClick={() => killPlayer(p.id)}
                >
                  <Skull className="w-7 h-7" />
                </Button>
              )}

              {p.isOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                  <Skull className="w-24 h-24 text-zinc-600 opacity-20 rotate-12" />
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Controls */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 z-50">
          <Button size="icon" variant="secondary" className="rounded-full w-14 h-14 shadow-2xl bg-mtg-blue text-white hover:bg-mtg-blue/90" onClick={resetGame}>
            <RotateCcw className="w-6 h-6" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full w-14 h-14 shadow-2xl bg-mtg-blue text-white hover:bg-mtg-blue/90" onClick={() => setIsConfiguring(true)}>
            <Settings2 className="w-6 h-6" />
          </Button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}