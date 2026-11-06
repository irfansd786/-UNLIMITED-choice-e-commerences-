import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Check, 
  ExternalLink,
  ChevronDown,
  Boxes,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { adminDashboardService } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import JarvisLiveSpeechColumn from '../components/jarvis/JarvisLiveSpeechColumn';

// Radial tick gauge matching the reference Rexora screenshot
function SuccessRateGauge({ rate = 100 }) {
  const totalTicks = 22;
  const safeRate = Math.min(Math.max(rate, 0), 100);
  const activeTicks = Math.round((safeRate / 100) * totalTicks);

  return (
    <div className="relative flex flex-col items-center justify-center pt-2">
      <svg viewBox="0 0 200 115" className="w-52 h-28 overflow-visible">
        {Array.from({ length: totalTicks }).map((_, i) => {
          const angle = -180 + (i / (totalTicks - 1)) * 180;
          const rad = (angle * Math.PI) / 180;
          const rOuter = 85;
          const rInner = 68;
          const cx = 100;
          const cy = 100;
          const x1 = cx + rInner * Math.cos(rad);
          const y1 = cy + rInner * Math.sin(rad);
          const x2 = cx + rOuter * Math.cos(rad);
          const y2 = cy + rOuter * Math.sin(rad);

          const isActive = i < activeTicks;
          // Gradient from soft lime green to vivid emerald
          const activeColor = i < totalTicks * 0.4 ? '#D7F58C' : (i < totalTicks * 0.75 ? '#86EFAC' : '#4ADE80');
          const strokeColor = isActive ? activeColor : '#EDF2EE';

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
          );
        })}
      </svg>
      {/* Center percentage label */}
      <div className="absolute bottom-1 text-center select-none">
        <span className="text-3xl font-black text-slate-900 tracking-tight block leading-none">
          {safeRate}%
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
          Fulfillment Rate
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRows, setSelectedRows] = useState({});

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminDashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Filter recent orders
  const filteredOrders = useMemo(() => {
    if (!stats?.recent_orders) return [];
    return stats.recent_orders.filter((ord) => {
      const q = orderSearchQuery.toLowerCase();
      const matchSearch = 
        !q ||
        ord.order_number?.toLowerCase().includes(q) ||
        ord.shipping_address?.full_name?.toLowerCase().includes(q) ||
        ord.items?.some(it => it.product_name?.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        const hasCat = ord.items?.some(it => {
          const name = (it.product_name || '').toLowerCase();
          if (cat === 'shoes') return name.includes('tatum') || name.includes('trainer') || name.includes('court') || name.includes('shoe');
          if (cat === 'hoodies') return name.includes('hoodie');
          if (cat === 't-shirts') return name.includes('tee') || name.includes('shirt');
          return true;
        });
        if (!hasCat) return false;
      }

      return true;
    });
  }, [stats?.recent_orders, orderSearchQuery, selectedCategory]);

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === filteredOrders.length) {
      setSelectedRows({});
    } else {
      const all = {};
      filteredOrders.forEach((o) => { all[o.id] = true; });
      setSelectedRows(all);
    }
  };

  const toggleRow = (id) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Peak revenue in 7-day period to highlight peak bar
  const maxDayRevenue = useMemo(() => {
    if (!stats?.monthly_sales?.length) return 1;
    return Math.max(...stats.monthly_sales.map(s => s.revenue || 0), 1);
  }, [stats?.monthly_sales]);

  // Real 7-day bar chart data from PostgreSQL database
  const barChartData = useMemo(() => {
    if (!stats?.monthly_sales) return [];
    return stats.monthly_sales.map((item) => ({
      name: item.date,
      revenue: item.revenue || 0,
      isHighlighted: (item.revenue || 0) > 0 && item.revenue === maxDayRevenue
    }));
  }, [stats?.monthly_sales, maxDayRevenue]);

  // Real payment split pills calculation (total 28 segments)
  const codPercentage = stats?.payment_methods?.cod_percentage ?? 60;
  const codPillsCount = Math.round((codPercentage / 100) * 28);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 h-64 bg-white rounded-3xl border border-slate-100"></div>
          <div className="lg:col-span-5 h-64 bg-white rounded-3xl border border-slate-100"></div>
          <div className="lg:col-span-3 h-64 bg-white rounded-3xl border border-slate-100"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-96 bg-white rounded-3xl border border-slate-100"></div>
          <div className="lg:col-span-4 h-96 bg-white rounded-3xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  const totalGrossRevenue = stats?.total_revenue ?? 0;
  const paidRevenue = stats?.paid_revenue ?? 0;
  const totalOrders = stats?.total_orders ?? 0;
  const activeOrders = stats?.active_orders ?? 0;
  const cancelledOrders = stats?.cancelled_orders ?? 0;
  const totalCustomers = stats?.total_customers ?? 0;
  const lowStockCount = stats?.low_stock_count ?? 0;
  const fulfillmentRate = stats?.fulfillment_rate ?? 100;
  const topProducts = stats?.top_selling_products || [];

  return (
    <div className="space-y-6">

      {/* Jarvis AI Live Speech & Command Monitor Column with Immediate STOP Button */}
      <JarvisLiveSpeechColumn />

      {/* =========================================================================
          ROW 1: 4 STAT CARDS (LEFT) + TOTAL PROFIT (CENTER) + SUCCESS RATE (RIGHT)
          Matching Rexora design with 100% Real Database Binding
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* BLOCK 1: 4 KPI CARDS (2x2 Grid) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Total Orders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {totalOrders.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span>▲</span> {activeOrders} Active Orders
              </span>
              <Link to="/admin/orders" className="text-[11px] font-bold text-slate-400 hover:text-slate-800 flex items-center gap-0.5">
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 2. Total Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight truncate">
                ₹{Math.round(totalGrossRevenue).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span>▲</span> ₹{Math.round(paidRevenue).toLocaleString('en-IN')} Prepaid
              </span>
              <Link to="/admin/orders" className="text-[11px] font-bold text-slate-400 hover:text-slate-800 flex items-center gap-0.5">
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 3. Active Customers */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Patrons</span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {totalCustomers.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span>▲</span> Verified Patrons
              </span>
              <Link to="/admin/customers" className="text-[11px] font-bold text-slate-400 hover:text-slate-800 flex items-center gap-0.5">
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 4. Low Stock Alerts */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Stock Attention</span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {lowStockCount}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                lowStockCount === 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {lowStockCount === 0 ? '✓ Optimal Stock Level' : `⚠ ${lowStockCount} items below alert`}
              </span>
              <Link to="/admin/inventory" className="text-[11px] font-bold text-slate-400 hover:text-slate-800 flex items-center gap-0.5">
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* BLOCK 2: TOTAL PROFIT OVERVIEW (Real Bar Chart Card) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-900">Total Sales & Revenue</h3>
              <div className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{Math.round(totalGrossRevenue).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-[#D7F58C] px-2 py-0.5 rounded-full">
                  Live Store Data
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  Daily Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Peak Sales Day
                </span>
              </div>
            </div>
          </div>

          {/* Real Bar Chart */}
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 15, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => v >= 1000 ? `₹${Math.round(v/1000)}k` : `₹${v}`} 
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-mono shadow-lg">
                          <p className="font-bold text-slate-300">{payload[0].payload.name} 2026</p>
                          <p className="text-emerald-400 font-bold mt-0.5">
                            ₹{Number(payload[0].value).toLocaleString('en-IN')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isHighlighted ? '#F97316' : '#CBD5E1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOCK 3: SUCCESS RATE (Fulfillment Gauge Card) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900">Success Rate</h3>
            <div className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-bold">{fulfillmentRate}% Fulfillment</span>
          </div>

          {/* Gauge Center */}
          <SuccessRateGauge rate={fulfillmentRate} />

          {/* Bottom Dual Metric Pills (Real Order Metrics) */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Orders</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-black text-slate-900">{activeOrders}</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Fulfilling
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cancelled</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-black text-slate-900">{cancelledOrders}</span>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  Voided
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 2: RECENT ORDERS TABLE (LEFT 2/3) + SALES OVERVIEW (RIGHT 1/3)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* RECENT ORDERS TABLE (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            {/* Header with Search and Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
                <p className="text-xs text-slate-400 font-medium">Keep track of real customer checkouts here</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Input Pill */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-36 sm:w-44 pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#173D30] transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Category</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Shoes">Shoes</option>
                </select>

                {/* Reset Filter Button */}
                {orderSearchQuery && (
                  <button 
                    onClick={() => setOrderSearchQuery('')}
                    className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="py-3 px-2 w-8">
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={filteredOrders.length > 0 && Object.keys(selectedRows).length === filteredOrders.length}
                        className="rounded border-slate-300 text-[#173D30] focus:ring-0 cursor-pointer" 
                      />
                    </th>
                    <th className="py-3 px-2 font-semibold">Order ID</th>
                    <th className="py-3 px-2 font-semibold">Product Name</th>
                    <th className="py-3 px-2 font-semibold">Customer</th>
                    <th className="py-3 px-2 font-semibold">Date</th>
                    <th className="py-3 px-2 font-semibold">Payment</th>
                    <th className="py-3 px-2 font-semibold">Amount</th>
                    <th className="py-3 px-2 font-semibold">Status</th>
                    <th className="py-3 px-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.slice(0, 6).map((ord) => {
                    const firstItem = ord.items?.[0];
                    const otherCount = (ord.items?.length || 1) - 1;
                    const isSelected = !!selectedRows[ord.id];

                    // Status Pill styling based on real status
                    let statusBg = 'bg-blue-50 text-blue-700 border-blue-100';
                    let statusLabel = ord.status;
                    if (ord.status === 'DELIVERED') {
                      statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      statusLabel = 'Delivered';
                    } else if (ord.status === 'CONFIRMED') {
                      statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      statusLabel = 'Confirmed';
                    } else if (ord.status === 'OUT_FOR_DELIVERY') {
                      statusBg = 'bg-cyan-50 text-cyan-700 border-cyan-100';
                      statusLabel = 'Out for Delivery';
                    } else if (ord.status === 'PROCESSING') {
                      statusBg = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                      statusLabel = 'Processing';
                    } else if (ord.status === 'PLACED') {
                      statusBg = 'bg-amber-50 text-amber-700 border-amber-100';
                      statusLabel = 'Placed';
                    } else if (ord.status === 'CANCELLED') {
                      statusBg = 'bg-rose-50 text-rose-700 border-rose-100';
                      statusLabel = 'Cancelled';
                    }

                    const paymentMethodName = ord.payment?.payment_method || 'COD';

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-2">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleRow(ord.id)}
                            className="rounded border-slate-300 text-[#173D30] focus:ring-0 cursor-pointer" 
                          />
                        </td>
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-900">
                          #{ord.order_number?.slice(-6) || ord.id}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {firstItem?.product_image ? (
                                <img src={firstItem.product_image} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <ShoppingBag className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                                {firstItem?.product_name || 'Streetwear Apparel'}
                              </span>
                              {otherCount > 0 && (
                                <span className="text-[10px] text-slate-400 block">
                                  +{otherCount} other {otherCount === 1 ? 'item' : 'items'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 font-medium text-slate-800">
                          {ord.shipping_address?.full_name || 'Patron'}
                        </td>
                        <td className="py-3.5 px-2 text-slate-500 font-medium whitespace-nowrap">
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 font-semibold uppercase text-[11px]">
                          {paymentMethodName}
                        </td>
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-900">
                          ₹{Math.round(ord.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBg}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <Link 
                            to={`/orders?search=${ord.order_number}`}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 inline-block"
                            title="Inspect Order Details"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        No orders match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
            <span>Showing {Math.min(filteredOrders.length, 6)} of {filteredOrders.length} authentic orders</span>
            <Link to="/admin/orders" className="font-bold text-[#173D30] hover:underline flex items-center gap-1">
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* SALES OVERVIEW & REAL TOP PRODUCTS (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-900">Payment Breakdown</h3>
              <div className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </div>

            {/* Real Channel / Payment Mode percentages */}
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#173D30]"></span>
                  Cash on Delivery (COD)
                </div>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {stats?.payment_methods?.cod_percentage ?? 60}% ({stats?.payment_methods?.cod_count ?? 0})
                </span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] justify-end">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Online / Prepaid
                </div>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {stats?.payment_methods?.online_percentage ?? 40}% ({stats?.payment_methods?.online_count ?? 0})
                </span>
              </div>
            </div>

            {/* Real Segmented Progress Bar (28 rounded pills) */}
            <div className="flex items-center gap-1 w-full py-3">
              {Array.from({ length: 28 }).map((_, i) => {
                const isCOD = i < codPillsCount;
                const bg = isCOD ? '#173D30' : '#06B6D4';

                return (
                  <div 
                    key={i} 
                    className="flex-1 h-6 rounded-full transition-all"
                    style={{ backgroundColor: bg }}
                    title={isCOD ? 'Cash on Delivery Segment' : 'Prepaid Online Segment'}
                  />
                );
              })}
            </div>

            {/* Top Products Table Header */}
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
              <span className="col-span-7">Top Product</span>
              <span className="col-span-2 text-center">Share</span>
              <span className="col-span-3 text-right">Revenue</span>
            </div>

            {/* Real Top Products List from Database */}
            <div className="space-y-3 mt-2.5">
              {topProducts.map((p, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center text-xs py-1">
                  <div className="col-span-7 flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                      {p.product_image ? (
                        <img src={p.product_image} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate" title={p.product_name}>
                        {p.product_name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.total_sold} units sold
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-600">
                    {p.share_percentage ?? Math.round((p.total_sold / 15) * 100)}%
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                    ₹{Math.round(p.total_sales).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="py-4 text-center text-slate-400 text-xs">
                  No products sold yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Verified from live orders</span>
            <Link to="/admin/products" className="font-bold text-[#173D30] hover:underline flex items-center gap-0.5">
              <span>Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
