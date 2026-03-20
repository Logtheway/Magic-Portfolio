
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Search, Layers, ChevronRight, X, Save, Loader2, Minus, Sword } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Deck, DeckCard } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { localPersistence } from '@/lib/local-persistence';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function DeckBuilderPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const db = useFirestore();
  
  const isLocalUser = useMemo(() => user?.uid?.startsWith('user-'), [user]);

  const { data: firebaseDecks } = useCollection<Deck>(
    db && !isLocalUser ? collection(db, 'decks') : null
  );

  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  useEffect(() => {
    if (isLocalUser && user) {
      setLocalDecks(localPersistence.getDecks(user.uid));
    }
  }, [isLocalUser, user]);

  const decks = useMemo(() => {
    return isLocalUser ? localDecks : (firebaseDecks || []);
  }, [firebaseDecks, localDecks, isLocalUser]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckCommander, setNewDeckCommander] = useState('');

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [newCardName, setNewCardName] = useState('');

  const handleCreateDeck = async () => {
    if (!user) return;
    if (!newDeckName.trim()) {
      toast({ title: "Error", description: "Deck name is required", variant: "destructive" });
      return;
    }

    const deckData = {
      name: newDeckName.trim(),
      commander: newDeckCommander.trim(),
      ownerId: user.uid,
      cards: [],
      createdAt: new Date().toISOString()
    };

    if (isLocalUser) {
      const saved = localPersistence.saveDeck(deckData);
      setLocalDecks(prev => [...prev, saved]);
    } else if (db) {
      const decksRef = collection(db, 'decks');
      addDoc(decksRef, { ...deckData, createdAt: serverTimestamp() }).catch(() => {});
    }

    setIsCreateOpen(false);
    setNewDeckName('');
    setNewDeckCommander('');
    toast({ title: "Success", description: "Deck created successfully" });
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (isLocalUser) {
      localPersistence.deleteDeck(deckId);
      setLocalDecks(prev => prev.filter(d => d.id !== deckId));
    } else if (db) {
      deleteDoc(doc(db, 'decks', deckId)).catch(() => {});
    }
    if (selectedDeck?.id === deckId) setSelectedDeck(null);
    toast({ title: "Deleted", description: "Deck removed from grimoire" });
  };

  const handleAddCard = async () => {
    if (!selectedDeck || !newCardName.trim()) return;

    setIsValidating(true);
    try {
      // Validate card against Scryfall API (fuzzy matching for better UX)
      const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(newCardName.trim())}`);
      
      if (!response.ok) {
        toast({
          title: "Invalid Card",
          description: `"${newCardName}" was not found in the Multiverse. Please check for spelling errors.`,
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      const cardData = await response.json();
      const validatedName = cardData.name; // Use the canonical name from Scryfall

      const updatedCards = [...selectedDeck.cards];
      const existingIndex = updatedCards.findIndex(c => c.name.toLowerCase() === validatedName.toLowerCase());

      if (existingIndex !== -1) {
        updatedCards[existingIndex].count += 1;
      } else {
        updatedCards.push({ name: validatedName, count: 1, category: 'Mainboard' });
      }

      const updatedDeck = { ...selectedDeck, cards: updatedCards };
      saveDeckChanges(updatedDeck);
      setNewCardName('');
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not reach the Scryfall archive. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateCardCount = (cardName: string, delta: number) => {
    if (!selectedDeck) return;

    const updatedCards = selectedDeck.cards.map(c => {
      if (c.name === cardName) {
        return { ...c, count: Math.max(0, c.count + delta) };
      }
      return c;
    }).filter(c => c.count > 0);

    saveDeckChanges({ ...selectedDeck, cards: updatedCards });
  };

  const saveDeckChanges = (updatedDeck: Deck) => {
    setSelectedDeck(updatedDeck);
    if (isLocalUser) {
      localPersistence.updateDeck(updatedDeck);
      setLocalDecks(prev => prev.map(d => d.id === updatedDeck.id ? updatedDeck : d));
    } else if (db) {
      updateDoc(doc(db, 'decks', updatedDeck.id), { cards: updatedDeck.cards }).catch(() => {});
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-headline font-bold text-mtg-colorless uppercase tracking-tighter">Deck Builder</h2>
              <p className="text-muted-foreground mt-1 italic">The Blind Eternities await your designs.</p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-mtg-colorless text-background hover:bg-mtg-colorless/90 font-bold">
                  <Plus className="w-4 h-4 mr-2" />
                  Forging New Deck
                </Button>
              </DialogTrigger>
              <DialogContent className="border-mtg-colorless/30">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-mtg-colorless">Blueprint Initialization</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Deck Name</Label>
                    <Input placeholder="e.g. Eldrazi Unbound" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Commander (Optional)</Label>
                    <Input placeholder="e.g. Zhulodok, Void Gorger" value={newDeckCommander} onChange={e => setNewDeckCommander(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-mtg-colorless text-background font-bold" onClick={handleCreateDeck}>Begin Construction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Deck List Side */}
            <div className="lg:col-span-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10 bg-card border-mtg-colorless/20" placeholder="Search blueprints..." />
              </div>
              
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {decks.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-mtg-colorless/20 rounded-xl opacity-50">
                      <Layers className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No decks drafted yet.</p>
                    </div>
                  ) : (
                    decks.map(deck => (
                      <Card 
                        key={deck.id} 
                        className={cn(
                          "cursor-pointer transition-all border-mtg-colorless/10 hover:border-mtg-colorless/40",
                          selectedDeck?.id === deck.id ? "bg-mtg-colorless/10 border-mtg-colorless/60" : "bg-card/50"
                        )}
                        onClick={() => setSelectedDeck(deck)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-headline">{deck.name}</CardTitle>
                              <CardDescription className="text-xs truncate max-w-[150px]">{deck.commander || 'No Commander'}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Deck Editor Side */}
            <div className="lg:col-span-8">
              {selectedDeck ? (
                <Card className="border-mtg-colorless/20 bg-card/30 backdrop-blur-sm min-h-[600px] flex flex-col">
                  <CardHeader className="border-b border-mtg-colorless/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-3xl font-headline text-mtg-colorless">{selectedDeck.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Sword className="w-3 h-3" /> {selectedDeck.commander || 'Add a commander...'}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{selectedDeck.cards.reduce((acc, c) => acc + c.count, 0)}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cards in Deck</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col">
                    <div className="p-6 space-y-4 border-b border-mtg-colorless/10">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Card Name (e.g. Sol Ring)" 
                          className="flex-1"
                          value={newCardName}
                          onChange={e => setNewCardName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !isValidating && handleAddCard()}
                          disabled={isValidating}
                        />
                        <Button 
                          className="bg-mtg-colorless text-background font-bold min-w-[100px]" 
                          onClick={handleAddCard}
                          disabled={isValidating || !newCardName.trim()}
                        >
                          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add</>}
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-2">
                        {selectedDeck.cards.length === 0 ? (
                          <div className="py-20 text-center opacity-30 italic">
                            Empty void... Add cards to build your army.
                          </div>
                        ) : (
                          selectedDeck.cards.map(card => (
                            <div key={card.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-transparent hover:border-mtg-colorless/20 transition-all">
                              <span className="font-medium">{card.name}</span>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-background/50 rounded-full px-2 py-1 border border-border">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCardCount(card.name, -1)}>
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-4 text-center font-bold text-sm">{card.count}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCardCount(card.name, 1)}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleUpdateCardCount(card.name, -card.count)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-mtg-colorless/20 rounded-2xl bg-card/20 min-h-[600px]">
                  <Layers className="w-16 h-16 text-mtg-colorless opacity-20 mb-4" />
                  <h3 className="text-xl font-headline font-semibold text-mtg-colorless">Select a Blueprint</h3>
                  <p className="text-muted-foreground max-w-xs text-center mt-2">Choose a deck from the list to view its contents or create a new one to begin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
