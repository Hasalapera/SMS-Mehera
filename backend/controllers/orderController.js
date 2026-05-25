const { Order, OrderItem, ProductVariant, Product, User, Customer } = require('../models');
const sequelize = require('../db/db');
const { sendEmailInvoice } = require('../utils/sendEmailInvoice'); 
const crypto = require('crypto');
const { sendDispatchNotification } = require('../utils/sendDispatchNotification');
const { sendDeliveryOTP, sendThankYouEmail } = require('../utils/emailSender');

// --- 1. current normal orde eka (SALES REP / OFFLINE) ---
const placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      order_id,              // 👈 Frontend එකෙන් එවන Unique ID එක
      customer_id, 
      customer_name, 
      shipping_address, 
      phone, 
      subtotal,              // Total
      discount_percentage,   // % 
      discount_amount,       
      total_amount,          // final total after discount
      items,
      payment_method         // 'cash' or 'credit' 
    } = req.body;

    // 🛡️ Idempotency Check: Prevent duplicate offline syncs
    if (order_id) {
      const existingOrder = await Order.findByPk(order_id, { transaction });
      if (existingOrder) {
        await transaction.rollback();
        return res.status(200).json({ success: true, message: "Order already synced!", orderId: order_id });
      }
    }

    // 🛡️ Stock Validation Phase before creating order
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
      order_id: order_id || undefined, // 👈 Frontend ID එක තියෙනවානම් ඒක පාවිච්චි කරනවා, නැත්නම් DB එකෙන් Generate කරනවා
      customer_id, 
      customer_name,     
      shipping_address,
      phone,
      subtotal: subtotal || 0,                    // store sub total
      discount_percentage: discount_percentage || 0, // % store 
      discount_amount: discount_amount || 0,      // store discount amount
      total_amount: total_amount || 0, 
      payment_method: payment_method || 'cash',   // store payment method
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
    
    await transaction.commit(); // ✅ confirm DB operations before sending response

    res.status(201).json({ success: true, message: "Order placed successfully!", orderId: newOrder.order_id });
  } catch (error) {
    // if there is error rollback it
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

    // 🛡️ Stock Validation Phase before creating online order
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
    // Send discount details while sending email
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
    // 🕵️ get user id and role from middleware
    const { user_id, role } = req.user; 
    let filter = {};

    // 🛡️ Admin, Manager, සහ Logistics Officer හැර අනිත් අයට පේන්නේ තමන් දාපු orders විතරයි
    if (role !== 'admin' && role !== 'manager' && role !== 'logistics_officer') {
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

const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Order එකයි ඒකෙ Items ටිකයි database එකෙන් ගන්නවා
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 🛡️ Admin order එක 'approved' කරනවා නම් විතරක් Stock Check එක කරනවා
    if (status === 'approved' && order.order_status !== 'approved') {
      const variantsToUpdate = [];

      // 1. Stock Validation Phase (හැම item එකක්ම check කරනවා)
      for (const item of order.OrderItems) {
        const variant = await ProductVariant.findByPk(item.variant_id, { 
          include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
          transaction 
        });

        if (!variant) continue;

        // ⚠️ Stock මදි නම් මෙතනින්ම නවත්තලා Error එකක් යවනවා (Rollback කරනවා)
        if (variant.stock_count < item.qty) {
          await transaction.rollback();
          const productName = variant.product?.product_name || 'Unknown Product';
          const variantName = variant.variant_name || 'Standard';
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant.stock_count}. Order cannot be approved.` 
          });
        }

        // ඔක්කොම හරි නම් update කරන්න ලිස්ට් එකට දාගන්නවා
        variantsToUpdate.push({ variant, qtyToDeduct: item.qty });
      }

      // 2. Stock Deduction Phase (ඔක්කොම items වල stock තියෙනවා නම් විතරක් අඩු කරනවා)
      for (const update of variantsToUpdate) {
        update.variant.stock_count -= update.qtyToDeduct;
        await update.variant.save({ transaction });
      }
    }

    // 🛡️ Online Order එක Shipped කරද්දි One-time Link එකට Token එකයි OTP එකයි හදනවා
    if (status === 'shipped' && order.order_type === 'online') {
      order.delivery_token = crypto.randomBytes(16).toString('hex');
      order.delivery_otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    }

    order.order_status = status;
    await order.save({ transaction });

    await transaction.commit(); // ✅ සේරම සාර්ථක නම් Database එකට save කරනවා

    let whatsappUrl = null;

    // 🚀 Parallel Process: Send WhatsApp & Email asynchronously
    if (status === 'shipped' && order.order_type === 'online') {
      // Full details ටික අරගෙන තමයි යවන්නේ Product Names එක්කම
      const fullOrder = await Order.findByPk(orderId, {
        include: [{
          model: OrderItem,
          include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
        }]
      });

      // 🟢 Generate WhatsApp Link Details
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

// 🛡️ Courier Confirm Delivery Request 
const confirmDeliveryWithOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token, otp } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // 1. දැනටමත් Delivered ද බලන්න
    if (order.order_status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Order is already delivered.' });
    }

    // 2. Token සහ OTP පරීක්ෂා කරන්න
    if (!order.delivery_token || order.delivery_token !== token || order.delivery_otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid Link or Incorrect OTP!' });
    }

    // 3. Status Update කරලා Token/OTP අයින් කරන්න
    order.order_status = 'delivered';
    order.delivery_token = null; // Token එක අයින් කරනවා
    order.delivery_otp = null;   // OTP එක අයින් කරනවා
    await order.save();

    // 4. Thank you email එක යවන්න
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
    console.error("Initiate Delivery Error:", error);
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

module.exports = { placeOrder, placeOnlineOrder, getAllOrders, updateOrderStatus, updateTrackingInfo, confirmDeliveryWithOTP, initiateDeliveryOTP, verifyDeliveryOTPByRep };