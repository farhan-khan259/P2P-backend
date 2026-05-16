// p2pbackend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import seed function
const seedAdmin = require('./seed');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
let dbConnected = false;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    dbConnected = true;

    // Run seed to ensure admin exists
    try {
      const seedFunction = require('./seed');
      await seedFunction();
    } catch (error) {
      console.log('Seed function note: Admin may already exist or seed requires direct DB access');
    }

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    // Dashboard routes
    const dashboardRoutes = require('./routes/dashboard');
    app.use('/api/dashboard', dashboardRoutes);

    // Health check route
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'MLM P2P Backend is running',
        timestamp: new Date().toISOString(),
      });
    });

    // Root route
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'MLM P2P Investment Backend API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          health: '/api/health',
        },
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    });

    // Start server with automatic port fallback if the preferred port is busy.
    const preferredPort = Number(process.env.PORT) || 5000;
    const maxPortRetries = 10;

    const startListening = (port, retriesLeft) => {
      const server = app.listen(port, () => {
        if (port !== preferredPort) {
          console.log(`⚠ Preferred port ${preferredPort} is busy. Using port ${port} instead.`);
        }
        console.log(`\n✓ Server running on http://localhost:${port}`);
        console.log(`✓ API endpoints available at http://localhost:${port}/api/auth`);
        console.log(`✓ Admin credentials: admin@gmail.com / admin123\n`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
          console.warn(`⚠ Port ${port} is in use. Trying port ${port + 1}...`);
          startListening(port + 1, retriesLeft - 1);
          return;
        }

        console.error('✗ Failed to bind server:', err.message);
        process.exit(1);
      });
    };

    startListening(preferredPort, maxPortRetries);
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('✗ Unhandled Rejection:', err.message);
  process.exit(1);
});
