const mongoose = require('mongoose');

const wasteTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['recyclable', 'biodegradable', 'hazardous', 'landfill', 'compostable', 'electronic']
  },
  description: String,
  keywords: [String],
  disposalInstructions: String,
  environmentalImpact: String,
  recyclingTips: String,
  decompositionTime: String,
  examples: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WasteType', wasteTypeSchema);
