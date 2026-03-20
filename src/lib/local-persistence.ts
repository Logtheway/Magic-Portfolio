
'use client';

/**
 * @fileOverview A utility for local persistence to support prototyping 
 * without a real Firebase API key.
 */

export interface LocalUser {
  uid: string;
  displayName: string;
  username: string;
}

export const localPersistence = {
  // Auth
  getCurrentUser: (): LocalUser | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('mt_user');
    return data ? JSON.parse(data) : null;
  },
  
  saveUser: (user: LocalUser) => {
    localStorage.setItem('mt_user', JSON.stringify(user));
  },
  
  clearUser: () => {
    localStorage.removeItem('mt_user');
  },

  // Groups
  getGroups: (ownerId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('mt_groups');
    const groups = data ? JSON.parse(data) : [];
    if (ownerId) {
      return groups.filter((g: any) => g.ownerId === ownerId);
    }
    return groups;
  },

  saveGroup: (group: any) => {
    const groups = localPersistence.getGroups();
    const newGroup = { ...group, id: `local-g-${Date.now()}` };
    groups.push(newGroup);
    localStorage.setItem('mt_groups', JSON.stringify(groups));
    return newGroup;
  },

  // Games
  getGames: (groupId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('mt_games');
    const games = data ? JSON.parse(data) : [];
    if (groupId) {
      return games.filter((g: any) => g.groupId === groupId);
    }
    return games;
  },

  saveGame: (game: any) => {
    const games = localPersistence.getGames();
    const newGame = { ...game, id: `local-gm-${Date.now()}` };
    games.push(newGame);
    localStorage.setItem('mt_games', JSON.stringify(games));
    return newGame;
  },

  // Decks
  getDecks: (ownerId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('mt_decks');
    const decks = data ? JSON.parse(data) : [];
    if (ownerId) {
      return decks.filter((d: any) => d.ownerId === ownerId);
    }
    return decks;
  },

  saveDeck: (deck: any) => {
    const decks = localPersistence.getDecks();
    const newDeck = { ...deck, id: `local-dk-${Date.now()}` };
    decks.push(newDeck);
    localStorage.setItem('mt_decks', JSON.stringify(decks));
    return newDeck;
  },

  updateDeck: (deck: any) => {
    const decks = localPersistence.getDecks();
    const index = decks.findIndex((d: any) => d.id === deck.id);
    if (index !== -1) {
      decks[index] = deck;
      localStorage.setItem('mt_decks', JSON.stringify(decks));
    }
  },

  deleteDeck: (deckId: string) => {
    const decks = localPersistence.getDecks();
    const filtered = decks.filter((d: any) => d.id !== deckId);
    localStorage.setItem('mt_decks', JSON.stringify(filtered));
  }
};
