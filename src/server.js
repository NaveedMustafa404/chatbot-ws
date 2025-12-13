require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/database');
const { initWebSocketServer } = require('./websocket/websocketServer');

// We import routes here 
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express(); 
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const wss = initWebSocketServer(server);

// Middleware -- Security and Parsing
app.use((req, res, next) => {
  if (req.headers.upgrade === 'websocket') {
    return next();
  }
  helmet()(req, res, next);
});

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WebSocket Chatbot API is running',
    timestamp: new Date().toISOString(),
    websocket: 'ws://localhost:' + PORT 
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket running on ws://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  
  // Close WebSocket connections
  wss.clients.forEach((client) => {
    client.close();
  });
  
  await pool.end();
  console.log('✅ Database connection pool closed');
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
