import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../../api/axiosInstance';

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
    
    const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    const [loading, setLoading] = useState(true);
    const [isTokenExpiring, setIsTokenExpiring] = useState(false);

    // LOGIN
    const login = (userData, userToken, refreshUserToken, expiresAt) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', userToken);
        localStorage.setItem('refreshToken', refreshUserToken);
        localStorage.setItem('expiresAt', expiresAt);
        
        setUser(userData);
        setToken(userToken);
        setRefreshToken(refreshUserToken);
        setIsTokenExpiring(false);
        
        console.log('✅ User logged in:', userData.email);
    };

    // REFRESH ACCESS TOKEN
    const refreshAccessTokenFn = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            
            if (!storedRefreshToken) {
                throw new Error('No refresh token');
            }

            const response = await api.post('/users/refresh-token', {
                refreshToken: storedRefreshToken
            });

            const { accessToken, expiresAt } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('expiresAt', expiresAt);

            setToken(accessToken);
            setIsTokenExpiring(false);

            console.log('✅ Access token refreshed');
            return accessToken;

        } catch (err) {
            console.error('❌ Refresh failed:', err.message);
            logout();
            return null;
        }
    };

    // LOGOUT
    const logout = async (target = '/') => { 
        try {
            await api.post('/users/logout');
        } catch (err) {
            console.warn('Logout request failed');
        } finally {
            // Clear all session data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('expiresAt');
            
            setUser(null);
            setToken(null);
            setRefreshToken(null);
            setIsTokenExpiring(false);
            
            // 🔴 මෙතනයි උඹේ logic එක: 
            // manual logout එකේදී '/' එකට යනවා, expiry එකේදී '/login' එකට යනවා
            window.location.href = target;
        }
    };

    // 2. Token Expiry Check කරන තැන
    const checkTokenExpiry = async () => {
        const expiresAt = localStorage.getItem('expiresAt');
        if (!expiresAt) return;

        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = parseInt(expiresAt) - now;

        if (secondsLeft <= 120 && secondsLeft > 0) {
            console.log('⏰ Token expiring soon, refreshing...');
            await refreshAccessTokenFn();
        } else if (secondsLeft <= 0) {
            console.warn('⏰ Token expired!');
            
            // 🔴 සෙෂන් එක ඉවර වුණොත් විතරක් බලෙන් Login එකට යවන්න
            logout('/login'); 
        }
    };

    // INIT & MONITOR
    useEffect(() => {
        checkTokenExpiry();
        
        const interval = setInterval(() => {
            checkTokenExpiry();
        }, 60000); // Every 1 minute check

        setLoading(false);
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider 
            value={{ user, token, refreshToken, login, logout, loading, isTokenExpiring }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);