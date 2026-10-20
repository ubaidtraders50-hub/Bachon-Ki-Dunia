import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Layers,
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Category, Product } from '../../types';

const SAMPLE_CATEGORY_IMAGES = [
  {
    name: 'Matching Sets',
    url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dresses & Frocks',
    url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Jackets & Hoodies',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sweaters & Knitwear',
    url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Baby Rompers',
    url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'T-Shirts & Tops',
    url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminCategoriesPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    order: number;
  }>({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    order: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      order: categories.length + 1,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      imageUrl: category.imageUrl || 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      isActive: category.isActive !== false,
      order: category.order || 1,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Category name is required.');
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        isActive: formData.isActive,
        order: Number(formData.order),
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Error saving category');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setIsDeletingId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-amber-500" />
            <span>Store Categories Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, or customize product categories for your summer & winter collections.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900 font-bold">{categories.length}</strong> Categories
        </div>
      </div>

      {/* Categories Cards / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug (URL)</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Products in Store</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((cat) => {
                const prodCount = products.filter(
                  (p) => p.category.toLowerCase() === cat.slug.toLowerCase() || p.category.toLowerCase() === cat.name.toLowerCase()
                ).length;

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80'}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      /{cat.slug}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold font-mono px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200/60">
                        {prodCount} Products
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cat.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsDeletingId(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Category"
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
            <h3 className="font-bold text-slate-900 text-base">Delete Category</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this category? Products currently assigned to this category will not be deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg font-['Outfit']">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rompers & Jumpsuits"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setFormData({
                      ...formData,
                      name,
                      slug: editingCategory ? formData.slug : slug,
                    });
                  }}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rompers"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category banner..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Image */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">Category Tile Photo</label>
                
                <div className="flex items-center gap-3">
                  <img
                    src={formData.imageUrl || 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80'}
                    alt="Category Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="space-y-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Photo from Device</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Preset sample photos */}
                <div className="pt-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                    Sample Clothing Photos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_CATEGORY_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-[10px] text-slate-700 rounded-md transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>Active & Visible in Storefront Navigation</span>
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
                  {modalSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
