import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';
import type { Category } from '../types.js';

export const categoriesRouter = Router();

// GET /api/categories - List all categories
categoriesRouter.get('/', (req, res) => {
  try {
    const data = db.read();
    const categories = data.categories || [];
    // Sort by order or name
    categories.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve categories', details: err.message });
  }
});

// POST /api/categories - Create new category (Admin)
categoriesRouter.post('/', requireAdmin, (req, res) => {
  try {
    const { name, slug, description, imageUrl, isActive, order } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const generatedSlug =
      (slug && slug.trim()) ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: generatedSlug,
      description: description?.trim() || '',
      imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      isActive: isActive !== false,
      order: order ? Number(order) : undefined,
    };

    const saved = db.transaction((currentDb) => {
      if (!currentDb.categories) {
        currentDb.categories = [];
      }
      currentDb.categories.push(newCategory);
      return { result: newCategory, updatedDb: currentDb };
    });

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
});

// PUT /api/categories/:id - Update category (Admin)
categoriesRouter.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updated = db.transaction((currentDb) => {
      if (!currentDb.categories) {
        currentDb.categories = [];
      }
      const idx = currentDb.categories.findIndex((c) => c.id === id || c.slug === id);
      if (idx === -1) {
        return { result: null };
      }

      const existing = currentDb.categories[idx];
      const updatedCat: Category = {
        ...existing,
        ...body,
        name: body.name ? body.name.trim() : existing.name,
        slug: body.slug ? body.slug.trim() : existing.slug,
        description: body.description !== undefined ? body.description.trim() : existing.description,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl.trim() : existing.imageUrl,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        order: body.order !== undefined ? Number(body.order) : existing.order,
      };

      currentDb.categories[idx] = updatedCat;
      return { result: updatedCat, updatedDb: currentDb };
    });

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

// DELETE /api/categories/:id - Delete category (Admin)
categoriesRouter.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const deleted = db.transaction((currentDb) => {
      if (!currentDb.categories) {
        return { result: false };
      }
      const initialLen = currentDb.categories.length;
      currentDb.categories = currentDb.categories.filter((c) => c.id !== id && c.slug !== id);
      const changed = currentDb.categories.length < initialLen;
      return { result: changed, updatedDb: changed ? currentDb : undefined };
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found or already deleted' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
});
