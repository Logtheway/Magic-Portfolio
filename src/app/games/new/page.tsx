'use client';

import { useState, useMemo } from 'react';
import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Group, COLOR_OPTIONS, ColorCombination } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Sword, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { localPersistence } from '@/lib/local-persistence';

interface ParticipantEntry {
  playerId: string;
  commanderName: string;
  colorIdentity: ColorCombination;
  participating: boolean;
}

export default function NewGamePage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const db = useFirestore();
  
  const isLocalUser = useMemo(() => user?.uid?.startsWith('user-'), [user]);

  const { data: firebaseGroups } = useCollection<Group>(
    db && !isLocalUser ? collection(db, 'groups') : null
  );

  const groups = useMemo(() => {
    if (isLocalUser) {
      return localPersistence.getGroups(user?.uid);
    }
    return firebaseGroups || [];
  }, [firebaseGroups, user?.uid, isLocalUser]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [winnerId, setWinnerId] = useState<string>('');
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);

  const selectedGroup = useMemo(() => 
    groups?.find(g => g.id === selectedGroupId), 
    [groups, selectedGroupId]
  );

  const handleGroupChange = (id: string) => {
    setSelectedGroupId(id);
    const group = groups?.find(g => g.id === id);
    if (group) {
      setParticipants(group.players.map(p => ({
        playerId: p.id,
        commanderName: '',
        colorIdentity: 'WUBRG',
        participating: true
      })));
      setWinnerId('');
    }
  };

  const handleParticipantChange = (index: number, field: keyof ParticipantEntry, value: any) => {
    const newList = [...participants];
    newList[index] = { ...newList[index], [field]: value };
    setParticipants(newList);
  };

  const handleLogGame = async () => {
    if (!selectedGroupId || !winnerId || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required game details.",
        variant: "destructive"
      });
      return;
    }

    const gameParticipants = participants
      .filter(p => p.participating)
      .map(p => ({
        playerId: p.playerId,
        commanderName: p.commanderName.trim() || 'Unnamed Commander',
        colorIdentity: p.colorIdentity
      }));

    if (gameParticipants.length < 2) {
      toast({
        title: "Invalid Participants",
        description: "A commander game requires at least 2 participants.",
        variant: "destructive"
      });
      return;
    }

    const gameData = {
      groupId: selectedGroupId,
      date,
      winnerPlayerId: winnerId,
      participants: gameParticipants,
      createdAt: new Date().toISOString()
    };

    if (isLocalUser) {
      // Save Locally (Prototyping Mode)
      localPersistence.saveGame(gameData);
    } else if (db) {
      // Save to Firebase (Cloud Mode)
      const gamesRef = collection(db, 'games');
      addDoc(gamesRef, { 
        ...gameData, 
        createdAt: serverTimestamp() 
      }).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: gamesRef.path,
          operation: 'create',
          requestResourceData: gameData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }

    toast({
      title: "Battle Recorded",
      description: "The game outcome has been etched into history.",
    });
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h2 className="text-4xl font-headline font-bold">Log New Battle</h2>
            <p className="text-muted-foreground mt-1">Record the outcome of your latest commander clash.</p>
          </header>

          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Game Fundamentals</CardTitle>
                <CardDescription>Select the group and set the encounter date.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Battle Group</Label>
                  <Select onValueChange={handleGroupChange} value={selectedGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a playgroup..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Battle Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-10" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedGroup && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">The Participants</CardTitle>
                  <CardDescription>Who played, what they used, and who emerged victorious?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <RadioGroup value={winnerId} onValueChange={setWinnerId} className="space-y-4">
                    {selectedGroup.players.map((player, index) => {
                      const participant = participants[index];
                      if (!participant) return null;

                      return (
                        <div key={player.id} className={`p-4 rounded-xl border transition-all ${participant.participating ? 'bg-secondary/20 border-border' : 'bg-transparent border-transparent opacity-40'}`}>
                          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex items-center gap-3 min-w-[150px]">
                              <Checkbox 
                                checked={participant.participating}
                                onCheckedChange={(checked) => handleParticipantChange(index, 'participating', !!checked)}
                              />
                              <Label className="font-bold flex items-center gap-2">
                                {player.name}
                                {player.isUser && <span className="text-[10px] bg-primary/40 px-1 rounded">YOU</span>}
                              </Label>
                            </div>

                            {participant.participating && (
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Commander</Label>
                                  <Input 
                                    placeholder="Commander Name" 
                                    className="h-9"
                                    value={participant.commanderName}
                                    onChange={(e) => handleParticipantChange(index, 'commanderName', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">Color Identity</Label>
                                  <Select 
                                    value={participant.colorIdentity}
                                    onValueChange={(val) => handleParticipantChange(index, 'colorIdentity', val)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {COLOR_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}

                            {participant.participating && (
                              <div className="flex items-center gap-2 ml-auto">
                                <RadioGroupItem value={player.id} id={`winner-${player.id}`} className="sr-only" />
                                <Label 
                                  htmlFor={`winner-${player.id}`}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${winnerId === player.id ? 'bg-accent text-background border-accent' : 'bg-secondary text-muted-foreground border-border'}`}
                                >
                                  <Trophy className={`w-3.5 h-3.5 ${winnerId === player.id ? 'fill-current' : ''}`} />
                                  <span className="text-xs font-bold">Winner</span>
                                </Label>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button 
                      className="bg-accent text-background hover:bg-accent/90 h-12 px-8 font-bold"
                      onClick={handleLogGame}
                      disabled={!winnerId || participants.filter(p => p.participating).length < 2}
                    >
                      <Sword className="w-4 h-4 mr-2" />
                      Log Battle Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}