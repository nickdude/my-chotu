require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit  = require('express-rate-limit');

const config = require('./config/env');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const v1Routes = require('./routes/v1');

const app = express();

// ─── Security & parsing ───────────────────────────────────────────────────────
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy:  { policy: 'cross-origin' },
  contentSecurityPolicy: config.isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      scriptSrc:  ["'self'"],
    },
  },
}));

// Global rate limit — generous ceiling; per-route limits enforce stricter thresholds
app.use(rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max:      300,           // 300 req/min per IP is high enough for legitimate clients
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
}));

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestId);

// ─── Logging ──────────────────────────────────────────────────────────────────
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv, ts: new Date().toISOString() });
});

app.use('/api/v1', v1Routes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
    app.listen(config.port, () => {
      logger.info(`API running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down');
  await prisma.$disconnect();
  process.exit(0);
});

start();
