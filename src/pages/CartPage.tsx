import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingFee,
    discount,
    total,
    freeShippingThreshold,
    amountToFreeShipping,
    isFreeShippingEligible,
    couponCode,
    couponDiscount,
    couponMessage,
    couponError,
    isApplyingCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const ok = await applyCoupon(inputCoupon.trim());
      if (ok) setInputCoupon('');
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          You haven't added any kid's summer or winter clothing to your cart yet. Explore our latest arrivals!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            to="/collections/summer"
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            Shop Summer Collection
          </Link>
          <Link
            to="/collections/winter"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            Shop Winter Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 font-['Outfit'] tracking-tight">
          Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your chosen outfits, colors, and sizes before heading to checkout.
        </p>
      </div>

      {/* Free Delivery Banner */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-2">
          {isFreeShippingEligible ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              You qualify for FREE nationwide delivery!
            </span>
          ) : (
            <span>
              Add <strong className="text-amber-800">Rs. {amountToFreeShipping.toLocaleString()}</strong> more to enjoy <strong>FREE Shipping</strong> across Pakistan!
            </span>
          )}
          <span className="font-mono text-slate-600">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-amber-200/60 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isFreeShippingEligible ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-6 divide-y divide-slate-100 space-y-4">
            {items.map((item) => (
              <div
                key={item.variationId}
                className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-24 object-cover rounded-2xl bg-slate-100 border border-slate-200/60 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="font-bold text-slate-900 text-sm hover:text-amber-600 transition-colors"
                    >
                      {item.productName}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span>{item.colorName}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-800">{item.size}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">SKU: {item.sku}</div>
                    <div className="text-xs font-bold text-slate-900 sm:hidden">
                      Rs. {item.unitPrice.toLocaleString()} each
                    </div>
                  </div>
                </div>

                {/* Right controls: Qty and Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-56">
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.variationId, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold font-mono text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variationId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-slate-900 text-sm font-mono">
                      Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.variationId)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 mt-1 justify-end ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FAF9F6] border-t border-slate-200/80 flex items-center justify-between text-xs">
            <Link to="/shop" className="text-slate-600 hover:text-slate-900 font-semibold">
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Empty Bag
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          {/* Coupon Input */}
          <div>
            {couponCode && couponDiscount > 0 ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    <strong>{couponCode}</strong> applied (-Rs. {discount.toLocaleString()})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon (e.g. WELCOME10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3 py-2.5 rounded-xl text-xs uppercase placeholder:normal-case focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !inputCoupon.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {couponError && <p className="text-[11px] text-rose-600 mt-1 pl-1">{couponError}</p>}
            {couponMessage && !couponError && (
              <p className="text-[11px] text-emerald-700 mt-1 pl-1">{couponMessage}</p>
            )}
          </div>

          {/* Line by Line Breakdown */}
          <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900 font-mono">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Promotional Discount</span>
                <span className="font-mono">-Rs. {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Nationwide Shipping</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE (Above Rs. 3,500)</span>
                ) : (
                  <span className="font-mono">Rs. {shippingFee.toLocaleString()}</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-100">
              <span>Final Total</span>
              <span className="text-amber-600 font-mono">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Cash on Delivery Available Across Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
