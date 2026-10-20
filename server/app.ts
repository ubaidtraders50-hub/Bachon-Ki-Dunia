import express from 'express';
import dotenv from 'dotenv';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { couponsRouter } from './routes/coupons.js';
import { settingsRouter } from './routes/settings.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

export const app = express();

// Middleware
app.use(express.json({ limit: '25mb' }));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'Bachon Ki Dunia API',
    time: new Date().toISOString(),
  });
});

export default app;
