require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

/* ============================================================
   PROCESS-LEVEL SAFETY NETS
   ============================================================ */
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled promise rejection (server continues):', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught exception (server continues):', err?.stack || err);
});

/* ============================================================
   DATABASE — non-blocking
   ============================================================ */
Promise.resolve()
  .then(() => connectDB())
  .catch((err) => {
    console.error(
      '❌ Initial DB connection failed — server will keep running:',
      err?.message || err
    );
  });

/* ============================================================
   CORS
   Accepts FRONTEND_URL (preferred) and CLIENT_URL (legacy).
   Missing vars won't break anything; disallowed origins get
   no CORS headers (browser blocks) but the server never 500s.
   ============================================================ */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

/* ============================================================
   BODY PARSERS — bounded
   ============================================================ */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Malformed JSON → 400, not a crash
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  next(err);
});

/* ============================================================
   NO /uploads STATIC — files live on Cloudinary now.
   ============================================================ */

/* ============================================================
   ROUTES — wrapped so a single broken controller / missing
   dependency does not crash the whole server at boot.
   ============================================================ */
function safeRequire(modPath, name) {
  try {
    return require(modPath);
  } catch (err) {
    console.error(
      `❌ Failed to load ${name} from "${modPath}" — endpoint disabled:`,
      err.message
    );
    const stub = express.Router();
    stub.use((req, res) =>
      res.status(503).json({ message: `${name} is currently unavailable` })
    );
    return stub;
  }
}

app.use('/api/auth',     safeRequire('./routes/authRoutes',    'authRoutes'));
app.use('/api/products', safeRequire('./routes/productRoutes', 'productRoutes'));
app.use('/api/orders',   safeRequire('./routes/orderRoutes',   'orderRoutes'));
app.use('/api/admin',    safeRequire('./routes/adminRoutes',   'adminRoutes'));
app.use('/api/messages', safeRequire('./routes/messageRoutes', 'messageRoutes'));

/* ============================================================
   HEALTH CHECK — include DB status for Render probes
   ============================================================ */
let dbStatus = () => 'unknown';
try {
  const mongoose = require('mongoose');
  dbStatus = () =>
    mongoose.connection?.readyState === 1 ? 'connected' : 'disconnected';
} catch { /* mongoose not used — fine */ }

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbStatus(),
  });
});

// Root route — satisfies Render's health probes and returns useful info
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'electric-url-api',
    health: '/api/health',
    docs: 'All endpoints live under /api/*',
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   404
   ============================================================ */
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
});

/* ============================================================
   GLOBAL ERROR HANDLER
   ============================================================ */
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error('❌ API Error:', err?.message || err);

  try {
    res.status(statusCode).json({
      message: err?.message || 'Server error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
    });
  } catch (sendErr) {
    console.error('❌ Error handler itself failed:', sendErr?.message || sendErr);
    if (!res.headersSent) res.status(500).end();
  }
});

/* ============================================================
   START
   ============================================================ */
const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ') || '(none configured)'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use.`);
  } else {
    console.error('❌ HTTP server error:', err?.message || err);
  }
});

/* ============================================================
   GRACEFUL SHUTDOWN — with hard timeout
   ============================================================ */
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully…`);

  const forceTimer = setTimeout(() => {
    console.error('⏱  Forced exit after 10s (open connections did not close).');
    process.exit(1);
  }, 10_000);

  server.close(() => {
    clearTimeout(forceTimer);
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));