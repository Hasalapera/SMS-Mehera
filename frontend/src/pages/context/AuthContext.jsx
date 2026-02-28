import React, { createContext, useState, useEffect, useContext, use } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== "undefined") {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
            setLoading(false);
        }
        checkUser();
    }, []);

    // useEffect(() => {
    //     const storedUser = localStorage.getItem('user');
    //     if (storedUser && storedUser !== "undefined") {
    //         setUser(JSON.parse(storedUser));
    //     }
    //     setLoading(false);
    // }, []);

    // ලොගින් වන විට යූසර්ව අප්ඩේට් කරන ෆන්ක්ෂන් එක
    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // ලොගවුට් වන විට යූසර්ව අයින් කරන ෆන්ක්ෂන් එක
    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);