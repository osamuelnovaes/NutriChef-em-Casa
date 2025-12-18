const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Initialize Express app
const app = express();

// Get environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ==================== SECURITY MIDDLEWARE ====================

// Set HTTP headers for security with Helmet
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting - protect against brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ==================== BODY PARSER & COMPRESSION ====================

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression middleware - compress all responses
app.use(compression());

// ==================== LOGGING ====================

// Morgan HTTP request logger
const morganFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ==================== HEALTH CHECK ENDPOINT ====================

/**
 * Health check endpoint
 * GET /health
 * Returns server status and basic information
 */
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    message: 'NutriChef-em-Casa server is running',
  };
  res.status(200).json(healthCheck);
});

/**
 * API Health check endpoint
 * GET /api/health
 * Returns API server status
 */
app.get('/api/health', (req, res) => {
  const apiHealthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NutriChef-em-Casa API',
    version: '1.0.0',
  };
  res.status(200).json(apiHealthCheck);
});

// ==================== API ROUTES ====================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NutriChef-em-Casa API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
    },
  });
});

// Import route handlers here as you create them
// Example:
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const recipeRoutes = require('./routes/recipes');
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/recipes', recipeRoutes);

// ==================== 404 HANDLER ====================

/**
 * 404 Not Found handler
 * Handles any requests that don't match defined routes
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// ==================== GLOBAL ERROR HANDLING ====================

/**
 * Global error handling middleware
 * Catches and handles all errors thrown in the application
 * Must be defined last, after all other middleware and routes
 */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details
  console.error({
    timestamp: new Date().toISOString(),
    statusCode,
    message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ==================== SERVER STARTUP ====================

/**
 * Start the Express server
 */
const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`
🚀 ==========================================
   NutriChef-em-Casa Server Started
🚀 ==========================================
   Port: ${PORT}
   Environment: ${NODE_ENV}
   CORS Origin: ${CORS_ORIGIN}
   URL: http://localhost:${PORT}
🚀 ==========================================
      `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;