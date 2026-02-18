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
    signIn: () => Promise<void>;
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
            // Updated to use mcs_users table
            const { data: profile, error } = await supabase
                .from('mcs_users')
                .select('role, department_id, display_name, language')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            // Merge auth user with profile data
            const fullUser: User = {
                ...authUser,
                profile: profile ? {
                    role: profile.role as 'admin' | 'user' | 'manager',
                    department_id: profile.department_id,
                    full_name: profile.display_name,
                    // avatar_url is not in mcs_users yet, so undefined
                } : { role: 'user' },
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
