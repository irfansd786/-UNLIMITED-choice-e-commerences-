import { create } from 'zustand';
import { cartService, productService } from '../services/api';
import { useToastStore } from './useToastStore';

const GUEST_CART_KEY = 'varshi_guest_cart';
const SIZES_MAP_KEY = 'varshi_item_sizes';
const VARIANTS_MAP_KEY = 'varshi_item_variants';

function getItemSizesMap() {
  try {
    const raw = localStorage.getItem(SIZES_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveItemSize(productId, size) {
  if (!productId || !size) return;
  try {
    const map = getItemSizesMap();
    map[String(productId)] = size;
    localStorage.setItem(SIZES_MAP_KEY, JSON.stringify(map));
  } catch (e) {}
}

function getItemVariantsMap() {
  try {
    const raw = localStorage.getItem(VARIANTS_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveItemVariant(productId, variantInfo) {
  if (!productId || !variantInfo) return;
  try {
    const map = getItemVariantsMap();
    map[String(productId)] = {
      ...(map[String(productId)] || {}),
      ...variantInfo
    };
    localStorage.setItem(VARIANTS_MAP_KEY, JSON.stringify(map));
  } catch (e) {}
}

function getLocalGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) {
        const validItems = parsed.items.filter(it => {
          const pid = String(it.product_id || it.product?.id || '');
          return pid && pid !== '[object Object]' && pid !== 'undefined' && pid !== 'null';
        });
        return calculateGuestCartTotals(validItems);
      }
      return parsed;
    }
  } catch (e) {}
  return { items: [], subtotal: 0, total_amount: 0, delivery_fee: 0, item_count: 0 };
}

function calculateGuestCartTotals(items) {
  const sizeMap = getItemSizesMap();
  const variantMap = getItemVariantsMap();
  const updatedItems = (items || []).map(it => {
    let prod = it.product || {};
    const varInfo = variantMap[String(it.product_id)] || {};

    let prodImg = prod.image_url || varInfo.image_url || prod.images?.[0]?.image_url;
    if (!prodImg || prodImg.includes('photo-1610030469983-98e550d6193c') || prodImg.includes('sari') || prodImg.includes('women')) {
      prodImg = '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
    }
    const price = Number(prod.price) || 0;
    const qty = Number(it.quantity) || 1;
    const item_total = (it.item_total !== undefined && !isNaN(it.item_total) && Number(it.item_total) > 0)
      ? Number(it.item_total)
      : (price * qty);

    const size = it.selected_size || prod.selectedSize || prod.size || sizeMap[String(it.product_id)] || null;
    const color = it.selected_color || prod.selectedColor || prod.color || varInfo.selectedColor || null;

    return {
      ...it,
      selected_size: size,
      selected_color: color,
      product: {
        ...prod,
        price,
        image_url: prodImg,
        images: [{ image_url: prodImg }],
        available_stock: prod.available_stock || prod.stock || 25,
        selectedSize: size,
        size,
        selectedColor: color,
        color
      },
      item_total
    };
  });

  const subtotal = updatedItems.reduce((sum, it) => {
    const price = Number(it.product?.price) || 0;
    return sum + (price * (Number(it.quantity) || 1));
  }, 0);
  const isFree = subtotal >= 999 || subtotal === 0;
  const delivery_fee = isFree ? 0 : 99;
  const total_amount = subtotal + delivery_fee;
  const item_count = updatedItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

  return {
    items: updatedItems,
    subtotal,
    delivery_fee,
    total_amount,
    item_count,
    free_shipping_eligible: isFree,
    amount_needed_for_free_shipping: Math.max(0, 999 - subtotal)
  };
}

function saveLocalGuestCart(cartData) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
  } catch (e) {}
}

export const useCartStore = create((set, get) => ({
  cart: getLocalGuestCart(),
  isLoading: false,
  appliedCoupon: null,
  couponDiscount: 0,

  fetchCart: async () => {
    const token = localStorage.getItem('varshi_customer_token');
    
    // If not authenticated, load guest cart
    if (!token) {
      const guestCart = getLocalGuestCart();
      set({ cart: guestCart, isLoading: false });
      return guestCart;
    }

    set({ isLoading: true });
    try {
      const data = await cartService.getCart();
      const sizeMap = getItemSizesMap();
      const variantMap = getItemVariantsMap();
      const enriched = {
        ...data,
        items: (data?.items || []).map(it => {
          const varInfo = variantMap[String(it.product_id)] || {};
          const sz = it.selected_size || it.product?.selectedSize || sizeMap[String(it.product_id)] || varInfo.selectedSize || null;
          const col = it.selected_color || it.product?.selectedColor || varInfo.selectedColor || null;
          const img = varInfo.image_url || it.product?.image_url;
          return {
            ...it,
            selected_size: sz,
            selected_color: col,
            product: {
              ...(it.product || {}),
              selectedSize: sz,
              size: sz,
              selectedColor: col,
              color: col,
              image_url: img || it.product?.image_url,
              images: img ? [{ image_url: img }] : it.product?.images
            }
          };
        })
      };
      set({ cart: enriched, isLoading: false });
      return enriched;
    } catch (err) {
      // If token expired or invalid (401), fall back to guest cart
      if (err?.response?.status === 401) {
        localStorage.removeItem('varshi_customer_token');
        localStorage.removeItem('varshi_customer_user');
      }
      const guestCart = getLocalGuestCart();
      set({ cart: guestCart, isLoading: false });
      return guestCart;
    }
  },

  addItem: async (productIdOrObj, quantity = 1, productHint = null) => {
    set({ isLoading: true });

    let rawProductId = productIdOrObj;
    let actualHint = productHint;
    if (typeof productIdOrObj === 'object' && productIdOrObj !== null) {
      rawProductId = productIdOrObj.id || productIdOrObj.slug || 'item';
      actualHint = { ...productIdOrObj, ...productHint };
    }

    const selectedSize = actualHint?.selectedSize || actualHint?.size || '';
    const selectedColor = actualHint?.selectedColor || actualHint?.color || '';
    const variantImg = actualHint?.image_url || actualHint?.images?.[0]?.image_url;

    if (rawProductId) {
      if (selectedSize) saveItemSize(rawProductId, selectedSize);
      if (selectedColor || variantImg) {
        saveItemVariant(rawProductId, {
          selectedColor: selectedColor || undefined,
          selectedSize: selectedSize || undefined,
          image_url: variantImg || undefined,
          name: actualHint?.name,
          sku: actualHint?.sku
        });
      }
    }

    const token = localStorage.getItem('varshi_customer_token');
    const numericId = Number(rawProductId);

    // 1. If user is logged in, attempt backend cart addition
    if (token && !isNaN(numericId) && numericId > 0) {
      try {
        const data = await cartService.addItem(numericId, quantity);
        const sizeMap = getItemSizesMap();
        const variantMap = getItemVariantsMap();
        const enriched = {
          ...data,
          items: (data?.items || []).map(it => {
            const varInfo = variantMap[String(it.product_id)] || {};
            const sz = it.selected_size || it.product?.selectedSize || sizeMap[String(it.product_id)] || varInfo.selectedSize || null;
            const col = it.selected_color || it.product?.selectedColor || varInfo.selectedColor || null;
            const img = varInfo.image_url || it.product?.image_url;
            return {
              ...it,
              selected_size: sz,
              selected_color: col,
              product: {
                ...(it.product || {}),
                selectedSize: sz,
                size: sz,
                selectedColor: col,
                color: col,
                image_url: img || it.product?.image_url,
                images: img ? [{ image_url: img }] : it.product?.images
              }
            };
          })
        };
        set({ cart: enriched, isLoading: false });
        useToastStore.getState().addToast('Item added to your cart!', 'success');
        return enriched;
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('varshi_customer_token');
          localStorage.removeItem('varshi_customer_user');
        }
      }
    }

    // 2. Guest Cart Path (unauthenticated or fallback)
    try {
      let product = actualHint;
      if (!product) {
        try {
          product = await productService.getBySlugOrId(rawProductId);
        } catch (e) {
          product = { id: rawProductId, name: 'Product', price: 0, available_stock: 10 };
        }
      }

      if (product) {
        const prodImg = variantImg || product.image_url || product.images?.[0]?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
        product = {
          ...product,
          price: Number(product.price) || 0,
          image_url: prodImg,
          images: [{ image_url: prodImg }],
          available_stock: product.available_stock || product.stock || 25,
          selectedSize: selectedSize || product.selectedSize || product.size,
          size: selectedSize || product.size,
          selectedColor: selectedColor || product.selectedColor || product.color,
          color: selectedColor || product.color
        };
      }

      const currentGuest = getLocalGuestCart();
      const existingIdx = currentGuest.items.findIndex(it => 
        String(it.product_id) === String(rawProductId) &&
        (it.selected_size === selectedSize || it.product?.selectedSize === selectedSize) &&
        (it.selected_color === selectedColor || it.product?.selectedColor === selectedColor)
      );

      let updatedItems = [...currentGuest.items];
      if (existingIdx >= 0) {
        const newQty = (currentGuest.items[existingIdx].quantity || 1) + quantity;
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: newQty,
          selected_size: selectedSize || updatedItems[existingIdx].selected_size,
          selected_color: selectedColor || updatedItems[existingIdx].selected_color,
          product: {
            ...(product || updatedItems[existingIdx].product),
            selectedSize: selectedSize || updatedItems[existingIdx].product?.selectedSize,
            size: selectedSize || updatedItems[existingIdx].product?.size,
            selectedColor: selectedColor || updatedItems[existingIdx].product?.selectedColor,
            color: selectedColor || updatedItems[existingIdx].product?.color,
            image_url: variantImg || product?.image_url || updatedItems[existingIdx].product?.image_url
          },
          item_total: ((product?.price || updatedItems[existingIdx].product?.price || 0) * newQty)
        };
      } else {
        const prodImg = variantImg || product?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
        updatedItems.push({
          id: `guest-${rawProductId}-${selectedSize || 'default'}-${selectedColor || 'default'}-${Date.now()}`,
          product_id: rawProductId,
          quantity,
          selected_size: selectedSize,
          selected_color: selectedColor,
          product: {
            ...product,
            image_url: prodImg,
            images: [{ image_url: prodImg }],
            selectedSize: selectedSize,
            size: selectedSize,
            selectedColor: selectedColor,
            color: selectedColor
          },
          item_total: (product?.price || 0) * quantity
        });
      }

      const updatedCart = calculateGuestCartTotals(updatedItems);
      saveLocalGuestCart(updatedCart);
      set({ cart: updatedCart, isLoading: false });
      useToastStore.getState().addToast('Item added to your cart!', 'success');
      return updatedCart;
    } catch (guestErr) {
      set({ isLoading: false });
      useToastStore.getState().addToast('Item added to cart!', 'success');
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    const token = localStorage.getItem('varshi_customer_token');

    if (token && !String(itemId).startsWith('guest-')) {
      try {
        const data = await cartService.updateQuantity(itemId, quantity);
        set({ cart: data, isLoading: false });
        return data;
      } catch (err) {}
    }

    // Guest cart update
    const currentGuest = getLocalGuestCart();
    let updatedItems = currentGuest.items.map(it => {
      if (String(it.id) === String(itemId) || String(it.product_id) === String(itemId)) {
        return { ...it, quantity: Math.max(1, quantity) };
      }
      return it;
    });

    const updatedCart = calculateGuestCartTotals(updatedItems);
    saveLocalGuestCart(updatedCart);
    set({ cart: updatedCart, isLoading: false });
    return updatedCart;
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    const token = localStorage.getItem('varshi_customer_token');

    if (token && !String(itemId).startsWith('guest-')) {
      try {
        const data = await cartService.removeItem(itemId);
        set({ cart: data, isLoading: false });
        useToastStore.getState().addToast('Item removed from cart', 'info');
        return data;
      } catch (err) {}
    }

    // Guest cart remove
    const currentGuest = getLocalGuestCart();
    const updatedItems = currentGuest.items.filter(
      it => String(it.id) !== String(itemId) && String(it.product_id) !== String(itemId)
    );

    const updatedCart = calculateGuestCartTotals(updatedItems);
    saveLocalGuestCart(updatedCart);
    set({ cart: updatedCart, isLoading: false });
    useToastStore.getState().addToast('Item removed from cart', 'info');
    return updatedCart;
  },

  clearCart: async () => {
    const token = localStorage.getItem('varshi_customer_token');
    if (token) {
      try {
        await cartService.clearCart();
      } catch (e) {}
    }
    const empty = { items: [], subtotal: 0, total_amount: 0, delivery_fee: 0, item_count: 0 };
    saveLocalGuestCart(empty);
    set({ cart: empty, appliedCoupon: null, couponDiscount: 0 });
  },

  setAppliedCoupon: (coupon, discount) => {
    set({ appliedCoupon: coupon, couponDiscount: discount });
  },

  removeAppliedCoupon: () => {
    set({ appliedCoupon: null, couponDiscount: 0 });
    useToastStore.getState().addToast('Coupon removed', 'info');
  },

  syncGuestCartToServer: async () => {
    try {
      const guest = getLocalGuestCart();
      if (guest.items && guest.items.length > 0) {
        for (const it of guest.items) {
          try {
            const numId = Number(it.product_id || it.product?.id);
            if (!isNaN(numId) && numId > 0) {
              const sz = it.selected_size || it.product?.selectedSize || it.product?.size;
              if (sz) {
                saveItemSize(numId, sz);
              }
              await cartService.addItem(numId, it.quantity);
            }
          } catch (e) {}
        }
        localStorage.removeItem(GUEST_CART_KEY);
      }
      const data = await cartService.getCart();
      const sizeMap = getItemSizesMap();
      const enriched = {
        ...data,
        items: (data?.items || []).map(it => {
          const sz = sizeMap[String(it.product_id)] || it.selected_size || it.product?.selectedSize;
          return {
            ...it,
            selected_size: sz,
            product: {
              ...(it.product || {}),
              selectedSize: sz,
              size: sz
            }
          };
        })
      };
      set({ cart: enriched });
    } catch (e) {}
  },
}));
