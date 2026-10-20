import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import { productsRouter } from './server/routes/products.js';
import { categoriesRouter } from './server/routes/categories.js';
import { ordersRouter } from './server/routes/orders.js';
import { couponsRouter } from './server/routes/coupons.js';
import { settingsRouter } from './server/routes/settings.js';
import { adminRouter } from './server/routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json({ limit: '25mb' }));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'Bachon Ki Dunia API', time: new Date().toISOString() });
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Bachon Ki Dunia server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
