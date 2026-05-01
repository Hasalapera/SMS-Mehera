const { Order, OrderItem, ProductVariant, Product, User } = require('../models');
const sequelize = require('../db/db');
const { sendEmailInvoice } = require('../utils/sendEmailInvoice'); // 👈 Import එක {} ඇතුළේ තියෙනවාද බලන්න

// --- 1. පවතින සාමාන්‍ය ඕඩර් එක (SALES REP / OFFLINE) ---
const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      customer_id, 
      customer_name, 
      shipping_address, 
      phone, 
      subtotal,              // Total
      discount_percentage,   // % 
      discount_amount,       
      total_amount,          // final total after discount
      items 
    } = req.body;

    const newOrder = await Order.create({
      customer_id, 
      customer_name,     
      shipping_address,
      phone,
      subtotal: subtotal || 0,                    // store sub total
      discount_percentage: discount_percentage || 0, // % store 
      discount_amount: discount_amount || 0,      // store discount amount
      total_amount: total_amount || 0,            // store final payable amount
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
    
    await transaction.commit(); // ✅ කලින්ම Commit කරනවා

    res.status(201).json({ success: true, message: "Order placed successfully!", orderId: newOrder.order_id });
  } catch (error) {
    // ⚠️ Commit වුණාට පස්සේ rollback කරන්න බැරි නිසා මේ condition එක වැදගත්
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// --- 2. ONLINE/RETAIL ORDER  ---
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
      subtotal,              
      discount_percentage,   
      discount_amount,       
      total_amount,          
      items 
    } = req.body;

    const newOrder = await Order.create({
      customer_name, phone: primary_phone, secondary_phone,
      district, shipping_address, email,
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

    // ✅ DB එකේ වැඩේ ඉවරයි - Commit කරනවා
    await transaction.commit();
    // Send discount details while sending email
    if (email) {
      try {
        // await එක අනිවාර්යයි, නැත්නම් හිරවෙන්න පුළුවන්
        await sendEmailInvoice(email, {
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
        });
        console.log(`✅ Invoice sent to ${email}`);
      } catch (emailErr) {
        // ඊමේල් එක ෆේල් වුණත් ඕඩර් එක දැනටමත් සේව් වෙලා තියෙන්නේ
        console.error("❌ Email process failed but order is saved:", emailErr.message);
      }
    }

    res.status(201).json({ success: true, message: "Online Order placed successfully!", orderId: newOrder.order_id });

  } catch (error) {
    // ⚠️ Transaction එක ඉවර නැතිනම් විතරක් Rollback කරන්න
    if (transaction && !transaction.finished) await transaction.rollback();
    
    console.error("Online Order Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to place online order",
      error: error.message 
    });
  }
};

// --- 3. get all orders ---
const getAllOrders = async (req, res) => {
  try {
    // 🕵️ get user id and role from middleware
    const { user_id, role } = req.user; 
    let filter = {};

    // deside filter based on role 
    // Filter by created_by only if not Admin or Manager, Admins and Managers can see all orders, while Sales Reps see only their own.
    if (role !== 'admin' && role !== 'manager') {
      filter = { created_by: user_id };
    }

    const orders = await Order.findAll({
      where: filter, // get order from relevant filter 
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