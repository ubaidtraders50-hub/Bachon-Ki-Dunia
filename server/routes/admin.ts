import { Router } from 'express';
import { db } from '../db.js';
import { verifyPassword, hashPassword, createToken, requireAdmin, type AuthenticatedRequest } from '../auth.js';

export const adminRouter = Router();

// POST /api/admin/login
adminRouter.post('/login', (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const data = db.read();
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const admin = data.admins.find(
      (a) => a.email.toLowerCase() === cleanInput || a.username.toLowerCase() === cleanInput
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const isValid = verifyPassword(password, admin.passwordHash, admin.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = createToken({ id: admin.id, email: admin.email, role: admin.role });

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/admin/me
adminRouter.get('/me', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ admin: req.user });
});

// POST /api/admin/change-password
adminRouter.post('/change-password', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const data = db.read();
    const admin = data.admins.find((a) => a.id === req.user?.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const isValid = verifyPassword(currentPassword, admin.passwordHash, admin.salt);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const { hash, salt } = hashPassword(newPassword);

    db.transaction((currentDb) => {
      const target = currentDb.admins.find((a) => a.id === req.user?.id);
      if (target) {
        target.passwordHash = hash;
        target.salt = salt;
      }
      return { result: true, updatedDb: currentDb };
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password', details: err.message });
  }
});

// GET /api/admin/dashboard-stats
adminRouter.get('/dashboard-stats', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    const orders = data.products ? data.orders : [];
    const products = data.products || [];

    // Financials
    const completedOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
    const processingOrders = orders.filter((o) => o.status === 'processing').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    // Inventory status
    const lowStockThreshold = 5;
    const lowStockItems: Array<{
      productId: string;
      productName: string;
      variationId: string;
      colorName: string;
      size: string;
      stock: number;
      sku: string;
    }> = [];

    let totalInventoryUnits = 0;

    for (const p of products) {
      for (const v of p.variations) {
        totalInventoryUnits += v.stock;
        if (v.stock <= lowStockThreshold) {
          lowStockItems.push({
            productId: p.id,
            productName: p.name,
            variationId: v.id,
            colorName: v.colorName,
            size: v.size,
            stock: v.stock,
            sku: v.sku,
          });
        }
      }
    }

    // Top Selling Items calculated from actual order snapshots
    const salesByProduct: Record<string, { name: string; units: number; revenue: number; image: string }> = {};
    for (const o of completedOrders) {
      for (const item of o.items) {
        if (!salesByProduct[item.productId]) {
          salesByProduct[item.productId] = {
            name: item.productName,
            units: 0,
            revenue: 0,
            image: item.imageUrl,
          };
        }
        salesByProduct[item.productId].units += item.quantity;
        salesByProduct[item.productId].revenue += item.subtotal;
      }
    }

    const topProducts = Object.values(salesByProduct)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts: products.length,
      totalInventoryUnits,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.slice(0, 10),
      topProducts,
      recentOrders: orders.slice(0, 6),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve stats', details: err.message });
  }
});
