const mongoose = require('mongoose');
const Activity = require('./models/Activity');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function addSampleActivities() {
  try {
    // Get your user ID (replace with your actual user ID from the database)
    // You can get this from the console log or MongoDB
    const userId = '68f7548d25b705c4e52c7e6b'; // Update this with your actual user ID
    
    const today = new Date();
    const sampleActivities = [];
    
    // Create activities for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Transportation activity
      sampleActivities.push({
        userId: userId,
        activityType: 'transportation',
        transportMode: 'car',
        distance: 30 + Math.random() * 20, // 30-50 km
        date: date,
        carbonEmissions: 7 + Math.random() * 5 // Will be recalculated
      });
      
      // Energy activity
      sampleActivities.push({
        userId: userId,
        activityType: 'energy',
        electricityUsage: 10 + Math.random() * 5, // 10-15 kWh
        date: date,
        carbonEmissions: 5 + Math.random() * 3 // Will be recalculated
      });
      
      // Food activity (every other day)
      if (i % 2 === 0) {
        sampleActivities.push({
          userId: userId,
          activityType: 'food',
          meatConsumption: 0.5 + Math.random() * 1, // 0.5-1.5 kg
          date: date,
          carbonEmissions: 3 + Math.random() * 2 // Will be recalculated
        });
      }
    }
    
    // Insert all activities
    const result = await Activity.insertMany(sampleActivities);
    console.log(`✅ Successfully added ${result.length} sample activities!`);
    console.log('📊 Activities span the last 7 days');
    console.log('🔄 Refresh your dashboard to see the trend chart!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample activities:', error);
    process.exit(1);
  }
}

addSampleActivities();
