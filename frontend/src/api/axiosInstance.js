import axios from 'axios';
import { useAuth } from '../pages/context/AuthContext'; // ⚠️ Can't use hooks in file

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true  // ✅ Send HttpOnly cookies
});

// REQUEST interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken'); // Assuming token is stored
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        
        if (status === 401) {
            console.warn('🔴 Session expired or invalid token!');
            
            // Clear auth
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            
            // Redirect
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;