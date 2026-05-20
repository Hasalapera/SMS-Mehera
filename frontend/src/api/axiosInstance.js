import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
            !originalRequest._retry && 
            !originalRequest.url.includes('/users/refresh-token') &&
            !originalRequest.url.includes('/users/login')
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
                const storedRefreshToken = localStorage.getItem('refreshToken');
                if (!storedRefreshToken) {
                    throw new Error('No refresh token available');
                }

                // IMPORTANT: Use standard axios here to bypass our interceptors
                // If we use 'api', a failed refresh would trigger this interceptor again!
                const response = await axios.post('http://localhost:5001/api/users/refresh-token', {
                    refreshToken: storedRefreshToken
                });

                const { accessToken, expiresAt } = response.data;

                // 1. Update localStorage
                localStorage.setItem('accessToken', accessToken);
                if (expiresAt) localStorage.setItem('expiresAt', expiresAt);

                // 2. Set authorization header for the original failed request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // 3. Process all queued requests with the new token
                processQueue(null, accessToken);
                
                // 4. Notify AuthContext to update its React state
                window.dispatchEvent(new Event('token-refreshed'));

                // 5. Retry the original request
                return api(originalRequest);

            } catch (err) {
                // If the refresh call itself fails (e.g. 403 or 401)
                processQueue(err, null);
                
                // Trigger logout in AuthContext via an event
                window.dispatchEvent(new Event('force-logout'));
                
                return Promise.reject(err);
            } finally {
                // Reset the flag regardless of success or failure
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;