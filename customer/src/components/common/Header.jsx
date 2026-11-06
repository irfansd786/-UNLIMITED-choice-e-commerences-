import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  Package, 
  MapPin, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { categoryService, productService } from '../../services/api';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    categoryService.getAll().then(data => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCart();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Handle search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await productService.getSearchSuggestions(searchQuery);
        setSuggestions(data);
      } catch (err) {
        setSuggestions(null);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const cartItemCount = cart?.items?.reduce((total, it) => total + it.quantity, 0) || 0;
  const wishlistItemCount = wishlist?.items?.length || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 shadow-xs m-0 p-0">
      {/* MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-3 md:gap-8">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <BrandLogo />
          </div>

          {/* Center Navigation Links (Matching Pic 2: Home, Shop v, About, Contact) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs font-semibold text-stone-700">
            <Link 
              to="/" 
              className={`transition-all hover:text-black ${
                location.pathname === '/' 
                  ? 'text-black font-bold' 
                  : 'text-stone-700'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/outfit-studio" 
              className={`inline-flex items-center gap-1.5 transition-all hover:text-black ${
                location.pathname === '/outfit-studio' 
                  ? 'text-black font-bold' 
                  : 'text-stone-700'
              }`}
            >
              <span>Outfit Studio</span>
              <span className="bg-[#16382C] text-[#C5A880] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider shadow-xs">
                New
              </span>
            </Link>
            <div className="relative group">
              <Link 
                to="/products" 
                className={`inline-flex items-center gap-1 transition-all hover:text-black ${
                  location.pathname === '/products' || location.pathname === '/shoes'
                    ? 'text-black font-bold' 
                    : 'text-stone-700'
                }`}
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 transition-transform group-hover:rotate-180" />
              </Link>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link to="/outfit-studio" className="block px-4 py-1.5 text-xs font-bold text-[#16382C] hover:bg-stone-50 flex items-center justify-between">
                  <span>Outfit Studio</span>
                  <span className="text-[9px] bg-[#FAF7EE] text-[#C5A880] px-1 rounded border border-[#EBDDC9]">NEW</span>
                </Link>
                <Link to="/shoes" className="block px-4 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-black">
                  Sneakers & Footwear
                </Link>
                <Link to="/products" className="block px-4 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-black">
                  All Streetwear
                </Link>
                <Link to="/category/hoodies" className="block px-4 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-black">
                  Hoodies & Oversized
                </Link>
                <Link to="/category/t-shirts" className="block px-4 py-1.5 text-xs text-stone-700 hover:bg-stone-50 hover:text-black">
                  Boxy T-Shirts
                </Link>
              </div>
            </div>
            <Link 
              to="/about" 
              className={`transition-all hover:text-black ${
                location.pathname === '/about' 
                  ? 'text-black font-bold' 
                  : 'text-stone-700'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`transition-all hover:text-black ${
                location.pathname === '/contact' 
                  ? 'text-black font-bold' 
                  : 'text-stone-700'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons (Search, Divider, Cart, Account) */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            
            {/* Desktop-Only Search Button / Collapsible Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in zoom-in-95 duration-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search footwear, apparel..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    autoFocus
                    className="w-48 sm:w-64 bg-stone-50 text-stone-900 text-xs rounded-full pl-9 pr-7 py-1.5 border border-stone-300 focus:outline-none focus:border-[#16382C] shadow-inner"
                  />
                  <Search className="w-4 h-4 text-stone-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }}
                  className="p-2 text-stone-700 hover:text-[#16382C] hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Open Search"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Autocomplete Dropdown (Desktop) */}
              {searchOpen && showSuggestions && suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                <div className="absolute top-full right-0 w-72 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 p-2 text-xs">
                  {suggestions.categories.length > 0 && (
                    <div className="p-2 border-b border-stone-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1">Categories</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {suggestions.categories.map((c) => (
                          <Link
                            key={c.slug}
                            to={`/category/${c.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-[#16382C] hover:text-white text-stone-800 text-xs rounded-full transition-colors font-medium"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.products.length > 0 && (
                    <div className="p-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1">Matching Products</span>
                      <div className="mt-1 space-y-1">
                        {suggestions.products.map((p) => (
                          <Link
                            key={p.slug}
                            to={`/products/${p.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-stone-50 text-stone-900 group transition-colors"
                          >
                            <span className="group-hover:text-[#16382C] font-medium truncate">{p.name}</span>
                            <span className="text-[#16382C] font-bold text-xs ml-2">₹{Math.round(p.price).toLocaleString('en-IN')}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vertical Separator matching reference screenshot */}
            <div className="hidden sm:block w-[1px] h-5 bg-stone-300" />
            {/* Account */}
            <div className="relative" ref={userDropdownRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-charcoal-900 hover:text-forest-800 p-1.5 rounded-xl hover:bg-cream-200/60 transition-colors"
                  aria-label="User Account"
                >
                  <div className="w-8 h-8 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center font-serif text-xs font-bold shadow-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden lg:block text-xs font-medium text-left max-w-[85px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 hidden lg:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-charcoal-800 hover:text-forest-900 px-2.5 py-1.5 rounded-xl hover:bg-cream-200/60 text-xs font-semibold tracking-wide transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-forest-800" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Account Dropdown */}
              {userDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <div className="px-3.5 py-2 border-b border-cream-100">
                    <p className="font-bold text-charcoal-900 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-charcoal-500 truncate">{user?.email}</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div className="py-1 border-b border-cream-100 bg-forest-50/50">
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3.5 py-1.5 text-forest-900 hover:bg-forest-100 font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                        Admin Operations Console
                      </Link>
                    </div>
                  )}
                  <div className="py-1">
                    <Link
                      to="/account/profile"
                      className="flex items-center gap-2 px-3.5 py-1.5 text-charcoal-800 hover:bg-cream-100 hover:text-forest-900 font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-forest-700" />
                      Dashboard & Profile
                    </Link>
                    <Link
                      to="/account/orders"
                      className="flex items-center gap-2 px-3.5 py-1.5 text-charcoal-800 hover:bg-cream-100 hover:text-forest-900 font-medium"
                    >
                      <Package className="w-3.5 h-3.5 text-forest-700" />
                      My Orders
                    </Link>
                    <Link
                      to="/account/addresses"
                      className="flex items-center gap-2 px-3.5 py-1.5 text-charcoal-800 hover:bg-cream-100 hover:text-forest-900 font-medium"
                    >
                      <MapPin className="w-3.5 h-3.5 text-forest-700" />
                      Saved Addresses
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 px-3.5 py-1.5 text-charcoal-800 hover:bg-cream-100 hover:text-forest-900 font-medium"
                    >
                      <Heart className="w-3.5 h-3.5 text-forest-700" />
                      My Wishlist ({wishlistItemCount})
                    </Link>
                  </div>
                  <div className="border-t border-cream-100 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-red-600 hover:bg-red-50 text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              id="header-wishlist-btn"
              className="relative p-2 text-charcoal-800 hover:text-forest-900 hover:bg-cream-200/60 rounded-xl transition-colors"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5 text-charcoal-700 hover:text-forest-800" />
              {wishlistItemCount > 0 && (
                <span
                  id="header-wishlist-badge"
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-forest-900 text-gold-300 text-[10px] font-bold flex items-center justify-center border border-white"
                >
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              id="header-cart-btn"
              className="relative p-2 text-charcoal-800 hover:text-forest-900 hover:bg-cream-200/60 rounded-xl transition-colors flex items-center gap-1.5"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-forest-900" />
                {cartItemCount > 0 && (
                  <span
                    id="header-cart-badge"
                    className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] rounded-full bg-forest-900 text-gold-300 text-[10px] font-bold flex items-center justify-center px-0.5 border border-white"
                  >
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-forest-950">
                {cart?.total_amount ? `₹${Math.round(cart.total_amount).toLocaleString('en-IN')}` : 'Cart'}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-charcoal-800 hover:text-forest-900 rounded-xl hover:bg-cream-200/60"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar — Clean Row Beneath Header */}
        <div className="md:hidden pb-3 pt-0.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search streetwear, hoodies, sneakers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full bg-[#FAF8F5] text-charcoal-900 placeholder:text-stone-400 text-xs rounded-full pl-9 pr-8 py-2 border border-stone-200 focus:outline-none focus:border-[#16382C] focus:bg-white shadow-2xs transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#16382C] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mobile Autocomplete Dropdown */}
            {showSuggestions && suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 p-2 text-xs">
                {suggestions.categories.length > 0 && (
                  <div className="p-1.5 border-b border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">Categories</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {suggestions.categories.map((c) => (
                        <Link
                          key={c.slug}
                          to={`/category/${c.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-[#16382C] hover:text-white text-stone-800 text-xs rounded-full transition-colors font-medium"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div className="p-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">Matching Products</span>
                    <div className="mt-1 space-y-1">
                      {suggestions.products.slice(0, 4).map((p) => (
                        <Link
                          key={p.slug}
                          to={`/products/${p.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-stone-50 text-stone-900 transition-colors"
                        >
                          <span className="font-medium truncate text-xs">{p.name}</span>
                          <span className="text-[#16382C] font-bold text-xs ml-2">₹{Math.round(p.price).toLocaleString('en-IN')}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>


      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-cream-200 px-4 py-4 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Shop Men's Streetwear</span>
            <div className="mt-2 flex flex-col gap-1.5 text-xs">
              <Link to="/outfit-studio" className="p-2.5 rounded-xl bg-[#16382C] text-white font-bold flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-1.5">
                  <span>Interactive Outfit Studio</span>
                  <span className="text-[8px] bg-[#C5A880] text-black px-1 rounded font-black">NEW</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
              </Link>
              <Link to="/category/hoodies" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                Hoodies (Oversized & Pullover) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
              <Link to="/category/t-shirts" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                T-Shirts (Graphic & Boxy) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
              <Link to="/category/shorts" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                Shorts (Casual & Cargo) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
              <Link to="/category/shoes" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                Shoes (Sneakers & Trainers) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
              <Link to="/category/bottomwear" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                Bottomwear (Joggers & Cargos) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
              <Link to="/category/jackets" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                Jackets (Bombers & Chore) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
              <Link to="/category/accessories" className="p-2.5 rounded-xl bg-black text-[#F5EFE6] hover:text-[#D2B47A] font-semibold flex items-center justify-between">
                Accessories (Caps, Belts, Wallets) <ArrowRight className="w-3.5 h-3.5 text-gold-500" />
              </Link>
            </div>
          </div>

          <div className="border-t border-cream-100 pt-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">Account & Orders</span>
            <div className="mt-2 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link to="/account/profile" className="block py-1.5 text-charcoal-800 font-medium">Dashboard ({user?.full_name})</Link>
                  <Link to="/account/orders" className="block py-1.5 text-charcoal-800 font-medium">My Orders</Link>
                  <Link to="/account/addresses" className="block py-1.5 text-charcoal-800 font-medium">Saved Addresses</Link>
                  <Link to="/wishlist" className="block py-1.5 text-charcoal-800 font-medium">My Wishlist ({wishlistItemCount})</Link>
                  <button onClick={logout} className="block py-1.5 text-red-600 font-bold">Log Out</button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link to="/login" className="flex-1 py-2 text-center text-xs font-bold bg-forest-900 text-gold-300 rounded-xl">Sign In</Link>
                  <Link to="/register" className="flex-1 py-2 text-center text-xs font-bold border border-forest-900 text-forest-900 rounded-xl">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
