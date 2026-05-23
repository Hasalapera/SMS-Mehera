const {Order, Product, User, ProductVariant, UserArea, Customer, Brand, Category,OrderItem, SalesTarget, sequelize} = require('../models');
const { Op } = require('sequelize');

const getSalesReport = async (req, res) => {
    console.log("--- Generating Sales Report Data ---");
    try {
        const { filterType, startDate, endDate } = req.query;
        let start = new Date();
        let end = new Date();

        let dateFilter = {}; // By default, no date filter (for 'all' option)

        // 📅 1. FilterType eka anuwa Date Range eka calculation karamu
        if (filterType === 'daily') {
            if (startDate) start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
            dateFilter = { created_at: { [Op.between]: [start, end] } };
        } else if (filterType === 'monthly') {
            if (startDate) start = new Date(startDate);
            start = new Date(start.getFullYear(), start.getMonth(), 1);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
            dateFilter = { created_at: { [Op.between]: [start, end] } };
        } else if (filterType === 'yearly') {
            if (startDate) start = new Date(startDate);
            start = new Date(start.getFullYear(), 0, 1);
            end = new Date(start.getFullYear(), 12, 0, 23, 59, 59, 999);
            dateFilter = { created_at: { [Op.between]: [start, end] } };
        } else if (filterType === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { created_at: { [Op.between]: [start, end] } };
        }

        // 📡 2. Query execution with Deep Eager Loading
        const rawOrders = await Order.findAll({
            where: {
                order_status: 'approved', // 🔒 Strict Check: Requested orders baha! Approved mthrakmai.
                ...dateFilter // Apply date boundaries dynamically
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
                // 3. Frontend expects `quantity` and `price` directly on the item.
                //    The original `OrderItem` model has `qty` and `price`. Let's map them.
                order.items = order.items.map(item => {
                    return {
                        ...item, // Keep other item data like variant info
                        quantity: item.qty,
                        price: item.price,
                    };
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

const getSalesRepRanking = async (req, res) => {
    try {
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);

        // 1. Get all active sales reps
        const reps = await User.findAll({
            where: { role: 'sales_rep', is_active: true },
            attributes: ['user_id', 'name', 'profile_image']
        });

        const rankings = [];

        for (const rep of reps) {
            // 2. Get Live Sales for the month (Approved, Shipped, Delivered)
            const salesSum = await Order.findOne({
                attributes: [[sequelize.fn('SUM', sequelize.literal('CAST(total_amount AS NUMERIC)')), 'totalSales']],
                where: {
                    created_by: rep.user_id,
                    order_status: ['approved', 'shipped', 'delivered'], 
                    created_at: { [Op.gte]: startDate, [Op.lt]: endDate }
                },
                raw: true
            });
            const achieved = parseFloat(salesSum?.totalSales || 0);

            // 3. Get Target for the month
            const targetData = await SalesTarget.findOne({
                where: { sales_rep_id: rep.user_id, month },
                raw: true
            });
            const target = targetData ? parseFloat(targetData.adjusted_target_amount) : 0;
            
            // 4. Calculate Percentage
            const achievementPercentage = target > 0 ? (achieved / target) * 100 : (achieved > 0 ? 100 : 0);

            rankings.push({
                user_id: rep.user_id,
                name: rep.name,
                profile_image: rep.profile_image,
                achieved,
                target,
                achievementPercentage
            });
        }

        // Sort by highest sales (achieved) descending
        rankings.sort((a, b) => b.achieved - a.achieved);

        res.status(200).json({ success: true, month, rankings });
    } catch (err) {
        console.error("❌ Rep Ranking Error:", err);
        res.status(500).json({ success: false, message: "Failed to generate rep ranking." });
    }
};

module.exports = {
    getSalesReport,
    getSalesRepRanking
};