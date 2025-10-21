const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const PlasticUsage = require('../models/PlasticUsage');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

// @route   POST /api/plastic-usage
// @desc    Log plastic usage
// @access  Private
router.post('/', authMiddleware, [
  body('plasticType').isIn(['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'other', 'single_use_plastic', 'microplastic']).withMessage('Invalid plastic type'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number')
], validateRequest, async (req, res) => {
  try {
    const plasticData = {
      userId: req.userId,
      ...req.body
    };

    // Calculate environmental impact score (higher is worse)
    let impactScore = plasticData.quantity * 10;
    if (!plasticData.recycled) impactScore *= 1.5;
    if (plasticData.plasticType === 'single_use_plastic') impactScore *= 2;
    plasticData.environmentalImpact = impactScore;

    const plasticUsage = new PlasticUsage(plasticData);
    await plasticUsage.save();

    // Check monthly plastic usage and send warning if high
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyUsage = await PlasticUsage.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalImpact: { $sum: '$environmentalImpact' }
        }
      }
    ]);

    if (monthlyUsage.length > 0 && monthlyUsage[0].totalQuantity > 50) {
      const notification = new Notification({
        userId: req.userId,
        title: '⚠️ High Plastic Usage Alert',
        message: `You've used ${monthlyUsage[0].totalQuantity.toFixed(0)} plastic items this month. Consider switching to reusable alternatives!`,
        type: 'warning',
        category: 'plastic',
        icon: '♻️'
      });
      await notification.save();

      const io = req.app.get('io');
      io.to(req.userId.toString()).emit('notification', {
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
    }

    res.status(201).json({
      success: true,
      message: 'Plastic usage logged successfully',
      data: plasticUsage,
      monthlyTotal: monthlyUsage.length > 0 ? monthlyUsage[0].totalQuantity : plasticData.quantity
    });
  } catch (error) {
    console.error('Add Plastic Usage Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging plastic usage',
      error: error.message
    });
  }
});

// @route   GET /api/plastic-usage
// @desc    Get plastic usage logs
// @access  Private
router.get('/', authMiddleware, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], validateRequest, async (req, res) => {
  try {
    const { startDate, endDate, plasticType, recycled, limit = 50, page = 1 } = req.query;
    
    const filter = { userId: req.userId };
    
    if (plasticType) {
      filter.plasticType = plasticType;
    }
    
    if (recycled !== undefined) {
      filter.recycled = recycled === 'true';
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const logs = await PlasticUsage.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PlasticUsage.countDocuments(filter);

    res.json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      logs
    });
  } catch (error) {
    console.error('Get Plastic Usage Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plastic usage data',
      error: error.message
    });
  }
});

// @route   GET /api/plastic-usage/summary
// @desc    Get plastic usage summary and reduction progress
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate, previousStartDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Current period data
    const currentLogs = await PlasticUsage.find({
      userId: req.userId,
      date: { $gte: startDate }
    });

    // Previous period data for comparison
    const previousLogs = await PlasticUsage.find({
      userId: req.userId,
      date: { $gte: previousStartDate, $lt: startDate }
    });

    const summary = {
      current: {
        totalQuantity: 0,
        totalWeight: 0,
        totalImpact: 0,
        recycledCount: 0,
        reusedCount: 0,
        byType: {},
        bySource: {}
      },
      previous: {
        totalQuantity: 0,
        totalWeight: 0
      },
      period,
      startDate,
      endDate: now
    };

    // Calculate current period stats
    currentLogs.forEach(log => {
      summary.current.totalQuantity += log.quantity;
      summary.current.totalWeight += log.weight || 0;
      summary.current.totalImpact += log.environmentalImpact;
      if (log.recycled) summary.current.recycledCount += log.quantity;
      if (log.reused) summary.current.reusedCount += log.quantity;
      
      // Group by type
      if (!summary.current.byType[log.plasticType]) {
        summary.current.byType[log.plasticType] = { quantity: 0, weight: 0 };
      }
      summary.current.byType[log.plasticType].quantity += log.quantity;
      summary.current.byType[log.plasticType].weight += log.weight || 0;
      
      // Group by source
      if (log.source) {
        if (!summary.current.bySource[log.source]) {
          summary.current.bySource[log.source] = 0;
        }
        summary.current.bySource[log.source] += log.quantity;
      }
    });

    // Calculate previous period stats
    previousLogs.forEach(log => {
      summary.previous.totalQuantity += log.quantity;
      summary.previous.totalWeight += log.weight || 0;
    });

    // Calculate reduction percentage
    const reductionPercentage = summary.previous.totalQuantity > 0
      ? ((summary.previous.totalQuantity - summary.current.totalQuantity) / summary.previous.totalQuantity * 100).toFixed(2)
      : 0;

    // Get user's goal
    const user = req.user;
    const goalProgress = reductionPercentage >= 0 ? reductionPercentage : 0;
    const goalAchieved = parseFloat(goalProgress) >= user.plasticReductionGoal;

    res.json({
      success: true,
      summary: {
        ...summary,
        reductionPercentage: parseFloat(reductionPercentage),
        goal: user.plasticReductionGoal,
        goalProgress: parseFloat(goalProgress),
        goalAchieved,
        recyclingRate: summary.current.totalQuantity > 0 
          ? (summary.current.recycledCount / summary.current.totalQuantity * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get Plastic Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plastic usage summary',
      error: error.message
    });
  }
});

// @route   DELETE /api/plastic-usage/:id
// @desc    Delete plastic usage log
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await PlasticUsage.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.json({
      success: true,
      message: 'Log deleted successfully'
    });
  } catch (error) {
    console.error('Delete Plastic Usage Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting log',
      error: error.message
    });
  }
});

module.exports = router;
