const express = require('express');
const router = express.Router();
const { EMISSION_FACTORS } = require('../utils/carbonCalculator');

// @route   GET /api/activities/types
// @desc    Get all activity types and options
// @access  Public
router.get('/activities/types', (req, res) => {
  try {
    const activityTypes = {
      transportation: {
        name: 'Transportation',
        description: 'Track your travel emissions',
        icon: '🚗',
        modes: [
          { value: 'car', label: 'Car', icon: '🚗', emissionFactor: EMISSION_FACTORS.transportation.car },
          { value: 'electric_car', label: 'Electric Car', icon: '⚡', emissionFactor: EMISSION_FACTORS.transportation.electric_car },
          { value: 'bus', label: 'Bus', icon: '🚌', emissionFactor: EMISSION_FACTORS.transportation.bus },
          { value: 'train', label: 'Train', icon: '🚆', emissionFactor: EMISSION_FACTORS.transportation.train },
          { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️', emissionFactor: EMISSION_FACTORS.transportation.motorcycle },
          { value: 'bike', label: 'Bicycle', icon: '🚲', emissionFactor: EMISSION_FACTORS.transportation.bike },
          { value: 'walk', label: 'Walk', icon: '🚶', emissionFactor: EMISSION_FACTORS.transportation.walk },
          { value: 'flight', label: 'Flight', icon: '✈️', emissionFactor: EMISSION_FACTORS.transportation.flight }
        ],
        fields: ['transportMode', 'distance']
      },
      energy: {
        name: 'Energy',
        description: 'Log your energy consumption',
        icon: '⚡',
        fields: ['electricityUsage', 'gasUsage']
      },
      food: {
        name: 'Food',
        description: 'Track your dietary impact',
        icon: '🍽️',
        fields: ['meatConsumption', 'vegetarianMeals']
      },
      waste: {
        name: 'Waste',
        description: 'Monitor waste generation',
        icon: '♻️',
        fields: ['wasteGenerated', 'recycledWaste']
      },
      water: {
        name: 'Water',
        description: 'Track water usage',
        icon: '💧',
        fields: ['waterUsage']
      }
    };

    const energySources = [
      { value: 'solar', label: 'Solar Power', icon: '☀️', description: 'Photovoltaic solar panels' },
      { value: 'wind', label: 'Wind Power', icon: '💨', description: 'Wind turbines' },
      { value: 'hydro', label: 'Hydroelectric', icon: '💧', description: 'Water-powered generation' },
      { value: 'geothermal', label: 'Geothermal', icon: '🌋', description: 'Earth heat energy' },
      { value: 'biomass', label: 'Biomass', icon: '🌿', description: 'Organic matter energy' },
      { value: 'tidal', label: 'Tidal Power', icon: '🌊', description: 'Ocean tidal energy' }
    ];

    const plasticTypes = [
      { value: 'PET', label: 'PET (1)', description: 'Polyethylene Terephthalate - bottles, containers', recyclable: true },
      { value: 'HDPE', label: 'HDPE (2)', description: 'High-Density Polyethylene - milk jugs, detergent bottles', recyclable: true },
      { value: 'PVC', label: 'PVC (3)', description: 'Polyvinyl Chloride - pipes, packaging', recyclable: false },
      { value: 'LDPE', label: 'LDPE (4)', description: 'Low-Density Polyethylene - bags, wraps', recyclable: true },
      { value: 'PP', label: 'PP (5)', description: 'Polypropylene - containers, straws', recyclable: true },
      { value: 'PS', label: 'PS (6)', description: 'Polystyrene - foam cups, packaging', recyclable: false },
      { value: 'single_use_plastic', label: 'Single-Use Plastic', description: 'Disposable plastics', recyclable: false },
      { value: 'other', label: 'Other Plastics', description: 'Mixed or unknown plastics', recyclable: false }
    ];

    const wasteCategories = [
      { value: 'recyclable', label: 'Recyclable', icon: '♻️', color: '#10b981', description: 'Can be recycled' },
      { value: 'biodegradable', label: 'Biodegradable', icon: '🌱', color: '#22c55e', description: 'Naturally decomposes' },
      { value: 'compostable', label: 'Compostable', icon: '🌿', color: '#84cc16', description: 'Can be composted' },
      { value: 'hazardous', label: 'Hazardous', icon: '⚠️', color: '#ef4444', description: 'Dangerous waste' },
      { value: 'electronic', label: 'Electronic', icon: '📱', color: '#3b82f6', description: 'E-waste' },
      { value: 'landfill', label: 'Landfill', icon: '🗑️', color: '#6b7280', description: 'General waste' }
    ];

    res.json({
      success: true,
      data: {
        activityTypes,
        energySources,
        plasticTypes,
        wasteCategories,
        emissionFactors: EMISSION_FACTORS
      }
    });
  } catch (error) {
    console.error('Get Activity Types Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity types',
      error: error.message
    });
  }
});

// @route   GET /api/environmental-data/carbon-factors
// @desc    Get emission factors used for calculations
// @access  Public
router.get('/environmental-data/carbon-factors', (req, res) => {
  try {
    res.json({
      success: true,
      emissionFactors: EMISSION_FACTORS,
      description: 'Carbon emission factors in kg CO2 per unit',
      units: {
        transportation: 'per kilometer',
        energy: {
          electricity: 'per kWh',
          gas: 'per cubic meter'
        },
        food: 'per kilogram',
        waste: 'per kilogram',
        water: 'per liter',
        renewable: 'offset per kWh'
      }
    });
  } catch (error) {
    console.error('Get Carbon Factors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching carbon factors',
      error: error.message
    });
  }
});

// @route   GET /api/stats/global
// @desc    Get global statistics
// @access  Public
router.get('/stats/global', async (req, res) => {
  try {
    const Activity = require('../models/Activity');
    const RenewableEnergy = require('../models/RenewableEnergy');
    const PlasticUsage = require('../models/PlasticUsage');
    const User = require('../models/User');

    const [
      totalUsers,
      totalActivities,
      totalCarbonEmissions,
      totalRenewableEnergy,
      totalPlasticUsage
    ] = await Promise.all([
      User.countDocuments(),
      Activity.countDocuments(),
      Activity.aggregate([{ $group: { _id: null, total: { $sum: '$carbonEmissions' } } }]),
      RenewableEnergy.aggregate([{ $group: { _id: null, total: { $sum: '$energyGenerated' } } }]),
      PlasticUsage.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalActivities,
        totalCarbonEmissions: totalCarbonEmissions[0]?.total || 0,
        totalRenewableEnergy: totalRenewableEnergy[0]?.total || 0,
        totalPlasticItems: totalPlasticUsage[0]?.total || 0,
        carbonSaved: (totalRenewableEnergy[0]?.total || 0) * 0.5 // Approximate
      }
    });
  } catch (error) {
    console.error('Get Global Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching global statistics',
      error: error.message
    });
  }
});

module.exports = router;
