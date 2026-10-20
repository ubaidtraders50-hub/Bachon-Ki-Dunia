import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';
import type { Order, OrderItem } from '../types.js';

export const ordersRouter = Router();

// POST /api/orders - Atomic Order Placement
ordersRouter.post('/', (req, res) => {
  try {
    const { customer, items, paymentMethod, couponCode } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address || !customer.city) {
      return res.status(400).json({ error: 'Customer name, phone, address, and city are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please select products.' });
    }

    // Atomic transaction for validation & stock deduction
    const orderResult = db.transaction((currentDb) => {
      const settings = currentDb.settings;
      let calculatedSubtotal = 0;
      const verifiedItems: OrderItem[] = [];

      // 1. Verify products & variation stock
      for (const item of items) {
        const product = currentDb.products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product "${item.productName || item.productId}" is no longer available.`);
        }

        const variation = product.variations.find((v) => v.id === item.variationId);
        if (!variation) {
          throw new Error(`The selected size/color for "${product.name}" is no longer available.`);
        }

        const requestedQty = Number(item.quantity);
        if (isNaN(requestedQty) || requestedQty <= 0) {
          throw new Error(`Invalid quantity for ${product.name}.`);
        }

        if (variation.stock < requestedQty) {
          throw new Error(
            `Insufficient stock for "${product.name}" (${variation.colorName}, ${variation.size}). Available: ${variation.stock}, requested: ${requestedQty}.`
          );
        }

        // Price check from database
        const unitPrice = variation.priceOverride ?? product.salePrice ?? product.regularPrice;
        const lineTotal = unitPrice * requestedQty;
        calculatedSubtotal += lineTotal;

        verifiedItems.push({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          variationId: variation.id,
          colorName: variation.colorName,
          size: variation.size,
          sku: variation.sku,
          unitPrice,
          quantity: requestedQty,
          subtotal: lineTotal,
          imageUrl: variation.imageUrl || product.images[0] || '',
        });
      }

      // 2. Validate Coupon
      let discount = 0;
      let appliedCoupon: string | undefined = undefined;

      if (couponCode && typeof couponCode === 'string') {
        const normalizedCode = couponCode.trim().toUpperCase();
        const coupon = currentDb.coupons.find((c) => c.code.toUpperCase() === normalizedCode && c.isActive);

        if (coupon) {
          if (calculatedSubtotal >= coupon.minOrderValue) {
            if (coupon.discountType === 'percentage') {
              discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
              }
            } else {
              discount = Math.min(coupon.discountValue, calculatedSubtotal);
            }
            appliedCoupon = coupon.code;
          }
        }
      }

      // 3. Shipping Fee
      const shippingFee =
        calculatedSubtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;

      const finalTotal = Math.max(0, calculatedSubtotal - discount + shippingFee);

      // 4. Deduct inventory atomically
      for (const item of verifiedItems) {
        const product = currentDb.products.find((p) => p.id === item.productId)!;
        const variation = product.variations.find((v) => v.id === item.variationId)!;
        variation.stock -= item.quantity;
      }

      // 5. Generate Order
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      const orderId = `BKD-${year}-${uniqueSuffix}`;

      const newOrder: Order = {
        id: orderId,
        customer: {
          fullName: customer.fullName.trim(),
          phone: customer.phone.trim(),
          email: (customer.email || '').trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          province: customer.province?.trim() || '',
          postalCode: customer.postalCode?.trim() || '',
          orderNotes: customer.orderNotes?.trim() || '',
        },
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        shippingFee,
        discount,
        couponCode: appliedCoupon,
        total: finalTotal,
        status: 'pending',
        paymentMethod: paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      currentDb.orders.unshift(newOrder);

      return {
        result: newOrder,
        updatedDb: currentDb,
      };
    });

    // Read latest settings for admin alerts
    const settings = db.read().settings;
    const rawAdminPhone = settings.adminAlertWhatsapp || settings.whatsapp || '03244422742';
    let cleanAdminPhone = rawAdminPhone.replace(/[^0-9]/g, '');
    if (cleanAdminPhone.startsWith('0092')) {
      cleanAdminPhone = cleanAdminPhone.slice(2);
    } else if (cleanAdminPhone.startsWith('0')) {
      cleanAdminPhone = '92' + cleanAdminPhone.slice(1);
    } else if (!cleanAdminPhone.startsWith('92') && cleanAdminPhone.length === 10) {
      cleanAdminPhone = '92' + cleanAdminPhone;
    }

    const adminEmail = settings.adminAlertEmail || settings.email || 'bachonkidunia50@gmail.com';

    const itemsSummary = orderResult.items
      .map((item) => `• ${item.quantity}x ${item.productName} (${item.colorName}, ${item.size}) - Rs. ${item.subtotal.toLocaleString()}`)
      .join('\n');

    const whatsappMessage = `🔔 *NEW ORDER CONFIRMED - BACHON KI DUNIA* 🔔\n\n` +
      `📦 *Order ID:* #${orderResult.id}\n` +
      `👤 *Customer Name:* ${orderResult.customer.fullName}\n` +
      `📞 *Customer Phone:* ${orderResult.customer.phone}\n` +
      `📍 *Delivery Address:* ${orderResult.customer.address}, ${orderResult.customer.city}\n\n` +
      `🛍️ *Items Ordered:*\n${itemsSummary}\n\n` +
      `💰 *Subtotal:* Rs. ${orderResult.subtotal.toLocaleString()}\n` +
      `🚚 *Shipping Fee:* ${orderResult.shippingFee === 0 ? 'FREE' : `Rs. ${orderResult.shippingFee}`}\n` +
      (orderResult.discount > 0 ? `🏷️ *Discount:* -Rs. ${orderResult.discount.toLocaleString()}\n` : '') +
      `💵 *TOTAL PAYABLE:* Rs. ${orderResult.total.toLocaleString()}\n` +
      `💳 *Payment Method:* ${orderResult.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'JazzCash / Direct Bank Transfer'}\n` +
      (orderResult.customer.orderNotes ? `📝 *Customer Notes:* ${orderResult.customer.orderNotes}\n` : '') +
      `\n✨ *Bachon Ki Dunia Online Order Notification*`;

    const adminWhatsappUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    const adminEmailMailto = `mailto:${adminEmail}?subject=${encodeURIComponent(`New Order Confirmed: #${orderResult.id} - ${orderResult.customer.fullName}`)}&body=${encodeURIComponent(whatsappMessage)}`;

    res.status(201).json({
      ...orderResult,
      adminWhatsappUrl,
      adminEmailMailto,
      whatsappMessage,
      adminPhone: rawAdminPhone,
      adminEmail,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Could not place order' });
  }
});

// GET /api/orders/track - Lookup order status
ordersRouter.get('/track', (req, res) => {
  try {
    const { orderId, query } = req.query;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const data = db.read();
    const searchId = (orderId as string).trim().toUpperCase();
    const order = data.orders.find((o) => o.id.toUpperCase() === searchId);

    if (!order) {
      return res.status(404).json({ error: 'No order found with this Order ID. Please check and try again.' });
    }

    // If query (phone/email) is provided, verify match for privacy
    if (query && typeof query === 'string' && query.trim()) {
      const q = query.trim().toLowerCase();
      const phoneMatch = order.customer.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const emailMatch = order.customer.email.toLowerCase().includes(q);
      if (!phoneMatch && !emailMatch) {
        return res.status(403).json({ error: 'Order ID found, but phone/email verification failed.' });
      }
    }

    // Return order details for tracking timeline
    res.json({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      total: order.total,
      itemCount: order.items.reduce((acc, i) => acc + i.quantity, 0),
      city: order.customer.city,
      items: order.items.map((i) => ({
        productName: i.productName,
        colorName: i.colorName,
        size: i.size,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Tracking lookup failed', details: err.message });
  }
});

// GET /api/orders/:id - Get full order by ID
ordersRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    const order = data.orders.find((o) => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve order', details: err.message });
  }
});

// GET /api/orders - Admin list orders
ordersRouter.get('/', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    let orders = [...data.orders];
    const { status, search } = req.query;

    if (status && typeof status === 'string' && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.customer.city.toLowerCase().includes(q)
      );
    }

    res.json({ orders, total: orders.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list orders', details: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status (Admin)
ordersRouter.patch('/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber, paymentStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const updated = db.transaction((currentDb) => {
      const order = currentDb.orders.find((o) => o.id === id);
      if (!order) return { result: null };

      const oldStatus = order.status;

      // Restock inventory if cancelling an order that wasn't already cancelled
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items) {
          const product = currentDb.products.find((p) => p.id === item.productId);
          if (product) {
            const variation = product.variations.find((v) => v.id === item.variationId);
            if (variation) {
              variation.stock += item.quantity;
            }
          }
        }
      }

      // Re-deduct if moving back from cancelled to active
      if (oldStatus === 'cancelled' && status && status !== 'cancelled') {
        for (const item of order.items) {
          const product = currentDb.products.find((p) => p.id === item.productId);
          if (product) {
            const variation = product.variations.find((v) => v.id === item.variationId);
            if (variation) {
              variation.stock = Math.max(0, variation.stock - item.quantity);
            }
          }
        }
      }

      if (status) order.status = status;
      if (courierName !== undefined) order.courierName = courierName;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
      if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
      order.updatedAt = new Date().toISOString();

      return { result: order, updatedDb: currentDb };
    });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});
