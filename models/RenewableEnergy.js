const mongoose = require('mongoose');

const renewableEnergySchema = new mongoose.Schema({
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
  energySource: {
    type: String,
    required: true,
    enum: ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'tidal']
  },
  energyGenerated: {
    type: Number, // in kWh
    required: true,
    min: 0
  },
  energyUsed: {
    type: Number, // in kWh
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  installationType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'community']
  },
  systemCapacity: {
    type: Number, // in kW
    min: 0
  },
  carbonOffset: {
    type: Number, // in kg CO2
    default: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  savings: {
    type: Number,
    min: 0
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

renewableEnergySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('RenewableEnergy', renewableEnergySchema);
