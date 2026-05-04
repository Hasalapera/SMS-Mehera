const { ProductVariant, sequelize } = require('../models');

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

            const variant = await ProductVariant.findByPk(variantId, { transaction });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ error: `Variant not found: ${variantId}` });
            }

            const previousStock = Number(variant.stock_count || 0);
            const newStock = previousStock + quantity;

            await variant.update({ stock_count: newStock }, { transaction });

            appliedUpdates.push({
                variant_id: variant.variant_id,
                quantity,
                previous_stock: previousStock,
                new_stock: newStock
            });
            totalUnits += quantity;
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
    batchRevertStockForVariants
};