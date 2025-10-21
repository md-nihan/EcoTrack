const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const WasteType = require('../models/WasteType');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

// Waste classification rules
const classifyWaste = (wasteDescription) => {
  const description = wasteDescription.toLowerCase();
  
  // Recyclable keywords
  const recyclableKeywords = ['plastic bottle', 'glass', 'paper', 'cardboard', 'aluminum', 'can', 'metal', 'newspaper', 'magazine', 'bottle'];
  
  // Biodegradable keywords
  const biodegradableKeywords = ['food', 'fruit', 'vegetable', 'organic', 'plant', 'leaves', 'garden', 'wood'];
  
  // Hazardous keywords
  const hazardousKeywords = ['battery', 'chemical', 'paint', 'oil', 'medicine', 'pesticide', 'cleaner', 'solvent'];
  
  // Electronic keywords
  const electronicKeywords = ['computer', 'phone', 'electronic', 'cable', 'charger', 'device', 'circuit'];
  
  // Compostable keywords
  const compostableKeywords = ['compost', 'coffee grounds', 'tea bags', 'eggshells', 'yard waste'];
  
  // Check for matches
  if (hazardousKeywords.some(keyword => description.includes(keyword))) {
    return {
      category: 'hazardous',
      confidence: 'high',
      instructions: 'Take to hazardous waste collection facility. Do not dispose in regular trash.',
      environmentalImpact: 'High risk to environment and health if not disposed properly',
      tips: 'Store safely until you can take to a proper collection point'
    };
  }
  
  if (electronicKeywords.some(keyword => description.includes(keyword))) {
    return {
      category: 'electronic',
      confidence: 'high',
      instructions: 'Take to e-waste recycling center or retailer take-back program.',
      environmentalImpact: 'Contains valuable materials and hazardous components',
      tips: 'Consider donating if still functional. Many components can be recycled.'
    };
  }
  
  if (compostableKeywords.some(keyword => description.includes(keyword))) {
    return {
      category: 'compostable',
      confidence: 'high',
      instructions: 'Add to compost bin or green waste collection.',
      environmentalImpact: 'Can create nutrient-rich soil. Reduces methane from landfills.',
      tips: 'Start a home compost bin to reduce waste and create free fertilizer!'
    };
  }
  
  if (biodegradableKeywords.some(keyword => description.includes(keyword))) {
    return {
      category: 'biodegradable',
      confidence: 'high',
      instructions: 'Compost if possible, otherwise green waste bin.',
      environmentalImpact: 'Will decompose naturally but better composted to avoid methane',
      tips: 'Separate from other waste to prevent contamination'
    };
  }
  
  if (recyclableKeywords.some(keyword => description.includes(keyword))) {
    return {
      category: 'recyclable',
      confidence: 'medium',
      instructions: 'Rinse clean and place in recycling bin. Check local recycling guidelines.',
      environmentalImpact: 'Recycling saves energy and raw materials',
      tips: 'Clean containers recycle better. Remove caps and labels when possible.'
    };
  }
  
  // Default to landfill with low confidence
  return {
    category: 'landfill',
    confidence: 'low',
    instructions: 'Place in general waste bin. Consider if this can be reduced, reused, or recycled.',
    environmentalImpact: 'Will sit in landfill for many years',
    tips: 'Try to reduce consumption of items that cannot be recycled or composted'
  };
};

// @route   POST /api/waste/classify
// @desc    Classify waste item
// @access  Public
router.post('/classify', [
  body('wasteDescription').trim().notEmpty().withMessage('Waste description is required')
], validateRequest, async (req, res) => {
  try {
    const { wasteDescription } = req.body;
    
    // Try to find in database first
    const wasteType = await WasteType.findOne({
      $or: [
        { name: { $regex: wasteDescription, $options: 'i' } },
        { keywords: { $in: [new RegExp(wasteDescription, 'i')] } }
      ]
    });
    
    if (wasteType) {
      return res.json({
        success: true,
        classification: {
          name: wasteType.name,
          category: wasteType.category,
          confidence: 'high',
          instructions: wasteType.disposalInstructions,
          environmentalImpact: wasteType.environmentalImpact,
          tips: wasteType.recyclingTips,
          decompositionTime: wasteType.decompositionTime,
          examples: wasteType.examples
        },
        source: 'database'
      });
    }
    
    // Use rule-based classification
    const classification = classifyWaste(wasteDescription);
    
    res.json({
      success: true,
      classification: {
        wasteDescription,
        ...classification
      },
      source: 'ai-classifier'
    });
  } catch (error) {
    console.error('Classify Waste Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error classifying waste',
      error: error.message
    });
  }
});

// @route   GET /api/waste/categories
// @desc    Get all waste categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await WasteType.find().sort({ category: 1, name: 1 });
    
    // Group by category
    const grouped = categories.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({
        name: item.name,
        description: item.description,
        disposalInstructions: item.disposalInstructions,
        recyclingTips: item.recyclingTips,
        examples: item.examples
      });
      return acc;
    }, {});
    
    res.json({
      success: true,
      categories: grouped,
      totalItems: categories.length
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// @route   POST /api/waste/add-type
// @desc    Add new waste type (admin)
// @access  Private
router.post('/add-type', authMiddleware, [
  body('name').trim().notEmpty().withMessage('Waste name is required'),
  body('category').isIn(['recyclable', 'biodegradable', 'hazardous', 'landfill', 'compostable', 'electronic']).withMessage('Invalid category')
], validateRequest, async (req, res) => {
  try {
    const wasteType = new WasteType(req.body);
    await wasteType.save();
    
    res.status(201).json({
      success: true,
      message: 'Waste type added successfully',
      wasteType
    });
  } catch (error) {
    console.error('Add Waste Type Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding waste type',
      error: error.message
    });
  }
});

module.exports = router;
