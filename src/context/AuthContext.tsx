import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'customer' | 'admin';
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string, phone?: string, address?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isMocked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMocked, setIsMocked] = useState(false);

  // We detect if Supabase is actually configured
  const hasSupabase = !!supabase;

  // Local storage keys for mock fallback (ensures preview works perfectly)
  const MOCK_USER_KEY = '2m_cosmetics_mock_user';
  const MOCK_PROFILE_KEY = '2m_cosmetics_mock_profile';

  useEffect(() => {
    if (hasSupabase && supabase) {
      setIsMocked(false);
      // Get initial session
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(initialSession.user.id);
        } else {
          setLoading(false);
        }
      }).catch(err => {
        console.error("Supabase getSession error, switching to mock mode: ", err);
        enableMockFallback();
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      enableMockFallback();
    }
  }, [hasSupabase]);

  const enableMockFallback = () => {
    setIsMocked(true);
    const storedUser = localStorage.getItem(MOCK_USER_KEY);
    const storedProfile = localStorage.getItem(MOCK_PROFILE_KEY);

    if (storedUser && storedProfile) {
      try {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error("Failed to parse mock credentials:", e);
      }
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn("Could not load user profile from profiles table, creating default structure: ", profileError);
        // Fallback profile if row doesn't exist yet
        const defaultProfile: UserProfile = {
          id: userId,
          email: user?.email || '',
          full_name: null,
          phone: null,
          address: null,
          role: 'customer'
        };
        setProfile(defaultProfile);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: string) => {
    setError(null);
    setLoading(true);

    if (isMocked || !supabase) {
      // Simulate SignUp
      const mockId = 'usr_' + Math.random().toString(36).substr(2, 9);
      const mockUser = {
        id: mockId,
        email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { full_name: fullName },
      } as any as User;

      const mockProfile: UserProfile = {
        id: mockId,
        email,
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
        created_at: new Date().toISOString()
      };

      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(mockProfile));

      setUser(mockUser);
      setProfile(mockProfile);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || '',
            address: address || '',
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Under our RLS and Schema, we insert a record in profiles if not done automatically by database triggers
        const { error: profileErr } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              phone: phone || null,
              address: address || null,
              role: 'customer' // Secure: client-side always registers as customer.
            }
          ]);
        
        if (profileErr) {
          console.log("Profile insert handled by trigger or skipped:", profileErr.message);
        }
        
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création de compte.');
      setLoading(false);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    if (isMocked || !supabase) {
      // Simulate SignIn
      const storedProfileStr = localStorage.getItem(MOCK_PROFILE_KEY);
      let mockProfile: UserProfile;

      if (storedProfileStr) {
        mockProfile = JSON.parse(storedProfileStr);
        if (mockProfile.email !== email) {
          // If a new email is trying to connect in mock mode
          mockProfile = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            email,
            full_name: 'Utilisateur de Test',
            phone: '+221 77 000 00 00',
            address: 'Dakar Plateau, Sénégal',
            role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
            created_at: new Date().toISOString()
          };
        }
      } else {
        mockProfile = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email,
          full_name: 'Utilisateur de Test',
          phone: '+221 77 000 00 00',
          address: 'Dakar Plateau, Sénégal',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
          created_at: new Date().toISOString()
        };
      }

      const mockUser = {
        id: mockProfile.id,
        email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        user_metadata: { full_name: mockProfile.full_name }
      } as any as User;

      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(mockProfile));

      setUser(mockUser);
      setProfile(mockProfile);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides ou erreur de connexion.');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    setLoading(true);

    if (isMocked || !supabase) {
      localStorage.removeItem(MOCK_USER_KEY);
      localStorage.removeItem(MOCK_PROFILE_KEY);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setError(null);
    if (!user) return;

    if (isMocked || !supabase) {
      const updated = { ...profile, ...updates } as UserProfile;
      setProfile(updated);
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(updated));
      return;
    }

    try {
      // Under Supabase policy, we update the profile corresponding to the connected user ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          address: updates.address,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isMocked
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
