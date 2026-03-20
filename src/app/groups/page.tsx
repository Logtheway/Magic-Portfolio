'use client';

import { useState, useMemo } from 'react';
import { Navigation, MobileNav } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Search, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Group } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { localPersistence } from '@/lib/local-persistence';

export default function GroupsPage() {
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [userPlayerIndex, setUserPlayerIndex] = useState<number>(0);

  const handleAddPlayerInput = () => {
    setPlayerNames([...playerNames, '']);
  };

  const handleRemovePlayerInput = (index: number) => {
    const newList = playerNames.filter((_, i) => i !== index);
    setPlayerNames(newList);
    if (userPlayerIndex === index) setUserPlayerIndex(0);
    else if (userPlayerIndex > index) setUserPlayerIndex(userPlayerIndex - 1);
  };

  const handlePlayerNameChange = (index: number, value: string) => {
    const newList = [...playerNames];
    newList[index] = value;
    setPlayerNames(newList);
  };

  const handleCreateGroup = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a group.",
        variant: "destructive"
      });
      return;
    }

    if (!groupName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a group name.",
        variant: "destructive"
      });
      return;
    }

    const players = playerNames
      .filter(name => name.trim() !== '')
      .map((name, index) => ({
        id: `p${Date.now()}-${index}`,
        name: name.trim(),
        isUser: index === userPlayerIndex
      }));

    if (players.length < 1) {
      toast({
        title: "Invalid Members",
        description: "Please add at least one member to the group.",
        variant: "destructive"
      });
      return;
    }

    const groupData = {
      name: groupName.trim(),
      ownerId: user.uid,
      players,
      createdAt: new Date().toISOString()
    };

    if (isLocalUser) {
      localPersistence.saveGroup(groupData);
    } else if (db) {
      const groupsRef = collection(db, 'groups');
      addDoc(groupsRef, { ...groupData, createdAt: serverTimestamp() }).catch(() => {});
    }

    setIsDialogOpen(false);
    setGroupName('');
    setPlayerNames(['']);
    setUserPlayerIndex(0);
    toast({
      title: "Group Created",
      description: `${groupName} has been successfully added to your grimoire.`,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-headline font-bold">Battle Groups</h2>
              <p className="text-muted-foreground mt-1">Green theme active. Tracking distinct metas.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-mtg-green text-white hover:bg-mtg-green/90 shadow-lg shadow-mtg-green/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-mtg-green/50">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-mtg-green">New Battle Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input 
                      id="groupName" 
                      placeholder="e.g. Friday Night Commanders" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Members</Label>
                      <Button variant="ghost" size="sm" onClick={handleAddPlayerInput} className="h-8 text-mtg-green hover:bg-mtg-green/10">
                        <Plus className="w-4 h-4 mr-1" /> Add Player
                      </Button>
                    </div>
                    
                    <RadioGroup 
                      value={userPlayerIndex.toString()} 
                      onValueChange={(v) => setUserPlayerIndex(parseInt(v))}
                      className="space-y-3"
                    >
                      {playerNames.map((name, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border border-border">
                            <RadioGroupItem value={index.toString()} id={`p-${index}`} className="border-mtg-green text-mtg-green" />
                            <Input 
                              placeholder={`Player ${index + 1}`} 
                              className="bg-transparent border-none h-8 p-0 focus-visible:ring-0"
                              value={name}
                              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                            />
                            {index === userPlayerIndex && (
                              <span className="text-[10px] bg-mtg-green/40 px-1.5 py-0.5 rounded font-bold text-mtg-green">YOU</span>
                            )}
                          </div>
                          {playerNames.length > 1 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleRemovePlayerInput(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full bg-mtg-green text-white hover:bg-mtg-green/90" 
                    onClick={handleCreateGroup}
                  >
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mtg-green/50 w-4 h-4" />
            <Input placeholder="Search groups..." className="pl-10 h-12 bg-card border-mtg-green/20 focus-visible:ring-mtg-green" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.length === 0 ? (
              <Card className="col-span-full py-12 text-center border-dashed border-mtg-green/30">
                <Users className="w-12 h-12 mx-auto text-mtg-green opacity-20 mb-4" />
                <h3 className="text-xl font-headline font-semibold">No Groups Found</h3>
                <p className="text-muted-foreground">Create your first group to start logging games.</p>
              </Card>
            ) : (
              groups.map((group) => (
                <Card key={group.id} className="group hover:border-mtg-green transition-all bg-card/50 border-mtg-green/10">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="font-headline text-2xl text-mtg-green">{group.name}</CardTitle>
                        <CardDescription>{group.players.length} Active Players</CardDescription>
                      </div>
                      <div className="w-12 h-12 bg-mtg-green/10 rounded-full flex items-center justify-center text-mtg-green">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex -space-x-2">
                        {group.players.map((p: any) => (
                          <div key={p.id} className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold" title={p.name}>
                            {p.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <Button asChild className="flex-1 bg-mtg-green text-white hover:bg-mtg-green/90">
                          <Link href={`/groups/${group.id}`}>View Analytics</Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild className="border-mtg-green text-mtg-green hover:bg-mtg-green/10">
                          <Link href={`/groups/${group.id}`}>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
