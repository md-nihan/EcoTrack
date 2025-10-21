# EcoTrack - Climate Change & Sustainability Platform

A comprehensive web platform for tracking carbon footprint, managing waste, monitoring renewable energy, and reducing plastic pollution. Built with Node.js, Express.js, MongoDB, and real-time WebSocket notifications.

## 🌟 Features

### 1. **Carbon Footprint Calculator**
- Track daily activities (transportation, energy, food, waste, water)
- Real-time CO₂ emission calculations
- Personalized reduction tips
- Visual charts and analytics
- Monthly/yearly summaries

### 2. **Smart Waste Sorting**
- AI-powered waste classification
- Instant disposal instructions
- Environmental impact information
- Comprehensive waste categories database

### 3. **Renewable Energy Tracker**
- Log solar, wind, hydro, and other renewable sources
- Carbon offset calculations
- Energy generation vs. consumption tracking
- Savings and impact reports

### 4. **Plastic Pollution Monitor**
- Track plastic usage by type
- Set reduction goals
- Monitor recycling rates
- Progress tracking and alerts

### 5. **Real-Time Notifications**
- WebSocket-powered live updates
- Achievement notifications
- Goal progress alerts
- Community statistics

### 6. **Personalized Eco Tips**
- AI-driven recommendations
- Impact-based suggestions
- Category-specific advice

## 🚀 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (Flexbox/Grid)
- **JavaScript (ES6+)** - Interactivity
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd "mega climate change and sustainability"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/climate-sustainability
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

6. **Access the application**
Open your browser and navigate to:
```
http://localhost:5000
```

## 🗂️ Project Structure

```
mega climate change and sustainability/
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Activity.js
│   ├── WasteType.js
│   ├── RenewableEnergy.js
│   ├── PlasticUsage.js
│   └── Notification.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── carbonRoutes.js
│   ├── wasteRoutes.js
│   ├── renewableRoutes.js
│   ├── plasticRoutes.js
│   ├── notificationRoutes.js
│   └── utilityRoutes.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── validate.js
├── utils/              # Utility functions
│   └── carbonCalculator.js
├── public/             # Frontend files
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   └── js/
│       ├── main.js
│       ├── auth.js
│       └── dashboard.js
├── server.js           # Express server
├── package.json
└── README.md
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh-token` - Refresh JWT token

### Carbon Footprint
- `POST /api/carbon-activities` - Add activity
- `GET /api/carbon-activities` - Get activities
- `PUT /api/carbon-activities/:id` - Update activity
- `DELETE /api/carbon-activities/:id` - Delete activity
- `GET /api/carbon-footprint/summary` - Get summary
- `GET /api/carbon-footprint/tips` - Get personalized tips

### Waste Sorting
- `POST /api/waste/classify` - Classify waste item
- `GET /api/waste/categories` - Get waste categories

### Renewable Energy
- `POST /api/renewable-energy` - Log energy data
- `GET /api/renewable-energy` - Get energy logs
- `GET /api/renewable-energy/summary` - Get summary

### Plastic Usage
- `POST /api/plastic-usage` - Log plastic usage
- `GET /api/plastic-usage` - Get plastic logs
- `GET /api/plastic-usage/summary` - Get summary

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read/:id` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Utilities
- `GET /api/activities/types` - Get activity types
- `GET /api/environmental-data/carbon-factors` - Get emission factors
- `GET /api/stats/global` - Get global statistics

## 🎨 Features Highlight

### Carbon Emission Factors
The platform uses scientifically-backed emission factors:
- **Transportation**: Car (0.192 kg CO₂/km), Bus (0.089 kg/km), Train (0.041 kg/km)
- **Energy**: Electricity (0.5 kg CO₂/kWh), Gas (2.0 kg/m³)
- **Food**: Meat (27 kg CO₂/kg), Vegetarian meals (2 kg/kg)
- **Waste**: Landfill (0.5 kg/kg), Recycled (-0.2 kg/kg)

### Smart Features
- **Auto-calculation**: Emissions calculated automatically based on input
- **Real-time updates**: WebSocket notifications for achievements
- **Personalized tips**: AI-driven recommendations based on user behavior
- **Goal tracking**: Set and monitor carbon and plastic reduction goals
- **Visual analytics**: Interactive charts with Chart.js

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- Environment variable protection

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Design

Fully responsive design optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

Built for climate action and sustainability awareness.

## 🙏 Acknowledgments

- Carbon emission factors from EPA and IPCC
- Font Awesome for icons
- Chart.js for visualizations
- Socket.IO for real-time features

## 📞 Support

For support, email support@ecotrack.com or open an issue in the repository.

## 🚀 Future Enhancements

- Mobile app (React Native)
- Machine learning for better waste classification
- Social features and community challenges
- Carbon offset marketplace integration
- Integration with smart home devices
- Gamification with badges and leaderboards

---

**Make a difference, one action at a time! 🌍**
