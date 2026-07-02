import Dexie from 'dexie';

// 📦 Create a new Dexie database instance
const db = new Dexie('MeheraOfflineDB');

// 🛠️ Define the database schema (Tables and Indexes) - Version 2
db.version(2).stores({
    pendingOrders: 'id, payload, created_at, status', // 'id' will be the unique order_id (UUID)
    customers: 'customer_id, saloon_name, owner_name, phone1, district', // Offline Customer Cache
    products: 'product_id, product_name, category_id, brand_id' // Offline Inventory Cache
});

export default db;