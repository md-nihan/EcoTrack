const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['transportation', 'energy', 'food', 'waste', 'water']
  },
  // Transportation
  transportMode: {
    type: String,
    enum: ['car', 'bus', 'train', 'bike', 'walk', 'motorcycle', 'flight', 'electric_car']
  },
  distance: {
    type: Number, // in kilometers
    min: 0
  },
  // Energy
  electricityUsage: {
    type: Number, // in kWh
    min: 0
  },
  gasUsage: {
    type: Number, // in cubic meters
    min: 0
  },
  // Food
  meatConsumption: {
    type: Number, // in kg
    min: 0
  },
  vegetarianMeals: {
    type: Number,
    min: 0
  },
  // Waste
  wasteGenerated: {
    type: Number, // in kg
    min: 0
  },
  recycledWaste: {
    type: Number, // in kg
    min: 0
  },
  // Water
  waterUsage: {
    type: Number, // in liters
    min: 0
  },
  // Calculated emissions
  carbonEmissions: {
    type: Number, // in kg CO2
    default: 0
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
activitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
