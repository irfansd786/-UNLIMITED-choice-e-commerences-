import React, { useState, useEffect } from 'react';
import { adminInventoryService, adminProductService } from '../services/api';
import { Boxes, AlertTriangle, CheckCircle2, Clock, Search, Edit3 } from 'lucide-react';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInventory();
  }, [lowStockFilter]);

  async function loadInventory() {
    setLoading(true);
    try {
      const data = await adminInventoryService.getAll(lowStockFilter);
      setInventory(data || []);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStock = async (item) => {
    const val = prompt(`Update physical stock for "${item.name}" (Current: ${item.stock}):`, item.stock);
    if (val === null || isNaN(val)) return;

    try {
      await adminProductService.updateStock(item.id, parseInt(val, 10));
      loadInventory();
    } catch (err) {
      alert(err.message || 'Error updating stock');
    }
  };

  const filtered = inventory.filter(it =>
    !searchQuery || 
    it.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    it.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowCount = inventory.filter(i => i.is_low_stock).length;
  const outCount = inventory.filter(i => i.stock <= 0).length;
  const healthyCount = inventory.filter(i => !i.is_low_stock && i.stock > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Inventory & Live Stock</h1>
          <p className="text-xs text-[#727A74] mt-1">Real-time physical inventory levels synchronized with the customer storefront</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
              lowStockFilter
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-white border border-[#E7EBE7] text-[#252A27] hover:border-[#173D30]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lowStockFilter ? "Showing Low Stock Only" : "Filter Low Stock"}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E7EBE7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#727A74] uppercase tracking-wider">Healthy Stock</span>
            <div className="text-2xl font-bold font-serif text-[#173D30] mt-1">{healthyCount} SKUs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E7EBE7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#727A74] uppercase tracking-wider">Low Stock Warning</span>
            <div className="text-2xl font-bold font-serif text-amber-700 mt-1">{lowCount} SKUs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E7EBE7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#727A74] uppercase tracking-wider">Out of Stock</span>
            <div className="text-2xl font-bold font-serif text-red-600 mt-1">{outCount} SKUs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7EBE7] shadow-xs max-w-md relative">
        <input
          type="text"
          placeholder="Search by SKU or product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#252A27] placeholder:text-[#9DA5A0] focus:outline-none focus:border-[#173D30]"
        />
        <Search className="w-4 h-4 text-[#727A74] absolute left-7 top-1/2 -translate-y-1/2" />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E7EBE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] text-[#727A74] uppercase tracking-wider text-[10px] border-b border-[#E7EBE7]">
                <th className="p-3.5 font-semibold">Product Item</th>
                <th className="p-3.5 font-semibold">SKU</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Current Stock</th>
                <th className="p-3.5 font-semibold">Threshold Alert</th>
                <th className="p-3.5 font-semibold">Audit Status</th>
                <th className="p-3.5 font-semibold text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBE7]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#727A74]">
                    Loading real-time inventory records...
                  </td>
                </tr>
              ) : filtered.map((it) => {
                const isOutOfStock = it.stock <= 0;
                const isLow = it.is_low_stock;

                return (
                  <tr key={it.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                    <td className="p-3.5 font-semibold text-[#252A27] max-w-xs truncate">{it.name}</td>
                    <td className="p-3.5 font-mono text-[#727A74]">{it.sku}</td>
                    <td className="p-3.5 text-[#727A74]">{it.category || "Apparel"}</td>
                    <td className="p-3.5 font-bold text-[#173D30]">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isLow
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]'
                      }`}>
                        {it.stock} Units
                      </span>
                    </td>
                    <td className="p-3.5 text-[#727A74]">Alert at ≤ {it.low_stock_threshold}</td>
                    <td className="p-3.5">
                      {isOutOfStock ? (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleUpdateStock(it)}
                        className="px-3 py-1.5 rounded-lg bg-[#F7F8F6] hover:bg-[#FAF6F0] border border-[#E7EBE7] text-[#173D30] font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A16E]" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#727A74]">
                    No inventory entries matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
