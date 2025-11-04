// --- AuthContext.tsx ---
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from './firebase'; // Using our simulated Firebase service

interface AuthState {
    uid: string;
    email: string | null;
}

interface AuthContextType {
    currentUser: AuthState | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AuthState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user ? { uid: user.uid, email: user.email } : null);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
