import React, { useEffect, useState } from 'react';
import db from '../db/offlineDb';
import api from '../api/axiosInstance';
import { useAuth } from '../pages/context/AuthContext';
import { toast } from 'react-hot-toast';

const OfflineSyncManager = () => {
    const { token } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const syncOrders = async () => {
            // If there's no internet connection, or if a sync is already in progress, exit the function early to prevent unnecessary operations.
            // If the user is offline, there's no point in trying to sync orders. If a sync is already happening, we don't want to start another one concurrently, which could lead to race conditions or duplicate submissions.
            // This check ensures that the sync process only runs when the user is online, has a valid token, and is not already syncing.
            if (!navigator.onLine || !token || isSyncing) return;

            try {
                const pendingOrders = await db.pendingOrders.where('status').equals('pending').toArray(); // Retrieve all orders from the local IndexedDB that are marked as 'pending'. These are the orders that have been placed while the user was offline and need to be synced with the server once the user is back online.
                if (pendingOrders.length === 0) return;

                setIsSyncing(true); // Set the syncing state to true to indicate that the sync process has started. This can be used to disable certain UI elements or show a loading indicator to the user, preventing them from initiating another sync while one is already in progress.
                let successCount = 0;

                for (const order of pendingOrders) {
                    try {
                        const config = { headers: { Authorization: `Bearer ${token}` } }; // Prepare the configuration for the API request, including the authorization header with the user's token. This ensures that the request is authenticated and can be processed by the server.
                        await api.post('/orders/place', order.payload, config); // Attempt to send the pending order to the server using a POST request. The order's payload contains all the necessary information for the server to process the order. If the request is successful, it means the order has been synced with the server.
                        
                        // If the order is successfully synced with the server, remove it from the local IndexedDB to prevent it from being sent again in future sync attempts. This keeps the local database clean and ensures that only unsynced orders remain.
                        await db.pendingOrders.delete(order.id);
                        successCount++;
                    } catch (err) {
                        console.error("Sync error for order:", order.id, err);
                        // If the server responds with a 400 status code, it indicates a validation error (e.g., stock issues). In this case, we mark the order as 'failed' in the local database to prevent it from being retried indefinitely. This ensures that the user is aware of the issue and can take appropriate action, such as adjusting the order or contacting support.
                        if (err.response && err.response.status === 400) {
                            await db.pendingOrders.update(order.id, { 
                                status: 'failed', 
                                error: err.response.data?.message || 'Validation Error' 
                            });
                        }
                    }
                }

                if (successCount > 0) {
                    toast.success(`${successCount} offline order(s) auto-synced successfully!`, { icon: '🔄' });
                }
            } catch (error) {
                console.error("Sync Manager Error:", error);
            } finally {
                setIsSyncing(false);
            }
        };

        // 📥 Cache Customers for Offline Search
        const cacheCustomers = async () => {
            if (!navigator.onLine || !token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await api.get('/customers/all', config);
                const customers = Array.isArray(res.data) ? res.data : (res.data.customers || []);
                if (customers.length > 0) {
                    await db.customers.clear(); // Clear the existing customers in the local IndexedDB to ensure that we have the most up-to-date customer data. This prevents duplicates and ensures that any changes made on the server side are reflected locally.
                    await db.customers.bulkPut(customers); // Bulk insert the fetched customer data into the local IndexedDB. This allows for offline access to customer information, enabling features like offline search and order placement even when the user is not connected to the internet.
                }
            } catch (err) {
                console.error("Failed to cache customers:", err);
            }
        };

        // 📥 Cache Products for Offline Inventory
        const cacheProducts = async () => {
            if (!navigator.onLine || !token) return;
            try {
                const res = await api.get('/products/getProducts');
                const products = res.data?.products || res.data || [];
                if (products.length > 0) {
                    await db.products.clear();
                    await db.products.bulkPut(products);
                }
            } catch (err) {
                console.error("Failed to cache products:", err);
            }
        };

        window.addEventListener('online', syncOrders);
        const interval = setInterval(syncOrders, 60000); // Check for pending orders every 60 seconds and attempt to sync them with the server. This ensures that any orders placed while offline are automatically sent to the server once the user is back online, improving the user experience and reducing the risk of lost orders.
        syncOrders(); // Initial check
        cacheCustomers(); // 👈 Download customers for offline use
        cacheProducts(); // 👈 Download products for offline use

        return () => {
            window.removeEventListener('online', syncOrders);
            clearInterval(interval);
        };
    }, [token, isSyncing]);

    return null; // UI එකක් පෙන්වන්නේ නෑ, background එකේ දුවන්නේ
};

export default OfflineSyncManager;