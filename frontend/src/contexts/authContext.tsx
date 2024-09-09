import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
    userId: string;
    email?: string;
    username?: string;
    displayName?: string;
    roles?: string[];
    passwordResetRequired?: boolean;
    isEmailVerified?: boolean;
    exp?: number;
}

interface AuthContextType {
    authState: AuthState | null;
    isLoggedIn: boolean;
    setAuthToken: (token: string) => void;
    logout: () => void;
    updateAuthState: (updates: Partial<AuthState>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const decodeToken = (token: string | null): AuthState | null => {
    if (!token) return null;
    try {
        const decoded: AuthState = jwtDecode<AuthState>(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp > currentTime) {
            return decoded;
        }
    } catch (error) {
        console.error('Error decoding token:', error);
    }
    return null;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const getTokenAuthState = () => {
        const token = localStorage.getItem('token');
        return decodeToken(token);
    };

    const [authState, setAuthState] = useState<AuthState | null>(getTokenAuthState());

    const updateAuthState = (updates: Partial<AuthState>) => {
        //console.log('Updating auth state with:', updates);
        setAuthState(currentState => currentState ? { ...currentState, ...updates } : null);
    };

    const setAuthToken = (token: string) => {
        //console.log('Setting auth token');
        localStorage.setItem('token', token);
        const decoded = decodeToken(token);
        setAuthState(decoded);
    };

    const logout = () => {
        //console.log('Logging out');
        localStorage.removeItem('token');
        setAuthState(null);
        window.location.href = '/'; // Navigate to home page after logout
    };

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        authState,
        isLoggedIn: !!authState,
        setAuthToken,
        logout,
        updateAuthState
    }), [authState]);

    //console.log('AuthProvider rendering with state:', authState);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
