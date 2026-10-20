import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, Tag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
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

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      const ok = await applyCoupon(inputCoupon.trim());
      if (ok) setInputCoupon('');
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-lg">Your Shopping Bag</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-amber-50/70 p-3.5 border-b border-amber-100/80 text-xs">
            <div className="flex items-center justify-between font-medium text-slate-800 mb-1.5">
              {isFreeShippingEligible ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free Nationwide Shipping Unlocked!
                </span>
              ) : (
                <span>
                  Add <strong className="text-amber-800">Rs. {amountToFreeShipping.toLocaleString()}</strong> more for <strong>FREE Delivery</strong>
                </span>
              )}
              <span className="font-bold text-slate-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isFreeShippingEligible ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Your shopping bag is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore our vibrant summer and warm winter collections to fill your baby's wardrobe!
                  </p>
                </div>
                <div className="flex flex-col w-full max-w-xs gap-2 pt-2">
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/collections/summer');
                    }}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                  >
                    Explore Summer Wear
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/collections/winter');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Explore Winter Wear
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variationId}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-[#FAF9F6] relative group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover bg-white flex-shrink-0 border border-slate-200/60"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.productSlug}`}
                          onClick={closeCart}
                          className="font-semibold text-slate-900 text-xs sm:text-sm truncate hover:text-amber-600 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.variationId)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variation Info (Color & Size) */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span>{item.colorName}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-800">{item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-slate-200 bg-white rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.variationId, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variationId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400">
                            Rs. {item.unitPrice.toLocaleString()} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-4">
              {/* Promo Coupon Form */}
              <div>
                {couponCode && couponDiscount > 0 ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code <strong>{couponCode}</strong> applied (-Rs. {discount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. WELCOME10)"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                        className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-8 pr-3 py-2 rounded-xl text-xs uppercase placeholder:normal-case focus:outline-none focus:border-amber-400"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !inputCoupon.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1 pl-1">{couponError}</p>
                )}
                {couponMessage && !couponError && (
                  <p className="text-[11px] text-emerald-700 mt-1 pl-1">{couponMessage}</p>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `Rs. ${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-950 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-amber-600 font-mono">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="hover:text-slate-900 underline font-medium"
                  >
                    View detailed cart
                  </Link>
                  <span>Cash on Delivery Available</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
