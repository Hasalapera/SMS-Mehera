//oder.js ekti oderitem.js ekti dektmda data yanva 
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../db/db'); // Database connection එක

const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction(); // Database Transaction එකක් පටන් ගැනීම

  try {
    const { customer_id,customer_name, shipping_address,phone, total_amount, items } = req.body;

    // 1. Order එක සේව් කිරීම (Header)
    const newOrder = await Order.create({
      customer_id,
      customer_name,     
      shipping_address,
      phone,
      total_amount,
      order_status: 'pending'
    }, { transaction });

    // 2. Order Items ටික සේව් කිරීම (Details)
    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    // හැමදේම හරි නම් Transaction එක Commit කරන්න
    await transaction.commit();

    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully!", 
      orderId: newOrder.order_id 
    });

  } catch (error) {
    // මොකක් හරි වැරදුණොත් කරපු දේවල් ඔක්කොම cancel (Rollback) කරන්න
    await transaction.rollback();
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// get all orders with their items
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      // 🛡️ මේ කෑල්ල තමයි වැදගත්ම! Items ටික Join කරලා ගන්නවා.
      include: [{
        model: OrderItem,
        // as: 'OrderItems' // ඔයා association එකේ alias එකක් දුන්නා නම් විතරක් මේක ඕනේ
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { placeOrder , getAllOrders};