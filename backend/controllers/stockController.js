const { ProductVariant, Product, User, sequelize } = require('../models');
const { createNotification } = require('./notificationController');

// Format user info for notification messages
const formatUserInfo = async (user) => {
    if (!user) return 'System';

    const dbUser = user.user_id
        ? await User.findByPk(user.user_id, { attributes: ['name', 'role'] })
        : null;

    const name = dbUser?.name || user.name || 'Unknown';
    const role = (dbUser?.role || user.role || 'user')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    return `${name} (${role})`;
};

const addStockToVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive integer' });
        }

        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        const currentStock = Number(variant.stock_count || 0);
        const updatedStock = currentStock + quantity;

        await variant.update({ stock_count: updatedStock });

        res.status(200).json({
            message: 'Stock updated successfully',
            variant: {
                variant_id: variant.variant_id,
                stock_count: variant.stock_count
            }
        });
    } catch (err) {
        console.error('Add Stock Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const batchAddStockToVariants = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            // Rollback transaction before returning error response
            await transaction.rollback();
            return res.status(400).json({ error: 'Updates array is required' });
        }

        const appliedUpdates = [];
        let totalUnits = 0;

        for (const update of updates) {
            const variantId = update?.variant_id;
            const quantity = Number(update?.quantity);

            if (!variantId || !Number.isInteger(quantity) || quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Each update must include variant_id and positive integer quantity' });
            }

            const variant = await ProductVariant.findByPk(variantId, { 
                transaction,
                include: [{ model: Product, as: 'product' }] //  Include product for name
            });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ error: `Variant not found: ${variantId}` });
            }

            // Get previous stock
            const previousStock = Number(variant.stock_count || 0);
            const newStock = previousStock + quantity;

            // Update stock count
            await variant.update({ stock_count: newStock }, { transaction });

            appliedUpdates.push({
                variant_id: variant.variant_id,
                quantity,
                previous_stock: previousStock,
                new_stock: newStock
            });
            totalUnits += quantity;
        }

        // Create notifications after all updates
        const userInfo = await formatUserInfo(req.user);
        for (const update of appliedUpdates) {
        const variant = await ProductVariant.findByPk(update.variant_id, {
            include: [{ model: Product, as: 'product' }]
        });
        
        const productName = variant?.product?.product_name || 'Unknown Product';
        const variantName = variant?.variant_name || 'Unknown Variant';
        const newStock = update.new_stock;
        const criticalLevel = Number(variant?.critical_stock_level || 5);

        let title, message, severity;

        if (newStock <= 0) {
            title = '🔴 Still Out of Stock';
            message = `${productName} - ${variantName} is still OUT OF STOCK after update by ${userInfo}`;
            severity = 'critical';
        } else if (newStock <= criticalLevel) {
            title = '🔴 Critical Stock Level';
            message = `${productName} - ${variantName} is at CRITICAL level (${newStock} units) - updated by ${userInfo}`;
            severity = 'critical';
        } else if (newStock < 10) {
            title = '🟡 Low Stock Alert';
            message = `${productName} - ${variantName} is LOW (${newStock} units after adding ${update.quantity}) - updated by ${userInfo}`;
            severity = 'warning';
        } else {
            title = '📦 Stock Added';
            message = `${productName} - ${variantName} updated to ${newStock} units (+${update.quantity} added) by ${userInfo}`;
            severity = 'info';
        }

        await createNotification('stock', title, message, update.variant_id, severity);
        }

        await transaction.commit();
        res.status(200).json({
            message: 'Batch stock update successful',
            summary: {
                updatedVariants: appliedUpdates.length,
                totalUnits
            },
            appliedUpdates
        });
    } catch (err) {
        await transaction.rollback();
        console.error('Batch Add Stock Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const batchEditStockForVariants = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Updates array is required' });
        }

        const appliedUpdates = [];
        let totalChange = 0;

        for (const update of updates) {
            const variantId = update?.variant_id;
            const newStock = Number(update?.newStock);

            if (!variantId || !Number.isInteger(newStock) || newStock < 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Each update must include variant_id and non-negative integer newStock' });
            }

            const variant = await ProductVariant.findByPk(variantId, { transaction });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ error: `Variant not found: ${variantId}` });
            }

            const oldStock = Number(variant.stock_count || 0);
            const change = newStock - oldStock;

            await variant.update({ stock_count: newStock }, { transaction });

            appliedUpdates.push({
                variant_id: variant.variant_id,
                oldStock,
                newStock,
                change
            });
            totalChange += change;
        }

        // Create notifications after all updates
        const userInfo = await formatUserInfo(req.user);
        for (const update of appliedUpdates) {
        const variant = await ProductVariant.findByPk(update.variant_id, {
            include: [{ model: Product, as: 'product' }]
        });

        const productName = variant?.product?.product_name || 'Unknown Product';
        const variantName = variant?.variant_name || 'Unknown Variant';
        const newStock = update.newStock;
        const oldStock = update.oldStock;
        const criticalLevel = Number(variant?.critical_stock_level || 5);
        const difference = newStock - oldStock;
        const sign = difference > 0 ? '+' : '';

        let title, message, severity;

        if (newStock <= 0) {
            title = '🔴 Out of Stock Alert';
            message = `${productName} - ${variantName} is now OUT OF STOCK (0 units) - updated by ${userInfo}`;
            severity = 'critical';
        } else if (newStock <= criticalLevel) {
            title = '🔴 Critical Stock Level';
            message = `${productName} - ${variantName} dropped to CRITICAL level (${newStock} units) - updated by ${userInfo}`;
            severity = 'critical';
        } else if (newStock < 10) {
            title = '🟡 Low Stock Alert';
            message = `${productName} - ${variantName} is LOW (${newStock} units, ${sign}${difference} change) - updated by ${userInfo}`;
            severity = 'warning';
        } else {
            title = '📦 Stock Updated';
            message = `${productName} - ${variantName} set to ${newStock} units (${sign}${difference} change) - updated by ${userInfo}`;
            severity = 'info';
        }

        await createNotification('stock', title, message, update.variant_id, severity);
        }

        await transaction.commit();
        res.status(200).json({
            message: 'Batch stock edit successful',
            summary: {
                updatedVariants: appliedUpdates.length,
                totalChange
            },
            appliedUpdates
        });
    } catch (err) {
        await transaction.rollback();
        console.error('Batch Edit Stock Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};


const batchRevertStockForVariants = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Updates array is required' });
        }

        const revertedUpdates = [];
        let totalUnits = 0;

        for (const update of updates) {
            const variantId = update?.variant_id;
            const quantity = Number(update?.quantity);

            if (!variantId || !Number.isInteger(quantity) || quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Each update must include variant_id and positive integer quantity' });
            }

            const variant = await ProductVariant.findByPk(variantId, { transaction });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ error: `Variant not found: ${variantId}` });
            }

            const previousStock = Number(variant.stock_count || 0);
            if (previousStock < quantity) {
                await transaction.rollback();
                return res.status(400).json({ error: `Cannot revert ${quantity} units for variant ${variantId}; current stock is ${previousStock}` });
            }

            const newStock = previousStock - quantity;
            await variant.update({ stock_count: newStock }, { transaction });

            revertedUpdates.push({
                variant_id: variant.variant_id,
                quantity,
                previous_stock: previousStock,
                new_stock: newStock
            });
            totalUnits += quantity;
        }

        // Create revert notifications
        const userInfo = await formatUserInfo(req.user);
        for (const update of revertedUpdates) {
        const variant = await ProductVariant.findByPk(update.variant_id, {
            include: [{ model: Product, as: 'product' }]
        });

        const productName = variant?.product?.product_name || 'Unknown Product';
        const variantName = variant?.variant_name || 'Unknown Variant';

        await createNotification(
            'stock',
            '↩️ Stock Addition Reverted',
            `${productName} - ${variantName}: ${update.quantity} units addition reverted by ${userInfo}`,
            update.variant_id,
            'warning'
        );
        }

        await transaction.commit();
        res.status(200).json({
            message: 'Batch stock revert successful',
            summary: {
                revertedVariants: revertedUpdates.length,
                totalUnits
            },
            revertedUpdates
        });
    } catch (err) {
        await transaction.rollback();
        console.error('Batch Revert Stock Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addStockToVariant,
    batchAddStockToVariants,
    batchEditStockForVariants,
    batchRevertStockForVariants
};