// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  // Transportation (per km)
  transportation: {
    car: 0.192,
    bus: 0.089,
    train: 0.041,
    bike: 0,
    walk: 0,
    motorcycle: 0.113,
    flight: 0.255,
    electric_car: 0.053
  },
  
  // Energy (per kWh)
  energy: {
    electricity: 0.5, // average grid electricity
    gas: 2.0 // per cubic meter
  },
  
  // Food (per kg)
  food: {
    meat: 27,
    vegetarian: 2
  },
  
  // Waste (per kg)
  waste: {
    landfill: 0.5,
    recycled: -0.2 // negative = carbon saved
  },
  
  // Water (per liter)
  water: {
    usage: 0.0003
  },
  
  // Renewable energy offset (per kWh)
  renewable: {
    solar: -0.5,
    wind: -0.5,
    hydro: -0.5,
    geothermal: -0.5,
    biomass: -0.3,
    tidal: -0.5
  }
};

// Calculate carbon emissions for an activity
const calculateCarbonEmissions = (activity) => {
  let emissions = 0;

  switch (activity.activityType) {
    case 'transportation':
      if (activity.transportMode && activity.distance) {
        emissions = EMISSION_FACTORS.transportation[activity.transportMode] * activity.distance;
      }
      break;

    case 'energy':
      if (activity.electricityUsage) {
        emissions += EMISSION_FACTORS.energy.electricity * activity.electricityUsage;
      }
      if (activity.gasUsage) {
        emissions += EMISSION_FACTORS.energy.gas * activity.gasUsage;
      }
      break;

    case 'food':
      if (activity.meatConsumption) {
        emissions += EMISSION_FACTORS.food.meat * activity.meatConsumption;
      }
      if (activity.vegetarianMeals) {
        emissions += EMISSION_FACTORS.food.vegetarian * activity.vegetarianMeals;
      }
      break;

    case 'waste':
      if (activity.wasteGenerated) {
        emissions += EMISSION_FACTORS.waste.landfill * activity.wasteGenerated;
      }
      if (activity.recycledWaste) {
        emissions += EMISSION_FACTORS.waste.recycled * activity.recycledWaste;
      }
      break;

    case 'water':
      if (activity.waterUsage) {
        emissions += EMISSION_FACTORS.water.usage * activity.waterUsage;
      }
      break;
  }

  return Math.max(0, emissions); // Ensure non-negative
};

// Calculate renewable energy carbon offset
const calculateRenewableOffset = (energyGenerated, energySource) => {
  const factor = EMISSION_FACTORS.renewable[energySource] || -0.5;
  return Math.abs(factor * energyGenerated); // Return positive offset value
};

// Get reduction tips based on activity type and emissions
const getReductionTips = (activityType, activity) => {
  const tips = {
    transportation: [
      {
        title: 'Use Public Transportation',
        description: 'Take the bus or train instead of driving alone. You could reduce emissions by up to 45%.',
        impact: 'high',
        category: 'transportation'
      },
      {
        title: 'Bike or Walk for Short Trips',
        description: 'For trips under 5km, consider biking or walking. Zero emissions and great for your health!',
        impact: 'high',
        category: 'transportation'
      },
      {
        title: 'Carpool with Others',
        description: 'Share rides with colleagues or friends to reduce your carbon footprint per person.',
        impact: 'medium',
        category: 'transportation'
      },
      {
        title: 'Consider an Electric Vehicle',
        description: 'Electric cars produce 72% less CO2 than traditional vehicles over their lifetime.',
        impact: 'high',
        category: 'transportation'
      }
    ],
    energy: [
      {
        title: 'Switch to LED Bulbs',
        description: 'LED bulbs use 75% less energy and last 25 times longer than traditional bulbs.',
        impact: 'medium',
        category: 'energy'
      },
      {
        title: 'Unplug Unused Electronics',
        description: 'Phantom power from unused devices can account for 10% of your electricity bill.',
        impact: 'low',
        category: 'energy'
      },
      {
        title: 'Use Energy-Efficient Appliances',
        description: 'Look for ENERGY STAR certified appliances to reduce consumption by 10-50%.',
        impact: 'high',
        category: 'energy'
      },
      {
        title: 'Adjust Your Thermostat',
        description: 'Lower heating by 1°C to save 10% on energy bills and reduce emissions.',
        impact: 'high',
        category: 'energy'
      },
      {
        title: 'Install Solar Panels',
        description: 'Generate clean, renewable energy and reduce your carbon footprint to near zero.',
        impact: 'high',
        category: 'energy'
      }
    ],
    food: [
      {
        title: 'Reduce Meat Consumption',
        description: 'Try Meatless Mondays! Reducing meat by one day per week can save 1,600 lbs of CO2 per year.',
        impact: 'high',
        category: 'food'
      },
      {
        title: 'Buy Local and Seasonal',
        description: 'Local produce requires less transportation, reducing associated carbon emissions.',
        impact: 'medium',
        category: 'food'
      },
      {
        title: 'Reduce Food Waste',
        description: '30% of food is wasted. Plan meals and use leftovers to minimize waste.',
        impact: 'medium',
        category: 'food'
      },
      {
        title: 'Grow Your Own Food',
        description: 'Start a small garden for herbs and vegetables. Zero food miles!',
        impact: 'medium',
        category: 'food'
      }
    ],
    waste: [
      {
        title: 'Recycle Properly',
        description: 'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.',
        impact: 'high',
        category: 'waste'
      },
      {
        title: 'Compost Organic Waste',
        description: 'Composting reduces methane emissions from landfills and creates nutrient-rich soil.',
        impact: 'high',
        category: 'waste'
      },
      {
        title: 'Reduce Single-Use Items',
        description: 'Use reusable bags, bottles, and containers instead of disposable ones.',
        impact: 'medium',
        category: 'waste'
      },
      {
        title: 'Buy Products with Less Packaging',
        description: 'Choose bulk items and products with minimal or recyclable packaging.',
        impact: 'medium',
        category: 'waste'
      }
    ],
    water: [
      {
        title: 'Fix Leaking Faucets',
        description: 'A dripping tap can waste 15 liters per day. Fix leaks promptly.',
        impact: 'medium',
        category: 'water'
      },
      {
        title: 'Take Shorter Showers',
        description: 'Reduce shower time by 2 minutes to save 10 gallons of water.',
        impact: 'medium',
        category: 'water'
      },
      {
        title: 'Install Water-Efficient Fixtures',
        description: 'Low-flow showerheads and faucets can reduce water use by 50%.',
        impact: 'high',
        category: 'water'
      },
      {
        title: 'Collect Rainwater',
        description: 'Use rainwater for gardening and reduce treated water consumption.',
        impact: 'medium',
        category: 'water'
      }
    ],
    general: [
      {
        title: 'Offset Your Carbon Footprint',
        description: 'Support verified carbon offset projects like reforestation and renewable energy.',
        impact: 'high',
        category: 'general'
      },
      {
        title: 'Educate Others',
        description: 'Share your knowledge about sustainability with family and friends.',
        impact: 'medium',
        category: 'general'
      },
      {
        title: 'Support Sustainable Businesses',
        description: 'Choose companies committed to environmental responsibility.',
        impact: 'medium',
        category: 'general'
      }
    ]
  };

  return tips[activityType] || tips.general;
};

module.exports = {
  EMISSION_FACTORS,
  calculateCarbonEmissions,
  calculateRenewableOffset,
  getReductionTips
};
