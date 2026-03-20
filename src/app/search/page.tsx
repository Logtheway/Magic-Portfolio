'use client';

import { useState } from 'react';
import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ImageOff, ExternalLink, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from 'next/image';

interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  oracle_text?: string;
  image_uris?: {
    normal: string;
    small: string;
  };
  card_faces?: {
    image_uris?: {
      normal: string;
    };
    oracle_text?: string;
  }[];
  scryfall_uri: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        if (response.status === 404) {
          setResults([]);
          return;
        }
        throw new Error('Failed to fetch from Scryfall');
      }
      const data = await response.json();
      setResults(data.data || []);
    } catch (err) {
      setError('An error occurred while searching for cards.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOracleText = (card: ScryfallCard) => {
    if (card.oracle_text) return card.oracle_text;
    if (card.card_faces) {
      return card.card_faces.map(face => `${face.oracle_text || ''}`).join('\n---\n');
    }
    return "No oracle text available.";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <h2 className="text-4xl font-headline font-bold text-mtg-black">Card Archive</h2>
            <p className="text-muted-foreground mt-1">Black theme active. Search the Scryfall databases.</p>
          </header>

          <Card className="border-mtg-black/20">
            <CardHeader>
              <CardTitle className="font-headline">Search the Multiverse</CardTitle>
              <CardDescription>Enter a card name to retrieve its details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mtg-black/50" />
                  <Input 
                    placeholder="e.g. Black Lotus, Lightning Bolt..." 
                    className="pl-10 h-12 bg-secondary/20 border-mtg-black/20 focus-visible:ring-mtg-black"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-mtg-black text-white hover:bg-mtg-black/90 h-12 px-6"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-secondary/20 rounded-xl animate-pulse border border-border/50" />
              ))
            ) : results.length > 0 ? (
              results.map((card) => {
                const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
                
                return (
                  <Card 
                    key={card.id} 
                    className="group overflow-hidden bg-card/50 border-mtg-black/10 hover:border-mtg-black/50 transition-all cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="relative aspect-[2/3] w-full">
                      {imageUrl ? (
                        <Image 
                          src={imageUrl} 
                          alt={card.name} 
                          fill 
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-secondary/40 text-muted-foreground gap-2">
                          <ImageOff className="w-10 h-10 opacity-20" />
                          <span className="text-xs">No image available</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm truncate">{card.name}</h3>
                        <div className="flex items-center gap-2">
                          <Info className="w-3 h-3 text-mtg-black" />
                          <a 
                            href={card.scryfall_uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-mtg-black hover:text-mtg-black/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.type_line}</p>
                    </CardContent>
                  </Card>
                );
              })
            ) : query && !loading ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 mx-auto text-mtg-black opacity-20" />
                <p className="text-muted-foreground">No cards found matching your query.</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="sm:max-w-[500px] border-mtg-black/30 bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-mtg-black">
              {selectedCard?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {selectedCard?.type_line}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="p-4 rounded-xl bg-secondary/20 border border-mtg-black/10">
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">
                {selectedCard && getOracleText(selectedCard)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border/50">
             <Button variant="ghost" className="text-mtg-black hover:bg-mtg-black/10" asChild>
                <a 
                  href={selectedCard?.scryfall_uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Scryfall
                </a>
             </Button>
             <Button variant="outline" onClick={() => setSelectedCard(null)}>
               Close
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
}
