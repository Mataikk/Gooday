import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import {
  authenticate,
  countUsers,
  createUser,
  deleteUser,
  getSessionUserId,
  getUser,
  NameTakenError,
  setSessionUserId,
  type User,
} from '@/db/users';

export type AuthError = 'invalid-credentials' | 'name-taken' | 'unknown';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signed-out'; user: null }
  | { status: 'signed-in'; user: User };

type AuthContextValue = AuthState & {
  /** Whether at least one account exists on this device. */
  hasAccounts: boolean;
  signIn: (name: string, password: string) => Promise<AuthError | null>;
  signUp: (name: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });
  const [hasAccounts, setHasAccounts] = useState(false);

  // Restore the previous session on launch.
  useEffect(() => {
    (async () => {
      setHasAccounts((await countUsers(db)) > 0);
      const userId = await getSessionUserId(db);
      const user = userId === null ? null : await getUser(db, userId);
      setState(user ? { status: 'signed-in', user } : { status: 'signed-out', user: null });
    })().catch((e) => {
      console.error('Failed to restore session', e);
      setState({ status: 'signed-out', user: null });
    });
  }, [db]);

  const startSession = async (user: User) => {
    await setSessionUserId(db, user.id);
    setHasAccounts(true);
    setState({ status: 'signed-in', user });
  };

  const value: AuthContextValue = {
    ...state,
    hasAccounts,

    async signIn(name, password) {
      try {
        const user = await authenticate(db, name.trim(), password);
        if (!user) return 'invalid-credentials';
        await startSession(user);
        return null;
      } catch (e) {
        console.error('Sign-in failed', e);
        return 'unknown';
      }
    },

    async signUp(name, password) {
      try {
        const user = await createUser(db, name.trim(), password);
        await startSession(user);
        return null;
      } catch (e) {
        if (e instanceof NameTakenError) return 'name-taken';
        console.error('Sign-up failed', e);
        return 'unknown';
      }
    },

    async signOut() {
      await setSessionUserId(db, null);
      setState({ status: 'signed-out', user: null });
    },

    async deleteAccount() {
      if (state.status !== 'signed-in') return;
      await deleteUser(db, state.user.id);
      await setSessionUserId(db, null);
      setHasAccounts((await countUsers(db)) > 0);
      setState({ status: 'signed-out', user: null });
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** The signed-in user. Only use in screens behind the auth guard. */
export function useCurrentUser(): User {
  const auth = useAuth();
  if (auth.status !== 'signed-in') throw new Error('No signed-in user');
  return auth.user;
}
