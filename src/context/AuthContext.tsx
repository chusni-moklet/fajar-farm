'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UserSession {
  email: string;
}

interface AuthContextProps {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isSimulationMode: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const ADMIN_EMAIL = 'fajar-kand@gmail.com';
const ADMIN_PASS = 'abahsuhar57';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            setUser({ email: session.user.email || '' });
          }
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session && session.user) {
              setUser({ email: session.user.email || '' });
            } else {
              setUser(null);
            }
          });
          
          setLoading(false);
          return () => subscription.unsubscribe();
        } catch (e) {
          console.error("Error checking Supabase session, entering fallback", e);
          setupLocalStorageAuth();
        }
      } else {
        setupLocalStorageAuth();
      }
    };

    const setupLocalStorageAuth = () => {
      const stored = localStorage.getItem('ff_admin_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setUser(parsed);
          }
        } catch {
          localStorage.removeItem('ff_admin_session');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        throw error;
      }
      if (data && data.user) {
        setUser({ email: data.user.email || '' });
        return true;
      }
      return false;
    } else {
      if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
        const session = { email: ADMIN_EMAIL };
        setUser(session);
        localStorage.setItem('ff_admin_session', JSON.stringify(session));
        return true;
      } else {
        throw new Error('Email atau password salah.');
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('ff_admin_session');
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSimulationMode: !isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
