
const { User, Order, UserArea, Customer, SalesTarget, sequelize} = require('../models');
const { createNotification } = require('./notificationController');
const { Op } = require('sequelize');


/**
 * assignTarget: Assigns or updates a dynamic sales target for a sales rep for a specific month.
 * 1. Calculates the density factor based on the active customer count.
 * 2. If a record already exists for that month, it updates it; otherwise, it creates a new one.
 */
const assignTarget = async (req, res) => {
  try {
    const { sales_rep_id, month, active_customer_count, base_target_amount, adjusted_target_amount } = req.body;

    // 🛡️ Backend Validation: Prevent assigning targets for past months
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (month < currentMonth) {
      return res.status(400).json({ success: false, message: "Cannot assign targets for past months." });
    }

    const companyAvgSaloons = 25; 
    const densityFactor = (active_customer_count / companyAvgSaloons).toFixed(2);

    const [target, created] = await SalesTarget.findOrCreate({
      where: { sales_rep_id, month },
      defaults: { active_customer_count, density_factor: densityFactor, base_target_amount, adjusted_target_amount }
    });

    if (!created) {
      await target.update({ active_customer_count, density_factor: densityFactor, base_target_amount, adjusted_target_amount });
    }

    // 🔔 Notify the sales rep about the target assignment/update
    const assignerName = req.user?.name || 'An administrator';
    const action = created ? 'set' : 'updated';
    await createNotification(
        'user',
        `Sales Target ${created ? 'Set' : 'Updated'} by ${assignerName}`,
        `Your sales target for ${month} has been ${action} to LKR ${Number(adjusted_target_amount).toLocaleString()} by ${assignerName}.`,
        {
            reference_id: target.id,
            target_user_id: sales_rep_id,
            severity: 'info',
            initiator_id: req.user.user_id
        }
    );

    res.status(200).json({ success: true, message: `Sales target ${created ? 'locked' : 'updated'} successfully!`, data: target, created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * getMonthlyRepTarget: Fetches the monthly target for a sales rep along with the achieved sales data
 */
const getMonthlyRepTarget = async (req, res) => {
  try {
    const { sales_rep_id, month } = req.query;

    if (!sales_rep_id || !month) {
      return res.status(400).json({ success: false, message: "Missing sales_rep_id or month parameters." });
    }

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    // 1. Fetch the target data for the sales rep for the given month
    const targetData = await SalesTarget.findOne({
      where: { sales_rep_id, month }
    });

    // 2. Calculate the total achieved sales for the sales rep in the given month
    const orderSum = await Order.findOne({
      attributes: [
        [
          sequelize.fn('SUM', sequelize.literal('CAST(total_amount AS NUMERIC)')), 
          'totalSales'
        ]
      ],
      where: {
        created_by: sales_rep_id,
        order_status: 'approved',
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      raw: true // Ensures we get a plain object instead of a Sequelize instance
    });

    const totalAchieved = orderSum ? parseFloat(orderSum.totalSales || 0) : 0;
    const adjusted_target = targetData ? parseFloat(targetData.adjusted_target_amount) : 0;
    const active_customers = targetData ? targetData.active_customer_count : 0;

    res.status(200).json({
      success: true,
      data: {
        adjusted_target_amount: adjusted_target,
        active_customer_count: active_customers,
        live_achieved_amount: totalAchieved
      }
    });

  } catch (err) {
    console.error("❌ Error in getMonthlyRepTarget:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * getRepLiveDetails: Fetches the live details of a sales rep, including the areas (districts) they are assigned to and the count of active customers they manage. 
 * This is useful for displaying real-time information in the sales target assignment form.
 */
const getRepLiveDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // english: Fetch the areas (districts) assigned to this sales rep from the UserArea table
    const areas = await UserArea.findAll({
      where: { user_id: id },
      attributes: ['district_name']
    });

    // english: Count the number of active customers assigned to this sales rep in the database
    const customerCount = await Customer.count({
      where: { sales_rep_id: id }
    });

    res.status(200).json({
      success: true,
      areas: areas.map(a => a.district_name),
      active_customer_count: customerCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * getExistingTarget: Checks if a target already exists for a given rep and month.
 */
const getExistingTarget = async (req, res) => {
  try {
    const { sales_rep_id, month } = req.query;

    if (!sales_rep_id || !month) {
      return res.status(400).json({ success: false, message: "Sales Rep ID and month are required." });
    }

    const target = await SalesTarget.findOne({
      where: { sales_rep_id, month }
    });

    if (target) {
      res.status(200).json({ success: true, target });
    } else {
      // It's not an error if not found, it's an expected outcome.
      res.status(404).json({ success: false, message: "No target found for the selected month." });
    }

  } catch (err) {
    console.error("Error fetching existing target:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  assignTarget,
  getMonthlyRepTarget,
  getRepLiveDetails,
  getExistingTarget
};
