
'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { localPersistence, LocalUser } from '@/lib/local-persistence';

export function useUser(auth: Auth | null) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local persistence first for prototyping mode
    const localUser = localPersistence.getCurrentUser();
    if (localUser) {
      setUser(localUser);
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, [auth]);

  return { user, loading };
}
