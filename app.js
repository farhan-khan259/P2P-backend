const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'MLM P2P Backend is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'MLM P2P Investment Backend API', version: '1.0.0' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'MLM P2P Backend is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'MLM P2P Investment Backend API', version: '1.0.0' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
