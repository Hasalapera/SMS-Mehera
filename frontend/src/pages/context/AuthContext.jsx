import React, { createContext, useState, useEffect, useContext, use } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            if (storedUser && storedUser !== "undefined") {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } else {
                setUser(null);
            }
            setLoading(false);
        }
        checkUser();
    }, []);

    // ලොගින් වන විට යූසර්ව අප්ඩේට් කරන ෆන්ක්ෂන් එක
    const login = (userData, userToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        
        setUser(userData);
        setToken(userToken);
    };

    // ලොගවුට් වන විට යූසර්ව අයින් කරන ෆන්ක්ෂන් එක
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        window.location.href = '/'; 
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);