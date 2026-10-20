import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';
import type { Product, ProductVariation } from '../types.js';

export const productsRouter = Router();

// GET /api/products - Search & Filter
productsRouter.get('/', (req, res) => {
  try {
    const data = db.read();
    let products = [...data.products];

    const {
      search,
      category,
      season,
      gender,
      size,
      color,
      inStock,
      minPrice,
      maxPrice,
      sort,
      featured,
      newArrival,
      bestSeller,
      limit,
    } = req.query;

    // Search query
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.variations.some((v) => v.colorName.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q))
      );
    }

    // Category
    if (typeof category === 'string' && category && category !== 'all') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Season
    if (typeof season === 'string' && season && season !== 'all') {
      products = products.filter((p) => p.season === season || p.season === 'all');
    }

    // Gender
    if (typeof gender === 'string' && gender && gender !== 'all') {
      products = products.filter((p) => p.gender === gender || p.gender === 'unisex');
    }

    // Featured / New / BestSeller flags
    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured);
    }
    if (newArrival === 'true') {
      products = products.filter((p) => p.isNewArrival);
    }
    if (bestSeller === 'true') {
      products = products.filter((p) => p.isBestSeller);
    }

    // Size filter (checks variations)
    if (typeof size === 'string' && size) {
      products = products.filter((p) => p.variations.some((v) => v.size.toLowerCase() === size.toLowerCase()));
    }

    // Color filter (checks variations)
    if (typeof color === 'string' && color) {
      products = products.filter((p) => p.variations.some((v) => v.colorName.toLowerCase().includes(color.toLowerCase())));
    }

    // In-Stock filter
    if (inStock === 'true') {
      products = products.filter((p) => p.variations.some((v) => v.stock > 0));
    }

    // Price range
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        products = products.filter((p) => (p.salePrice ?? p.regularPrice) >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        products = products.filter((p) => (p.salePrice ?? p.regularPrice) <= max);
      }
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => (a.salePrice ?? a.regularPrice) - (b.salePrice ?? b.regularPrice));
    } else if (sort === 'price_desc') {
      products.sort((a, b) => (b.salePrice ?? b.regularPrice) - (a.salePrice ?? a.regularPrice));
    } else if (sort === 'popularity' || sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating || (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // Default: newest
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = products.length;

    if (limit) {
      const l = parseInt(limit as string, 10);
      if (!isNaN(l) && l > 0) {
        products = products.slice(0, l);
      }
    }

    res.json({
      products,
      total,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

// GET /api/products/:slugOrId - Single product
productsRouter.get('/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const data = db.read();
    const product = data.products.find((p) => p.slug === slugOrId || p.id === slugOrId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Related products (same category or season)
    const related = data.products
      .filter((p) => p.id !== product.id && (p.category === product.category || p.season === product.season))
      .slice(0, 4);

    res.json({ product, related });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get product', details: err.message });
  }
});

// POST /api/products - Create product (Admin)
productsRouter.post('/', requireAdmin, (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      season,
      gender,
      regularPrice,
      salePrice,
      fabric,
      careInstructions,
      images,
      variations,
      isFeatured,
      isNewArrival,
      isBestSeller,
    } = req.body;

    if (!name || !regularPrice || !variations || !Array.isArray(variations) || variations.length === 0) {
      return res.status(400).json({ error: 'Product name, regular price, and at least one variation are required.' });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      slug: generatedSlug,
      description: description || '',
      category: category || 'sets',
      season: season || 'all',
      gender: gender || 'unisex',
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      fabric: fabric || '100% Breathable Cotton',
      careInstructions: careInstructions || 'Machine wash cold.',
      images: Array.isArray(images) && images.length > 0 ? images : [variations[0]?.imageUrl || ''],
      variations: variations.map((v: Partial<ProductVariation>, idx: number) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        colorName: v.colorName || 'Default',
        colorHex: v.colorHex || '#1E293B',
        size: v.size || '1-2 Years',
        sku: v.sku || `BKD-${Date.now().toString().slice(-4)}-${idx}`,
        stock: Number(v.stock ?? 10),
        priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
        imageUrl: v.imageUrl || (images && images[0]) || '',
      })),
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.transaction((currentDb) => {
      currentDb.products.unshift(newProduct);
      return { result: newProduct, updatedDb: currentDb };
    });

    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// PUT /api/products/:id - Update product (Admin)
productsRouter.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updated = db.transaction((currentDb) => {
      const idx = currentDb.products.findIndex((p) => p.id === id);
      if (idx === -1) {
        return { result: null };
      }

      const existing = currentDb.products[idx];
      const updatedProduct: Product = {
        ...existing,
        ...body,
        regularPrice: Number(body.regularPrice ?? existing.regularPrice),
        salePrice: body.salePrice !== undefined && body.salePrice !== null ? Number(body.salePrice) : undefined,
        variations: Array.isArray(body.variations) ? body.variations : existing.variations,
      };

      currentDb.products[idx] = updatedProduct;
      return { result: updatedProduct, updatedDb: currentDb };
    });

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin)
productsRouter.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const removed = db.transaction((currentDb) => {
      const idx = currentDb.products.findIndex((p) => p.id === id);
      if (idx === -1) {
        return { result: false };
      }
      currentDb.products.splice(idx, 1);
      return { result: true, updatedDb: currentDb };
    });

    if (!removed) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// PATCH /api/products/:id/variations/:variationId/stock - Quick adjust stock
productsRouter.patch('/:id/variations/:variationId/stock', requireAdmin, (req, res) => {
  try {
    const { id, variationId } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    const result = db.transaction((currentDb) => {
      const product = currentDb.products.find((p) => p.id === id);
      if (!product) return { result: null };

      const variation = product.variations.find((v) => v.id === variationId);
      if (!variation) return { result: null };

      variation.stock = stock;
      return { result: { product, variation }, updatedDb: currentDb };
    });

    if (!result) {
      return res.status(404).json({ error: 'Product or variation not found' });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update stock', details: err.message });
  }
});

// POST /api/products/sync - Bulk sync / restore custom products
productsRouter.post('/sync', (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const updated = db.transaction((currentDb) => {
      let count = 0;
      products.forEach((incoming: Product) => {
        if (!incoming.id || !incoming.name) return;
        const existingIdx = currentDb.products.findIndex((p) => p.id === incoming.id);
        if (existingIdx !== -1) {
          currentDb.products[existingIdx] = incoming;
          count++;
        } else {
          currentDb.products.unshift(incoming);
          count++;
        }
      });
      return { result: { synced: count, total: currentDb.products.length }, updatedDb: currentDb };
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync products', details: err.message });
  }
});

