import { create } from 'zustand';
import { wishlistService } from '../services/api';
import { useToastStore } from './useToastStore';

const GUEST_WISHLIST_KEY = 'varshi_guest_wishlist';
const VARIANTS_MAP_KEY = 'varshi_item_variants';

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

function enrichWishlistItems(items) {
  const variantMap = getItemVariantsMap();
  return (items || []).map((it) => {
    const prodId = it.product_id || it.product?.id || it.id;
    const varInfo = variantMap[String(prodId)] || {};
    const prod = it.product || {};
    const color = it.selected_color || prod.selectedColor || prod.color || varInfo.selectedColor || null;
    const size = it.selected_size || prod.selectedSize || prod.size || varInfo.selectedSize || null;
    const img = prod.image_url || varInfo.image_url || prod.images?.[0]?.image_url;

    return {
      ...it,
      selected_color: color,
      selected_size: size,
      product: {
        ...prod,
        selectedColor: color,
        color: color,
        selectedSize: size,
        size: size,
        image_url: img || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp',
        images: img ? [{ image_url: img }] : prod.images
      }
    };
  });
}

function getLocalGuestWishlist() {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) {
        return { items: enrichWishlistItems(parsed.items) };
      }
    }
  } catch (e) {}
  return { items: [] };
}

function saveLocalGuestWishlist(data) {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(data));
  } catch (e) {}
}

export const useWishlistStore = create((set, get) => ({
  wishlist: getLocalGuestWishlist(),
  isLoading: false,

  fetchWishlist: async () => {
    const token = localStorage.getItem('varshi_customer_token');
    if (!token) {
      const guest = getLocalGuestWishlist();
      set({ wishlist: guest, isLoading: false });
      return guest;
    }

    set({ isLoading: true });
    try {
      const data = await wishlistService.getWishlist();
      const enriched = {
        ...data,
        items: enrichWishlistItems(data?.items || [])
      };
      set({ wishlist: enriched, isLoading: false });
      return enriched;
    } catch (err) {
      const guest = getLocalGuestWishlist();
      set({ wishlist: guest, isLoading: false });
      return guest;
    }
  },

  toggleItem: async (productId, productHint = null) => {
    set({ isLoading: true });

    const selectedColor = productHint?.selectedColor || productHint?.color || '';
    const selectedSize = productHint?.selectedSize || productHint?.size || '';
    const variantImg = productHint?.image_url || productHint?.images?.[0]?.image_url;

    if (productId && (selectedColor || variantImg || selectedSize)) {
      saveItemVariant(productId, {
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
        image_url: variantImg || undefined,
        name: productHint?.name,
        sku: productHint?.sku
      });
    }

    const token = localStorage.getItem('varshi_customer_token');

    // 1. Authenticated User Path
    if (token) {
      try {
        const data = await wishlistService.toggleItem(productId);
        const enriched = {
          ...data,
          items: enrichWishlistItems(data?.items || [])
        };
        const isNowInWishlist = enriched.items.some(
          (it) => String(it.product_id) === String(productId) || String(it.id) === String(productId)
        );
        set({ wishlist: enriched, isLoading: false });

        if (isNowInWishlist) {
          useToastStore.getState().addToast('Saved to your favorites!', 'success');
        } else {
          useToastStore.getState().addToast('Removed from favorites', 'info');
        }
        return { inWishlist: isNowInWishlist, data: enriched };
      } catch (err) {
        // If token failed, clear and proceed with guest wishlist
        localStorage.removeItem('varshi_customer_token');
        localStorage.removeItem('varshi_customer_user');
      }
    }

    // 2. Guest Wishlist Path (unauthenticated or offline fallback)
    try {
      const current = getLocalGuestWishlist();
      const existingIdx = current.items.findIndex(
        (it) => String(it.product_id) === String(productId) || String(it.id) === String(productId)
      );

      let updatedItems = [...current.items];
      let isNowInWishlist = false;

      if (existingIdx >= 0) {
        updatedItems.splice(existingIdx, 1);
        isNowInWishlist = false;
        useToastStore.getState().addToast('Removed from favorites', 'info');
      } else {
        const prodImg = variantImg || productHint?.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp';
        const product = productHint ? {
          ...productHint,
          image_url: prodImg,
          images: [{ image_url: prodImg }],
          selectedColor: selectedColor || productHint.selectedColor,
          color: selectedColor || productHint.color,
          selectedSize: selectedSize || productHint.selectedSize,
          size: selectedSize || productHint.size
        } : {
          id: productId,
          name: 'Product',
          price: 0,
          image_url: prodImg,
        };

        updatedItems.push({
          id: `guest-wish-${productId}`,
          product_id: productId,
          selected_color: selectedColor,
          selected_size: selectedSize,
          product,
        });
        isNowInWishlist = true;
        useToastStore.getState().addToast('Saved to your favorites!', 'success');
      }

      const updated = { items: enrichWishlistItems(updatedItems) };
      saveLocalGuestWishlist(updated);
      set({ wishlist: updated, isLoading: false });
      return { inWishlist: isNowInWishlist, data: updated };
    } catch (guestErr) {
      set({ isLoading: false });
      return { inWishlist: false, data: { items: [] } };
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true });
    const token = localStorage.getItem('varshi_customer_token');

    if (token) {
      try {
        const data = await wishlistService.removeItem(productId);
        set({ wishlist: data, isLoading: false });
        useToastStore.getState().addToast('Removed from favorites', 'info');
        return data;
      } catch (err) {}
    }

    // Guest removal
    const current = getLocalGuestWishlist();
    const updatedItems = current.items.filter(
      (it) => String(it.product_id) !== String(productId) && String(it.id) !== String(productId)
    );
    const updated = { items: updatedItems };
    saveLocalGuestWishlist(updated);
    set({ wishlist: updated, isLoading: false });
    useToastStore.getState().addToast('Removed from favorites', 'info');
    return updated;
  },

  isItemInWishlist: (productId) => {
    const { wishlist } = get();
    const current = wishlist || getLocalGuestWishlist();
    if (!current || !current.items) return false;
    return current.items.some(
      (it) => String(it.product_id) === String(productId) || String(it.id) === String(productId)
    );
  },
}));
