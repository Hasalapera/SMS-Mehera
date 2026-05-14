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
    const [refreshTokenState, setRefreshTokenState] = useState(localStorage.getItem('refreshToken') || null);
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
        setRefreshTokenState(refreshUserToken);
        setIsTokenExpiring(false);
        
        console.log('✅ User logged in:', userData.email);
    };

    /*
    * eka access token expire wenna kalin refresh token eka use karala automatically aluth access token ekak ganna.
    * 1. Local storage eken refresh token eka gannawa.
    * 2. Refresh token ekak nadda kiyala check karanawa.
    * 3. Token eka thiyenawa nam backend eke refresh-token endpoint ekata request ekak yawanawa.
    * 4. Backend eka refresh token validate karala aluth access token ekak generate karanawa.
    * 5. e aluth access token eka local storage eke save karanawa.
    * 6. React state update karala app eka refresh nokara continue karanna allow karanawa.
    * 7. Refresh process eka success nam token expiring state eka reset karanawa.
    * 8. Mokak hari error ekak unoth (invalid refresh token, expired token, network issue), user wa logout karala login page ekata redirect karanawa.
    * 
    * Me function eka use karanne user wa logout nokara secure widihata
    * session eka maintain karanna. (Example: Facebook, Gmail, Instagram wage apps)
    */
    // PROACTIVE REFRESH ACCESS TOKEN
    const refreshAccessTokenFn = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            
            if (!storedRefreshToken) {
                throw new Error('No refresh token');
            }

            // Using pure api bypasses the response interceptor for this specific route.
            const response = await api.post('/users/refresh-token', {
                refreshToken: storedRefreshToken
            });

            const { accessToken, expiresAt } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('expiresAt', expiresAt);

            setToken(accessToken);
            setIsTokenExpiring(false);

            console.log('✅ Access token refreshed proactively');
            return accessToken;

        } catch (err) {
            console.error('❌ Proactive refresh failed:', err.message);
            // If proactive refresh fails, we log out immediately
            logout('/login');
            return null;
        }
    };

    // LOGOUT

    /*
    * userge current session eka completely end karala system eken safely logout karana eka.
    * 
    * 1. Backend logout endpoint ekata request ekak yawanawa
    *    (server side refresh token/cookie invalidate karanna).
    * 2. Logout request eka fail unath app eka crash wenne na,
    *    catch block eken handle karanawa.
    * 3. Finally block eka always run wenawa (success unath fail unath).
    * 4. Local storage eke thiyena user session data okkoma clear karanawa:
    *      - user details
    *      - access token
    *      - refresh token
    *      - token expire time
    * 5. React state reset karanawa:
    *      - user null karanawa
    *      - token remove karanawa
    *      - refresh token state clear karanawa
    *      - token expiring state false karanawa
    * 6. Last ekedi target path ekata redirect karanawa
    *    (default widihata '/' home page ekata yai).
    * 
    * Me function eka use karanne secure widihata session eka close karanna.
    * Logout unama old token use karala protected routes access karanna bari wenawa.
    */
    const logout = async (target = '/') => { 
        try {
            await api.post('/users/logout');
        } catch (err) {
            console.warn('Logout request failed or already logged out');
        } finally {
            // Clear all session data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('expiresAt');
            
            setUser(null);
            setToken(null);
            setRefreshTokenState(null);
            setIsTokenExpiring(false);
            
            // Redirect
            window.location.href = target;
        }
    };

    // Token Expiry Check (Proactive checks)

    /*
    * access token eka expire wenna lagai da nathnam already expire wela da kiyala check karana eka.
    * 
    * 1. Local storage eken token expire wena time (expiresAt) eka gannawa.
    * 2. expiresAt nattan function eka stop wenawa (return).
    * 3. Current time eka (now) seconds walin gannawa.
    * 4. Token expire wenna thiyena actual time eka calculate karanawa:
    *      secondsLeft = expiresAt - current time
    * 5. Token eka expire wenna lagai nam (BUFFER_TIME athule):
    *      - proactively aluth access token ekak gannawa
    *      - refreshAccessTokenFn() call karanawa
    *      - user logout nokara session eka continue wenawa
    * 6. Token eka already expire wela nam:
    *      - user logout karanawa
    *      - login page ekata redirect karanawa
    * 
    * BUFFER_TIME use karanne token eka actual expire wenna kalin
    * safe side ekata refresh karanna.
    * Example:
    *    Token eka 15 mins nam,
    *    last 2 mins athulata awoth auto refresh wenawa.
    * 
    * Me function eka use karanne secure authentication maintain karanna
    * saha sudden logout avoid karanna.
    * (Example: Gmail, Facebook, Instagram wage systems)
    */
    const checkTokenExpiry = async () => {
        const expiresAt = localStorage.getItem('expiresAt');
        if (!expiresAt) return;

        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = parseInt(expiresAt) - now;

        // SETUP FOR PRODUCTION:
        // Token Expiry: 15 mins (900s)
        // Buffer: 120s (2 mins)
        //
        // SETUP FOR TESTING (60s token):
        // Buffer: 15s
        //
        // NOTE: Make sure your setInterval time below is smaller than this BUFFER_TIME
        const BUFFER_TIME = 120; // Switch to 15 if you are testing with a 60s token!

        if (secondsLeft <= BUFFER_TIME && secondsLeft > 0) {
            console.log('⏳ Token expiring soon, refreshing proactively...');
            await refreshAccessTokenFn();
        } else if (secondsLeft <= 0) {
            console.warn('🔴 Token completely expired! Logging out...');
            // In case the browser tab was asleep and the interceptor didn't catch it
            logout('/login'); 
        }
    };

    // INIT & MONITOR

    /*
    * token system eka continuously manage karanna use wenawa.
    * 1. Page eka load unama token eka eka warak check karanawa.
    * 2. Passe every 30 seconds (or 5 seconds testing) token expiry check karanawa.
    * 3. Token refresh unoth app state update wenawa (event listener).
    * 4. Token fail / invalid unoth auto logout wenawa.
    * 5. Component eka close unama interval + listeners clean karanawa.
    *
    * - Login session eka auto maintain karanna
    * - Expired token walin errors avoid karanna
    * - Secure logout handling
    */
    useEffect(() => {
        checkTokenExpiry();
        
        // ⚙️ Production: 30000 (30s)
        // 🧪 Testing with 60s token: 5000 (5s)
        const interval = setInterval(() => {
            checkTokenExpiry();
        }, 30000); // Switch to 5000 if testing with 60s token!

        // Listen for events dispatched from the Axios Interceptor
        const handleTokenRefreshed = () => {
            setToken(localStorage.getItem('accessToken'));
        };
        const handleForceLogout = () => {
            logout('/login');
        };

        window.addEventListener('token-refreshed', handleTokenRefreshed);
        window.addEventListener('force-logout', handleForceLogout);

        setLoading(false);

        return () => {
            clearInterval(interval);
            window.removeEventListener('token-refreshed', handleTokenRefreshed);
            window.removeEventListener('force-logout', handleForceLogout);
        };
    }, []);

    return (
        <AuthContext.Provider 
            value={{ user, token, refreshToken: refreshTokenState, login, logout, loading, isTokenExpiring }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
