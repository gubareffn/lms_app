import React, {createContext, useState, useEffect, ReactNode, useContext} from 'react';
import axios from 'axios';

// Типы
type UserData = {
    id: string;
    // name: string;
    email: string;
    token: string;
    userType: string;
};

type AuthContextType = {
    user: UserData | null;
    isAuthenticated: boolean;
    login: (userData: UserData) => void;
    logout: () => void;
};

type AuthProviderProps = {
    children: ReactNode;
};


export const AuthContext = createContext<AuthContextType | undefined>(undefined);


function verifyToken(token: string) {
    
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserData | null>(null);


    const login = (userData: UserData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userType', userData.userType);
        localStorage.setItem('userId', userData.id);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get<UserData>('/api/auth/login', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    login(response.data);
                })
                .catch(() => {
                    logout();
                });
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (user) {
                verifyToken(user.token);
            }
        }, 5 * 60 * 1000); // Проверка каждые 5 минут

        return () => clearInterval(interval);
    }, [user]);

    
    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
