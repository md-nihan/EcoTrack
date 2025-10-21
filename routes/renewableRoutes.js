const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const RenewableEnergy = require('../models/RenewableEnergy');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const { calculateRenewableOffset } = require('../utils/carbonCalculator');

// @route   POST /api/renewable-energy
// @desc    Log renewable energy data
// @access  Private
router.post('/', authMiddleware, [
  body('energySource').isIn(['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'tidal']).withMessage('Invalid energy source'),
  body('energyGenerated').isFloat({ min: 0 }).withMessage('Energy generated must be a positive number')
], validateRequest, async (req, res) => {
  try {
    const energyData = {
      userId: req.userId,
      ...req.body
    };

    // Calculate carbon offset
    energyData.carbonOffset = calculateRenewableOffset(energyData.energyGenerated, energyData.energySource);

    const renewableEnergy = new RenewableEnergy(energyData);
    await renewableEnergy.save();

    // Send achievement notification for significant contribution
    if (energyData.energyGenerated > 100) {
      const notification = new Notification({
        userId: req.userId,
        title: '🌟 Green Energy Champion!',
        message: `Amazing! You generated ${energyData.energyGenerated} kWh of ${energyData.energySource} energy, offsetting ${energyData.carbonOffset.toFixed(2)} kg CO2!`,
        type: 'achievement',
        category: 'energy',
        icon: '⚡'
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
      message: 'Renewable energy data logged successfully',
      data: renewableEnergy
    });
  } catch (error) {
    console.error('Add Renewable Energy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging renewable energy',
      error: error.message
    });
  }
});

// @route   GET /api/renewable-energy
// @desc    Get renewable energy logs
// @access  Private
router.get('/', authMiddleware, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], validateRequest, async (req, res) => {
  try {
    const { startDate, endDate, energySource, limit = 50, page = 1 } = req.query;
    
    const filter = { userId: req.userId };
    
    if (energySource) {
      filter.energySource = energySource;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const logs = await RenewableEnergy.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RenewableEnergy.countDocuments(filter);

    res.json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      logs
    });
  } catch (error) {
    console.error('Get Renewable Energy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching renewable energy data',
      error: error.message
    });
  }
});

// @route   GET /api/renewable-energy/summary
// @desc    Get renewable energy summary
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

    const logs = await RenewableEnergy.find({
      userId: req.userId,
      date: { $gte: startDate }
    });

    const summary = {
      totalEnergyGenerated: 0,
      totalEnergyUsed: 0,
      totalCarbonOffset: 0,
      totalSavings: 0,
      bySource: {},
      logCount: logs.length,
      period,
      startDate,
      endDate: now
    };

    logs.forEach(log => {
      summary.totalEnergyGenerated += log.energyGenerated;
      summary.totalEnergyUsed += log.energyUsed || 0;
      summary.totalCarbonOffset += log.carbonOffset;
      summary.totalSavings += log.savings || 0;
      
      if (!summary.bySource[log.energySource]) {
        summary.bySource[log.energySource] = {
          energyGenerated: 0,
          carbonOffset: 0,
          count: 0
        };
      }
      
      summary.bySource[log.energySource].energyGenerated += log.energyGenerated;
      summary.bySource[log.energySource].carbonOffset += log.carbonOffset;
      summary.bySource[log.energySource].count += 1;
    });

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get Renewable Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching renewable energy summary',
      error: error.message
    });
  }
});

// @route   DELETE /api/renewable-energy/:id
// @desc    Delete renewable energy log
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await RenewableEnergy.findOneAndDelete({ 
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
    console.error('Delete Renewable Energy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting log',
      error: error.message
    });
  }
});

module.exports = router;
