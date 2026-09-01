const express = require('express');
const cors = require('cors');

const loggingMiddleware = require('./middleware/loggingMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/auth');
const salonRoutes = require('./routes/salons');
const serviceRoutes = require('./routes/services');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '100kb' }));
app.use(loggingMiddleware);

app.get('/', (req, res) => {
  res.status(200).json({ data: null, message: 'Welcome to Salon APIs', status: 200 });
});

app.get('/health', (req, res) => {
  res.status(200).json({ data: { uptime: process.uptime() }, message: 'OK', status: 200 });
});

app.use('/', authRoutes);
app.use('/salons', salonRoutes);
app.use('/services', serviceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;