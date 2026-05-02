import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [isTokenExpiring, setIsTokenExpiring] = useState(false);

    // LOGIN function
    const login = (userData, userToken, expiresAt) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        localStorage.setItem('expiresAt', expiresAt);
        
        setUser(userData);
        setToken(userToken);
        setIsTokenExpiring(false);
        
        console.log('✅ User logged in:', userData.email);
    };

    // LOGOUT function - 2 versions
    // 1. Manual logout (නිකම logout button එකෙන්)
    const logout = async (isExpired = false) => {
        try {
            // Backend එකට logout request දෙන්න (optional)
            // await api.post('/users/logout');
        } catch (err) {
            console.warn('Logout request failed');
        } finally {
            // Clear all auth data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            
            setUser(null);
            setToken(null);
            setIsTokenExpiring(false);
            
            // 👈 KEY: Token expired නම් /login එකට, නැත්නම් / (Landing)
            if (isExpired) {
                console.warn('🔴 Session expired - redirecting to login');
                window.location.href = '/login';
            } else {
                console.log('👋 Manual logout - redirecting to home');
                window.location.href = '/';
            }
        }
    };

    // CHECK TOKEN EXPIRY
    const checkTokenExpiry = () => {
        const expiresAt = localStorage.getItem('expiresAt');
        if (!expiresAt) {
            setIsTokenExpiring(true);
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = parseInt(expiresAt) - now;

        if (secondsLeft <= 0) {
            console.warn('⏰ Token expired! Auto-logging out...');
            logout(true); // 👈 isExpired = true
        } else if (secondsLeft < 300) { // 5 minutes
            setIsTokenExpiring(true);
            console.log(`⏰ Token expiring in: ${secondsLeft} seconds`);
        } else {
            setIsTokenExpiring(false);
        }
    };

    // INIT & MONITOR
    useEffect(() => {
        checkTokenExpiry();
        
        // Every 10 seconds check
        const interval = setInterval(() => {
            checkTokenExpiry();
        }, 10000);

        setLoading(false);
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider 
            value={{ user, token, login, logout, loading, isTokenExpiring }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);