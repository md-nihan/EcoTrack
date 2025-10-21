const mongoose = require('mongoose');

const plasticUsageSchema = new mongoose.Schema({
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
  plasticType: {
    type: String,
    required: true,
    enum: ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'other', 'single_use_plastic', 'microplastic']
  },
  itemType: {
    type: String,
    enum: ['bottle', 'bag', 'container', 'packaging', 'straw', 'utensils', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number, // in grams
    min: 0
  },
  recycled: {
    type: Boolean,
    default: false
  },
  reused: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['food_delivery', 'grocery', 'personal_care', 'household', 'beverage', 'other']
  },
  alternativeUsed: String,
  environmentalImpact: {
    type: Number, // impact score
    default: 0
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

plasticUsageSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('PlasticUsage', plasticUsageSchema);
