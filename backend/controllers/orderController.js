// backend/controllers/orderController.js
const { Order, OrderItem, ProductVariant, Product, User, Customer, SalesTarget } = require('../models');
const sequelize = require('../db/db');
const { sendEmailInvoice } = require('../utils/sendEmailInvoice'); 
const crypto = require('crypto');
const { sendDispatchNotification } = require('../utils/sendDispatchNotification');
const { decrypt } = require('../utils/cryptoUtils');
const { sendDeliveryOTP, sendThankYouEmail } = require('../utils/emailSender');
const { createNotification } = require('./notificationController');
const { Op, fn, col, where, cast } = require('sequelize');

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

    const initiator = req.user;
    const shortId = newOrder.order_id.substring(0, 8).toUpperCase();
    const totalFmt = Number(total_amount || 0).toLocaleString();

    // Notification for Admins/Managers
    await createNotification(
      'order',
      `Order by ${initiator.name}`,
      `Order #${shortId} for ${customer_name} was submitted by ${initiator.name}. Total: LKR ${totalFmt}.`,
      {
        reference_id: newOrder.order_id,
        target_role: 'manager', // Target managers (and admins will see it too)
        severity: 'info',
        initiator_id: initiator.user_id,
      }
    );

    // Notification for the Sales Rep who placed it
    await createNotification(
      'order',
      'Your Order Submitted',
      `Your order #${shortId} for ${customer_name} has been submitted for approval. Total: LKR ${totalFmt}.`,
      {
        reference_id: newOrder.order_id,
        target_user_id: initiator.user_id, // Target self
        severity: 'info',
        initiator_id: initiator.user_id,
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

    const initiator = req.user;

    await createNotification(
      'order',
      'Online Order Submitted',
      `Online order #${newOrder.order_id.substring(0, 8).toUpperCase()} for ${customer_name} was submitted. Total: LKR ${Number(total_amount || 0).toLocaleString()}.`,
      {
        reference_id: newOrder.order_id,
        target_role: 'online_store_keeper', // Target relevant role
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

// --- 3. GET ALL ORDERS WITH DECRYPTION MATRIX ---
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

// --- 4. UPDATE ORDER STATUS (WITH 5-STAGE LOGISTICS ROUTING SYSTEM) ---
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

    // 🎯 Courier Handover හෝ Delivery Handover වන විට Secure Tokens / OTP ඔටෝම බිල්ඩ් වෙනවා මචං
    if ((status === 'handed_over' || status === 'handed_over_delivery') && !order.delivery_otp) {
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

    const notificationTargetUserId = await getOrderNotificationTarget(order, order.created_by);

    if (notificationTargetUserId) {
      const severity = ['rejected', 'cancelled', 'returned'].includes(status) ? 'warning' : 'info';
      await createNotification(
        'order',
        `Order ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
        `Order #${order.order_id.substring(0, 8).toUpperCase()} for ${order.customer_name} is now ${status.replace('_', ' ')}.`,
        { reference_id: order.order_id, target_user_id: notificationTargetUserId, severity, initiator_id: req.user.user_id }
      );
    }

    // 🚀 [WHATSAPP DISPATCH ALERT SCRIPT]:
    let whatsappUrl = null;
    if (status === 'handed_over' && order.order_type === 'online') {
      const fullOrder = await Order.findByPk(orderId, {
        include: [{ model: OrderItem, include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] }]
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const confirmLink = `${frontendUrl}/confirm-delivery/${order.order_id}/${order.delivery_token}`;
      const itemsList = (fullOrder.OrderItems || []).map(item => `- ${item.variant?.product?.product_name || 'Product'} x${item.qty}`).join('\n');

      const messageText = `📦 *MEHERA INTERNATIONAL - DISPATCH ALERT* 📦\n\nYour order Ref #${order.order_id.substring(0, 8).toUpperCase()} has been handed over to ${order.courier_name || 'Courier'}.\nTracking Ref: ${order.tracking_id}\n\n*Items:*\n${itemsList}\n\nWhen the courier arrives, click the link below and enter this OTP to confirm delivery:\n*OTP:* ${order.delivery_otp}\n*Link:* ${confirmLink}\n\n---\n*සිංහල:*\nඔබගේ ඇණවුම කුරියර් සේවාවට බාර දී ඇත!\nභාණ්ඩ ලැබුණු පසු, ලැබුණු බව තහවුරු කිරීමට මෙම OTP අංකය ඇතුළත් කරන්න:\n*OTP අංකය:* ${order.delivery_otp}`;

      let cleanNumber = order.phone.replace(/\D/g, '');
      if (cleanNumber.startsWith('0')) cleanNumber = '94' + cleanNumber.substring(1);

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

// --- 5. UPDATE COURIER TRACKING DETAILS ---
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

// --- 6. CONFIRM DELIVERY WITH OTP ---
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
    if (!emailToUse) return res.status(400).json({ success: false, message: 'No email associated with this order to send OTP.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.delivery_otp = otp;
    await order.save();

    sendDeliveryOTP(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id, otp).catch(console.error);
    res.status(200).json({ success: true, message: 'OTP sent to customer email' });
  } catch (error) {
    console.error("Initiate Delivery Error:", error);
    res.status(500).json({ success: false });
  }
};

const verifyDeliveryOTPByRep = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const order = await Order.findByPk(orderId, { include: [{ model: Customer, as: 'customer' }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.delivery_otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP!' });

    order.order_status = 'delivered';
    await order.save();

    const emailToUse = order.email || (order.customer && order.customer.email);
    if (emailToUse) sendThankYouEmail(emailToUse, order.customer_name || order.customer?.saloon_name, order.order_id).catch(console.error);
    res.status(200).json({ success: true, message: 'Order marked as delivered successfully!' });
  } catch (error) {
    console.error("Verify Delivery Error:", error);
    res.status(500).json({ success: false });
  }
};

const getOrderById = async (req, res) => {
  try {
    const rawId = req.params.orderId;

    const id = String(rawId || "")
      .trim()
      .replace(/^#/, "")
      .replace(/^ORD-/i, "");

    if (!id) {
      return res.status(400).json({
        message: "Order reference is required.",
      });
    }

    let whereClause;

    // Short reference search: E6523D85
    if (id.length < 36) {
      whereClause = where(
        fn("UPPER", cast(col("order_id"), "TEXT")),
        {
          [Op.like]: `${id.toUpperCase()}%`,
        }
      );
    } else {
      // Full UUID search
      whereClause = { order_id: id };
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        { model: Customer, as: "customer" },
        { model: User, as: "creator", attributes: ["name", "role"] },
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [
                { model: Product, as: "product" }
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found with the provided reference.",
      });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error("Get Order By ID Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user_id, role } = req.user;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 🛡️ Authorization Check: Admins/Managers can delete any order. 
    // Sales reps can only delete orders they created.
    if (role !== 'admin' && role !== 'manager' && order.created_by !== user_id) {
      return res.status(403).json({ success: false, message: "Access denied. You can only delete your own orders." });
    }

    // Adjust Sales Target if approved order is deleted
    if (order.order_status === 'approved') {
      const orderAmount = parseFloat(order.total_amount);
      const repId = order.created_by;
      const orderMonth = order.created_at.toISOString().slice(0, 7);

      if (repId && orderAmount > 0) {
        await SalesTarget.decrement('achieved_amount', {
          by: orderAmount,
          where: { sales_rep_id: repId, month: orderMonth }
        }).catch(console.error);

        // Re-evaluate target status
        const target = await SalesTarget.findOne({
          where: { sales_rep_id: repId, month: orderMonth }
        });
        if (target) {
          const isNowAchieved = parseFloat(target.achieved_amount) >= parseFloat(target.adjusted_target_amount);
          if (target.is_achieved !== isNowAchieved) {
            await target.update({ is_achieved: isNowAchieved });
          }
        }
      }
    }

    await order.destroy();

    // Create Notification
    await createNotification(
      'order',
      'Order Deleted',
      `Order #${order.order_id.substring(0, 8).toUpperCase()} for ${order.customer_name} was deleted.`,
      {
        reference_id: order.order_id,
        target_user_id: order.created_by,
        severity: 'warning',
        initiator_id: user_id,
      }
    ).catch(err => console.error("Error creating delete notification:", err));

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
};

const updateOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const { 
      subtotal, 
      discount_percentage, 
      discount_amount, 
      total_amount, 
      payment_method, 
      items 
    } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = order.order_status;
    const previousTotalAmount = parseFloat(order.total_amount);
    const newTotalAmount = parseFloat(total_amount);

    // If order was already approved, we handle stock adjustment (restore first, check, then deduct)
    if (previousStatus === 'approved') {
      // 1. Restore stock of the old items
      for (const oldItem of order.OrderItems) {
        const variant = await ProductVariant.findByPk(oldItem.variant_id, { transaction });
        if (variant) {
          variant.stock_count += oldItem.qty;
          await variant.save({ transaction });
        }
      }

      // 2. Validate and deduct stock of the new items
      for (const newItem of items) {
        const variant = await ProductVariant.findByPk(newItem.variant_id, {
          include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
          transaction
        });

        if (!variant || variant.stock_count < newItem.qty) {
          await transaction.rollback();
          const productName = variant?.product?.product_name || 'Unknown Product';
          const variantName = variant?.variant_name || 'Standard';
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${productName} (${variantName}). Requested: ${newItem.qty}, Available: ${variant ? variant.stock_count : 0}.`
          });
        }

        variant.stock_count -= newItem.qty;
        await variant.save({ transaction });
      }

      // 3. Adjust Sales Target
      const repId = order.created_by;
      const orderMonth = order.created_at.toISOString().slice(0, 7);
      if (repId && previousTotalAmount !== newTotalAmount) {
        const diff = newTotalAmount - previousTotalAmount;
        if (diff > 0) {
          await SalesTarget.increment('achieved_amount', {
            by: diff,
            where: { sales_rep_id: repId, month: orderMonth },
            transaction
          });
        } else if (diff < 0) {
          await SalesTarget.decrement('achieved_amount', {
            by: Math.abs(diff),
            where: { sales_rep_id: repId, month: orderMonth },
            transaction
          });
        }

        // Re-evaluate target status
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
    } else {
      // For requested/other status (where stock has not been deducted yet), we just validate that we have enough stock available
      for (const newItem of items) {
        const variant = await ProductVariant.findByPk(newItem.variant_id, {
          include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
          transaction
        });

        if (!variant || variant.stock_count < newItem.qty) {
          await transaction.rollback();
          const productName = variant?.product?.product_name || 'Unknown Product';
          const variantName = variant?.variant_name || 'Standard';
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${productName} (${variantName}). Requested: ${newItem.qty}, Available: ${variant ? variant.stock_count : 0}.`
          });
        }
      }
    }

    // Update order fields
    order.subtotal = subtotal;
    order.discount_percentage = discount_percentage;
    order.discount_amount = discount_amount;
    order.total_amount = total_amount;
    order.payment_method = payment_method;

    await order.save({ transaction });

    // Delete old order items
    await OrderItem.destroy({
      where: { order_id: orderId },
      transaction
    });

    // Create new order items
    const orderItemsData = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    await transaction.commit();

    // Create notification
    await createNotification(
      'order',
      'Order Updated',
      `Order #${orderId.substring(0, 8).toUpperCase()} for ${order.customer_name} was updated. Total: LKR ${Number(total_amount).toLocaleString()}.`,
      {
        reference_id: orderId,
        target_user_id: order.created_by,
        severity: 'info',
        initiator_id: req.user.user_id,
      }
    ).catch(err => console.error("Error creating update notification:", err));

    res.status(200).json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Update Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to update order" });
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
  deleteOrder,
  updateOrder,
  getOrderById
};