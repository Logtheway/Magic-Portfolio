
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { User as UserIcon, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { localPersistence } from '@/lib/local-persistence';

export function AuthModal() {
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading || user) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);

    // Using Local Persistence for "No API Key" functionality
    setTimeout(() => {
      try {
        const mockUser = {
          uid: `user-${username.toLowerCase()}`,
          displayName: username,
          username: username
        };
        
        localPersistence.saveUser(mockUser);
        
        toast({
          title: isSignUp ? "Grimoire Initialized" : "Welcome Back",
          description: isSignUp 
            ? `Welcome to the toolbox, ${username}!` 
            : "Your battle records have been restored.",
        });

        // Force a page refresh to update all hooks
        window.location.reload();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Could not initialize your local grimoire.",
        });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[400px] border-accent/20 bg-card/95 backdrop-blur-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <div>
            <DialogTitle className="text-3xl font-headline font-bold">Magic Toolbox</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {isSignUp ? "Create an account to start tracking your journey." : "Enter your credentials to access your records."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="username" 
                placeholder="e.g. JaceBeleren" 
                className="pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-accent text-background hover:bg-accent/90 font-bold"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Create Account" : "Enter Battlefield")}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {isSignUp ? "Already have an account?" : "New to the toolbox?"}
          </span>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-accent hover:underline font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground opacity-50 mt-2">
          Prototyping Mode: Data is stored in your browser.
        </p>
      </DialogContent>
    </Dialog>
  );
}
