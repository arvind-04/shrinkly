const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { generalLimiter, redirectLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const urlController = require('./controllers/urlController');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes with general rate limiting
app.use('/api/auth', generalLimiter, authRoutes);
app.use('/api/urls', generalLimiter, urlRoutes);
app.use('/api/analytics', generalLimiter, analyticsRoutes);

// Short URL redirect (root level, with redirect-specific rate limiter)
app.get('/:shortCode', redirectLimiter, urlController.redirectUrl);

// Error handling
app.use(errorHandler);

module.exports = app;
