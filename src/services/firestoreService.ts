import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Mood, Message, Session, StressCategory } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function createSession(mood: Mood) {
  const path = 'sessions';
  try {
    if (!auth.currentUser) throw new Error("Not authenticated");
    
    // We use a specific ID to keep it simple or let Firestore generate
    const sessionData = {
      userId: auth.currentUser.uid,
      mood,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, path), sessionData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function addMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  const path = `sessions/${sessionId}/messages`;
  try {
    const messageData = {
      role,
      content,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, path), messageData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const path = `sessions/${sessionId}/messages`;
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        content: data.content,
        timestamp: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

export async function getUserSessions(): Promise<Session[]> {
  const path = 'sessions';
  try {
    if (!auth.currentUser) return [];
    const q = query(
      collection(db, path), 
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Session[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

export async function finalizeSession(sessionId: string, category: StressCategory) {
  const path = `sessions/${sessionId}`;
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await setDoc(sessionRef, {
      category,
      status: 'completed',
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}
