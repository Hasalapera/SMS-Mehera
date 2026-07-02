// backend/controllers/orderController.js
const { Order, OrderItem, ProductVariant, Product, User, Customer, SalesTarget } = require('../models');
const sequelize = require('../db/db');
const { sendEmailInvoice } = require('../utils/sendEmailInvoice'); 
const crypto = require('crypto');
const { sendDispatchNotification } = require('../utils/sendDispatchNotification');
const { decrypt } = require('../utils/cryptoUtils');
const { sendDeliveryOTP, sendThankYouEmail } = require('../utils/emailSender');
const { createNotification } = require('./notificationController');
const { Op } = require('sequelize'); // 💡 [ADDED]: Sequelize Operators, Like operations සඳහා

const getOrderNotificationTarget = async (orderLike, fallbackUserId) => {
  if (!orderLike?.customer_id) return fallbackUserId || null;

  const customer = await Customer.findByPk(orderLike.customer_id, {
    attributes: ['sales_rep_id']
  });

  return customer?.sales_rep_id || fallbackUserId || null;
};

// --- 1. current normal orde eka (SALES REP / OFFLINE) ---
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
        try {
          orderJSON.phone = decrypt(orderJSON.phone);
        } catch (e) {
          console.warn(`Could not decrypt order.phone for order ${orderJSON.order_id}`);
        }
      }

      if (orderJSON.customer && orderJSON.customer.phone1) {
        try {
          orderJSON.customer.phone1 = decrypt(orderJSON.customer.phone1);
        } catch (e) {
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

const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const previousStatus = (await Order.findByPk(orderId, { attributes: ['order_status'], transaction }))?.order_status;

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

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

    if (status === 'shipped' && order.order_type === 'online') {
      order.delivery_token = crypto.randomBytes(16).toString('hex');
      order.delivery_otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    }

    order.order_status = status;
    await order.save({ transaction });

    const orderAmount = parseFloat(order.total_amount);
    const repId = order.created_by;
    const orderMonth = order.created_at.toISOString().slice(0, 7);

    if (repId && orderAmount > 0) {
      if (status === 'approved' && previousStatus !== 'approved') {
        await SalesTarget.increment('achieved_amount', {
          by: orderAmount,
          where: { sales_rep_id: repId, month: orderMonth },
          transaction
        });
      }
      else if ((status === 'cancelled' || status === 'rejected') && previousStatus === 'approved') {
        await SalesTarget.decrement('achieved_amount', {
          by: orderAmount,
          where: { sales_rep_id: repId, month: orderMonth },
          transaction
        });
      }

      const target = await SalesTarget.findOne({
        where: { sales_rep_id: repId, month: orderMonth },
        transaction
      });

      if (target) {
        const isNowAchieved = parseFloat(target.achieved_amount) >= parseFloat(target.adjusted_target_amount);
        if (target.is_achieved !== isNowAchieved) {
          await target.update({ is_achieved: isNowAchieved }, { transaction });
        }
      }
    }

    await transaction.commit(); 

    const notificationTargetUserId = await getOrderNotificationTarget(order, order.created_by);

    if (notificationTargetUserId) {
      const severity = ['rejected', 'cancelled'].includes(status) ? 'warning' : 'info';
      await createNotification(
        'order',
        `Order ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
        `Order #${order.order_id.substring(0, 8).toUpperCase()} for ${order.customer_name} is now ${status}.`,
        {
          reference_id: order.order_id,
          target_user_id: notificationTargetUserId,
          severity,
          initiator_id: req.user.user_id
        }
      );
    }

    let whatsappUrl = null;

    if (status === 'shipped' && order.order_type === 'online') {
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

      const messageText = `📦 *MEHERA INTERNATIONAL - DISPATCH ALERT* 📦\n\n*English:*\nYour order has been dispatched!\nOrder Ref: #${order.order_id.substring(0, 8).toUpperCase()}\nCustomer: ${order.customer_name}\nAddress: ${order.shipping_address}\nTotal Amount: LKR ${Number(order.total_amount).toLocaleString()}\n\n*Items:*\n${itemsList}\n\nWhen the courier arrives, click the link below and enter this OTP to confirm delivery:\n*OTP:* ${order.delivery_otp}\n*Link:* ${confirmLink}\n\n---\n*සිංහල:*\nඔබගේ ඇණවුම පිටත් කර යවා ඇත!\nඇණවුම් අංකය: #${order.order_id.substring(0, 8).toUpperCase()}\nපාරිභෝගිකයා: ${order.customer_name}\nලිපිනය: ${order.shipping_address}\nමුළු මුදල: LKR ${Number(order.total_amount).toLocaleString()}\n\nකුරියර් සේවාව පැමිණි පසු, භාණ්ඩ ලැබුණු බව තහවුරු කිරීමට පහත ලින්ක් එක ක්ලික් කර මෙම OTP අංකය ඇතුළත් කරන්න:\n*OTP අංකය:* ${order.delivery_otp}\n*ලින්ක් එක:* ${confirmLink}\n\n---\n*தமிழ்:*\nஉங்கள் ஆர்டர் அனுப்பப்பட்டது!\nஆர்டர் எண்: #${order.order_id.substring(0, 8).toUpperCase()}\nவாடிக்கையாளர்: ${order.customer_name}\nமுகவரி: ${order.shipping_address}\nமொத்த தொகை: LKR ${Number(order.total_amount).toLocaleString()}\n\nகூரியர் வந்ததும், டெலிவரியை உறுதிப்படுத்த கீழே உள்ள இணைப்பைக் கிளிக் செய்து இந்த OTP ஐ உள்ளிடவும்:\n*OTP:* ${order.delivery_otp}\n*இணைப்பு:* ${confirmLink}`;

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

const updateTrackingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tracking_id } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.tracking_id = tracking_id;
    await order.save();

    res.status(200).json({ success: true, message: "Tracking ID updated successfully", order });
  } catch (error) {
    console.error("Tracking Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update tracking info" });
  }
};

// 🛡️ Courier & Landing Page Direct Scan Confirm Delivery Request 
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
    const order = await Order.findByPk(orderId, {
      include: [{ model: Customer, as: 'customer' }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.order_status !== 'shipped') return res.status(400).json({ success: false, message: 'Order is not in shipped status' });
    
    const emailToUse = order.email || (order.customer && order.customer.email);
    if (!emailToUse) return res.status(400).json({ success: false, message: 'No email associated with this order to send OTP.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.delivery_otp = otp;
    await order.save();

    sendDeliveryOTP(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id, otp).catch(console.error);
    res.status(200).json({ success: true, message: 'OTP sent to customer email' });
  } catch (error) {
    console.error("Init Delivery Error:", error);
    res.status(500).json({ success: false, message: 'Failed to initiate delivery' });
  }
};

const verifyDeliveryOTPByRep = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const order = await Order.findByPk(orderId, { include: [{ model: Customer, as: 'customer' }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.order_status !== 'shipped') return res.status(400).json({ success: false, message: 'Order is not in shipped status' });
    if (order.delivery_otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP!' });

    order.order_status = 'delivered';
    await order.save();

    const emailToUse = order.email || (order.customer && order.customer.email);
    if (emailToUse) sendThankYouEmail(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id).catch(console.error);
    res.status(200).json({ success: true, message: 'Order marked as delivered successfully!' });
  } catch (error) {
    console.error("Verify Delivery Error:", error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params; 
    const searchTerm = orderId.trim();

    let order = null;

    // 1. UUID එකක් නම්
    if (searchTerm.length === 36) {
      order = await Order.findByPk(searchTerm, {
        // 🎯 [ADDED order_type]: ෆ්‍රොන්ටෙන්ඩ් එකට ඕඩර් වර්ගය හඳුනාගන්න මේක එකතු කලා
        attributes: ['order_id', 'customer_name', 'order_status', 'tracking_id', 'order_type']
      });
    }

    // 2. Short ID එකක් නම්
    if (!order) {
      order = await Order.findOne({
        where: sequelize.where(
          sequelize.cast(sequelize.col('order_id'), 'text'),
          { [Op.like]: `${searchTerm.toLowerCase()}%` }
        ),
        // 🎯 [ADDED order_type]: මෙතනටත් එකතු කලා මචං
        attributes: ['order_id', 'customer_name', 'order_status', 'tracking_id', 'order_type']
      });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order reference not found in registry" });
    }

    return res.status(200).json(order);

  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    return res.status(500).json({ success: false, message: "Server error tracing order reference" });
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