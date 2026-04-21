const { Order, OrderItem, ProductVariant, Product } = require('../models');
const sequelize = require('../db/db');
const sendEmailInvoice = require('../utils/sendEmailInvoice');

// --- 1. පවතින සාමාන්‍ය ඕඩර් එක (SALES REP / OFFLINE) ---
const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { customer_id, customer_name, shipping_address, phone, total_amount, items } = req.body;

    const newOrder = await Order.create({
      customer_id, 
      customer_name,     
      shipping_address,
      phone, // 👈 නිවැරදි phone එක මෙතනට එන්න ඕනේ
      total_amount,
      order_status: 'pending',
      order_type: 'offline'
    }, { transaction });

    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id, // 👈 මේක තිබුණොත් තමයි නම පේන්නේ
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });
    await transaction.commit();

    res.status(201).json({ success: true, message: "Order placed successfully!", orderId: newOrder.order_id });
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
      customer_name, primary_phone, secondary_phone, 
      district, shipping_address, email, items, total_amount 
    } = req.body;

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

    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id, 
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });
    await transaction.commit();

    if (email) {
      sendEmailInvoice(email, {
        order_id: newOrder.order_id,
        customer_name,
        total_amount,
        shipping_address,
        district,
        primary_phone,
        items 
      }).catch(err => console.error("Email Failed:", err));
    }

    res.status(201).json({ success: true, message: "Online Order Place වුණා!", orderId: newOrder.order_id });
  } catch (error) {
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
        include: [{
          model: ProductVariant,
          as: 'variant',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['product_name'] 
          }]
        }]
      }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { placeOrder, placeOnlineOrder, getAllOrders };