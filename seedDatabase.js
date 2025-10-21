const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WasteType = require('./models/WasteType');

dotenv.config();

const wasteData = [
    // Recyclable
    {
        name: 'Plastic Bottles (PET)',
        category: 'recyclable',
        description: 'Clear plastic bottles marked with recycling symbol #1',
        keywords: ['plastic bottle', 'water bottle', 'soda bottle', 'PET', 'beverage bottle'],
        disposalInstructions: 'Rinse clean, remove caps, and place in recycling bin. Flatten to save space.',
        environmentalImpact: 'Recycling saves 70% of energy compared to making new plastic. Can be recycled into clothing, carpet, and new bottles.',
        recyclingTips: 'Always remove and recycle caps separately. Rinse to avoid contamination.',
        decompositionTime: '450 years',
        examples: ['Water bottles', 'Soda bottles', 'Juice containers']
    },
    {
        name: 'Glass Bottles and Jars',
        category: 'recyclable',
        description: 'Glass containers of any color',
        keywords: ['glass', 'jar', 'glass bottle', 'wine bottle', 'glass container'],
        disposalInstructions: 'Rinse clean, remove lids, and place in glass recycling bin.',
        environmentalImpact: 'Glass can be recycled infinitely without loss of quality. Saves 30% energy.',
        recyclingTips: 'Separate by color if required. Remove metal lids and corks.',
        decompositionTime: '1 million years',
        examples: ['Wine bottles', 'Jam jars', 'Sauce bottles']
    },
    {
        name: 'Aluminum Cans',
        category: 'recyclable',
        description: 'Aluminum beverage cans',
        keywords: ['aluminum can', 'soda can', 'beer can', 'metal can'],
        disposalInstructions: 'Rinse and crush to save space. Place in metal recycling.',
        environmentalImpact: 'Recycling aluminum saves 95% of the energy needed to make new cans.',
        recyclingTips: 'One aluminum can saves enough energy to run a TV for 3 hours.',
        decompositionTime: '80-200 years',
        examples: ['Soda cans', 'Beer cans', 'Energy drink cans']
    },
    {
        name: 'Cardboard and Paper',
        category: 'recyclable',
        description: 'Clean cardboard boxes and paper products',
        keywords: ['cardboard', 'paper', 'box', 'newspaper', 'magazine'],
        disposalInstructions: 'Flatten boxes, remove tape and staples. Keep dry and clean.',
        environmentalImpact: 'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.',
        recyclingTips: 'Wet or food-soiled paper cannot be recycled - compost instead.',
        decompositionTime: '2-6 weeks',
        examples: ['Shipping boxes', 'Cereal boxes', 'Office paper', 'Newspapers']
    },
    
    // Biodegradable
    {
        name: 'Food Scraps',
        category: 'biodegradable',
        description: 'Vegetable and fruit waste',
        keywords: ['food waste', 'vegetable', 'fruit', 'peel', 'scraps'],
        disposalInstructions: 'Add to compost bin or green waste collection.',
        environmentalImpact: 'Composting reduces methane emissions and creates nutrient-rich soil.',
        recyclingTips: 'Avoid meat, dairy, and oily foods in home compost.',
        decompositionTime: '1-12 months',
        examples: ['Fruit peels', 'Vegetable scraps', 'Coffee grounds', 'Eggshells']
    },
    {
        name: 'Yard Waste',
        category: 'biodegradable',
        description: 'Grass, leaves, and plant trimmings',
        keywords: ['leaves', 'grass', 'yard waste', 'garden waste', 'plant'],
        disposalInstructions: 'Compost or place in yard waste bin.',
        environmentalImpact: 'Creates nutrient-rich compost, reduces landfill waste.',
        recyclingTips: 'Shred larger pieces to speed decomposition.',
        decompositionTime: '6-12 months',
        examples: ['Grass clippings', 'Leaves', 'Small branches', 'Plant trimmings']
    },
    
    // Compostable
    {
        name: 'Coffee Grounds and Tea Bags',
        category: 'compostable',
        description: 'Used coffee grounds and tea bags',
        keywords: ['coffee', 'tea bag', 'coffee grounds'],
        disposalInstructions: 'Add to compost bin or use as garden fertilizer.',
        environmentalImpact: 'Excellent source of nitrogen for compost.',
        recyclingTips: 'Remove staples from tea bags before composting.',
        decompositionTime: '3-6 months',
        examples: ['Used coffee filters', 'Tea bags', 'Coffee grounds']
    },
    
    // Hazardous
    {
        name: 'Batteries',
        category: 'hazardous',
        description: 'All types of batteries',
        keywords: ['battery', 'batteries', 'rechargeable', 'lithium'],
        disposalInstructions: 'Take to battery recycling center or hazardous waste collection.',
        environmentalImpact: 'Contains toxic heavy metals that can contaminate soil and water.',
        recyclingTips: 'Never throw in regular trash. Store safely until proper disposal.',
        decompositionTime: '100+ years (toxic)',
        examples: ['AA/AAA batteries', 'Lithium batteries', 'Car batteries', 'Phone batteries']
    },
    {
        name: 'Paint and Chemicals',
        category: 'hazardous',
        description: 'Household paints, solvents, and chemicals',
        keywords: ['paint', 'chemical', 'solvent', 'cleaner', 'pesticide'],
        disposalInstructions: 'Take to hazardous waste facility. Never pour down drain.',
        environmentalImpact: 'Can contaminate water supply and harm wildlife.',
        recyclingTips: 'Donate unused paint to community programs.',
        decompositionTime: 'Toxic - varies',
        examples: ['Latex paint', 'Oil-based paint', 'Pesticides', 'Household cleaners']
    },
    {
        name: 'Light Bulbs (CFL/LED)',
        category: 'hazardous',
        description: 'Compact fluorescent and LED bulbs',
        keywords: ['light bulb', 'CFL', 'LED', 'fluorescent'],
        disposalInstructions: 'Take to hardware store or hazardous waste collection.',
        environmentalImpact: 'CFLs contain mercury. Proper disposal prevents contamination.',
        recyclingTips: 'Store broken bulbs in sealed containers.',
        decompositionTime: 'Toxic components',
        examples: ['CFL bulbs', 'LED bulbs', 'Fluorescent tubes']
    },
    
    // Electronic
    {
        name: 'Electronics and E-Waste',
        category: 'electronic',
        description: 'Old phones, computers, and electronic devices',
        keywords: ['computer', 'phone', 'electronic', 'e-waste', 'device', 'cable'],
        disposalInstructions: 'Take to e-waste recycling center or manufacturer take-back program.',
        environmentalImpact: 'Contains valuable materials and toxic components. Proper recycling recovers resources.',
        recyclingTips: 'Erase data before recycling. Consider donating working devices.',
        decompositionTime: '1000+ years',
        examples: ['Old phones', 'Computers', 'Tablets', 'Chargers', 'Cables']
    },
    
    // Landfill
    {
        name: 'Plastic Bags and Film',
        category: 'landfill',
        description: 'Soft plastic bags and wrapping',
        keywords: ['plastic bag', 'shopping bag', 'film', 'wrapper'],
        disposalInstructions: 'Reuse when possible. Some stores have plastic bag recycling.',
        environmentalImpact: 'Takes centuries to break down. Major marine pollution source.',
        recyclingTips: 'Use reusable bags instead. Recycle at grocery store drop-off.',
        decompositionTime: '10-1000 years',
        examples: ['Shopping bags', 'Produce bags', 'Bread bags', 'Plastic wrap']
    },
    {
        name: 'Styrofoam',
        category: 'landfill',
        description: 'Polystyrene foam containers and packaging',
        keywords: ['styrofoam', 'polystyrene', 'foam', 'packing peanuts'],
        disposalInstructions: 'Difficult to recycle. Reduce usage. Check for specialized recycling.',
        environmentalImpact: 'Never biodegrades. Breaks into microplastics.',
        recyclingTips: 'Avoid purchasing products with styrofoam packaging.',
        decompositionTime: 'Never fully decomposes',
        examples: ['Food containers', 'Coffee cups', 'Packing peanuts', 'Egg cartons']
    },
    {
        name: 'Diapers and Sanitary Products',
        category: 'landfill',
        description: 'Disposable diapers and hygiene products',
        keywords: ['diaper', 'sanitary', 'hygiene products'],
        disposalInstructions: 'Place in regular trash. Not recyclable.',
        environmentalImpact: 'Takes 500 years to decompose. Consider reusable alternatives.',
        recyclingTips: 'Use cloth diapers or biodegradable alternatives when possible.',
        decompositionTime: '500 years',
        examples: ['Disposable diapers', 'Sanitary pads', 'Tampons']
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await WasteType.deleteMany({});
        console.log('🗑️  Cleared existing waste types');

        // Insert new data
        await WasteType.insertMany(wasteData);
        console.log(`✅ Inserted ${wasteData.length} waste types`);

        console.log('\n📊 Database seeded successfully!');
        console.log('\nWaste categories added:');
        console.log('  - Recyclable: 4 types');
        console.log('  - Biodegradable: 2 types');
        console.log('  - Compostable: 1 type');
        console.log('  - Hazardous: 3 types');
        console.log('  - Electronic: 1 type');
        console.log('  - Landfill: 3 types');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
