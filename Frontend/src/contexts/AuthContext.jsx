import { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            try {
                const user = AuthService.getCurrentUser();
                setUser(user);
            } catch (error) {
                console.error(error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for storage changes in other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'token') {
                const user = AuthService.getCurrentUser();
                setUser(user);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (credentials) => {
        try {
            const data = await AuthService.login(credentials);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await AuthService.register(userData);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logout = () => {
        try {
            AuthService.logout();
            setUser(null);
        } catch (error) {
            console.error(error);
            // Still set user to null even if cleanup fails
            setUser(null);
        }
    };

    const updateProfile = (newProfile) => {
        setUser(prev => ({ ...prev, ...newProfile }));
    };

    const debugAuth = () => {
        return AuthService.debugAuthState();
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        debugAuth
    };

    return (
        <AuthContext.Provider value={value}>
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