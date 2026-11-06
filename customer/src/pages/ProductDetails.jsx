import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { STUDIO_PRODUCTS } from './ProductStudio';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Award, 
  MapPin, 
  ChevronRight, 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  Lock, 
  Share2, 
  Package, 
  ArrowRight,
  RotateCw,
  Compass,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { productService, reviewService } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useFlyAnimation } from '../context/FlyAnimationContext';
import ProductCard from '../components/common/ProductCard';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [searchParams] = useSearchParams();
  const [selectedColor, setSelectedColor] = useState(null);
  const [customImages, setCustomImages] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  // Review Form Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Store Hooks
  const { addItem } = useCartStore();
  const { toggleItem, isItemInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const { flyToCart, flyToBuyNow } = useFlyAnimation();

  // Animation Refs
  const mainImageRef = useRef(null);
  const addToCartBtnRef = useRef(null);
  const buyNowBtnRef = useRef(null);

  // Button Action States
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prodData = await productService.getBySlugOrId(slug);
        setProduct(prodData);
        setQuantity(1);
        setSelectedImage(0);

        const studioData = STUDIO_PRODUCTS[slug] || Object.values(STUDIO_PRODUCTS).find(p => p.slug === slug);
        const paramColorId = searchParams.get('color');
        const paramSize = searchParams.get('size');

        // Intelligently select default size based on URL param or category
        if (paramSize) {
          setSelectedSize(paramSize);
        } else if (prodData.category?.slug === 'shoes') {
          setSelectedSize('44');
        } else if (prodData.category?.slug === 'accessories') {
          setSelectedSize('One Size');
        } else {
          setSelectedSize('M');
        }

        // Initialize color variant if available
        if (studioData && studioData.colors?.length > 0) {
          const matchedColor = studioData.colors.find(c => c.id === paramColorId) || studioData.colors[0];
          setSelectedColor(matchedColor);
          setCustomImages([
            { image_url: matchedColor.frontImage, alt_text: `${prodData.name} - Front View (${matchedColor.colorName})` },
            { image_url: matchedColor.backImage, alt_text: `${prodData.name} - Back View (${matchedColor.colorName})` },
          ]);
        }

        const [relData, revData] = await Promise.all([
          productService.getRelated(prodData.id).catch(() => []),
          reviewService.getByProduct(prodData.id).catch(() => []),
        ]);
        setRelated(relData || []);
        setReviews(revData || []);
      } catch (err) {
        console.error("Failed to load product details", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 aspect-[4/5] bg-gray-50 rounded-2xl border border-gray-100"></div>
            <div className="lg:col-span-5 space-y-6 pt-2">
              <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              <div className="h-9 bg-gray-100 rounded w-4/5"></div>
              <div className="h-6 bg-gray-100 rounded w-1/4"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-28 bg-gray-50 rounded-xl border border-gray-100"></div>
              <div className="h-14 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md">
          The requested men's fashion piece may be out of catalog or relocated.
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#16382C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0F2C22] transition-colors"
        >
          <span>Explore Streetwear Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Real product images (variant specific or backend gallery)
  const images = customImages && customImages.length > 0
    ? customImages
    : (product.images && product.images.length > 0
        ? product.images
        : [{ image_url: product.image_url || '/images/variants/classic-cream-supima-boxy-tee_original_front.webp', alt_text: product.name }]);

  const studioData = STUDIO_PRODUCTS[slug] || Object.values(STUDIO_PRODUCTS).find(p => p.slug === slug);

  const handleColorChange = (col) => {
    setSelectedColor(col);
    setCustomImages([
      { image_url: col.frontImage, alt_text: `${product.name} - Front View (${col.colorName})` },
      { image_url: col.backImage, alt_text: `${product.name} - Back View (${col.colorName})` },
    ]);
    setSelectedImage(0);
  };

  const inWishlist = isItemInWishlist(product.id);
  const isOutOfStock = product.available_stock <= 0;

  // Helper to package the current active variant (color, front image, size, sku)
  const getVariantProductHint = () => {
    const currentImgSrc = selectedColor?.frontImage || images[selectedImage]?.image_url || product.image_url;
    const colorName = selectedColor?.colorName || null;
    return {
      ...product,
      selectedSize,
      size: selectedSize,
      selectedColor: colorName,
      color: colorName,
      colorId: selectedColor?.id || null,
      image_url: currentImgSrc,
      images: selectedColor?.frontImage ? [{ image_url: selectedColor.frontImage }] : images,
      sku: selectedColor ? `${product.sku || 'VE'}-${selectedColor.id.toUpperCase()}-${selectedSize}` : product.sku
    };
  };

  // Handle Add to Cart with Fly Animation
  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    const variantHint = getVariantProductHint();
    const currentImgSrc = variantHint.image_url;

    flyToCart(mainImageRef.current, currentImgSrc, () => {
      setIsAdding(false);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2400);
    });

    try {
      await addItem(product.id, quantity, variantHint);
      const colorLabel = variantHint.selectedColor ? ` - ${variantHint.selectedColor}` : '';
      addToast(`Added ${quantity}x "${product.name}" (${selectedSize}${colorLabel}) to your bag.`, 'success');
    } catch (err) {
      console.error("Cart add error:", err);
      setIsAdding(false);
      addToast('Failed to update cart. Please try again.', 'error');
    }
  };

  // Handle Buy Now with Direct Checkout Navigation
  const handleBuyNow = async () => {
    if (isOutOfStock || isBuying) return;
    setIsBuying(true);
    const variantHint = getVariantProductHint();
    const currentImgSrc = variantHint.image_url;

    flyToBuyNow(mainImageRef.current, buyNowBtnRef.current, currentImgSrc, async () => {
      try {
        await addItem(product.id, quantity, variantHint);
        navigate('/checkout');
      } catch (err) {
        console.error("Buy now cart error:", err);
        addToast('Failed to proceed to checkout.', 'error');
      } finally {
        setIsBuying(false);
      }
    });
  };

  // Delivery Pincode Checker
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 6) {
      setPincodeResult({ valid: false, message: "Please enter a valid 6-digit PIN code." });
      return;
    }
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);
    const dateStr = estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    setPincodeResult({
      valid: true,
      message: `Express Delivery Available to PIN ${pincode}! Expected arrival by ${dateStr}. Free shipping eligible.`
    });
  };

  // Verified Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please sign in to submit a verified product review.', 'info');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      addToast('Please enter your review feedback.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const rev = await reviewService.create({
        product_id: product.id,
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });
      setReviews([rev, ...reviews]);
      setShowReviewModal(false);
      setNewComment('');
      setNewTitle('');
      addToast('Thank you! Your verified review has been published.', 'success');
    } catch (err) {
      addToast(err.message || 'Could not post review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 360° Studio is strictly reserved for shirts, hoodies, t-shirts, and jackets (NEVER for shoes)
  const is360Eligible = () => {
    if (!product) return false;
    const catSlug = (product.category?.slug || '').toLowerCase();
    const catName = (product.category?.name || '').toLowerCase();
    const prodName = (product.name || '').toLowerCase();
    const prodSlug = (product.slug || '').toLowerCase();

    // Strictly exclude shoes, sneakers, trainers, footwear
    if (
      catSlug === 'shoes' ||
      catSlug.includes('shoe') ||
      catSlug.includes('sneaker') ||
      catSlug.includes('footwear') ||
      catName.includes('shoe') ||
      catName.includes('sneaker') ||
      catName.includes('footwear') ||
      prodSlug.includes('sneaker') ||
      prodSlug.includes('trainer') ||
      prodSlug.includes('runner') ||
      prodSlug.includes('court') ||
      prodSlug.includes('shoe') ||
      prodSlug.includes('dunk') ||
      prodName.includes('sneaker') ||
      prodName.includes('shoe') ||
      prodName.includes('trainer') ||
      prodName.includes('runner')
    ) {
      return false;
    }

    // Strictly allow ONLY shirts, hoodies, t-shirts, jackets
    return (
      catSlug === 't-shirts' ||
      catSlug === 'hoodies' ||
      catSlug === 'jackets' ||
      catSlug === 'shirts' ||
      catSlug.includes('shirt') ||
      catSlug.includes('hoodie') ||
      catSlug.includes('jacket') ||
      catName.includes('shirt') ||
      catName.includes('hoodie') ||
      catName.includes('jacket') ||
      prodName.includes('t-shirt') ||
      prodName.includes('tee') ||
      prodName.includes('hoodie') ||
      prodName.includes('jacket') ||
      prodName.includes('polo') ||
      prodName.includes('shirt')
    );
  };

  // Size Options based on product category (S, M, L, XL, 2XL)
  const sizeOptions = product?.category?.slug === 'shoes'
    ? ['40', '41', '42', '43', '44', '45', '46']
    : product?.category?.slug === 'accessories'
    ? ['One Size']
    : ['S', 'M', 'L', 'XL', '2XL'];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-10">
        
        {/* Breadcrumb Navigation with Instant Back Button */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer mr-1"
            title="Back to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back</span>
          </button>
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/products" className="hover:text-black transition-colors">Collections</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <Link to={`/category/${product.category.slug}`} className="hover:text-black transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main 2-Column Product Layout with smooth entrance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start animate-in fade-in slide-in-from-top-6 duration-700 ease-out">
          
          {/* =========================================================================
              LEFT COLUMN: High-Resolution Product Gallery with Thumbnails & 360 Entry
              ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Vertical Thumbnail Column */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[620px] scrollbar-none flex-shrink-0">
                {images.map((img, idx) => {
                  const isSelected = selectedImage === idx;
                  const label = img.alt_text?.toLowerCase().includes('back') 
                    ? 'Back' 
                    : img.alt_text?.toLowerCase().includes('front') 
                    ? 'Front' 
                    : `View ${idx + 1}`;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#F9F9FB] p-1 ${
                        isSelected 
                          ? 'border-[#16382C] ring-2 ring-[#16382C]/15 shadow-sm' 
                          : 'border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300'
                      }`}
                      title={label}
                    >
                      <img 
                        src={img.image_url} 
                        alt={img.alt_text || `${product.name} thumbnail ${idx + 1}`} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold uppercase bg-white/90 text-gray-700 px-1 py-0.5 rounded shadow-2xs">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Stage Image Viewport */}
            <div className="relative flex-1 aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-[#FAF9F6] border border-gray-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center p-4 sm:p-8 select-none group">
              <img
                ref={mainImageRef}
                src={images[selectedImage]?.image_url}
                alt={images[selectedImage]?.alt_text || product.name}
                className="max-h-[92%] max-w-[92%] object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.12)] transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Discount Badge */}
              {product.discount_percentage > 0 && (
                <span className="absolute top-4 left-4 bg-[#16382C] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  {product.discount_percentage}% OFF
                </span>
              )}

              {/* Enter 360° Interactive Studio Button (Strictly for shirts, hoodies, t-shirts, and jackets only) */}
              {is360Eligible() && (
                <button
                  type="button"
                  onClick={() => navigate(`/studio/${product.slug}`)}
                  className="absolute top-4 left-24 sm:left-28 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 hover:bg-white text-gray-800 border border-gray-200/90 text-[11px] font-bold uppercase tracking-wider shadow-xs hover:scale-105 transition-all cursor-pointer"
                  title="Open 360° Interactive Studio"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#16382C]" />
                  <span>360° Studio</span>
                </button>
              )}

              {/* Wishlist Toggle Button */}
              <button
                type="button"
                onClick={() => toggleItem(product.id, getVariantProductHint())}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs ${
                  inWishlist 
                    ? 'bg-red-50 border-red-200 text-red-500 scale-105' 
                    : 'bg-white/90 hover:bg-white border-gray-200 text-gray-700 hover:scale-105'
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Quick View Angle Switcher (if Front & Back available) */}
              {images.length >= 2 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full border border-gray-200/90 shadow-xs">
                  {images.slice(0, 3).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full transition-all ${
                        selectedImage === idx
                          ? 'bg-[#16382C] text-white'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {idx === 0 ? 'Front' : idx === 1 ? 'Back' : 'Profile'}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Product Details, Stock, Size, & Purchase Controls
              ========================================================================= */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Header: Brand & Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                  {product.brand || 'UNLIMITED CHOICE'} {product.category?.name ? `• ${product.category.name}` : ''}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-950 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star
                      key={st}
                      className={`w-4 h-4 ${
                        st <= Math.round(product.rating_average || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">
                  {(product.rating_average || 5.0).toFixed(1)}
                </span>
                <span className="text-gray-400">•</span>
                <a href="#reviews-section" className="text-gray-600 hover:text-[#16382C] font-medium underline">
                  {reviews.length || product.review_count || 0} customer reviews
                </a>
              </div>
            </div>

            {/* Pricing Block */}
            <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-gray-100 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#16382C] tracking-tight">
                ₹{Math.round(product.price).toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    ₹{Math.round(product.compare_at_price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {product.discount_percentage || Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Real Stock and Live Availability */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider ${
                isOutOfStock 
                  ? 'text-red-600' 
                  : product.available_stock <= 5 
                  ? 'text-amber-700' 
                  : 'text-emerald-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isOutOfStock ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
                }`} />
                {isOutOfStock 
                  ? "Sold Out" 
                  : product.available_stock <= 5 
                  ? `Only ${product.available_stock} Units Left` 
                  : `In Stock (${product.available_stock} Available)`}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">Authentic Men's Collection</span>
            </div>

            {/* Color Selector (Strictly 3 Colors of the exact SAME product) */}
            {studioData && studioData.colors?.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                    Select Color: <span className="text-[#16382C] font-extrabold">{selectedColor?.colorName}</span>
                  </span>
                  <span className="text-gray-500 text-[11px]">3 Available Shades</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {studioData.colors.map((col) => {
                    const isSelected = selectedColor?.id === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleColorChange(col)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#16382C] bg-[#16382C]/5 text-[#16382C] ring-2 ring-[#16382C]/20 shadow-xs scale-102'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Select Size: <span className="text-[#16382C] font-extrabold">{selectedSize}</span>
                </span>
                <span className="text-gray-500 text-[11px]">
                  {product?.category?.slug === 'shoes' ? 'Standard UK Sizing' : 'Relaxed Streetwear Fit'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[48px] px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === sz
                        ? 'bg-[#16382C] text-white border-[#16382C] shadow-sm ring-2 ring-[#16382C]/20 scale-102'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 py-1">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-xs text-gray-900 bg-white py-2">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.available_stock, quantity + 1))}
                  disabled={quantity >= product.available_stock || isOutOfStock}
                  className="p-2.5 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Primary & Secondary Purchase Controls */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Forest Green Add to Cart Button */}
                <button
                  id="product-details-add-to-cart-btn"
                  ref={addToCartBtnRef}
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50 ${
                    addedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#16382C] hover:bg-[#0F2C22] text-white'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
                    </>
                  )}
                </button>

                {/* Secondary Antique-Gold / Outlined Buy Now Button */}
                <button
                  id="product-details-buy-now-btn"
                  ref={buyNowBtnRef}
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || isBuying}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider border-2 border-[#C5A880] text-[#16382C] bg-[#FAF8F5] hover:bg-[#F3EFEA] flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <span>{isBuying ? 'Preparing...' : 'Buy Now Directly'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </button>
              </div>

              {/* Wishlist Link Button */}
              <button
                type="button"
                onClick={() => toggleItem(product.id, getVariantProductHint())}
                className="w-full py-2.5 text-xs font-semibold text-gray-700 hover:text-[#16382C] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{inWishlist ? "Saved in Your Wishlist" : "Add to Wishlist"}</span>
              </button>
            </div>

            {/* Real Material Highlight */}
            {product.material && (
              <div className="p-3.5 rounded-2xl bg-[#F9F9F8] border border-gray-100 flex items-start gap-3 text-xs">
                <Sparkles className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">Garment Architecture & Fabric</span>
                  <span className="text-gray-600 leading-relaxed">{product.material}</span>
                </div>
              </div>
            )}

            {/* Pincode Delivery Checker */}
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#16382C]" /> Check Delivery & Cash on Delivery Availability
              </span>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit PIN code"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#16382C]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#16382C] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0F2C22] transition-colors cursor-pointer"
                >
                  Verify
                </button>
              </form>
              {pincodeResult && (
                <p className={`text-[11px] ${pincodeResult.valid ? 'text-emerald-700' : 'text-red-600'} pt-0.5`}>
                  {pincodeResult.message}
                </p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-center">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-700 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#16382C]" />
                <span className="font-semibold">100% Authentic</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-700 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#16382C]" />
                <span className="font-semibold">Express Delivery</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-700 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#16382C]" />
                <span className="font-semibold">7-Day Return</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-700 flex flex-col items-center gap-1">
                <Lock className="w-4 h-4 text-[#16382C]" />
                <span className="font-semibold">Secure Payment</span>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            TABS SECTION: Description, Specifications, Reviews, & Styling Guide
            ========================================================================= */}
        <div id="reviews-section" className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden mt-12">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: 'description', label: 'Product Description' },
              { id: 'specifications', label: 'Specifications & Materials' },
              { id: 'reviews', label: `Verified Reviews (${reviews.length})` },
              { id: 'care', label: 'Fit & Fabric Care' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 whitespace-nowrap transition-all border-b-2 font-bold uppercase tracking-wider text-[11px] ${
                  activeTab === tab.id
                    ? 'border-[#16382C] text-[#16382C] bg-gray-50/70'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="p-6 sm:p-8 text-xs text-gray-700 leading-relaxed">
            {activeTab === 'description' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="font-serif text-lg font-bold text-gray-950">
                  {product.name}
                </h3>
                <p className="text-sm leading-relaxed text-gray-800">
                  {product.description}
                </p>
                {product.short_description && (
                  <p className="text-xs text-gray-500 italic border-l-2 border-[#C5A880] pl-3 py-1">
                    {product.short_description}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-xl divide-y divide-gray-100">
                {product.brand && (
                  <div className="py-2.5 flex justify-between">
                    <span className="font-semibold text-gray-500">Brand</span>
                    <span className="font-bold text-gray-900">{product.brand}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="py-2.5 flex justify-between">
                    <span className="font-semibold text-gray-500">SKU</span>
                    <span className="font-mono font-bold text-gray-900">{product.sku}</span>
                  </div>
                )}
                {product.material && (
                  <div className="py-2.5 flex justify-between">
                    <span className="font-semibold text-gray-500">Material Composition</span>
                    <span className="font-bold text-gray-900">{product.material}</span>
                  </div>
                )}
                {product.specifications && typeof product.specifications === 'object' && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex justify-between">
                    <span className="font-semibold text-gray-500">{key}</span>
                    <span className="font-bold text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-950">Customer Reviews</h3>
                    <p className="text-xs text-gray-500">Real feedback from verified purchasers</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#16382C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0F2C22] transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-gray-500">No customer reviews yet.</p>
                    <p className="text-xs text-gray-400">Be the first to share your experience with this piece!</p>
                  </div>
                ) : (
                  <div className="space-y-4 divide-y divide-gray-100">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{rev.user_name || "Verified Customer"}</span>
                            {rev.is_verified_purchase && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-2.5 h-2.5 text-emerald-600" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.title && <h4 className="font-bold text-gray-900 text-xs">{rev.title}</h4>}
                        <p className="text-gray-700 text-xs leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="font-serif text-lg font-bold text-gray-950">Fit & Fabric Maintenance</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="font-bold text-gray-900">Silhouette Guidance</p>
                    <p className="text-xs text-gray-600">
                      Our men's streetwear garments are engineered with relaxed shoulders and tailored drape. For an authentic boxy aesthetic, select your standard size. For an oversized drop, size up by one.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="font-bold text-gray-900">Washing & Preserving Dense Cotton</p>
                    <p className="text-xs text-gray-600">
                      Machine wash cold inside out with similar dark tones. Avoid bleaching and tumble drying. Hang dry in shade to maintain fiber elasticity and high-GSM structural weight.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RELATED STREETWEAR RECOMMENDATIONS
            ========================================================================= */}
        {related.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-serif text-xl font-bold text-gray-950">Complete Your Outfit</h3>
              <Link to="/products" className="text-xs font-semibold text-[#16382C] hover:text-[#C5A880] flex items-center gap-1">
                <span>View All Collections</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* =========================================================================
          MOBILE STICKY PURCHASE BAR (Appears on small screens without blocking content)
          ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total</span>
          <span className="text-lg font-black text-[#16382C]">
            ₹{Math.round(product.price * quantity).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="flex-1 py-3 px-3 rounded-xl bg-[#16382C] text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Adding...' : 'Add'}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isBuying}
            className="flex-1 py-3 px-3 rounded-xl bg-[#C5A880] text-[#16382C] font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>Buy Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          VERIFIED REVIEW SUBMISSION MODAL
          ========================================================================= */}
      {showReviewModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-gray-950">Write a Verified Review</h3>
              <button 
                type="button"
                onClick={() => setShowReviewModal(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-900 mb-1.5">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setNewRating(st)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          st <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-1">Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Flawless 450GSM drape and immaculate stitching!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#16382C]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 mb-1">Your Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Share details regarding the fabric thickness, fit, wash retention, and comfort..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#16382C]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 rounded-xl bg-[#16382C] text-white font-bold uppercase tracking-wider hover:bg-[#0F2C22] disabled:opacity-50 transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
