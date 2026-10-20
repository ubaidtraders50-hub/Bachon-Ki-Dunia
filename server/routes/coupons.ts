import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';
import type { Coupon } from '../types.js';

export const couponsRouter = Router();

// POST /api/coupons/validate - Validate coupon for customer checkout
couponsRouter.post('/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Please enter a coupon code.' });
    }

    const data = db.read();
    const normalized = code.trim().toUpperCase();
    const coupon = data.coupons.find((c) => c.code.toUpperCase() === normalized && c.isActive);

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `This coupon requires a minimum cart value of Rs. ${coupon.minOrderValue.toLocaleString()}.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, orderSubtotal);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      message: `Coupon "${coupon.code}" applied successfully! You save Rs. ${discount.toLocaleString()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to validate coupon', details: err.message });
  }
});

// GET /api/coupons - List all coupons (Admin)
couponsRouter.get('/', requireAdmin, (req, res) => {
  const data = db.read();
  res.json({ coupons: data.coupons });
});

// POST /api/coupons - Create coupon (Admin)
couponsRouter.post('/', requireAdmin, (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Code and discount value are required.' });
    }

    const newCoupon: Coupon = {
      code: code.trim().toUpperCase(),
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      isActive: true,
    };

    const saved = db.transaction((currentDb) => {
      // Check duplicate
      if (currentDb.coupons.some((c) => c.code === newCoupon.code)) {
        throw new Error('A coupon with this code already exists.');
      }
      currentDb.coupons.unshift(newCoupon);
      return { result: newCoupon, updatedDb: currentDb };
    });

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create coupon' });
  }
});

// DELETE /api/coupons/:code - Delete coupon (Admin)
couponsRouter.delete('/:code', requireAdmin, (req, res) => {
  try {
    const { code } = req.params;
    const removed = db.transaction((currentDb) => {
      const idx = currentDb.coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
      if (idx === -1) return { result: false };
      currentDb.coupons.splice(idx, 1);
      return { result: true, updatedDb: currentDb };
    });

    if (!removed) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon removed' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete coupon', details: err.message });
  }
});
