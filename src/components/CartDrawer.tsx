import React from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Truck,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { formatAud, resolveAssemblyPackage } from '../utils/pricing.ts';
import { isVerifiedNonPlaceholderImage } from '../data/builderCatalog.ts';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToCatalogue: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToCatalogue
}) => {
  const {
    isCartOpen,
    closeCart,
    cartItem,
    componentItems,
    removeFromCart,
    updateComponentQty,
    removeComponentFromCart,
    buildServiceId,
    updateBuildService,
    deliveryMethodId,
    updateDeliveryMethod,
    pricing,
    shippingConfig,
    assemblyPackages
  } = useCart();

  if (!isCartOpen) return null;

  const hasPc = Boolean(cartItem && pricing);
  const hasComponents = componentItems.length > 0;
  const hasAnyItems = hasPc || hasComponents;

  const componentsSubtotal = componentItems.reduce(
    (sum, item) => sum + item.part.price * item.quantity,
    0
  );

  const deliveryChargeOnly =
    deliveryMethodId === 'pickup'
      ? 0
      : deliveryMethodId === 'express'
      ? shippingConfig.expressPrice
      : shippingConfig.normalPrice;

  const activePackage = resolveAssemblyPackage(buildServiceId, assemblyPackages);
  const combinedTotal = hasPc && pricing
    ? pricing.finalTotal + componentsSubtotal
    : componentsSubtotal + deliveryChargeOnly;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 text-navy shadow-2xl flex flex-col">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-navy text-cyan-300 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading text-[16px] font-bold text-navy leading-tight">Your cart</h2>
                <p className="text-[12px] text-slate-500">Review PC build, assembly package &amp; delivery</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {!hasAnyItems ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-[16px] font-bold text-navy">Your cart is empty</h3>
                  <p className="text-[13px] text-slate-600 mt-1 max-w-xs mx-auto">
                    Explore our prebuilt gaming PCs, custom PC builder, or individual components.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToCatalogue();
                  }}
                  className="inline-flex h-10 items-center gap-2 bg-navy hover:bg-navy-800 text-white text-[13px] font-semibold px-4 rounded-md transition-colors"
                >
                  <span>Browse Prebuilt PCs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                {hasPc && cartItem && pricing && (
                  <>
                    <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
                            {cartItem.pc.tier}
                          </span>
                          <h3 className="font-heading text-[16px] font-bold text-navy mt-0.5">{cartItem.pc.name}</h3>
                          <p className="text-[12px] text-slate-600 line-clamp-1">{cartItem.pc.tagline}</p>
                        </div>
                        <button
                          onClick={removeFromCart}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Remove PC build from cart"
                          aria-label="Remove item from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] text-slate-600">Parts and Windows price:</span>
                          <span className="font-heading text-[15px] font-extrabold text-navy">
                            {formatAud(cartItem.pc.basePrice)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3 shrink-0 text-brand-blue" />
                          <span>1 assembly package per PC build — adjust below.</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-slate-500 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Assembly &amp; Testing Package</span>
                      </label>

                      <div className="grid grid-cols-1 gap-2">
                        {assemblyPackages.filter((pkg) => pkg.enabled).map((pkg) => {
                          const isSelected = activePackage.id === pkg.id;
                          return (
                            <label
                              key={pkg.id}
                              className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition ${
                                isSelected
                                  ? 'border-brand-blue bg-sky-50/50 ring-1 ring-brand-blue'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="drawer-build-service"
                                value={pkg.id}
                                checked={isSelected}
                                onChange={() => updateBuildService(pkg.id)}
                                className="mt-1 accent-sky-500"
                              />
                              <div className="flex-1 text-[12px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-heading font-bold text-[13px] text-navy">{pkg.name}</span>
                                  <span className="font-heading font-extrabold text-navy">{formatAud(pkg.price)}</span>
                                </div>
                                <p className="text-slate-600 mt-1 text-[11.5px]">
                                  {pkg.shortSummary || pkg.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {hasComponents && (
                  <div className="space-y-2.5">
                    <label className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Individual Components &amp; Peripherals
                    </label>
                    <div className="space-y-2">
                      {componentItems.map(({ part, quantity }) => (
                        <div
                          key={part.id}
                          className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3"
                        >
                          {isVerifiedNonPlaceholderImage(part.image) && (
                            <img
                              src={part.image}
                              alt={part.name}
                              className="w-11 h-11 object-contain rounded border border-slate-200 bg-white shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[12.5px] text-navy truncate">{part.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {part.brand} • {formatAud(part.price)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateComponentQty(part.id, quantity - 1)}
                              className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                              aria-label={`Decrease quantity for ${part.name}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[12px] font-semibold w-5 text-center">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateComponentQty(part.id, quantity + 1)}
                              className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                              aria-label={`Increase quantity for ${part.name}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeComponentFromCart(part.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              aria-label={`Remove ${part.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <label className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-slate-500 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Delivery Method</span>
                  </label>

                  <div className="grid grid-cols-1 gap-2">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                        deliveryMethodId === 'pickup'
                          ? 'border-brand-blue bg-sky-50/50 ring-1 ring-brand-blue'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="drawer-delivery"
                        value="pickup"
                        checked={deliveryMethodId === 'pickup'}
                        onChange={() => updateDeliveryMethod('pickup')}
                        className="mt-1 accent-sky-500"
                      />
                      <div className="flex-1 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-navy">Pick up</span>
                          <span className="font-heading font-bold text-navy">No charge</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">Collect from workshop once ready.</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                        deliveryMethodId === 'normal'
                          ? 'border-brand-blue bg-sky-50/50 ring-1 ring-brand-blue'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="drawer-delivery"
                        value="normal"
                        checked={deliveryMethodId === 'normal'}
                        onChange={() => updateDeliveryMethod('normal')}
                        className="mt-1 accent-sky-500"
                      />
                      <div className="flex-1 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-navy">Normal Delivery</span>
                          <span className="font-heading font-bold text-navy">+{formatAud(shippingConfig.normalPrice)}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{shippingConfig.normalTimeframe}</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                        deliveryMethodId === 'express'
                          ? 'border-brand-blue bg-sky-50/50 ring-1 ring-brand-blue'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="drawer-delivery"
                        value="express"
                        checked={deliveryMethodId === 'express'}
                        onChange={() => updateDeliveryMethod('express')}
                        className="mt-1 accent-sky-500"
                      />
                      <div className="flex-1 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-navy">Express Delivery</span>
                          <span className="font-heading font-bold text-navy">+{formatAud(shippingConfig.expressPrice)}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{shippingConfig.expressTimeframe}</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-2 text-[12.5px]">
                  {hasPc && pricing && (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>PC Parts &amp; Windows:</span>
                        <span className="font-semibold text-navy">{formatAud(pricing.partsAndWindowsPrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{pricing.buildServiceName}:</span>
                        <span className="font-semibold text-navy">+{formatAud(pricing.buildServicePrice)}</span>
                      </div>
                    </>
                  )}
                  {hasComponents && (
                    <div className="flex justify-between text-slate-600">
                      <span>Individual components ({componentItems.reduce((s, i) => s + i.quantity, 0)}):</span>
                      <span className="font-semibold text-navy">{formatAud(componentsSubtotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>{hasPc && pricing ? pricing.deliveryMethodName : deliveryMethodId === 'express' ? 'Express Delivery' : deliveryMethodId === 'normal' ? 'Normal Delivery' : 'Pick up'}:</span>
                    <span className="font-semibold text-navy">
                      {deliveryChargeOnly === 0 ? 'No charge' : `+${formatAud(deliveryChargeOnly)}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-navy">Order total:</span>
                    <span className="font-heading text-[18px] font-extrabold text-navy">
                      {formatAud(combinedTotal)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {hasAnyItems && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-2">
              <button
                onClick={() => {
                  closeCart();
                  onNavigateToCheckout();
                }}
                className="w-full h-11 flex items-center justify-center gap-2 bg-navy hover:bg-navy-800 text-white font-semibold rounded-md transition-colors text-[13.5px]"
              >
                <span>Go to Cart &amp; Order Checkout</span>
                <span>({formatAud(combinedTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                No card details stored. We confirm everything before payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
