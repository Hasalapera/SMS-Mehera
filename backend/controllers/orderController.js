// backend/controllers/orderController.js
const { Order, OrderItem, ProductVariant, Product, User, Customer, SalesTarget } = require('../models');
const sequelize = require('../db/db');
const { sendEmailInvoice } = require('../utils/sendEmailInvoice'); 
const crypto = require('crypto');
const { sendDispatchNotification } = require('../utils/sendDispatchNotification');
const { decrypt } = require('../utils/cryptoUtils');
const { sendDeliveryOTP, sendThankYouEmail } = require('../utils/emailSender');
const { createNotification } = require('./notificationController');
const { Op } = require('sequelize');

const getOrderNotificationTarget = async (orderLike, fallbackUserId) => {
  if (!orderLike?.customer_id) return fallbackUserId || null;

  const customer = await Customer.findByPk(orderLike.customer_id, {
    attributes: ['sales_rep_id']
  });

  return customer?.sales_rep_id || fallbackUserId || null;
};

// --- 1. CURRENT NORMAL ORDER (SALES REP / OFFLINE) ---
const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      order_id,              
      customer_id, 
      customer_name, 
      shipping_address, 
      phone, 
      subtotal,              
      discount_percentage,   
      discount_amount,       
      total_amount,          
      items,
      payment_method         
    } = req.body;

    if (order_id) {
      const existingOrder = await Order.findByPk(order_id, { transaction });
      if (existingOrder) {
        await transaction.rollback();
        return res.status(200).json({ success: true, message: "Order already synced!", orderId: order_id });
      }
    }

    for (const item of items) {
      const variant = await ProductVariant.findByPk(item.variant_id, { 
        include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
        transaction 
      });

      if (!variant || variant.stock_count < item.qty) {
        await transaction.rollback();
        const productName = variant?.product?.product_name || 'Unknown Product';
        const variantName = variant?.variant_name || 'Standard';
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant ? variant.stock_count : 0}. Order cannot be placed.` 
        });
      }
    }

    const newOrder = await Order.create({
      order_id: order_id || undefined, 
      customer_id, 
      customer_name,     
      shipping_address,
      phone,
      subtotal: subtotal || 0,                    
      discount_percentage: discount_percentage || 0, 
      discount_amount: discount_amount || 0,      
      total_amount: total_amount || 0, 
      payment_method: payment_method || 'cash',   
      order_status: 'requested',
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

    const notificationTargetUserId = await getOrderNotificationTarget(newOrder, req.user.user_id);

    await createNotification(
      'order',
      'Order Submitted',
      `Order #${newOrder.order_id.substring(0, 8).toUpperCase()} for ${customer_name} was submitted for approval. Total: LKR ${Number(total_amount || 0).toLocaleString()}.`,
      {
        reference_id: newOrder.order_id,
        target_user_id: notificationTargetUserId,
        severity: 'info',
        initiator_id: req.user.user_id,
      }
    );

    res.status(201).json({ success: true, message: "Order placed successfully!", orderId: newOrder.order_id });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// --- 2. ONLINE/RETAIL ORDER ---
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

    for (const item of items) {
      const variant = await ProductVariant.findByPk(item.variant_id, { 
        include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
        transaction 
      });

      if (!variant || variant.stock_count < item.qty) {
        await transaction.rollback();
        const productName = variant?.product?.product_name || 'Unknown Product';
        const variantName = variant?.variant_name || 'Standard';
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant ? variant.stock_count : 0}. Order cannot be placed.` 
        });
      }
    }

    const newOrder = await Order.create({
      customer_name, phone: primary_phone, secondary_phone,
      district, shipping_address, email,
      subtotal: subtotal || 0,
      discount_percentage: discount_percentage || 0,
      discount_amount: discount_amount || 0,
      total_amount: total_amount || 0,
      order_status: 'requested',
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

    await createNotification(
      'order',
      'Online Order Submitted',
      `Online order #${newOrder.order_id.substring(0, 8).toUpperCase()} for ${customer_name} was submitted. Total: LKR ${Number(total_amount || 0).toLocaleString()}.`,
      {
        reference_id: newOrder.order_id,
        target_user_id: req.user.user_id,
        severity: 'info',
        initiator_id: req.user.user_id,
      }
    );

    if (email) {
      try {
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
        console.error("❌ Email process failed but order is saved:", emailErr.message);
      }
    }

    res.status(201).json({ success: true, message: "Online Order placed successfully!", orderId: newOrder.order_id });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Online Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place online order", error: error.message });
  }
};

// --- 3. GET ALL ORDERS ---
const getAllOrders = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const { customerId } = req.query; 
    let filter = {};

    if (customerId) {
      filter = { customer_id: customerId };
    }
    else if (role !== 'admin' && role !== 'manager' && role !== 'logistics_officer') {
      filter = { created_by: user_id };
    }

    const orders = await Order.findAll({
      where: filter, 
      include: [
        {
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
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['phone1', 'phone2', 'lane1', 'lane2', 'district'] 
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const decryptedOrders = orders.map(order => {
      const orderJSON = order.toJSON();
      if (orderJSON.phone) {
        try { orderJSON.phone = decrypt(orderJSON.phone); } catch (e) {
          console.warn(`Could not decrypt order.phone for order ${orderJSON.order_id}`);
        }
      }

      if (orderJSON.customer && orderJSON.customer.phone1) {
        try { orderJSON.customer.phone1 = decrypt(orderJSON.customer.phone1); } catch (e) {
          console.warn(`Could not decrypt phone1 for customer on order ${orderJSON.order_id}`);
          orderJSON.customer.phone1 = 'Decryption Error';
        }
      }
      return orderJSON;
    });

    res.status(200).json(decryptedOrders);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// --- 4. UPDATE ORDER STATUS (WITH 5-STAGE ONLINE ENGINE) ---
const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = order.order_status;

    // Stock deduction logic on Approval
    if (status === 'approved' && previousStatus !== 'approved') {
      const variantsToUpdate = [];

      for (const item of order.OrderItems) {
        const variant = await ProductVariant.findByPk(item.variant_id, { 
          include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
          transaction 
        });

        if (!variant) continue;

        if (variant.stock_count < item.qty) {
          await transaction.rollback();
          const productName = variant.product?.product_name || 'Unknown Product';
          const variantName = variant.variant_name || 'Standard';
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant.stock_count}. Order cannot be approved.` 
          });
        }

        variantsToUpdate.push({ variant, qtyToDeduct: item.qty });
      }

      for (const update of variantsToUpdate) {
        update.variant.stock_count -= update.qtyToDeduct;
        await update.variant.save({ transaction });
      }
    }

    // 🎯 OTP and Secure Token Generation happens at 'shipped' state for online orders
    if (status === 'shipped' && order.order_type === 'online' && !order.delivery_otp) {
      order.delivery_token = crypto.randomBytes(16).toString('hex');
      order.delivery_otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    }

    order.order_status = status;
    await order.save({ transaction });

    // Target tracking mechanics
    const orderAmount = parseFloat(order.total_amount);
    const repId = order.created_by;
    const orderMonth = order.created_at.toISOString().slice(0, 7);

    if (repId && orderAmount > 0) {
      if (status === 'approved' && previousStatus !== 'approved') {
        await SalesTarget.increment('achieved_amount', { by: orderAmount, where: { sales_rep_id: repId, month: orderMonth }, transaction });
      }
      else if ((status === 'cancelled' || status === 'rejected') && previousStatus === 'approved') {
        await SalesTarget.decrement('achieved_amount', { by: orderAmount, where: { sales_rep_id: repId, month: orderMonth }, transaction });
      }

      const target = await SalesTarget.findOne({ where: { sales_rep_id: repId, month: orderMonth }, transaction });
      if (target) {
        const isNowAchieved = parseFloat(target.achieved_amount) >= parseFloat(target.adjusted_target_amount);
        if (target.is_achieved !== isNowAchieved) {
          await target.update({ is_achieved: isNowAchieved }, { transaction });
        }
      }
    }

    await transaction.commit(); 

    // Notification Hub dispatch trigger
    const notificationTargetUserId = await getOrderNotificationTarget(order, order.created_by);
    if (notificationTargetUserId) {
      const severity = ['rejected', 'cancelled', 'returned'].includes(status) ? 'warning' : 'info';
      await createNotification(
        'order',
        `Order ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
        `Order #${order.order_id.substring(0, 8).toUpperCase()} for ${order.customer_name} is now ${status}.`,
        { reference_id: order.order_id, target_user_id: notificationTargetUserId, severity, initiator_id: req.user.user_id }
      );
    }

    // 🚀 [WHATSAPP DISPATCH SHIFT]: Alert text triggers when order shifts to 'handed_over' state
    let whatsappUrl = null;
    if (status === 'handed_over' && order.order_type === 'online') {
      const fullOrder = await Order.findByPk(orderId, {
        include: [{
          model: OrderItem,
          include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
        }]
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const confirmLink = `${frontendUrl}/confirm-delivery/${order.order_id}/${order.delivery_token}`;
      
      const itemsList = (fullOrder.OrderItems || []).map(item => 
          `- ${item.variant?.product?.product_name || 'Product'} (${item.variant?.variant_name || 'Std'}) x${item.qty}`
      ).join('\n');

      const messageText = `📦 *MEHERA INTERNATIONAL - DISPATCH ALERT* 📦\n\nYour order Ref #${order.order_id.substring(0, 8).toUpperCase()} has been handed over to ${order.courier_name || 'Courier'}.\nTracking Ref: ${order.tracking_id}\n\nUpon delivery, input OTP to confirm:\n*OTP Code:* ${order.delivery_otp}\n*Verify Link:* ${confirmLink}\n\n---\nකුරියර් සේවාව පැමිණි පසු, භාණ්ඩ ලැබුණු බව තහවුරු කිරීමට මෙම OTP අංකය ඇතුළත් කරන්න:\n*OTP අංකය:* ${order.delivery_otp}`;

      let cleanNumber = order.phone.replace(/\D/g, '');
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '94' + cleanNumber.substring(1);
      } else if (cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
        cleanNumber = '94' + cleanNumber;
      }

      whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
      sendDispatchNotification(fullOrder).catch(console.error);
    }

    res.status(200).json({ success: true, message: "Order status updated", order, whatsappUrl });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Status Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

// --- 5. UPDATE COURIER TRACKING LEDGER ---
const updateTrackingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tracking_id, courier_name } = req.body; 

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.tracking_id = tracking_id;
    if (courier_name) {
      order.courier_name = courier_name; 
    }
    
    await order.save();
    res.status(200).json({ success: true, message: "Tracking & Courier info updated", order });
  } catch (error) {
    console.error("Tracking Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update tracking info" });
  }
};

// --- 6. CONFIRM DELIVERY VIA OTP ---
const confirmDeliveryWithOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token, otp } = req.body; 

    const order = await Order.findByPk(orderId, {
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.order_status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Order is already marked as delivered.' });
    }

    if (token) {
        if (order.delivery_token !== token || order.delivery_otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid Link or Incorrect OTP!' });
        }
    } else {
        if (order.delivery_otp !== otp) {
            return res.status(400).json({ success: false, message: 'Incorrect Secure Delivery OTP Code!' });
        }
    }

    order.order_status = 'delivered';
    order.delivery_token = null; 
    order.delivery_otp = null;   
    await order.save();

    const emailToUse = order.email || (order.customer && order.customer.email);
    if (emailToUse) {
      sendThankYouEmail(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id).catch(console.error);
    }

    res.status(200).json({ success: true, message: 'Delivery confirmed successfully!' });
  } catch (error) {
    console.error("Confirm Delivery Error:", error);
    res.status(500).json({ success: false, message: 'Server error confirming delivery' });
  }
};

const initiateDeliveryOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { include: [{ model: Customer, as: 'customer' }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const emailToUse = order.email || (order.customer && order.customer.email);
    if (!emailToUse) return res.status(400).json({ success: false, message: 'No email associated.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.delivery_otp = otp;
    await order.save();

    sendDeliveryOTP(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id, otp).catch(console.error);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const verifyDeliveryOTPByRep = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const order = await Order.findByPk(orderId, { include: [{ model: Customer, as: 'customer' }] });
    if (!order) return res.status(404).json({ success: false });
    if (order.delivery_otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP!' });

    order.order_status = 'delivered';
    await order.save();

    const emailToUse = order.email || (order.customer && order.customer.email);
    if (emailToUse) sendThankYouEmail(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id).catch(console.error);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// --- 7. GET ORDER BY ID (TRACING ENGINE) ---
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params; 
    const searchTerm = orderId.trim();
    let order = null;

    const selectAttributes = ['order_id', 'customer_name', 'order_status', 'tracking_id', 'order_type', 'courier_name'];

    if (searchTerm.length === 36) {
      order = await Order.findByPk(searchTerm, { attributes: selectAttributes });
    }

    if (!order) {
      order = await Order.findOne({
        where: sequelize.where(
          sequelize.cast(sequelize.col('order_id'), 'text'),
          { [Op.like]: `${searchTerm.toLowerCase()}%` }
        ),
        attributes: selectAttributes
      });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order reference not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error tracing order" });
  }
};

module.exports = { 
    placeOrder, 
    placeOnlineOrder, 
    getAllOrders, 
    updateOrderStatus, 
    updateTrackingInfo, 
    confirmDeliveryWithOTP, 
    initiateDeliveryOTP, 
    verifyDeliveryOTPByRep,
    getOrderById
};
