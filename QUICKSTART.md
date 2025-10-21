# 🚀 Quick Start Guide - EcoTrack

## ⚡ Get Started in 3 Minutes!

### Step 1: Install & Seed (1 minute)
```bash
npm install
npm run seed
```

### Step 2: Start Server (30 seconds)
```bash
npm run dev
```

### Step 3: Open Browser (30 seconds)
Navigate to: **http://localhost:5000**

## 🎯 What to Try First

### 1. Create Account
- Click "Get Started" button
- Username: `demo`
- Email: `demo@ecotrack.com`
- Password: `demo123`

### 2. Explore Dashboard
- View overview statistics
- Check interactive charts
- See recent activities

### 3. Log Carbon Activity
- Click "Carbon Tracking" in sidebar
- Select "Transportation"
- Choose "Car" and enter "50" km
- See instant CO₂ calculation!

### 4. Try Waste Classifier
- Click "Waste Sorting"
- Type "plastic bottle"
- Get instant classification!

### 5. Log Renewable Energy
- Click "Renewable Energy"
- Select "Solar"
- Enter "100" kWh
- See carbon offset!

## 📊 Project Structure Overview

```
project/
├── server.js              # Main server file
├── models/                # Database schemas
├── routes/                # API endpoints
├── middleware/            # Auth & validation
├── utils/                 # Helper functions
├── public/                # Frontend files
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── register.html     # Signup page
│   ├── dashboard.html    # Main dashboard
│   ├── css/              # Stylesheets
│   └── js/               # Client scripts
├── seedDatabase.js       # Database seeder
└── README.md             # Full documentation
```

## 🎨 Features at a Glance

| Feature | Description | Status |
|---------|-------------|--------|
| 🌍 Landing Page | Beautiful intro page | ✅ Complete |
| 🔐 Authentication | Login/Register with JWT | ✅ Complete |
| 📊 Dashboard | Interactive overview | ✅ Complete |
| 🚗 Carbon Tracker | 5 activity categories | ✅ Complete |
| ♻️ Waste Sorter | 14 waste types | ✅ Complete |
| ⚡ Energy Logger | 6 renewable sources | ✅ Complete |
| 🧴 Plastic Monitor | 9 plastic types | ✅ Complete |
| 💡 Eco Tips | 50+ personalized tips | ✅ Complete |
| 🔔 Notifications | Real-time Socket.IO | ✅ Complete |
| 📱 Responsive | Mobile, tablet, desktop | ✅ Complete |

## 🔑 Key Technologies

- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Real-time**: Socket.IO
- **Charts**: Chart.js
- **Auth**: JWT + bcrypt

## 🌟 Key Features Explained

### Carbon Footprint Calculator
Tracks 5 activity types:
- 🚗 **Transportation**: Car, bus, bike, walk, etc.
- ⚡ **Energy**: Electricity and gas usage
- 🍽️ **Food**: Meat consumption vs vegetarian meals
- ♻️ **Waste**: Generated and recycled amounts
- 💧 **Water**: Daily water usage

**Auto-calculates CO₂ emissions using EPA factors!**

### Smart Waste Sorting
Pre-loaded with 14 waste types:
- ♻️ Recyclable (4 types)
- 🌱 Biodegradable (2 types)
- ☘️ Compostable (1 type)
- ⚠️ Hazardous (3 types)
- 📱 Electronic (1 type)
- 🗑️ Landfill (3 types)

**Includes disposal instructions and environmental impact!**

### Real-Time Notifications
Get instant alerts for:
- High carbon activities
- Renewable energy achievements
- Plastic usage warnings
- Goal completions

## 📱 Responsive Design

Works perfectly on:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (< 768px)

## 🎯 Demo Credentials

For quick testing:
```
Username: demo
Email: demo@ecotrack.com
Password: demo123
```

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## ⚠️ Troubleshooting

**Server won't start?**
→ Make sure MongoDB is running: `mongod`

**Port already in use?**
→ Change PORT in `.env` file

**Dependencies error?**
→ Delete `node_modules` and run `npm install`

## 🎨 UI Colors

- Primary: `#10b981` (Green)
- Secondary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Red)

## 📞 Need Help?

Check these files:
- **README.md** - Full project documentation
- **DEPLOYMENT_GUIDE.md** - Detailed deployment guide
- **server.js** - Backend server code
- **public/js/dashboard.js** - Frontend logic

## 🌍 Make an Impact!

Every action you track helps:
- 📊 Understand your environmental footprint
- 🎯 Set and achieve sustainability goals
- 🌱 Make informed eco-friendly decisions
- 🌍 Contribute to a healthier planet

---

**Ready to make a difference? Start tracking now! 🚀**

Visit: http://localhost:5000
