const {
  Order,
  OrderItem,
  ProductVariant,
  Product,
  User,
  Customer,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../db/db");
const { sendEmailInvoice } = require("../utils/sendEmailInvoice");
const crypto = require("crypto");
const {
  sendDispatchNotification,
} = require("../utils/sendDispatchNotification");
const { sendDeliveryOTP, sendThankYouEmail } = require("../utils/emailSender");

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
      payment_method, // 'cash' or 'credit'
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
        include: [
          { model: Product, as: "product", attributes: ["product_name"] },
        ],
        transaction,
      });

      if (!variant || variant.stock_count < item.qty) {
        await transaction.rollback();
        const productName = variant?.product?.product_name || "Unknown Product";
        const variantName = variant?.variant_name || "Standard";
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant ? variant.stock_count : 0}. Order cannot be placed.`,
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

    const orderItemsData = items.map((item) => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    await transaction.commit(); // ✅ confirm DB operations before sending response

    res
      .status(201)
      .json({
        success: true,
        message: "Order placed successfully!",
        orderId: newOrder.order_id,
      });
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
      items,
    } = req.body;

    // 🛡️ Stock Validation Phase before creating online order
    for (const item of items) {
      const variant = await ProductVariant.findByPk(item.variant_id, {
        include: [
          { model: Product, as: "product", attributes: ["product_name"] },
        ],
        transaction,
      });

      if (!variant || variant.stock_count < item.qty) {
        await transaction.rollback();
        const productName = variant?.product?.product_name || "Unknown Product";
        const variantName = variant?.variant_name || "Standard";
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant ? variant.stock_count : 0}. Order cannot be placed.`,
        });
      }
    }

    const newOrder = await Order.create(
      {
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
        order_status: "requested",
        created_by: req.user.user_id,
        order_type: "online",
      },
      { transaction },
    );

    const orderItemsData = items.map((item) => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
      price: item.price,
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
          items,
        });
        console.log(`✅ Invoice sent to ${email}`);
      } catch (emailErr) {
        console.error(
          "❌ Email process failed but order is saved:",
          emailErr.message,
        );
      }
    }

    res
      .status(201)
      .json({
        success: true,
        message: "Online Order placed successfully!",
        orderId: newOrder.order_id,
      });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();

    console.error("Online Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place online order",
      error: error.message,
    });
  }
};

// --- 3. get all orders ---
const getAllOrders = async (req, res) => {
  try {
    // 🕵️ get user id and role from middleware
    const { user_id, role } = req.user;
    let filter = {};

    // සේල්ස් රෙප් කෙනෙකුට තමන්ගේ සැලූන් වල සියලුම ඕඩර්ස් පෙන්වීමට ඇති තාර්කික කොටස
    if (
      role !== "admin" &&
      role !== "manager" &&
      role !== "logistics_officer"
    ) {
      // දැනට මෙම රෙප්ට අනුයුක්ත කර ඇති සැලූන් ලිස්ට් එක ගන්නවා
      const assignedSalons = await Customer.findAll({
        where: { sales_rep_id: user_id },
        attributes: ["customer_id"],
      });
      const salonIds = assignedSalons.map((s) => s.customer_id);

      filter = {
        [Op.or]: [
          { customer_id: { [Op.in]: salonIds } }, // රෙප්ට අයිති සැලූන් වල ඕනෑම කෙනෙක් දාපු ඕඩර්ස්
          { created_by: user_id }, // රෙප් විසින්ම දාපු ඕඩර්ස්
        ],
      };
    }

    const orders = await Order.findAll({
      where: filter, // get order from relevant filter
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["product_name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["name", "role", "deleted_at"],
          paranoid: false, // අයින් වූ සේල්ස් රෙප්ලාගේ නම් ද පෙන්වීමට
        },
      ],
      order: [["created_at", "DESC"]],
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
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 🛡️ Admin order එක 'approved' කරනවා නම් විතරක් Stock Check එක කරනවා
    if (status === "approved" && order.order_status !== "approved") {
      const variantsToUpdate = [];

      // 1. Stock Validation Phase (හැම item එකක්ම check කරනවා)
      for (const item of order.OrderItems) {
        const variant = await ProductVariant.findByPk(item.variant_id, {
          include: [
            { model: Product, as: "product", attributes: ["product_name"] },
          ],
          transaction,
        });

        if (!variant) continue;

        // ⚠️ Stock මදි නම් මෙතනින්ම නවත්තලා Error එකක් යවනවා (Rollback කරනවා)
        if (variant.stock_count < item.qty) {
          await transaction.rollback();
          const productName =
            variant.product?.product_name || "Unknown Product";
          const variantName = variant.variant_name || "Standard";
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${productName} (${variantName}). Requested: ${item.qty}, Available: ${variant.stock_count}.`,
          });
        }
        variantsToUpdate.push({ variant, qty: item.qty });
      }

      // 2. Stock Deduction Phase
      for (const { variant, qty } of variantsToUpdate) {
        await variant.decrement("stock_count", { by: qty, transaction });
      }
    }

    order.order_status = status;
    await order.save({ transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Update Status Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};

// --- 5. update order details (EDIT) ---
const updateOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const {
      customer_name,
      shipping_address,
      phone,
      subtotal,
      discount_percentage,
      discount_amount,
      total_amount,
      items,
      payment_method,
    } = req.body;

    const order = await Order.findByPk(orderId, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 1. Update basic details
    await order.update({
      customer_name,
      shipping_address,
      phone,
      subtotal,
      discount_percentage,
      discount_amount,
      total_amount,
      payment_method
    }, { transaction });

    // 2. Update Order Items (පරණ ඒවා අයින් කරලා අලුත් ඒවා දානවා)
    await OrderItem.destroy({ where: { order_id: orderId }, transaction });

    const orderItemsData = items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      variant_id: item.variant_id,
      qty: item.qty,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });

    await transaction.commit();
    res.status(200).json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Update Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

// Stubs to prevent "handler must be a function" crash in routes
const updateTrackingInfo = async (req, res) => res.status(501).json({ message: "Not implemented" });
const confirmDeliveryWithOTP = async (req, res) => res.status(501).json({ message: "Not implemented" });
const initiateDeliveryOTP = async (req, res) => res.status(501).json({ message: "Not implemented" });
const verifyDeliveryOTPByRep = async (req, res) => res.status(501).json({ message: "Not implemented" });

module.exports = {
  placeOrder,
  placeOnlineOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  updateTrackingInfo,
  confirmDeliveryWithOTP,
  initiateDeliveryOTP,
  verifyDeliveryOTPByRep
};
