'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser as useUserHook } from './auth/use-user';
import { useAuth, useFirestore, useFirebaseApp } from './provider';

export function initializeFirebase() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  return { app, firestore, auth };
}

export { FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection, useDoc };
export { useFirestore, useAuth, useFirebaseApp };

export function useUser() {
  const auth = useAuth();
  return useUserHook(auth);
}
