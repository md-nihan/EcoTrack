const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Validate JWT Secret on startup
const { validateJWTSecret } = require('./utils/validateJWT');
validateJWTSecret();

// Import routes
const authRoutes = require('./routes/authRoutes');
const carbonRoutes = require('./routes/carbonRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const renewableRoutes = require('./routes/renewableRoutes');
const plasticRoutes = require('./routes/plasticRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const utilityRoutes = require('./routes/utilityRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Make io accessible to routes
app.set('io', io);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/carbon-activities', carbonRoutes);
app.use('/api/carbon-footprint', carbonRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/renewable-energy', renewableRoutes);
app.use('/api/plastic-usage', plasticRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', utilityRoutes);

// Root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Climate Change & Sustainability API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      carbonActivities: '/api/carbon-activities',
      carbonFootprint: '/api/carbon-footprint',
      waste: '/api/waste',
      renewableEnergy: '/api/renewable-energy',
      plasticUsage: '/api/plastic-usage',
      notifications: '/api/notifications'
    }
  });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };


