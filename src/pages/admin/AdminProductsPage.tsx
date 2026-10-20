import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Package,
  Layers,
  Image as ImageIcon,
  Upload,
  Sparkles,
  ExternalLink,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import type { Product, ProductVariation, Category } from '../../types';

const SAMPLE_KIDS_IMAGES = [
  {
    name: 'Boys Safari Cotton Set',
    url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Yellow Cotton Playwear',
    url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Baby Combed Romper',
    url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Girls Floral Dress',
    url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Winter Hooded Jacket',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cozy Woolen Sweater',
    url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminProductsPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Category Quick Manager Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatSlug, setQuickCatSlug] = useState('');
  const [quickCatDescription, setQuickCatDescription] = useState('');
  const [quickCatSubmitting, setQuickCatSubmitting] = useState(false);
  const [quickCatError, setQuickCatError] = useState<string | null>(null);
  const [quickCatSuccess, setQuickCatSuccess] = useState<string | null>(null);

  // Form State
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    category: string;
    season: 'summer' | 'winter' | 'all';
    gender: 'boys' | 'girls' | 'unisex';
    regularPrice: number;
    salePrice: string;
    fabric: string;
    careInstructions: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    images: string[];
    variations: ProductVariation[];
  }>({
    name: '',
    slug: '',
    description: '',
    category: 'sets',
    season: 'summer',
    gender: 'boys',
    regularPrice: 2490,
    salePrice: '1990',
    fabric: '100% Breathable Combed Cotton',
    careInstructions: 'Machine wash cold with mild detergent.',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: `var-${Date.now()}-1`,
        colorName: 'Navy Blue',
        colorHex: '#1E293B',
        size: '1-2 Years',
        sku: 'BKD-NEW-NV-12Y',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Clear legacy buggy cache key
      try {
        localStorage.removeItem('bkd_cached_products');
      } catch {}

      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setCustomImageUrl('');
    const defaultImg = 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80';
    setFormData({
      name: '',
      slug: '',
      description: '',
      category: 'sets',
      season: 'summer',
      gender: 'boys',
      regularPrice: 2490,
      salePrice: '',
      fabric: '100% Combed Breathable Cotton',
      careInstructions: 'Machine wash cold. Do not bleach.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [defaultImg],
      variations: [
        {
          id: `var-${Date.now()}-1`,
          colorName: 'Navy Blue',
          colorHex: '#1E293B',
          size: '1-2 Years',
          sku: 'BKD-AUTO-01',
          stock: 12,
          imageUrl: defaultImg,
        },
      ],
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setCustomImageUrl('');
    const existingImages =
      product.images && product.images.length > 0
        ? [...product.images]
        : [product.variations[0]?.imageUrl || 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80'];

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      season: product.season,
      gender: (product.gender as any) || 'unisex',
      regularPrice: product.regularPrice,
      salePrice: product.salePrice ? String(product.salePrice) : '',
      fabric: product.fabric,
      careInstructions: product.careInstructions,
      isFeatured: !!product.isFeatured,
      isNewArrival: !!product.isNewArrival,
      isBestSeller: !!product.isBestSeller,
      images: existingImages,
      variations: JSON.parse(JSON.stringify(product.variations)),
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Image Upload & Gallery Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onComplete: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onComplete(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) {
      setQuickCatError('Category name is required.');
      return;
    }
    setQuickCatSubmitting(true);
    setQuickCatError(null);
    setQuickCatSuccess(null);
    try {
      const generatedSlug =
        quickCatSlug.trim() ||
        quickCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: quickCatName.trim(),
          slug: generatedSlug,
          description: quickCatDescription.trim(),
          imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
          isActive: true,
          order: categories.length + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      // Refresh categories list
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      // Automatically select new category
      setFormData((prev) => ({ ...prev, category: data.slug || generatedSlug }));
      setQuickCatSuccess(`Category "${data.name}" added and selected!`);
      setQuickCatName('');
      setQuickCatSlug('');
      setQuickCatDescription('');
      setTimeout(() => {
        setIsCategoryModalOpen(false);
        setQuickCatSuccess(null);
      }, 1000);
    } catch (err: any) {
      setQuickCatError(err.message || 'Error saving category');
    } finally {
      setQuickCatSubmitting(false);
    }
  };

  const handleAddProductImage = (url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (formData.images.includes(cleanUrl)) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, cleanUrl],
    }));
    setCustomImageUrl('');
  };

  const handleRemoveProductImage = (index: number) => {
    if (formData.images.length <= 1) {
      alert('Please keep at least one product photo.');
      return;
    }
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: updated,
    }));
  };

  const handleSetMainProductImage = (index: number) => {
    if (index === 0) return;
    const target = formData.images[index];
    const rest = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: [target, ...rest],
    }));
  };

  const handleApplyMainImageToAll = () => {
    const mainImg = formData.images[0];
    if (!mainImg) return;
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v) => ({ ...v, imageUrl: mainImg })),
    }));
  };

  const handleAddVariation = () => {
    const mainImg = formData.images[0] || 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80';
    const newVar: ProductVariation = {
      id: `var-${Date.now()}-${formData.variations.length + 1}`,
      colorName: 'Sunshine Yellow',
      colorHex: '#FBBF24',
      size: '2-3 Years',
      sku: `BKD-VAR-${Math.floor(100 + Math.random() * 900)}`,
      stock: 10,
      imageUrl: mainImg,
    };
    setFormData({ ...formData, variations: [...formData.variations, newVar] });
  };

  const handleUpdateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...formData.variations];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, variations: updated });
  };

  const handleRemoveVariation = (index: number) => {
    if (formData.variations.length <= 1) {
      alert('A product must contain at least one variation (color & size).');
      return;
    }
    const updated = formData.variations.filter((_, i) => i !== index);
    setFormData({ ...formData, variations: updated });
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSubmitting(true);

    try {
      const primaryImages = formData.images.filter((img) => img && img.trim().length > 0);
      const varImages = formData.variations.map((v) => v.imageUrl).filter((img) => img && img.trim().length > 0);
      const combinedImages = Array.from(new Set([...primaryImages, ...varImages]));
      if (combinedImages.length === 0) {
        throw new Error('Please provide at least one product image.');
      }

      const validatedVariations = formData.variations.map((v) => ({
        ...v,
        imageUrl: v.imageUrl && v.imageUrl.trim().length > 0 ? v.imageUrl : combinedImages[0],
      }));

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        category: formData.category,
        season: formData.season,
        gender: formData.gender,
        regularPrice: Number(formData.regularPrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        fabric: formData.fabric.trim(),
        careInstructions: formData.careInstructions.trim(),
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        variations: validatedVariations,
        images: combinedImages,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setModalError(err.message || 'Error saving product');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setIsDeletingId(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  // Quick adjust stock
  const handleQuickStockChange = async (productId: string, variationId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      const res = await fetch(`/api/products/${productId}/variations/${variationId}/stock`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            return {
              ...p,
              variations: p.variations.map((v) => (v.id === variationId ? { ...v, stock: newStock } : v)),
            };
          })
        );
      }
    } catch (err) {
      console.error('Quick stock change failed', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Product & Variation Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your summer & winter collections, colors, sizes, pricing, and live inventory.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search products by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#FAF9F6] border border-slate-200 text-slate-800 py-1.5 px-3 rounded-xl focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Season & Category</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Variations (Color · Size · Stock)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-14 rounded-xl object-cover border border-slate-200/60 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">/{product.slug}</div>
                        <div className="flex gap-1.5 mt-1">
                          {product.isFeatured && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              Featured
                            </span>
                          )}
                          {product.isNewArrival && (
                            <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 capitalize">
                      <span className="font-semibold text-slate-800">{product.season}</span>
                      <div className="text-slate-500 text-[11px]">{product.category} · {product.gender}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">
                        Rs. {(product.salePrice ?? product.regularPrice).toLocaleString()}
                      </div>
                      {product.salePrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          Rs. {product.regularPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1.5 max-w-md">
                        <div className="text-[11px] font-bold text-slate-700">
                          Total Stock: <span className="font-mono">{totalStock} units</span> ({product.variations.length} variations)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.variations.map((v) => (
                            <div
                              key={v.id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px]"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                style={{ backgroundColor: v.colorHex }}
                              />
                              <span className="font-medium">{v.colorName}</span>
                              <span className="text-slate-400">/</span>
                              <span>{v.size}:</span>
                              {/* Inline Stock Controls */}
                              <button
                                onClick={() => handleQuickStockChange(product.id, v.id, v.stock - 1)}
                                className="text-slate-500 hover:text-slate-900 px-0.5 font-bold"
                              >
                                -
                              </button>
                              <strong className={`font-mono ${v.stock <= 3 ? 'text-rose-600' : 'text-slate-900'}`}>
                                {v.stock}
                              </strong>
                              <button
                                onClick={() => handleQuickStockChange(product.id, v.id, v.stock + 1)}
                                className="text-slate-500 hover:text-slate-900 px-0.5 font-bold"
                              >
                                +
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsDeletingId(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Confirm Product Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(isDeletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg font-['Outfit']">
                {editingProduct ? 'Edit Product & Variations' : 'Add New Kids Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="space-y-6 text-xs">
              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kids Safari Cotton Tee & Shorts Set"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      placeholder="auto-generated-if-empty"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short product story and features..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-800">Category *</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickCatError(null);
                            setQuickCatSuccess(null);
                            setIsCategoryModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:text-amber-900 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>+ Add New</span>
                        </button>
                        <Link
                          to="/admin/categories"
                          target="_blank"
                          className="text-[10px] text-slate-500 hover:text-slate-800 underline font-medium"
                        >
                          Edit All
                        </Link>
                      </div>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Season</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value as any })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                    >
                      <option value="summer">Summer</option>
                      <option value="winter">Winter</option>
                      <option value="all">All Seasons</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                    >
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Regular Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.regularPrice}
                      onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Sale Price (PKR - Optional)</label>
                    <input
                      type="number"
                      placeholder="Leave empty if not on sale"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PRODUCT IMAGES & MEDIA GALLERY SECTION */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>Product Photos & Media Gallery</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        {formData.images.length} {formData.images.length === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Upload product pictures from your device, enter URLs, or select from curated presets. The first image is the Primary Display Photo.
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyMainImageToAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
                      title="Sync main image across all variations"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Apply Main Photo to All Colors</span>
                    </button>
                  )}
                </div>

                {/* Hidden file input for main product image upload */}
                <input
                  type="file"
                  ref={mainFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, (dataUrl) => {
                      handleAddProductImage(dataUrl);
                    })
                  }
                />

                {/* Upload & Add Controls */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    {/* Device Upload Button */}
                    <button
                      type="button"
                      onClick={() => mainFileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Upload Photo from Device</span>
                    </button>

                    {/* Or Paste URL Input */}
                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or enter image URL (https://...)"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddProductImage(customImageUrl);
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddProductImage(customImageUrl)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        + Add Image
                      </button>
                    </div>
                  </div>

                  {/* Kids Clothing Presets */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Sample Kids Clothing Photos (Click to Add):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_KIDS_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleAddProductImage(preset.url)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
                        >
                          <img src={preset.url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                          <span>+ {preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gallery Previews Grid */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-2">
                    Current Product Gallery ({formData.images.length}):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden border-2 bg-white shadow-xs transition-all ${
                          idx === 0 ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-slate-200'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Product photo ${idx + 1}`}
                          className="w-full h-28 object-cover bg-slate-50"
                        />
                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs">
                            PRIMARY
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainProductImage(idx)}
                              className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-bold"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="w-full py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* VARIATION BUILDER SECTION */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Variations (Colors, Sizes, Stock & Color-Specific Photos)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      When customers select a color swatch, the website will dynamically display this color's photo!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                  >
                    + Add Variation
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {formData.variations.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-3"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 text-[10px]">
                            Color Name
                          </label>
                          <input
                            type="text"
                            required
                            value={v.colorName}
                            onChange={(e) => handleUpdateVariation(idx, 'colorName', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 text-[10px]">
                            Color Hex (#)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={v.colorHex}
                              onChange={(e) => handleUpdateVariation(idx, 'colorHex', e.target.value)}
                              className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={v.colorHex}
                              onChange={(e) => handleUpdateVariation(idx, 'colorHex', e.target.value)}
                              className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 text-[10px]">
                            Size
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2-3 Years"
                            value={v.size}
                            onChange={(e) => handleUpdateVariation(idx, 'size', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 text-[10px]">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariation(idx, 'stock', Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      {/* Variation Image row with preview and upload */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-slate-200/60">
                        {/* Thumbnail preview */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <img
                            src={v.imageUrl || formData.images[0]}
                            alt={v.colorName}
                            className="w-12 h-14 rounded-xl object-cover border border-slate-200 bg-white"
                          />
                          <div className="space-y-1">
                            <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-semibold text-slate-700 shadow-2xs">
                              <Upload className="w-3 h-3 text-amber-500" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (dataUrl) => {
                                    handleUpdateVariation(idx, 'imageUrl', dataUrl);
                                  })
                                }
                              />
                            </label>
                            {formData.images[0] && (
                              <button
                                type="button"
                                onClick={() => handleUpdateVariation(idx, 'imageUrl', formData.images[0])}
                                className="block text-[10px] text-amber-700 hover:underline font-medium"
                              >
                                Use Main Photo
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="block font-semibold text-slate-700 text-[10px]">
                            Image URL for {v.colorName || 'this color'}
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={v.imageUrl}
                            onChange={(e) => handleUpdateVariation(idx, 'imageUrl', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-[11px]"
                          />
                        </div>

                        <div className="w-24">
                          <label className="block font-semibold text-slate-700 text-[10px]">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariation(idx, 'sku', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-[11px]"
                          />
                        </div>

                        <div className="pt-3 sm:pt-4 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariation(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="Remove variation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {modalSubmitting ? 'Saving to Database...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base font-['Outfit']">
                  Add New Store Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickCatError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{quickCatError}</span>
              </div>
            )}

            {quickCatSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{quickCatSuccess}</span>
              </div>
            )}

            <form onSubmit={handleQuickCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rompers & Bodysuits"
                  value={quickCatName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setQuickCatName(name);
                    setQuickCatSlug(
                      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    );
                  }}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. rompers"
                  value={quickCatSlug}
                  onChange={(e) => setQuickCatSlug(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short tagline for category collection..."
                  value={quickCatDescription}
                  onChange={(e) => setQuickCatDescription(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Current Categories List Preview */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Existing Categories ({categories.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  {categories.map((c) => (
                    <span
                      key={c.id}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-700"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Link
                  to="/admin/categories"
                  target="_blank"
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline"
                >
                  Open Full Categories Page →
                </Link>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quickCatSubmitting}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xs disabled:opacity-50"
                  >
                    {quickCatSubmitting ? 'Creating...' : '+ Create Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
