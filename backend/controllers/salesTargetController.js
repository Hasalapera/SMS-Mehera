
const { User, Order, UserArea, Customer, SalesTarget, sequelize} = require('../models');
const { createNotification } = require('./notificationController');
const { Op } = require('sequelize');


/**
 * assignTarget: හැම මාසෙම Rep කෙනෙක්ට dynamic target එකක් ඇසයින් කිරීම හෝ අප්ඩේට් කිරීම
 * 1. Active customer count එක මත පදනම්ව density factor එක ගණනය කරයි.
 * 2. දැනටමත් රෙකෝඩ් එකක් පවතී නම් එය අප්ඩේට් කරයි, නැතහොත් අලුතින් සාදයි.
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
            recipient_id: sales_rep_id,
            reference_id: target.id,
            severity: 'info'
        }
    );

    res.status(200).json({ success: true, message: `Sales target ${created ? 'locked' : 'updated'} successfully!`, data: target, created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * getMonthlyRepTarget: සේල්ස් රිපෝට් එක ඇතුළේ පෙන්වන්න රෙප්ගේ ලොක් කරපු Target එක සහ දත්ත ලබා ගැනීම
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

    // 1. බැක්ඇන්ඩ් එකෙන් ලොක් කරපු Target එක අදිනවා
    const targetData = await SalesTarget.findOne({
      where: { sales_rep_id, month }
    });

    // 2. 🎯 FIX: PostgreSQL වලට නූලටම මැච් වෙන පිරිසිදු ලයිව් SUM Calculation එක
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
      raw: true // Raw object එකක් විදිහට කෙළින්ම දත්ත ටික ගන්නවා
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
 * getRepLiveDetails: රෙප් කෙනෙක්ව පෝම් එකෙන් සිලෙක්ට් කරපු ගමන් එයාගේ 
 * ඩේටාබේස් එකේ ඉන්න ඇත්තම සලූන් ගණන ලයිව් Count කරලා, ඒරියාස් ටික ඇදලා දීම
 */
const getRepLiveDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. ਰෙਪට අදාළ දිස්ත්‍රික්ක (Areas) ලබා ගැනීම
    const areas = await UserArea.findAll({
      where: { user_id: id },
      attributes: ['district_name']
    });

    // 2. ඩේටාබේස් එකෙන් මේ රෙප්ට ඇසයින් කරලා ඉන්න ඇත්තම සලූන් ගණන සජීවීව ගණන් කිරීම
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

// 🎯 🔌 ALL EXPORTS AT THE BOTTOM (උඹේ userController එකේ ආකෘතියටම)
module.exports = {
  assignTarget,
  getMonthlyRepTarget,
  getRepLiveDetails,
  getExistingTarget
};