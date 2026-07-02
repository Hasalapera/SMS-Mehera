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
            // 🛑 අන්තර්ජාලය නැත්නම්, හෝ දැනටමත් sync වෙනවා නම් නවත්වන්න
            if (!navigator.onLine || !token || isSyncing) return;

            try {
                const pendingOrders = await db.pendingOrders.where('status').equals('pending').toArray();
                if (pendingOrders.length === 0) return;

                setIsSyncing(true);
                let successCount = 0;

                for (const order of pendingOrders) {
                    try {
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await api.post('/orders/place', order.payload, config);
                        
                        // ✅ සාර්ථක නම් Local DB එකෙන් අයින් කරනවා
                        await db.pendingOrders.delete(order.id);
                        successCount++;
                    } catch (err) {
                        console.error("Sync error for order:", order.id, err);
                        // ⚠️ 400 Validation Error (e.g. Stock error) ආවොත් infinite loop නොවෙන්න failed කියලා මාක් කරනවා
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
                    await db.customers.clear(); // පරණ Cache එක මකනවා
                    await db.customers.bulkPut(customers); // අලුත් එක දානවා
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
        const interval = setInterval(syncOrders, 60000); // හැම විනාඩියකට සැරයක්ම චෙක් කරනවා
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