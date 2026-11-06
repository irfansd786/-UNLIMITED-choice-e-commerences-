import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  RotateCw,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Check
} from 'lucide-react';
import { productService } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { useFlyAnimation } from '../context/FlyAnimationContext';

// Curated 3-Color Collections tailored specifically to each product
// Crucial: Changing color strictly changes the garment color of the SAME product!
export const STUDIO_PRODUCTS = {
  'midnight-navy-work-chore-jacket': {
    name: 'Midnight Navy Work Chore Jacket',
    slug: 'midnight-navy-work-chore-jacket',
    price: 3899,
    compareAtPrice: 5499,
    sku: 'VE-JK-CHORE',
    category: 'Jackets',
    colors: [
      {
        id: 'midnight-navy',
        colorName: 'Midnight Heavy Navy',
        hex: '#1B263B',
        borderHex: '#3E4E6D',
        frontImage: '/images/variants/midnight-navy-work-chore-jacket_original_front.webp',
        backImage: '/images/variants/midnight-navy-work-chore-jacket_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#ECF1F7',
          outerTone: '#D6E0EE',
        }
      },
      {
        id: 'charcoal-black',
        colorName: 'Washed Charcoal Black',
        hex: '#1E1E20',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/midnight-navy-work-chore-jacket_charcoal-black_front.webp',
        backImage: '/images/variants/midnight-navy-work-chore-jacket_charcoal-black_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E4E5E8',
          outerTone: '#CFCFD6',
        }
      },
      {
        id: 'tobacco-camel',
        colorName: 'British Tobacco Camel',
        hex: '#7A5C38',
        borderHex: '#9E784A',
        frontImage: '/images/variants/midnight-navy-work-chore-jacket_tobacco-camel_front.webp',
        backImage: '/images/variants/midnight-navy-work-chore-jacket_tobacco-camel_back.webp',
        bgTheme: {
          lightCenter: '#FFFDF9',
          midTone: '#F5ECE1',
          outerTone: '#E3D2BE',
        }
      }
    ]
  },
  'forest-green-box-fit-hoodie': {
    name: 'Forest Green Box-Fit Hoodie',
    slug: 'forest-green-box-fit-hoodie',
    price: 2899,
    compareAtPrice: 4499,
    sku: 'VE-HD-BOX-GRN',
    category: 'Hoodies',
    colors: [
      {
        id: 'forest-green',
        colorName: 'Forest Bottle Green',
        hex: '#16382C',
        borderHex: '#235946',
        frontImage: '/images/variants/forest-green-box-fit-hoodie_original_front.webp',
        backImage: '/images/variants/forest-green-box-fit-hoodie_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EEF4EF',
          outerTone: '#D9E6DC',
        }
      },
      {
        id: 'onyx-black',
        colorName: 'Washed Onyx Black',
        hex: '#1E1E20',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/forest-green-box-fit-hoodie_onyx-black_front.webp',
        backImage: '/images/variants/forest-green-box-fit-hoodie_onyx-black_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E4E5E8',
          outerTone: '#CFCFD6',
        }
      },
      {
        id: 'midnight-navy',
        colorName: 'Deep Royal Navy',
        hex: '#1D3B5C',
        borderHex: '#2B5787',
        frontImage: '/images/variants/forest-green-box-fit-hoodie_midnight-navy_front.webp',
        backImage: '/images/variants/forest-green-box-fit-hoodie_midnight-navy_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#ECF2F9',
          outerTone: '#D5E2F0',
        }
      }
    ]
  },
  'heather-grey-heavy-fleece-hoodie': {
    name: 'Heather Grey Heavy Fleece Hoodie',
    slug: 'heather-grey-heavy-fleece-hoodie',
    price: 2899,
    compareAtPrice: 4499,
    sku: 'VE-HD-HVY-GRY',
    category: 'Hoodies',
    colors: [
      {
        id: 'heather-grey',
        colorName: 'Melange Heather Grey',
        hex: '#9CA3AF',
        borderHex: '#D1D5DB',
        frontImage: '/images/variants/heather-grey-heavy-fleece-hoodie_original_front.webp',
        backImage: '/images/variants/heather-grey-heavy-fleece-hoodie_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EAECEF',
          outerTone: '#D8DDE3',
        }
      },
      {
        id: 'charcoal-black',
        colorName: 'Washed Charcoal Black',
        hex: '#1E1E20',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/heather-grey-heavy-fleece-hoodie_charcoal-black_front.webp',
        backImage: '/images/variants/heather-grey-heavy-fleece-hoodie_charcoal-black_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E4E5E8',
          outerTone: '#CFCFD6',
        }
      },
      {
        id: 'oatmeal-cream',
        colorName: 'Oatmeal Bone Fleece',
        hex: '#E3DCBE',
        borderHex: '#C5BE9F',
        frontImage: '/images/variants/heather-grey-heavy-fleece-hoodie_oatmeal-cream_front.webp',
        backImage: '/images/variants/heather-grey-heavy-fleece-hoodie_oatmeal-cream_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#FAF7EE',
          outerTone: '#ECE5D3',
        }
      }
    ]
  },
  'cryptic-celestis-oversized-hoodie': {
    name: 'Cryptic Celestis Oversized Hoodie',
    slug: 'cryptic-celestis-oversized-hoodie',
    price: 2899,
    compareAtPrice: 4499,
    sku: 'VE-HD-CC-BLK',
    category: 'Hoodies',
    colors: [
      {
        id: 'washed-black',
        colorName: 'Washed Onyx Black',
        hex: '#1E1E20',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/cryptic-celestis-oversized-hoodie_original_front.webp',
        backImage: '/images/variants/cryptic-celestis-oversized-hoodie_original_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E4E5E8',
          outerTone: '#CFCFD6',
        }
      },
      {
        id: 'vintage-plum',
        colorName: 'Vintage Mineral Plum',
        hex: '#845863',
        borderHex: '#9E6E7A',
        frontImage: '/images/variants/cryptic-celestis-oversized-hoodie_vintage-plum_front.webp',
        backImage: '/images/variants/cryptic-celestis-oversized-hoodie_vintage-plum_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#F7EDEF',
          outerTone: '#EBD8DC',
        }
      },
      {
        id: 'forest-pine',
        colorName: 'Deep Pine Green',
        hex: '#1E3B2F',
        borderHex: '#2B5745',
        frontImage: '/images/variants/cryptic-celestis-oversized-hoodie_forest-pine_front.webp',
        backImage: '/images/variants/cryptic-celestis-oversized-hoodie_forest-pine_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EEF4EF',
          outerTone: '#D9E6DC',
        }
      }
    ]
  },
  'vintage-mineral-acid-wash-hoodie': {
    name: 'Vintage Mineral Acid-Wash Hoodie',
    slug: 'vintage-mineral-acid-wash-hoodie',
    price: 2999,
    compareAtPrice: 4699,
    sku: 'VE-HD-WSH-SGE',
    category: 'Hoodies',
    colors: [
      {
        id: 'mineral-sage',
        colorName: 'Vintage Mineral Plum',
        hex: '#9D6E77',
        borderHex: '#B78D96',
        frontImage: '/images/variants/vintage-mineral-acid-wash-hoodie_original_front.webp',
        backImage: '/images/variants/vintage-mineral-acid-wash-hoodie_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#F7EDEF',
          outerTone: '#EBD8DC',
        }
      },
      {
        id: 'onyx-black',
        colorName: 'Washed Shadow Black',
        hex: '#1E1E20',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/vintage-mineral-acid-wash-hoodie_onyx-black_front.webp',
        backImage: '/images/variants/vintage-mineral-acid-wash-hoodie_onyx-black_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E4E5E8',
          outerTone: '#CFCFD6',
        }
      },
      {
        id: 'forest-pine',
        colorName: 'Acid Forest Sage',
        hex: '#1E3B2F',
        borderHex: '#2B5745',
        frontImage: '/images/variants/vintage-mineral-acid-wash-hoodie_forest-pine_front.webp',
        backImage: '/images/variants/vintage-mineral-acid-wash-hoodie_forest-pine_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EEF4EF',
          outerTone: '#D9E6DC',
        }
      }
    ]
  },
  'jet-black-compact-drop-shoulder-tee': {
    name: 'Jet Black Compact Drop-Shoulder Tee',
    slug: 'jet-black-compact-drop-shoulder-tee',
    price: 1299,
    compareAtPrice: 1999,
    sku: 'VE-TS-JET-BLK',
    category: 'T-Shirts',
    colors: [
      {
        id: 'onyx-black',
        colorName: 'Onyx Drop-Shoulder Black',
        hex: '#18181B',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/jet-black-compact-drop-shoulder-tee_original_front.webp',
        backImage: '/images/variants/jet-black-compact-drop-shoulder-tee_original_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E5E5E9',
          outerTone: '#D2D2D8',
        }
      },
      {
        id: 'oatmeal-cream',
        colorName: 'Classic Natural Bone',
        hex: '#E8E1CE',
        borderHex: '#C9C0A7',
        frontImage: '/images/variants/jet-black-compact-drop-shoulder-tee_oatmeal-cream_front.webp',
        backImage: '/images/variants/jet-black-compact-drop-shoulder-tee_oatmeal-cream_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#FAF6EE',
          outerTone: '#EFE6D5',
        }
      },
      {
        id: 'vintage-plum',
        colorName: 'Vintage Mineral Mauve',
        hex: '#8A5C69',
        borderHex: '#A57381',
        frontImage: '/images/variants/jet-black-compact-drop-shoulder-tee_vintage-plum_front.webp',
        backImage: '/images/variants/jet-black-compact-drop-shoulder-tee_vintage-plum_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#F7EDEF',
          outerTone: '#EBD8DC',
        }
      }
    ]
  },
  'classic-cream-supima-boxy-tee': {
    name: 'Classic Cream Supima Boxy Tee',
    slug: 'classic-cream-supima-boxy-tee',
    price: 1399,
    compareAtPrice: 2199,
    sku: 'VE-TS-SUP-CRM',
    category: 'T-Shirts',
    colors: [
      {
        id: 'cream-bone',
        colorName: 'Classic Cream Bone',
        hex: '#F3EFE6',
        borderHex: '#D4CEBF',
        frontImage: '/images/variants/classic-cream-supima-boxy-tee_original_front.webp',
        backImage: '/images/variants/classic-cream-supima-boxy-tee_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#FAF6EE',
          outerTone: '#EFE6D5',
        }
      },
      {
        id: 'onyx-black',
        colorName: 'Washed Onyx Black',
        hex: '#18181B',
        borderHex: '#3F3F46',
        frontImage: '/images/variants/classic-cream-supima-boxy-tee_onyx-black_front.webp',
        backImage: '/images/variants/classic-cream-supima-boxy-tee_onyx-black_back.webp',
        bgTheme: {
          lightCenter: '#FAFAFC',
          midTone: '#E5E5E9',
          outerTone: '#D2D2D8',
        }
      },
      {
        id: 'peach-terracotta',
        colorName: 'Peach Apricot Terracotta',
        hex: '#E89874',
        borderHex: '#C57754',
        frontImage: '/images/variants/classic-cream-supima-boxy-tee_peach-terracotta_front.webp',
        backImage: '/images/variants/classic-cream-supima-boxy-tee_peach-terracotta_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#FDF2EB',
          outerTone: '#F6DFD1',
        }
      }
    ]
  },
  'cyber-tokyo-typographic-graphic-tee': {
    name: 'Cyber Tokyo Typographic Graphic Tee',
    slug: 'cyber-tokyo-typographic-graphic-tee',
    price: 1499,
    compareAtPrice: 2399,
    sku: 'VE-TS-CYB-TOK',
    category: 'T-Shirts',
    colors: [
      {
        id: 'cyber-black',
        colorName: 'Cyber Typography Print Black',
        hex: '#27272A',
        borderHex: '#52525B',
        frontImage: '/images/variants/cyber-tokyo-typographic-graphic-tee_original_front.webp',
        backImage: '/images/variants/cyber-tokyo-typographic-graphic-tee_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EDEDF2',
          outerTone: '#D9D9E2',
        }
      },
      {
        id: 'oatmeal-cream',
        colorName: 'Cyber Bone Off-White',
        hex: '#E6DFC9',
        borderHex: '#C2BAA2',
        frontImage: '/images/variants/cyber-tokyo-typographic-graphic-tee_oatmeal-cream_front.webp',
        backImage: '/images/variants/cyber-tokyo-typographic-graphic-tee_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#FAF7EE',
          outerTone: '#EDE5D2',
        }
      },
      {
        id: 'forest-pine',
        colorName: 'Cyber Neon Pine',
        hex: '#1E3B2F',
        borderHex: '#2B5745',
        frontImage: '/images/variants/cyber-tokyo-typographic-graphic-tee_forest-pine_front.webp',
        backImage: '/images/variants/cyber-tokyo-typographic-graphic-tee_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EEF4EF',
          outerTone: '#D9E6DC',
        }
      }
    ]
  },
  'textured-waffle-knit-streetwear-polo': {
    name: 'Textured Waffle-Knit Streetwear Polo',
    slug: 'textured-waffle-knit-streetwear-polo',
    price: 1799,
    compareAtPrice: 2699,
    sku: 'VE-TS-WAF-POL',
    category: 'T-Shirts',
    colors: [
      {
        id: 'waffle-charcoal',
        colorName: 'Waffle Charcoal Camp Black',
        hex: '#2C3539',
        borderHex: '#4A5559',
        frontImage: '/images/variants/textured-waffle-knit-streetwear-polo_original_front.webp',
        backImage: '/images/variants/textured-waffle-knit-streetwear-polo_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EFF2F1',
          outerTone: '#DDE2E0',
        }
      },
      {
        id: 'oatmeal-cream',
        colorName: 'Waffle Knit Oatmeal Cream',
        hex: '#E3DCBE',
        borderHex: '#C5BE9F',
        frontImage: '/images/variants/textured-waffle-knit-streetwear-polo_oatmeal-cream_front.webp',
        backImage: '/images/variants/textured-waffle-knit-streetwear-polo_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#FAF7EE',
          outerTone: '#ECE5D3',
        }
      },
      {
        id: 'forest-pine',
        colorName: 'Deep Pine Waffle Knit',
        hex: '#1E3B2F',
        borderHex: '#2B5745',
        frontImage: '/images/variants/textured-waffle-knit-streetwear-polo_forest-pine_front.webp',
        backImage: '/images/variants/textured-waffle-knit-streetwear-polo_original_back.webp',
        bgTheme: {
          lightCenter: '#FFFFFF',
          midTone: '#EEF4EF',
          outerTone: '#D9E6DC',
        }
      }
    ]
  }
};

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

export default function ProductStudio() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // 360 Rotation Physics State
  const [focusAngle, setFocusAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ isDragging: false, startX: 0, startAngle: 0 });
  const studioImgRef = useRef(null);
  const { flyToCart } = useFlyAnimation();

  // Color Swatch & Bottom-to-Top Wipe States
  const [colorPalette, setColorPalette] = useState([]);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [incomingVariant, setIncomingVariant] = useState(null);
  const [isColorWiping, setIsColorWiping] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Size Selection State
  const [selectedSize, setSelectedSize] = useState('M');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Load Product Data and assign its EXACT 3 Color Variants
  useEffect(() => {
    async function loadStudio() {
      setLoading(true);
      try {
        const prodData = await productService.getBySlugOrId(slug).catch(() => null);

        // 360° Studio is strictly for shirts, hoodies, t-shirts, and jackets. Never for shoes.
        const catSlug = (prodData?.category?.slug || '').toLowerCase();
        const catName = (prodData?.category?.name || '').toLowerCase();
        const isShoe = catSlug === 'shoes' || catSlug.includes('shoe') || catSlug.includes('sneaker') || catSlug.includes('footwear') ||
                       catName.includes('shoe') || catName.includes('sneaker') || catName.includes('footwear') ||
                       slug.includes('sneaker') || slug.includes('runner') || slug.includes('trainer') || slug.includes('court') || slug.includes('dunk');

        if (isShoe) {
          navigate(`/products/${slug}`, { replace: true });
          return;
        }

        // Find exact entry in STUDIO_PRODUCTS (by slug, API slug, or name) or generate safe fallback
        const studioEntry = STUDIO_PRODUCTS[slug] || 
          Object.values(STUDIO_PRODUCTS).find(p => 
            p.slug === slug || 
            (prodData?.slug && p.slug === prodData.slug) || 
            (prodData?.name && p.name.toLowerCase() === prodData.name.toLowerCase())
          ) || {
          name: prodData?.name || 'Streetwear Essential',
          slug: slug,
          price: prodData?.price || 2499,
          compareAtPrice: prodData?.compare_at_price || 3999,
          sku: prodData?.sku || 'VE-STU-001',
          category: prodData?.category?.name || 'Streetwear',
          colors: [
            {
              id: 'original-color',
              colorName: 'Original Studio Tone',
              hex: '#1E1E20',
              borderHex: '#3F3F46',
              frontImage: prodData?.front_image || prodData?.images?.[0]?.image_url || '/images/variants/midnight-navy-work-chore-jacket_original_front.webp',
              backImage: prodData?.back_image || prodData?.images?.[1]?.image_url || '/images/variants/midnight-navy-work-chore-jacket_original_back.webp',
              bgTheme: { lightCenter: '#FFFFFF', midTone: '#ECEFF1', outerTone: '#CFD8DC' }
            },
            {
              id: 'charcoal-black',
              colorName: 'Washed Charcoal Black',
              hex: '#18181B',
              borderHex: '#27272A',
              frontImage: '/images/variants/midnight-navy-work-chore-jacket_charcoal-black_front.webp',
              backImage: '/images/variants/midnight-navy-work-chore-jacket_charcoal-black_back.webp',
              bgTheme: { lightCenter: '#FAFAFC', midTone: '#E4E5E8', outerTone: '#CFCFD6' }
            },
            {
              id: 'oatmeal-bone',
              colorName: 'Oatmeal Bone Cream',
              hex: '#E6DFC9',
              borderHex: '#C5BE9F',
              frontImage: '/images/variants/classic-cream-supima-boxy-tee_original_front.webp',
              backImage: '/images/variants/classic-cream-supima-boxy-tee_original_back.webp',
              bgTheme: { lightCenter: '#FFFFFF', midTone: '#FAF7EE', outerTone: '#ECE5D3' }
            }
          ]
        };

        const palette = studioEntry.colors;
        setColorPalette(palette);
        setCurrentVariant(palette[0]);

        setActiveProduct({
          id: prodData?.id || 101,
          name: prodData?.name || studioEntry.name,
          slug: prodData?.slug || studioEntry.slug,
          price: prodData?.price || studioEntry.price,
          compare_at_price: prodData?.compare_at_price || studioEntry.compareAtPrice,
          category: prodData?.category || { name: studioEntry.category },
          sku: prodData?.sku || studioEntry.sku,
          stock: prodData?.available_stock || 25,
          colorName: palette[0].colorName,
        });
      } catch (err) {
        console.error("Failed to load studio product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStudio();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Color Selection: Triggers bottom-to-top wipe animation on the SAME product
  const handleSelectColor = (selectedVariant) => {
    if (isColorWiping || !currentVariant || currentVariant.id === selectedVariant.id) return;

    setIncomingVariant(selectedVariant);
    setIsColorWiping(true);
    setAnimKey(prev => prev + 1);

    // Update active product details for the tag & breadcrumbs
    setActiveProduct(prev => ({
      ...prev,
      colorName: selectedVariant.colorName,
    }));

    // Complete bottom-to-top wipe after 1250ms
    setTimeout(() => {
      setCurrentVariant(selectedVariant);
      setIncomingVariant(null);
      setIsColorWiping(false);
    }, 1250);
  };

  // Quick Add To Bag Handler with smooth flying animation
  const handleAddToCart = async () => {
    if (!activeProduct || !currentVariant) return;
    setIsAddingToCart(true);

    if (flyToCart && studioImgRef.current) {
      flyToCart(studioImgRef.current, currentVariant.frontImage);
    }

    try {
      await useCartStore.getState().addItem(
        activeProduct.id || slug,
        1,
        {
          id: activeProduct.id,
          name: activeProduct.name,
          price: activeProduct.price,
          compare_at_price: activeProduct.compare_at_price,
          slug: activeProduct.slug,
          image_url: currentVariant.frontImage,
          selectedSize: selectedSize,
          selectedColor: currentVariant.colorName,
          sku: activeProduct.sku,
        }
      );

      useToastStore.getState().addToast(
        `Added ${activeProduct.name} (${currentVariant.colorName}, Size ${selectedSize}) to bag!`,
        'success'
      );
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2400);
    } catch (err) {
      console.error("Add to cart error:", err);
      useToastStore.getState().addToast('Could not add to bag. Please try again.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Direct Order Now / Buy Now Handler with flying animation
  const handleOrderNow = async () => {
    if (!activeProduct || !currentVariant) return;
    setIsOrdering(true);

    let hasFlown = false;
    if (flyToCart && studioImgRef.current) {
      hasFlown = true;
      flyToCart(studioImgRef.current, currentVariant.frontImage, () => {
        navigate('/checkout');
      });
    }

    try {
      await useCartStore.getState().addItem(
        activeProduct.id || slug,
        1,
        {
          id: activeProduct.id,
          name: activeProduct.name,
          price: activeProduct.price,
          compare_at_price: activeProduct.compare_at_price,
          slug: activeProduct.slug,
          image_url: currentVariant.frontImage,
          selectedSize: selectedSize,
          selectedColor: currentVariant.colorName,
          sku: activeProduct.sku,
        }
      );

      if (!hasFlown) {
        navigate('/checkout');
      }
    } catch (err) {
      console.error("Order now error:", err);
      navigate('/checkout');
    } finally {
      setIsOrdering(false);
    }
  };

  // 360 Rotation Math
  const normalizedAngle = ((focusAngle % 360) + 360) % 360;
  const isFacingBack = normalizedAngle >= 90 && normalizedAngle <= 270;

  // Dynamic Studio Background shifts with rotation AND adapts to selected color theme
  const rad = (normalizedAngle * Math.PI) / 180;
  const lightShiftX = 50 + 24 * Math.sin(rad);
  const lightShiftY = 38 + 14 * Math.cos(rad);

  const activeBg = (incomingVariant || currentVariant)?.bgTheme || {
    lightCenter: '#FFFFFF',
    midTone: '#F9F7F2',
    outerTone: '#F1EDE4'
  };

  const dynamicStudioBg = {
    background: `radial-gradient(circle at ${lightShiftX.toFixed(1)}% ${lightShiftY.toFixed(1)}%, ${activeBg.lightCenter} 0%, ${activeBg.midTone} 48%, ${activeBg.outerTone} 100%)`,
    transition: isDragging ? 'none' : 'background 750ms cubic-bezier(0.25, 1, 0.5, 1)'
  };

  // Pointer Handlers for 360 Rotation
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startAngle: focusAngle,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    setFocusAngle(dragRef.current.startAngle + deltaX * 0.85);
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  const rotateToFront = () => {
    setIsDragging(false);
    const nearestFront = Math.round(focusAngle / 360) * 360;
    setFocusAngle(nearestFront);
  };

  const rotateToBack = () => {
    setIsDragging(false);
    const nearestBack = Math.round((focusAngle - 180) / 360) * 360 + 180;
    setFocusAngle(nearestBack);
  };

  const spinFull360 = () => {
    setIsDragging(false);
    setFocusAngle(prev => prev + 360);
  };

  if (loading || !currentVariant || !activeProduct) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#16382C] rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Loading 360° Studio...
        </span>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] h-screen w-screen overflow-hidden text-[#111827] flex flex-col justify-between select-none"
      style={dynamicStudioBg}
    >
      {/* Top Bar: Clean Minimalist Navigation & Single 'View Full Details' Button */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 sm:pt-3.5 pb-1 z-30 flex-shrink-0">
        <div className="flex items-center justify-between">
          
          {/* Back to Storefront */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          {/* Breadcrumb info */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-[#C5A880] font-bold uppercase tracking-wider text-[11px]">360° Studio</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-semibold text-gray-800 truncate max-w-xs">{activeProduct.name}</span>
          </div>

          {/* Navigate to Product Details */}
          <button
            type="button"
            onClick={() => navigate(`/products/${activeProduct.slug}?color=${currentVariant.id}&size=${selectedSize}`)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 hover:bg-white text-gray-900 border border-gray-200/90 text-xs font-bold uppercase tracking-wider shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title={`View full details for ${activeProduct.name}`}
          >
            <span>View Full Details</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#16382C]" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MIDDLE STAGE: Centered Big Product in Middle + Hanging Luxury Price Tag
          ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative px-4 w-full max-w-5xl mx-auto my-auto">
        
        {/* Subtle Metallic Studio Rod */}
        <div className="w-48 sm:w-80 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full opacity-60 mb-0.5 flex-shrink-0" />

        {/* Garment Stage Container (Substantially Bigger Product Image) */}
        <div className="relative flex items-center justify-center flex-1 min-h-0 w-full max-h-[58vh] sm:max-h-[64vh]">

          {/* =====================================================================
              PHYSICAL LUXURY STREETWEAR PRICE TAG (Shows exact Color & Size chosen)
              ===================================================================== */}
          <div 
            className="absolute -top-1 -left-8 sm:-left-24 md:-left-36 lg:-left-44 z-30 flex flex-col items-end pointer-events-none sm:pointer-events-auto group cursor-default"
            style={{
              transform: 'rotate(-4deg)',
              transformOrigin: 'top right'
            }}
          >
            {/* Hanging String/Cord */}
            <div className="w-px h-5 sm:h-8 bg-gradient-to-b from-gray-400 to-gray-500 mr-4" />

            {/* Swing Tag Body */}
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#E5DECF] shadow-[0_8px_20px_rgba(0,0,0,0.08)] min-w-[130px] sm:min-w-[165px] text-left transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0">
              
              {/* Metallic Eyelet Ring Hole */}
              <div className="absolute -top-2 right-3 w-3 h-3 rounded-full bg-[#E5DECF] border-2 border-white flex items-center justify-center shadow-xs">
                <div className="w-1 h-1 rounded-full bg-[#3F3F46]" />
              </div>

              {/* Tag Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#C5A880]">
                    UNLIMITED
                  </span>
                  <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    IN STOCK
                  </span>
                </div>

                <div className="font-serif text-xs font-bold text-gray-900 leading-snug truncate max-w-[145px]">
                  {activeProduct.name}
                </div>

                {/* Big Bold Price Tag */}
                <div className="flex items-baseline gap-1 pt-0.5">
                  <span className="text-base sm:text-lg font-black text-[#16382C] tracking-tight">
                    ₹{Math.round(activeProduct.price).toLocaleString('en-IN')}
                  </span>
                  {activeProduct.compare_at_price && (
                    <span className="text-[9px] text-gray-400 line-through">
                      ₹{Math.round(activeProduct.compare_at_price).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Active Color & Selected Size Display */}
                <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-500 font-medium">
                  <span className="font-bold text-gray-800 truncate max-w-[90px]">
                    {currentVariant.colorName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-900 font-bold">
                    Size {selectedSize}
                  </span>
                </div>

                {/* Subtle Barcode SKU */}
                <div className="pt-0.5 text-[7px] text-gray-400 font-mono tracking-wider">
                  {activeProduct.sku}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              3D ROTATING INTERACTIVE PRODUCT (CENTER OF PAGE - ENLARGED SCALE)
              ===================================================================== */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative h-[48vh] sm:h-[56vh] md:h-[60vh] max-h-[520px] min-h-[300px] aspect-[3/4] cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
            style={{
              perspective: '1400px',
              touchAction: 'none'
            }}
          >
            {/* Dynamic Floor Shadow */}
            <div 
              className="absolute -bottom-2 w-56 sm:w-72 h-5 bg-black/15 blur-lg rounded-[100%] pointer-events-none transition-transform duration-300"
              style={{
                transform: `scale(${1 + 0.08 * Math.cos(rad)})`
              }}
            />

            {/* 3D Mesh Container */}
            <div
              className="w-full h-full relative"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${focusAngle}deg)`,
                transition: isDragging ? 'none' : 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform'
              }}
            >
              {/* -----------------------------------------------------------------
                  FRONT FACE (0°) WITH BOTTOM-TO-TOP COLOR WIPE ANIMATION
                  ----------------------------------------------------------------- */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg) translateZ(1px)',
                }}
              >
                {/* 1. Base Layer: Current Color Front Image */}
                <img
                  ref={studioImgRef}
                  src={currentVariant.frontImage}
                  alt={`${activeProduct.name} front presentation`}
                  className="max-h-[100%] max-w-[100%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)]"
                  loading="eager"
                  draggable={false}
                />

                {/* 2. Top Layer: Incoming Color Front Image (Animated Bottom to Top) */}
                {isColorWiping && incomingVariant && (
                  <div 
                    key={`front-${animKey}`}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none animate-color-wipe"
                  >
                    <img
                      src={incomingVariant.frontImage}
                      alt="Color Transition Front"
                      className="max-h-[100%] max-w-[100%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)]"
                      draggable={false}
                    />

                    {/* Laser / Light Beam Sweep Line */}
                    <div 
                      className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent shadow-[0_0_8px_#C5A880] animate-beam-rise pointer-events-none" 
                    />
                  </div>
                )}
              </div>

              {/* -----------------------------------------------------------------
                  BACK FACE (180°) WITH BOTTOM-TO-TOP COLOR WIPE ANIMATION
                  ----------------------------------------------------------------- */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg) translateZ(1px)',
                }}
              >
                {/* 1. Base Layer: Current Color Back Image */}
                <img
                  src={currentVariant.backImage}
                  alt={`${activeProduct.name} back presentation`}
                  className="max-h-[100%] max-w-[100%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)]"
                  loading="eager"
                  draggable={false}
                />

                {/* 2. Top Layer: Incoming Color Back Image (Animated Bottom to Top) */}
                {isColorWiping && incomingVariant && (
                  <div 
                    key={`back-${animKey}`}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none animate-color-wipe"
                  >
                    <img
                      src={incomingVariant.backImage}
                      alt="Color Transition Back"
                      className="max-h-[100%] max-w-[100%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)]"
                      draggable={false}
                    />

                    {/* Laser / Light Beam Sweep Line */}
                    <div 
                      className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent shadow-[0_0_8px_#C5A880] animate-beam-rise pointer-events-none" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* 360° Rotate Angle Indicator & Quick Flip Controls */}
        <div className="flex items-center gap-2 mt-0.5 mb-1 z-20 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-0.5 rounded-full border border-gray-200/90 shadow-2xs text-[11px] font-semibold text-gray-700">
            <button
              type="button"
              onClick={rotateToFront}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                !isFacingBack ? 'bg-[#16382C] text-white font-bold' : 'hover:text-black'
              }`}
            >
              Front 0°
            </button>
            <button
              type="button"
              onClick={rotateToBack}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                isFacingBack ? 'bg-[#16382C] text-white font-bold' : 'hover:text-black'
              }`}
            >
              Back 180°
            </button>
            <button
              type="button"
              onClick={spinFull360}
              title="Smooth 360 Spin"
              className="p-1 hover:text-[#C5A880] transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
            Drag garment to spin 360°
          </span>
        </div>

      </div>

      {/* =========================================================================
          BOTTOM SECTION: Unified 3-Color, Size (S, M, L, XL, 2XL) & Dual Actions [Add to Bag] [Order Now]
          (100% Contained Inside The Box - ZERO Overflow, Clean Floating Dock)
          ========================================================================= */}
      <div className="w-full mx-auto px-2 sm:px-4 pb-2 sm:pb-3 flex flex-col items-center z-30 flex-shrink-0">
        
        {/* Floating Capsule Dock - w-fit ensures generous padding on all sides of buttons */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-2xl sm:rounded-full border border-gray-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] w-fit max-w-[96vw] flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2.5 sm:gap-3.5 md:gap-5 box-border">
          
          {/* 1. COLOR OPTIONS: Direct Visual Color Swatches for the Same Product (Zero Text Clutter) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0" role="radiogroup" aria-label="Product Color Options">
            {colorPalette.map((col) => {
              const isActive = (incomingVariant?.id || currentVariant?.id) === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSelectColor(col)}
                  className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 shadow-xs ${
                    isActive
                      ? 'scale-115 ring-2 ring-[#16382C] ring-offset-2 shadow-sm'
                      : 'hover:scale-108 opacity-85 hover:opacity-100 ring-1 ring-black/15 hover:ring-black/30'
                  }`}
                  style={{
                    backgroundColor: col.hex,
                    borderColor: col.borderHex,
                  }}
                  title={col.colorName}
                  aria-label={`Select ${col.colorName}`}
                >
                  {isActive && (
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{
                        backgroundColor: col.id.includes('cream') || col.id.includes('grey') ? '#16382C' : '#FFFFFF'
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200/80 flex-shrink-0" />

          {/* 2. SIZE SELECTION (S, M, L, XL, 2XL) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <div className="flex flex-col flex-shrink-0">
              <span className="font-bold uppercase tracking-wider text-[8px] sm:text-[9px] text-gray-400">
                Size
              </span>
              <span className="font-bold text-[#16382C] text-[11px] sm:text-xs">
                {selectedSize}
              </span>
            </div>

            {/* S, M, L, XL, 2XL options */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {SIZES.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[26px] sm:min-w-[30px] h-6 sm:h-7 px-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#16382C] text-white shadow-xs scale-105 ring-1 ring-[#16382C]'
                        : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200 hover:text-black border border-gray-200/70'
                    }`}
                    title={`Select Size ${sz}`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200/80 flex-shrink-0" />

          {/* 3. DUAL ACTIONS: [ Add to Bag ] and [ Order Now ] (Guaranteed 100% Inside Card with Safe Margin) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Add to Bag Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-2xs whitespace-nowrap cursor-pointer flex-shrink-0 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-[#16382C] border border-[#16382C]/30 hover:border-[#16382C] active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#16382C]" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            {/* Order Now Button - Guaranteed Fully Inside Card */}
            <button
              type="button"
              onClick={handleOrderNow}
              disabled={isOrdering}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-[#16382C] hover:bg-[#122e24] text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

        <span className="text-[9px] text-gray-400 font-medium pt-1">
          360° Studio View • Single Page Experience
        </span>

      </div>
    </div>
  );
}
