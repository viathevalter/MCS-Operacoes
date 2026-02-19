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
                // Ensure loading stays true until profile is fetched
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                // Determine if we need to fetch profile (e.g. if user changed)
                // For simplicity, fetch if we don't have a user or if ID differs
                if (!user || user.id !== session.user.id) {
                    setLoading(true); // BLOCK UI until profile loads
                    fetchProfile(session.user);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []); // Removed 'user' dependency to avoid loops

    const fetchProfile = async (authUser: AuthUser) => {
        try {
            console.log('AuthContext: Fetching profile for', authUser.email);
            // Updated to use public.profiles table
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role, department, full_name, email')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.error('AuthContext: Error fetching profile:', error);
            } else {
                console.log('AuthContext: Profile found:', profile);
            }

            // Merge auth user with profile data
            const fullUser: User = {
                ...authUser,
                profile: profile ? {
                    role: profile.role as 'admin' | 'user' | 'manager',
                    department_id: profile.department, // Using Name as ID for now since app uses names mostly
                    full_name: profile.full_name,
                    // avatar_url is not in mcs_users yet, so undefined
                } : { role: 'user' },
                isAdmin: profile?.role === 'admin',
            };

            console.log('AuthContext: Setting user:', fullUser);
            setUser(fullUser);
        } catch (err) {
            console.error('AuthContext: Unexpected error fetching profile:', err);
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
