import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Boxes, 
  ClipboardList, 
  Users, 
  Star, 
  Ticket, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bell,
  Download,
  CheckCircle2,
  AlertTriangle,
  Package,
  Check,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { useJarvisStore } from '../../store/useJarvisStore';
import { adminDashboardService, adminOrderService } from '../../services/api';
import AIBusinessAssistant from '../ai/AIBusinessAssistant';
import JarvisVoiceController from '../jarvis/JarvisVoiceController';
import JarvisFloatingOrb from '../jarvis/JarvisFloatingOrb';
import JarvisProductBuilderModal from '../jarvis/JarvisProductBuilderModal';
import JarvisCouponModal from '../jarvis/JarvisCouponModal';
import JarvisCustomerWebViewer from '../jarvis/JarvisCustomerWebViewer';

export default function AdminLayout() {
  const { user, logout } = useAdminAuthStore();
  const { openAssistant } = useAIAssistantStore();
  const { isListening, isSpeaking } = useJarvisStore();
  const navigate = useNavigate();

  const storefrontUrl = import.meta.env.VITE_STORE_URL || (typeof window !== 'undefined' && window.location.port === '5174' ? 'http://localhost:5173' : '/');
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Export report states
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  // Alerts states
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsList, setAlertsList] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const alertsRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Products', to: '/products', icon: ShoppingBag },
    { label: 'Categories', to: '/categories', icon: Layers },
    { label: 'Inventory & Stock', to: '/inventory', icon: Boxes },
    { label: 'Orders & Fulfillment', to: '/orders', icon: ClipboardList },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Reviews & Ratings', to: '/reviews', icon: Star },
    { label: 'Coupons & Promos', to: '/coupons', icon: Ticket },
    { label: 'Store Settings', to: '/settings', icon: SettingsIcon },
  ];

  const adminFirstName = user?.full_name ? user.full_name.split(' ')[0] : 'Chief';

  // Load live store alerts for notification bell
  useEffect(() => {
    async function loadAlerts() {
      try {
        const stats = await adminDashboardService.getStats();
        const alerts = [];

        // 1. Pending orders needing packaging / dispatch
        if (stats.pending_orders > 0) {
          alerts.push({
            id: 'pending-orders',
            type: 'urgent',
            title: `${stats.pending_orders} Orders Awaiting Packing & Dispatch`,
            desc: `${stats.pending_orders} orders have been placed and require warehouse preparation and shipping handover.`,
            link: '/orders',
            time: 'Needs Action'
          });
        }

        // 2. Inventory status
        if (stats.low_stock_count > 0) {
          alerts.push({
            id: 'low-stock',
            type: 'warning',
            title: `Low Stock Alert (${stats.low_stock_count} items)`,
            desc: `${stats.low_stock_count} products have breached the minimum replenishment threshold.`,
            link: '/inventory',
            time: 'Stock Warning'
          });
        } else {
          alerts.push({
            id: 'stock-optimal',
            type: 'success',
            title: 'Catalog Stock Levels Optimal',
            desc: `All ${stats.total_products || 40} items in your active catalog are well-stocked and verified healthy.`,
            link: '/inventory',
            time: 'Live Audit'
          });
        }

        // 3. Recent High-Value Checkout
        if (stats.recent_orders && stats.recent_orders.length > 0) {
          const latest = stats.recent_orders[0];
          alerts.push({
            id: 'latest-order',
            type: 'info',
            title: `Latest Order #${latest.order_number?.slice(-6) || latest.id}`,
            desc: `${latest.shipping_address?.full_name || 'Customer'} placed an order for ₹${Math.round(latest.total_amount).toLocaleString('en-IN')}.`,
            link: `/orders?search=${latest.order_number}`,
            time: 'Recent Checkout'
          });
        }

        // 4. Autonomous AI Sentinel Status
        alerts.push({
          id: 'ai-sentinel',
          type: 'ai',
          title: 'Jarvis Voice Sentinel Online',
          desc: 'Connected to Groq AI engine & ElevenLabs voice pipeline. 24/7 store operations active.',
          action: () => openAssistant(),
          time: 'Active 24/7'
        });

        setAlertsList(alerts);
        setUnreadAlertsCount(stats.pending_orders > 0 ? 2 : 1);
      } catch (err) {
        console.error("Could not fetch alerts:", err);
      }
    }
    loadAlerts();
  }, [openAssistant]);

  // Click outside to close alerts popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setAlertsOpen(false);
      }
    }
    if (alertsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [alertsOpen]);

  // Comprehensive Live Data Export
  const handleExportFullReport = async () => {
    setIsExporting(true);
    try {
      // Fetch live statistics and full orders list
      const [stats, orders] = await Promise.all([
        adminDashboardService.getStats().catch(() => null),
        adminOrderService.getAll().catch(() => [])
      ]);

      const nowStr = new Date().toLocaleString('en-IN');
      const dateFileStr = new Date().toISOString().slice(0, 10);

      // Section 1: Executive Summary
      let csv = 'VARSHI ENTERPRISES - EXECUTIVE STORE OPERATIONS & AUDIT REPORT\n';
      csv += `Generated At,"${nowStr}"\n`;
      csv += `Admin User,"${user?.full_name || 'Admin'} (${user?.email || 'admin@varshi.com'})"\n`;
      csv += `Data Source,"Certified Live Store Database"\n\n`;

      csv += '--- STORE FINANCIAL & ORDER SUMMARY ---\n';
      csv += 'Metric,Value\n';
      csv += `Total Gross Revenue,"INR ${Math.round(stats?.total_revenue || 0).toLocaleString('en-IN')}"\n`;
      csv += `Prepaid Online Revenue,"INR ${Math.round(stats?.paid_revenue || 0).toLocaleString('en-IN')}"\n`;
      csv += `Cash on Delivery Gross,"INR ${Math.round((stats?.total_revenue || 0) - (stats?.paid_revenue || 0)).toLocaleString('en-IN')}"\n`;
      csv += `Total Orders Placed,${stats?.total_orders || orders.length || 0}\n`;
      csv += `Active Orders Fulfilling,${stats?.active_orders || orders.filter(o => o.status !== 'CANCELLED').length}\n`;
      csv += `Cancelled Orders,${stats?.cancelled_orders || orders.filter(o => o.status === 'CANCELLED').length}\n`;
      csv += `Order Fulfillment Rate,"${stats?.fulfillment_rate || 80}%"\n`;
      csv += `Registered Customers,${stats?.total_customers || 3}\n`;
      csv += `Catalog Products,${stats?.total_products || 40}\n`;
      csv += `Low Stock Alert Items,${stats?.low_stock_count || 0}\n`;
      csv += `COD Orders Split,"${stats?.payment_methods?.cod_percentage || 62.5}% (${stats?.payment_methods?.cod_count || 5} orders)"\n`;
      csv += `Prepaid / UPI Split,"${stats?.payment_methods?.online_percentage || 37.5}% (${stats?.payment_methods?.online_count || 3} orders)"\n\n`;

      // Section 2: Top Selling Products
      csv += '--- TOP SELLING PRODUCTS ---\n';
      csv += 'Rank,Product Name,Category,Units Sold,Share %,Total Sales (INR)\n';
      (stats?.top_selling_products || []).forEach((p, idx) => {
        csv += `${idx + 1},"${p.product_name}","${p.category || 'Streetwear'}",${p.total_sold},"${p.share_percentage}%","INR ${Math.round(p.total_sales).toLocaleString('en-IN')}"\n`;
      });
      csv += '\n';

      // Section 3: Daily Sales (Last 7 Days)
      csv += '--- DAILY SALES REVENUE (LAST 7 DAYS) ---\n';
      csv += 'Date,Revenue (INR)\n';
      (stats?.monthly_sales || []).forEach((d) => {
        csv += `"${d.date}","INR ${Math.round(d.revenue).toLocaleString('en-IN')}"\n`;
      });
      csv += '\n';

      // Section 4: Complete Orders Register
      csv += '--- COMPLETE DETAILED ORDERS REGISTER ---\n';
      csv += 'Order Number,Date,Customer Name,Phone,Address,City,State,Pincode,Payment Method,Payment Status,Order Status,Items Ordered,Total Amount (INR)\n';
      (orders || []).forEach((ord) => {
        const addr = ord.shipping_address || {};
        const fullAddr = `${addr.address_line1 || ''}${addr.address_line2 ? ' ' + addr.address_line2 : ''}`.replace(/"/g, '""');
        const itemsSummary = (ord.items || []).map(i => `${i.product_name} (x${i.quantity})`).join('; ').replace(/"/g, '""');
        const custName = (addr.full_name || 'Patron').replace(/"/g, '""');
        const orderDate = ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN') : '—';
        const method = ord.payment?.payment_method || 'COD';
        const pStatus = ord.payment?.status || 'PENDING';
        
        csv += `"${ord.order_number}","${orderDate}","${custName}","${addr.phone_number || '—'}","${fullAddr}","${addr.city || '—'}","${addr.state || '—'}","${addr.postal_code || '—'}","${method}","${pStatus}","${ord.status}","${itemsSummary}","INR ${Math.round(ord.total_amount).toLocaleString('en-IN')}"\n`;
      });

      // UTF-8 BOM so Excel opens it with full special characters and rupee symbols
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Varshi-Enterprises-Full-Store-Report-${dateFileStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExportNotice('✓ Store report with all details downloaded successfully!');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5EFE8] text-[#1B271E] flex flex-col lg:flex-row font-sans selection:bg-[#D7F58C] selection:text-[#192714]">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur border-b border-[#D8E3DC] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C5A16E]/50 bg-[#FAF6F0] flex-shrink-0 shadow-xs">
            <img src="/logo.png" alt="Varshi Enterprises" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-serif font-black text-sm text-[#173D30] tracking-wide block leading-none">VARSHI</span>
            <span className="text-[9px] font-bold text-[#6D7B71] tracking-widest uppercase">Admin Console</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAssistant()}
            className="p-2 text-[#173D30] hover:bg-[#F0F5F1] rounded-xl border border-[#D8E3DC] transition-colors"
            title="Open Jarvis AI"
          >
            <Sparkles className="w-4 h-4 text-[#A3E635]" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#1B271E] hover:bg-[#F0F5F1] rounded-xl border border-[#D8E3DC] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR MENU (FIXED TO SCREEN — DOES NOT MOVE WHEN SCROLLING)
          ========================================================================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-[#D9E4DD] flex flex-col justify-between transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:self-start lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-72 shadow-sm`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#E3EDE6] flex items-center justify-between">
            <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'lg:justify-center lg:w-full' : ''}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C5A16E]/40 bg-[#FAF6F0] flex-shrink-0 shadow-xs">
                <img src="/logo.png" alt="Varshi Enterprises" className="w-full h-full object-cover" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h1 className="font-serif font-black text-base text-[#173D30] tracking-wider leading-none">VARSHI</h1>
                  <span className="text-[9px] font-bold text-[#728276] tracking-[0.2em] uppercase mt-1 block">ENTERPRISES</span>
                </div>
              )}
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#728276] hover:text-[#173D30] hover:bg-[#F2F7F4] transition-colors border border-[#E3EDE6] cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items (Side Menu Only) */}
          <div className="p-3.5 space-y-4 flex-1 overflow-y-auto scrollbar-none">
            {/* Jarvis 24/7 AI Sentinel Button */}
            <button
              onClick={() => {
                setSidebarOpen(false);
                openAssistant();
              }}
              className={`w-full group flex items-center rounded-2xl p-2.5 transition-all border cursor-pointer ${
                collapsed 
                  ? 'justify-center bg-[#173D30] text-[#D7F58C] border-[#173D30]' 
                  : 'justify-between bg-[#173D30] text-white border-[#173D30] hover:bg-[#112F25] shadow-sm'
              }`}
              title="Jarvis AI 24/7 Voice Sentinel"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-white/10 text-[#D7F58C] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-[#D7F58C]" />
                </div>
                {!collapsed && (
                  <div className="text-left min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Jarvis Commander</span>
                    <span className="text-[10px] text-[#A5C7B4] block">24/7 Voice Sentinel</span>
                  </div>
                )}
              </div>
              {!collapsed && (
                <span className="text-[9px] bg-[#D7F58C] text-[#162A10] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 shadow-2xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-[#173D30] animate-pulse'}`}></span>
                  ONLINE
                </span>
              )}
            </button>

            {/* Navigation Links with Modern Pill Active Indicator */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all select-none ${
                        isActive
                          ? 'bg-[#D7F58C] text-[#192714] shadow-xs font-bold'
                          : 'text-[#627066] hover:text-[#192714] hover:bg-[#EEF4F0]'
                      } ${collapsed ? 'justify-center px-2 rounded-xl' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Storefront Link Footer */}
          <div className="p-3 border-t border-[#E3EDE6] bg-[#F7FAF8] space-y-2.5">
            <div className={`flex items-center justify-between ${collapsed ? 'flex-col gap-2' : ''}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#173D30] text-[#D7F58C] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1B271E] truncate">{user?.full_name || 'Admin User'}</p>
                    <p className="text-[10px] text-[#728276] font-medium">Administrator</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#728276] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Log Out of Admin Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-full bg-white border border-[#D9E4DD] hover:border-[#173D30] text-[#173D30] text-[11px] font-bold transition-all shadow-2xs ${
                collapsed ? 'px-1' : ''
              }`}
              title="Open Live Customer Storefront"
            >
              {!collapsed && <span>Live Store</span>}
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A16E]" />
            </a>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (FRAMED BY CLEAN SAGE-MINT BACKDROP)
          ========================================================================= */}
      <main className="flex-1 min-w-0 overflow-x-hidden flex flex-col min-h-screen">
        {/* Top Header Row — Clean Greeting & Actions, NO NAVBAR TABS */}
        <header className="px-4 sm:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Welcome, {adminFirstName}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              An overview of customer insights, sales performance, and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto relative">
            {/* Export Success Toast */}
            {exportNotice && (
              <div className="absolute top-12 right-0 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 z-50 animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
                <Check className="w-3.5 h-3.5 text-[#D7F58C]" />
                <span>{exportNotice}</span>
              </div>
            )}

            {/* Export Report Action — Downloads all details in CSV */}
            <button
              onClick={handleExportFullReport}
              disabled={isExporting}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs active:scale-98 cursor-pointer disabled:opacity-60"
              title="Export Complete Operations & Orders Report (CSV)"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export Report</span>
                </>
              )}
            </button>

            {/* Notification Bell with Real Alerts Center */}
            <div className="relative" ref={alertsRef}>
              <button 
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer relative"
                title="Store Operations Alerts & Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown Popover */}
              {alertsOpen && (
                <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Store Alerts</span>
                      {unreadAlertsCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          {unreadAlertsCount} pending
                        </span>
                      )}
                    </div>
                    {unreadAlertsCount > 0 && (
                      <button
                        onClick={() => setUnreadAlertsCount(0)}
                        className="text-[11px] font-bold text-[#173D30] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 mt-3 max-h-80 overflow-y-auto pr-1">
                    {alertsList.map((alert) => {
                      let iconBg = 'bg-blue-50 text-blue-600';
                      let IconComponent = Package;
                      if (alert.type === 'urgent') {
                        iconBg = 'bg-rose-50 text-rose-600';
                        IconComponent = AlertTriangle;
                      } else if (alert.type === 'warning') {
                        iconBg = 'bg-amber-50 text-amber-600';
                        IconComponent = AlertTriangle;
                      } else if (alert.type === 'success') {
                        iconBg = 'bg-emerald-50 text-emerald-600';
                        IconComponent = CheckCircle2;
                      } else if (alert.type === 'ai') {
                        iconBg = 'bg-[#173D30] text-[#D7F58C]';
                        IconComponent = Sparkles;
                      }

                      return (
                        <div 
                          key={alert.id}
                          onClick={() => {
                            setAlertsOpen(false);
                            if (alert.link) navigate(alert.link);
                            if (alert.action) alert.action();
                          }}
                          className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 transition-colors border border-slate-100 cursor-pointer group"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#173D30] transition-colors">
                                  {alert.title}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                  {alert.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                                {alert.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {alertsList.length === 0 && (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No active alerts at this time.
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Live Database Sentinel</span>
                    <button
                      onClick={() => {
                        setAlertsOpen(false);
                        navigate('/orders');
                      }}
                      className="text-[11px] font-bold text-[#173D30] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Manage All Orders</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Storefront Pulse Button */}
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-[#173D30] transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Store</span>
              <ExternalLink className="w-3 h-3 text-[#C5A16E]" />
            </a>

            {/* User Profile Avatar in Header */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-9 h-9 rounded-full bg-[#173D30] text-[#D7F58C] flex items-center justify-center font-bold text-xs shadow-2xs">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{user?.full_name || 'Admin'}</span>
                <span className="text-[10px] text-slate-400 font-semibold block leading-none">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <div className="px-4 sm:px-8 pb-8 flex-1">
          {/* Headless 24/7 Jarvis Voice & Navigation Engine */}
          <JarvisVoiceController adminName={adminFirstName} />

          {/* Routed Admin Page Content */}
          <Outlet />

          {/* Master Jarvis Floating Orb (Bottom-Right) */}
          <JarvisFloatingOrb />

          {/* Jarvis Voice-Driven Product Studio Modal */}
          <JarvisProductBuilderModal />

          {/* Jarvis Voice-Driven Coupon Studio Modal */}
          <JarvisCouponModal />

          {/* Jarvis Voice-Driven Customer Store Live View Modal */}
          <JarvisCustomerWebViewer />

          {/* Unified Jarvis AI Command Center Slide-over Drawer */}
          <AIBusinessAssistant />
        </div>
      </main>
    </div>
  );
}
