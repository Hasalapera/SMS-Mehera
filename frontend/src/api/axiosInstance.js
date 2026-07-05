import axios from 'axios';

// 1. Get the root URL from environment variables, with a fallback for local development.
const API_ROOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'; // Local dev fallback

// 2. Construct the final baseURL, ensuring it always ends with '/api'.
// This removes any trailing slash from the root URL and then adds '/api'.
const BASE_URL = `${API_ROOT_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true  // ✅ Send HttpOnly cookies
});

// Variables to handle multiple concurrent requests
let isRefreshing = false;
let failedQueue = [];

// Helper to resolve or reject all pending requests in the queue
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const isAuthEndpoint = (url = '') => (
    url.includes('/users/refresh-token') || url.includes('/users/login')
);

// REQUEST interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
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
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        
        // Catch 401 Unauthorized errors
        // Make sure it's not the refresh-token or login route to avoid infinite loops
        if (
            status === 401 && 
            originalRequest &&
            !originalRequest._retry && 
            !isAuthEndpoint(originalRequest.url)
        ) {
            
            if (isRefreshing) {
                // If a refresh is already in progress, put this request in the queue
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest); // Retry request with new token
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${BASE_URL}/users/refresh-token`, null, {
                    withCredentials: true
                });

                const { accessToken, expiresAt } = response.data;

                localStorage.setItem('accessToken', accessToken);
                if (expiresAt) localStorage.setItem('expiresAt', expiresAt);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);

                window.dispatchEvent(new Event('token-refreshed'));

                return api(originalRequest);

            } catch (err) {
                processQueue(err, null);

                window.dispatchEvent(new Event('force-logout'));

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
