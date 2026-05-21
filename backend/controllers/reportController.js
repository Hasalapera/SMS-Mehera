const {Order, Product, User, ProductVariant, UserArea, Customer, Brand, Category,OrderItem, sequelize} = require('../models');
const { Op } = require('sequelize');

const getSalesReport = async (req, res) => {
    console.log("--- Generating Sales Report Data ---");
    try {
        const { filterType, startDate, endDate } = req.query;
        let start = new Date();
        let end = new Date();

        // 📅 1. FilterType eka anuwa Date Range eka calculation karamu
        if (filterType === 'daily') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (filterType === 'monthly') {
            start = new Date(start.getFullYear(), start.getMonth(), 1);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (filterType === 'yearly') {
            start = new Date(start.getFullYear(), 0, 1);
            end = new Date(start.getFullYear(), 12, 0, 23, 59, 59, 999);
        } else if (filterType === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        }

        // 📡 2. Query execution with Deep Eager Loading
        const rawOrders = await Order.findAll({
            where: {
                order_status: 'approved', // 🔒 Strict Check: Requested orders baha! Approved mthrakmai.
                created_at: {
                    [Op.between]: [start, end]
                }
            },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'name', 'email'] // Order eka dapu rep
                },
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['customer_id', 'saloon_name', 'owner_name', 'district'] // Client details
                },
                {
                    model: OrderItem,
                    // as: 'OrderItems' is the default, which is correct for the query
                    include: [{
                        model: ProductVariant,
                        as: 'variant',
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: [['product_name', 'name']] // FIX: Use correct column 'product_name' and alias to 'name'
                        }]
                    }]
                }
            ],
            order: [['created_at', 'DESC']] // Aluthma ewa issarahata ganna
        });

        // ADAPTER: Transform data to match frontend expectations without changing global models
        const orders = rawOrders.map(orderInstance => {
            const order = orderInstance.toJSON();

            // 1. Frontend expects `sales_rep`, but the query provides `creator`. Let's align them.
            order.sales_rep = order.creator;
            delete order.creator;

            // 2. Frontend expects `items`, but Sequelize's default is `OrderItems`.
            order.items = order.OrderItems;
            if (order.items) {
                // 3. Frontend expects `quantity`, but the model has `qty`.
                order.items = order.items.map(item => {
                    item.quantity = item.qty;
                    delete item.qty;
                    return item;
                });
            }
            delete order.OrderItems;

            return order;
        });

        return res.status(200).json({
            success: true,
            meta: { filterType, start, end, totalOrders: orders.length },
            orders
        });

    } catch (err) {
        console.error("❌ Sales Report Backend Error:", err.stack);
        return res.status(500).json({ error: "Failed to compile sales report data." });
    }
};

module.exports = {
    getSalesReport
};