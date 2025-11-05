// --- firebase.ts ---
// This file simulates a Firebase backend for authentication and data storage.
// In a real production app, you would replace the localStorage logic
// with actual calls to the Firebase SDK (Auth and Firestore).

import { UserProgress } from './types';

// --- MOCK USER TYPE ---
interface MockUser {
    uid: string;
    email: string | null;
}

// --- SIMULATED AUTHENTICATION ---

const loadUserFromStorage = (): MockUser | null => {
    const userJson = localStorage.getItem('firebase_currentUser');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            // If parsing fails, the data is corrupt, so remove it.
            localStorage.removeItem('firebase_currentUser');
            return null;
        }
    }
    return null;
};

const auth = {
    _currentUser: loadUserFromStorage(), // Eagerly load user from storage on module initialization
    _listeners: [] as ((user: MockUser | null) => void)[],

    get currentUser(): MockUser | null {
        return this._currentUser; // Now it's just a simple getter for the internal state
    },

    setCurrentUser(user: MockUser | null) {
        this._currentUser = user;
        if (user) {
            localStorage.setItem('firebase_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('firebase_currentUser');
        }
        this._listeners.forEach(listener => listener(user));
    },

    onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
        this._listeners.push(callback);
        // Immediately call with current user state (which is now reliably loaded)
        callback(this.currentUser);
        
        // Return an unsubscribe function
        return () => {
            const index = this._listeners.indexOf(callback);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        };
    }
};

export const signUpWithEmailAndPassword = async (email: string, pass: string): Promise<MockUser> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('firebase_users') || '{}');
            if (users[email]) {
                return reject(new Error("Auth: Email already in use."));
            }
            const uid = `uid_${Date.now()}`;
            users[email] = { uid, pass }; // In real app, hash password
            localStorage.setItem('firebase_users', JSON.stringify(users));
            
            const newUser = { uid, email };
            auth.setCurrentUser(newUser);
            resolve(newUser);
        }, 500);
    });
};

export const signInWithEmailAndPassword = async (email: string, pass: string): Promise<MockUser> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('firebase_users') || '{}');
            if (users[email] && users[email].pass === pass) {
                const user = { uid: users[email].uid, email };
                auth.setCurrentUser(user);
                resolve(user);
            } else {
                reject(new Error("Auth: Invalid credentials."));
            }
        }, 500);
    });
};

export const signOut = async (): Promise<void> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            auth.setCurrentUser(null);
            resolve();
        }, 200);
    });
};

// --- SIMULATED FIRESTORE DATABASE ---

export const getUserProgressFromDb = async (userId: string, defaultProgress: UserProgress): Promise<UserProgress> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const allProgress = JSON.parse(localStorage.getItem('firebase_db_progress') || '{}');
            if (allProgress[userId]) {
                // In a real app, you would also merge with default progress to handle new fields
                const saved = allProgress[userId];
                const hydratedProgress = { ...defaultProgress };
                 (Object.keys(defaultProgress) as Array<keyof UserProgress>).forEach(key => {
                    if (saved[key] !== undefined) {
                        const existingValue = saved[key];
                         if (typeof existingValue === 'object' && existingValue !== null && !Array.isArray(existingValue)) {
                           (hydratedProgress as any)[key] = { ...(hydratedProgress as any)[key], ...existingValue };
                        } else {
                           (hydratedProgress as any)[key] = existingValue;
                        }
                    }
                });
                resolve(hydratedProgress);
            } else {
                // First time user, save default progress
                updateUserProgressInDb(userId, defaultProgress);
                resolve(defaultProgress);
            }
        }, 300);
    });
};

export const updateUserProgressInDb = async (userId: string, progress: UserProgress): Promise<void> => {
    return new Promise((resolve) => {
        // No timeout needed for saving, should be fast.
        const allProgress = JSON.parse(localStorage.getItem('firebase_db_progress') || '{}');
        allProgress[userId] = progress;
        localStorage.setItem('firebase_db_progress', JSON.stringify(allProgress));
        resolve();
    });
};

// Export the simulated auth object to be used with onAuthStateChanged
export { auth };