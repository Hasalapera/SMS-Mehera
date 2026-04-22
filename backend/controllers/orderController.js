const { Order, OrderItem, ProductVariant, Product, User } = require('../models');
const sequelize = require('../db/db');
const sendEmailInvoice = require('../utils/sendEmailInvoice');

// --- 1. පවතින සාමාන්‍ය ඕඩර් එක (SALES REP / OFFLINE) ---
const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      customer_id, 
      customer_name, 
      shipping_address, 
      phone, 
      subtotal,              // 👈 මුලු එකතුව
      discount_percentage,   // 👈 % එක
      discount_amount,       // 👈 LKR amount එක
      total_amount,          // 👈 අවසාන payable එක
      items 
    } = req.body;

    const newOrder = await Order.create({
      customer_id, 
      customer_name,     
      shipping_address,
      phone,
      subtotal: subtotal || 0,                    // 👈 මුලු එකතුව store කරන්න
      discount_percentage: discount_percentage || 0, // 👈 % store කරන්න
      discount_amount: discount_amount || 0,      // 👈 LKR amount store කරන්න
      total_amount: total_amount || 0,            // 👈 අවසාන එක store කරන්න
      order_status: 'pending',
      created_by: req.user.user_id,
      order_type: 'offline'
    }, { transaction });

    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });
    await transaction.commit();

    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully!", 
      orderId: newOrder.order_id 
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// --- 2. අලුතින් එක් කළ ONLINE/RETAIL ORDER එක ---
const placeOnlineOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      customer_name, 
      primary_phone, 
      secondary_phone, 
      district, 
      shipping_address, 
      email,
      subtotal,              // 👈 NEW
      discount_percentage,   // 👈 NEW
      discount_amount,       // 👈 NEW
      total_amount,          // 👈 UPDATED
      items 
    } = req.body;

    const newOrder = await Order.create({
      customer_name,
      phone: primary_phone, 
      secondary_phone,
      district,
      shipping_address,
      email,
      subtotal: subtotal || 0,
      discount_percentage: discount_percentage || 0,
      discount_amount: discount_amount || 0,
      total_amount: total_amount || 0,
      order_status: 'pending',
      created_by: req.user.user_id,
      order_type: 'online' 
    }, { transaction });

    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id, 
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });
    await transaction.commit();

    // Email Invoice යවන විට discount details ඇතුළත් කරන්න
    if (email) {
      sendEmailInvoice(email, {
        order_id: newOrder.order_id,
        customer_name,
        subtotal,
        discount_percentage,
        discount_amount,
        total_amount,
        shipping_address,
        district,
        primary_phone,
        items 
      }).catch(err => console.error("Email Failed:", err));
    }

    res.status(201).json({ 
      success: true, 
      message: "Online Order placed successfully!", 
      orderId: newOrder.order_id 
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Online Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to place online order",
      error: error.message 
    });
  }
};

// --- 3. පවතින සියලුම ඕඩර් ලබාගැනීමේ FUNCTION එක ---
const getAllOrders = async (req, res) => {
  try {
    // 🕵️ Middleware එකෙන් එන User ID එක සහ Role එක ගමු
    const { user_id, role } = req.user; 

    let filter = {};

    // 🛡️ Role එක අනුව Filter එක තීරණය කරමු
    // Admin හෝ Manager නෙවෙයි නම් විතරක් created_by අනුව filter කරනවා
    if (role !== 'admin' && role !== 'manager') {
      filter = { created_by: user_id };
    }

    const orders = await Order.findAll({
      where: filter, // 👈 අදාළ Filter එක මෙතනට වැටෙනවා
      include: [{
        model: OrderItem,
        include: [{
          model: ProductVariant,
          as: 'variant',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['product_name'] 
          }]
        }]
      },
      {
          model: User,
          as: 'creator',
          attributes: ['name', 'role'] 
        }
    ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { placeOrder, placeOnlineOrder, getAllOrders };