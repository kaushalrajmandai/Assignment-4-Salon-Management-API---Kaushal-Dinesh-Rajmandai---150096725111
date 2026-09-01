require('dotenv').config();

const PORT = process.env.PORT || 5000;

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`[FATAL] Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = require('./app');
const { checkConnection } = require('./config/supabase');

const start = async () => {
  try {
    await checkConnection();
    console.log('[DB] Supabase connected');

    const server = app.listen(PORT, () => {
      console.log(`[SERVER] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    const shutdown = (signal) => {
      console.log(`[SERVER] ${signal} received, shutting down`);
      server.close(() => process.exit(0));
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
};

start();