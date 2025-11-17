// contexts/UserContext.tsx
// User authentication and context management

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers } from '../admin/utils/mockAdminData';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'reviewer' | 'labeler' | 'uploader';
}

interface UserContextType {
    currentUser: User | null;
    login: (email: string) => boolean;
    logout: () => void;
    switchUser: (email: string) => boolean;
    isAdmin: () => boolean;
    isReviewer: () => boolean;
    canCreateTasks: () => boolean;
    canReviewTasks: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'mecado_current_user';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        // Try to restore user from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                return null;
            }
        }

        // Default to jose for development
        const defaultUser = mockUsers.find(u => u.email === 'jose@mecado.com');
        if (defaultUser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
            return defaultUser;
        }

        return null;
    });

    // Save to localStorage whenever user changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [currentUser]);

    const login = (email: string): boolean => {
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
            console.log(`[UserContext] Logged in as ${user.username} (${user.role})`);
            return true;
        }
        console.error(`[UserContext] User not found: ${email}`);
        return false;
    };

    const logout = (): void => {
        setCurrentUser(null);
        console.log('[UserContext] Logged out');
    };

    const switchUser = (email: string): boolean => {
        return login(email);
    };

    const isAdmin = (): boolean => {
        return currentUser?.role === 'admin';
    };

    const isReviewer = (): boolean => {
        return currentUser?.role === 'admin' || currentUser?.role === 'reviewer';
    };

    const canCreateTasks = (): boolean => {
        return currentUser?.role === 'admin';
    };

    const canReviewTasks = (): boolean => {
        return currentUser?.role === 'admin' || currentUser?.role === 'reviewer';
    };

    return (
        <UserContext.Provider
            value={{
                currentUser,
                login,
                logout,
                switchUser,
                isAdmin,
                isReviewer,
                canCreateTasks,
                canReviewTasks,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

// Export User type for use in other files
export type { User };