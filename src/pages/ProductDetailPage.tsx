import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Star,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Ruler,
  AlertCircle,
  Share2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { SizeGuideModal } from '../components/common/SizeGuideModal';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import type { Product, ProductVariation } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, settings } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Variation States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          setError('Product not found');
          return;
        }
        const data = await res.json();
        const p: Product = data.product;
        setProduct(p);
        setRelated(data.related || []);

        // Initial variation selection
        if (p.variations && p.variations.length > 0) {
          const firstVar = p.variations[0];
          setSelectedColor(firstVar.colorName);
          setSelectedSize(firstVar.size);
          setActiveImage(firstVar.imageUrl || p.images[0]);
        } else {
          setActiveImage(p.images[0]);
        }

        // Save to recently viewed
        try {
          const stored = localStorage.getItem('bkd_recently_viewed');
          let list: Product[] = stored ? JSON.parse(stored) : [];
          list = [p, ...list.filter((item) => item.id !== p.id)].slice(0, 6);
          localStorage.setItem('bkd_recently_viewed', JSON.stringify(list));
          setRecentlyViewed(list.filter((item) => item.id !== p.id));
        } catch {
          // ignore storage errors
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-[4/5] bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
            <div className="h-12 bg-slate-200 rounded-xl w-1/3 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The kid's outfit you are looking for may have been moved or is no longer in catalog.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <span>Return to Shop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Extract unique colors from product variations
  const colorMap = new Map<string, { colorName: string; colorHex: string; imageUrl: string }>();
  product.variations.forEach((v) => {
    if (!colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, {
        colorName: v.colorName,
        colorHex: v.colorHex,
        imageUrl: v.imageUrl,
      });
    }
  });
  const availableColors = Array.from(colorMap.values());

  // Extract unique sizes
  const uniqueSizes = Array.from(new Set(product.variations.map((v) => v.size)));

  // Find currently matched variation based on selected color and selected size
  const activeVariation = product.variations.find(
    (v) => v.colorName === selectedColor && v.size === selectedSize
  );

  // Check if sizes are available for the selected color
  const isSizeAvailableForColor = (size: string) => {
    const match = product.variations.find(
      (v) => v.colorName === selectedColor && v.size === size
    );
    return match && match.stock > 0;
  };

  // Critical requirement: selecting a different color immediately changes main image!
  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    setValidationError(null);

    // Look up variation for this color
    const colorVar = product.variations.find((v) => v.colorName === colorName);
    if (colorVar) {
      setActiveImage(colorVar.imageUrl || product.images[0]);
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setValidationError(null);
  };

  // Pricing calculations
  const unitPrice =
    activeVariation?.priceOverride ?? product.salePrice ?? product.regularPrice;
  const regularPrice = product.regularPrice;
  const hasDiscount = unitPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - unitPrice) / regularPrice) * 100)
    : 0;

  const currentStock = activeVariation ? activeVariation.stock : 0;
  const isOutOfStock = !activeVariation || currentStock <= 0;

  // Validation before adding
  const validateSelection = (): ProductVariation | null => {
    if (!selectedColor) {
      setValidationError('Please select a color for this outfit.');
      return null;
    }
    if (!selectedSize) {
      setValidationError('Please select a size for your child.');
      return null;
    }
    if (!activeVariation || activeVariation.stock <= 0) {
      setValidationError('This color and size combination is currently out of stock.');
      return null;
    }
    setValidationError(null);
    return activeVariation;
  };

  const handleAddToCart = () => {
    const variation = validateSelection();
    if (variation) {
      addToCart(product, variation, quantity);
    }
  };

  const handleBuyNow = () => {
    const variation = validateSelection();
    if (variation) {
      addToCart(product, variation, quantity);
      navigate('/checkout');
    }
  };

  const inWishlist = isInWishlist(product.id);

  // WhatsApp styling assistance link
  const cleanPhone = (settings?.whatsapp || '+923136180608').replace(/[^0-9]/g, '');
  const shareWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum! I have a question about "${product.name}" (SKU: ${activeVariation?.sku || product.slug}).`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-slate-500 flex items-center gap-2 font-medium">
        <Link to="/" className="hover:text-amber-600">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-amber-600">
          Shop
        </Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-amber-600 capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-200/60">
            <img
              src={activeImage}
              alt={`${product.name} - ${selectedColor}`}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {hasDiscount && (
                <span className="bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
              {product.season === 'summer' && (
                <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full">
                  Summer Collection
                </span>
              )}
              {product.season === 'winter' && (
                <span className="bg-sky-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                  Winter Warmth
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-md ${
                inWishlist
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Reel (Switches main image) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {/* Show all available variation images + base product images */}
            {Array.from(new Set([activeVariation?.imageUrl, ...product.images])).filter(Boolean).map(
              (img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img!)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === img
                      ? 'border-amber-500 ring-2 ring-amber-200 scale-105'
                      : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Column: Product Purchasing Details */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Metadata clean text */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium capitalize mb-2">
              <span>{product.gender}</span>
              <span>·</span>
              <span>{product.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewCount} reviews)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-['Outfit'] leading-tight">
              {product.name}
            </h1>

            {/* SKU and Live Stock status */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
              <span>SKU: {activeVariation?.sku || 'BKD-READY'}</span>
              <span>·</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Currently Sold Out</span>
              ) : currentStock <= 5 ? (
                <span className="text-amber-700 font-bold">Only {currentStock} left in stock!</span>
              ) : (
                <span className="text-emerald-700 font-bold">In Stock ({currentStock} available)</span>
              )}
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-950 font-mono">
                Rs. {unitPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through">
                  Rs. {regularPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Cash on Delivery Available
            </span>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* VARIATION 1: COLOR SWATCHES */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Color: <span className="font-normal text-slate-600">{selectedColor}</span>
              </span>
              <span className="text-slate-400 text-[11px]">Clicking updates photos</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {availableColors.map((c) => {
                const isSelected = selectedColor === c.colorName;
                return (
                  <button
                    key={c.colorName}
                    onClick={() => handleColorSelect(c.colorName)}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 text-slate-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.colorHex }}
                    />
                    <span>{c.colorName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VARIATION 2: SIZE SELECTOR */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Child's Age / Size: <span className="font-normal text-slate-600">{selectedSize}</span>
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-amber-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {uniqueSizes.map((size) => {
                const isSelected = selectedSize === size;
                const available = isSizeAvailableForColor(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : available
                        ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <div className="text-xs font-bold text-slate-900">Quantity:</div>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold"
              >
                -
              </button>
              <span className="px-3 text-xs font-black text-slate-900 font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentStock || 1, quantity + 1))}
                disabled={quantity >= currentStock}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">Max {currentStock} per order</span>
          </div>

          {/* Action CTAs: Add to Cart & Buy Now */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all shadow-xs hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Instant Buy Now (Direct Checkout)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp Direct Help */}
          <div className="pt-2">
            <a
              href={shareWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask About Fabric or Sizing on WhatsApp</span>
            </a>
          </div>

          {/* Highlights & Guarantees */}
          <div className="divide-y divide-slate-100 border-t border-slate-200 pt-4 text-xs text-slate-600 space-y-3">
            <div className="pt-3">
              <strong className="text-slate-900 block mb-1">Fabric Composition:</strong>
              <p>{product.fabric}</p>
            </div>
            <div className="pt-3">
              <strong className="text-slate-900 block mb-1">Care & Washing:</strong>
              <p>{product.careInstructions}</p>
            </div>
            <div className="pt-3">
              <strong className="text-slate-900 block mb-1">Delivery & Exchange:</strong>
              <p>
                Nationwide 2-4 working days delivery via Leopards/Trax Courier. 7-day hassle-free size
                replacement guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tab Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Product Story & Details</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {product.description}
        </p>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">You May Also Like</h2>
            <Link to="/shop" className="text-xs font-semibold text-amber-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};
