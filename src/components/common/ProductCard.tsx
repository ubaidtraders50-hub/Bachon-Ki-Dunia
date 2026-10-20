import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useStore();
  const { addToCart, items } = useCart();

  // Selected variation for the card (defaults to the first variation)
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const activeVariation =
    product.variations[selectedVariationIndex] || product.variations[0];

  // Group variations by unique color to render swatch dots
  const uniqueColorVariations = product.variations.filter(
    (v, i, self) => i === self.findIndex((t) => t.colorName === v.colorName)
  );

  // Group variations by unique size for quick selection
  const uniqueSizes = Array.from(new Set(product.variations.map((v) => v.size)));

  const currentImage =
    activeVariation?.imageUrl ||
    product.images[0] ||
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80';

  const regularPrice = product.regularPrice;
  const currentPrice = activeVariation?.priceOverride ?? product.salePrice ?? regularPrice;
  const hasDiscount = currentPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.variations.every((v) => v.stock <= 0);
  const isCurrentVarOutOfStock = !activeVariation || activeVariation.stock <= 0;

  // Check if this product or variation is already in the cart
  const cartItem = items.find((i) => i.variationId === activeVariation?.id);
  const totalInCartForProduct = items
    .filter((i) => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeVariation || activeVariation.stock <= 0) return;

    addToCart(product, activeVariation, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Find variation matching current color and this size
    const match = product.variations.findIndex(
      (v) => v.colorName === activeVariation?.colorName && v.size === size
    );
    if (match !== -1) {
      setSelectedVariationIndex(match);
    } else {
      // Find first variation with this size
      const fallbackMatch = product.variations.findIndex((v) => v.size === size);
      if (fallbackMatch !== -1) setSelectedVariationIndex(fallbackMatch);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden relative">
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {hasDiscount && (
            <span className="bg-rose-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.season === 'summer' && (
            <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              Summer
            </span>
          )}
          {product.season === 'winter' && (
            <span className="bg-sky-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              Winter
            </span>
          )}
          {totalInCartForProduct > 0 && (
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              In Cart: {totalInCartForProduct}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:text-rose-500 hover:bg-white shadow-xs backdrop-blur-xs'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-slate-900 font-bold text-xs uppercase px-3 py-1.5 rounded-lg shadow">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Button on Desktop Hover */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex gap-2">
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-md text-center flex items-center justify-center gap-1.5 transition-colors backdrop-blur-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </Link>
          <button
            onClick={handleQuickAddToCart}
            disabled={isCurrentVarOutOfStock}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            title="Quick Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1 capitalize">
            <span>{product.gender}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        {/* Color Swatches */}
        {uniqueColorVariations.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-600 mr-1">Colors:</span>
            {uniqueColorVariations.map((v) => {
              const isSelected = activeVariation?.colorName === v.colorName;
              return (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newIdx = product.variations.findIndex(
                      (item) => item.colorName === v.colorName
                    );
                    if (newIdx !== -1) setSelectedVariationIndex(newIdx);
                  }}
                  className={`w-4 h-4 rounded-full transition-transform border ${
                    isSelected
                      ? 'ring-2 ring-amber-500 scale-125 border-white shadow-xs'
                      : 'border-slate-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                  title={v.colorName}
                  aria-label={`Select color ${v.colorName}`}
                />
              );
            })}
          </div>
        )}

        {/* Quick Size Selection Chips */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Size:</span>
            <span className="font-medium text-amber-700">{activeVariation?.size}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {uniqueSizes.slice(0, 4).map((size) => {
              const isSelected = activeVariation?.size === size;
              return (
                <button
                  key={size}
                  onClick={(e) => handleSelectSize(e, size)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price and Action Button Section */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg font-mono">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-600 line-through">
                  Rs. {regularPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-800 font-medium">COD Available</span>
          </div>

          {/* Explicit "Add to Cart" Button */}
          <button
            onClick={handleQuickAddToCart}
            disabled={isCurrentVarOutOfStock}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isAddedRecently
                ? 'bg-emerald-600 text-white scale-105'
                : isCurrentVarOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-md active:scale-95'
            }`}
            aria-label={`Add ${product.name} to Cart`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added!</span>
              </>
            ) : isCurrentVarOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
