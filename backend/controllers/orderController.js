const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../db/db');
const sendEmailInvoice = require('../utils/sendEmailInvoice'); // 👈 අලුත් utility එක import කරන්න

// --- 1. පවතින සාමාන්‍ය ඕඩර් එක (SALES REP / OFFLINE) ---
const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { customer_id, customer_name, shipping_address, phone, total_amount, items } = req.body;

    const newOrder = await Order.create({
      customer_id, 
      customer_name,     
      shipping_address,
      phone,
      total_amount,
      order_status: 'pending',
      order_type: 'offline'
    }, { transaction });

    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
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
    await transaction.rollback();
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// --- 2. අලුතින් එක් කළ ONLINE/RETAIL ORDER එක (WITH EMAIL) ---
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
      items, 
      total_amount 
    } = req.body;

    // 1. Order Header එක Database එකේ සේව් කිරීම
    const newOrder = await Order.create({
      customer_name,
      phone: primary_phone, 
      secondary_phone,
      district,
      shipping_address,
      email,
      total_amount,
      order_status: 'pending',
      order_type: 'online' 
    }, { transaction });

    // 2. Order Items ටික සේව් කිරීම
    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    //  මුලින්ම Database Transaction එක සාර්ථකව Commit කරනවා
    await transaction.commit();

    //  3. Database එකේ සේව් වුණාට පස්සේ Automatic Email එක යවනවා
    if (email) {
      try {
        // අලුත් ඕඩර් එකේ විස්තර utility එකට යවනවා
        await sendEmailInvoice(email, {
          order_id: newOrder.order_id,
          customer_name,
          total_amount,
          shipping_address,
          district,
          primary_phone,
          items // භාණ්ඩ ලැයිස්තුව ඊමේල් එකේ පෙන්වන්න
        });
        console.log(`Invoice email sent to: ${email}`);
      } catch (mailError) {
        // ඊමේල් එක යවන්න බැරි වුණත් ඕඩර් එක Database එකේ තියෙන නිසා error එකක් යවන්නේ නැහැ
        console.error("Email Sending Failed:", mailError.message);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: "Online Order registered & Invoice sent!", 
      orderId: newOrder.order_id 
    });

  } catch (error) {
    // මොකක් හරි වැරදුණොත් Database එක කලින් තිබූ තත්ත්වයට පත් කරනවා
    if (transaction) await transaction.rollback();
    console.error("Online Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place online order" });
  }
};

// --- 3. පවතින සියලුම ඕඩර් ලබාගැනීමේ FUNCTION එක ---
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { 
  placeOrder, 
  placeOnlineOrder, 
  getAllOrders 
};