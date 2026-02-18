import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User as AuthUser, Session } from '@supabase/supabase-js';

// Extend the user type to include our profile data
export interface User extends AuthUser {
    profile?: {
        role: 'admin' | 'user' | 'manager';
        department_id?: string;
        full_name?: string;
        avatar_url?: string;
    };
    // Helper to check roles
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: () => Promise<void>; // Simple redirect to login or stub
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser: AuthUser) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            // Merge auth user with profile data
            const fullUser: User = {
                ...authUser,
                profile: profile || { role: 'user' }, // Default to user if no profile
                isAdmin: profile?.role === 'admin',
            };

            setUser(fullUser);
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            // Fallback
            setUser({ ...authUser, isAdmin: false });
        } finally {
            setLoading(false);
        }
    };

    const signIn = async () => {
        // For now, just redirect to a login route or trigger standard supabase UI
        // In this app structure, we might need a dedicated Login page.
        // For dev/test, we can use:
        // await supabase.auth.signInWithOAuth({ provider: 'google' });
        // Or email/password.
        // Let's assume there's a LoginPage component or we use the UI.
        // For this context, we just expose the state.
        console.log('SignIn triggered - implement login UI');
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
