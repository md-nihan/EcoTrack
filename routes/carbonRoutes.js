const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const { calculateCarbonEmissions, getReductionTips } = require('../utils/carbonCalculator');

// @route   POST /api/carbon-activities
// @desc    Add a new carbon activity
// @access  Private
router.post('/', authMiddleware, [
  body('activityType').isIn(['transportation', 'energy', 'food', 'waste', 'water']).withMessage('Invalid activity type'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], validateRequest, async (req, res) => {
  try {
    const activityData = {
      userId: req.userId,
      ...req.body
    };

    // Calculate carbon emissions
    activityData.carbonEmissions = calculateCarbonEmissions(activityData);

    const activity = new Activity(activityData);
    await activity.save();

    // Check if emissions are high and send notification
    if (activityData.carbonEmissions > 50) {
      const notification = new Notification({
        userId: req.userId,
        title: 'High Carbon Activity Detected',
        message: `Your recent ${activityData.activityType} activity generated ${activityData.carbonEmissions.toFixed(2)} kg CO2. Consider greener alternatives!`,
        type: 'warning',
        category: 'carbon',
        icon: '⚠️'
      });
      await notification.save();

      // Emit real-time notification
      const io = req.app.get('io');
      io.to(req.userId.toString()).emit('notification', {
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
    }

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      activity,
      carbonEmissions: activityData.carbonEmissions
    });
  } catch (error) {
    console.error('Add Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding activity',
      error: error.message
    });
  }
});

// @route   GET /api/carbon-activities
// @desc    Get user's carbon activities
// @access  Private
router.get('/', authMiddleware, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('activityType').optional().isIn(['transportation', 'energy', 'food', 'waste', 'water']).withMessage('Invalid activity type')
], validateRequest, async (req, res) => {
  try {
    const { startDate, endDate, activityType, limit = 50, page = 1 } = req.query;
    
    const filter = { userId: req.userId };
    
    if (activityType) {
      filter.activityType = activityType;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const activities = await Activity.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      activities
    });
  } catch (error) {
    console.error('Get Activities Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
});

// @route   PUT /api/carbon-activities/:id
// @desc    Update an activity
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        activity[key] = req.body[key];
      }
    });

    // Recalculate emissions
    activity.carbonEmissions = calculateCarbonEmissions(activity);

    await activity.save();

    res.json({
      success: true,
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    console.error('Update Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating activity',
      error: error.message
    });
  }
});

// @route   DELETE /api/carbon-activities/:id
// @desc    Delete an activity
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting activity',
      error: error.message
    });
  }
});

// @route   GET /api/carbon-footprint/summary
// @desc    Get carbon footprint summary
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const activities = await Activity.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate totals by activity type
    const summary = {
      totalEmissions: 0,
      byActivityType: {
        transportation: 0,
        energy: 0,
        food: 0,
        waste: 0,
        water: 0
      },
      activityCount: activities.length,
      period,
      startDate,
      endDate: now
    };

    // Group emissions by date for trend chart
    const emissionsByDate = {};
    
    activities.forEach(activity => {
      summary.totalEmissions += activity.carbonEmissions;
      summary.byActivityType[activity.activityType] += activity.carbonEmissions;
      
      // Group by date for trend
      const dateKey = activity.date.toISOString().split('T')[0];
      if (!emissionsByDate[dateKey]) {
        emissionsByDate[dateKey] = 0;
      }
      emissionsByDate[dateKey] += activity.carbonEmissions;
    });
    
    // Convert to arrays for chart
    const trendData = Object.entries(emissionsByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, emissions]) => ({
        date,
        emissions: parseFloat(emissions.toFixed(2))
      }));

    // Get user's goal
    const user = req.user;
    const goalProgress = user.carbonFootprintGoal 
      ? ((user.carbonFootprintGoal - summary.totalEmissions) / user.carbonFootprintGoal * 100).toFixed(2)
      : null;

    res.json({
      success: true,
      summary: {
        ...summary,
        trendData,
        goal: user.carbonFootprintGoal,
        goalProgress: goalProgress > 0 ? goalProgress : 0,
        goalStatus: summary.totalEmissions <= user.carbonFootprintGoal ? 'achieved' : 'exceeded'
      }
    });
  } catch (error) {
    console.error('Get Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching summary',
      error: error.message
    });
  }
});

// @route   GET /api/carbon-footprint/tips
// @desc    Get personalized reduction tips
// @access  Private
router.get('/tips', authMiddleware, async (req, res) => {
  try {
    const { activityType } = req.query;

    // Get user's recent activities to provide personalized tips
    const recentActivities = await Activity.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(10);

    let tips = [];

    if (activityType) {
      tips = getReductionTips(activityType);
    } else {
      // Provide tips based on highest emission activities
      const emissionsByType = {};
      recentActivities.forEach(activity => {
        emissionsByType[activity.activityType] = 
          (emissionsByType[activity.activityType] || 0) + activity.carbonEmissions;
      });

      // Get top 2 activity types
      const topActivities = Object.entries(emissionsByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type]) => type);

      topActivities.forEach(type => {
        tips.push(...getReductionTips(type).slice(0, 2));
      });

      // Add general tips
      tips.push(...getReductionTips('general').slice(0, 2));
    }

    res.json({
      success: true,
      tips,
      personalized: !activityType
    });
  } catch (error) {
    console.error('Get Tips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tips',
      error: error.message
    });
  }
});

module.exports = router;
