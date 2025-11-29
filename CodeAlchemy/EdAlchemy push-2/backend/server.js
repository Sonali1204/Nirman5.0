const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');

const app = express();

// Connect to SQLite database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the correct path
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EdAlchemy API is running!',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 EdAlchemy Server Started!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log('💾 Database: SQLite (database.sqlite)');
  console.log(`📁 Frontend path: ${frontendPath}`);
});