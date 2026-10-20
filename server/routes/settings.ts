import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

export const settingsRouter = Router();

// GET /api/settings - Public store settings
settingsRouter.get('/', (req, res) => {
  const data = db.read();
  res.json(data.settings);
});

// PUT /api/settings - Update settings (Admin)
settingsRouter.put('/', requireAdmin, (req, res) => {
  try {
    const body = req.body;
    const updated = db.transaction((currentDb) => {
      currentDb.settings = {
        ...currentDb.settings,
        ...body,
        defaultShippingFee: Number(body.defaultShippingFee ?? currentDb.settings.defaultShippingFee),
        freeShippingThreshold: Number(body.freeShippingThreshold ?? currentDb.settings.freeShippingThreshold),
      };
      return { result: currentDb.settings, updatedDb: currentDb };
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update store settings', details: err.message });
  }
});
