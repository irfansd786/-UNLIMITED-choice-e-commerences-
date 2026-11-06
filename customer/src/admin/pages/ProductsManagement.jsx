import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Boxes, 
  X, 
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminProductService, adminCategoryService } from '../services/api';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    sku: '',
    stock: 10,
    low_stock_threshold: 5,
    status: 'PUBLISHED',
    brand: 'Varshi Enterprises',
    material: '',
    is_featured: false,
    is_new_arrival: true,
    is_deal_of_the_day: false,
    images: [{ image_url: '', alt_text: '', is_primary: true }],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        adminProductService.getAll(),
        adminCategoryService.getAll(),
      ]);
      setProducts(prodsData.items || []);
      const activeCats = catsData.filter(c => c.is_active !== false);
      setCategories(activeCats);
    } catch (err) {
      console.error("Failed to load products management data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      category_id: categories[0]?.id || '',
      price: '',
      compare_at_price: '',
      cost_price: '',
      sku: `VE-${Date.now().toString().slice(-5)}`,
      stock: 10,
      low_stock_threshold: 5,
      status: 'PUBLISHED',
      brand: 'Varshi Enterprises',
      material: '',
      is_featured: false,
      is_new_arrival: true,
      is_deal_of_the_day: false,
      images: [{ image_url: '', alt_text: '', is_primary: true }],
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      short_description: prod.short_description || '',
      description: prod.description || '',
      category_id: prod.category_id,
      price: prod.price,
      compare_at_price: prod.compare_at_price || '',
      cost_price: prod.cost_price || '',
      sku: prod.sku,
      stock: prod.stock,
      low_stock_threshold: prod.low_stock_threshold,
      status: prod.status,
      brand: prod.brand,
      material: prod.material || '',
      is_featured: prod.is_featured,
      is_new_arrival: prod.is_new_arrival,
      is_deal_of_the_day: prod.is_deal_of_the_day,
      images: prod.images?.length > 0 ? prod.images.map(img => ({ image_url: img.image_url, alt_text: img.alt_text, is_primary: img.is_primary })) : [{ image_url: '', alt_text: '', is_primary: true }],
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id, 10),
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock: parseInt(formData.stock, 10),
        low_stock_threshold: parseInt(formData.low_stock_threshold, 10),
        images: formData.images.filter(img => img.image_url.trim() !== ''),
      };

      if (editingProduct) {
        await adminProductService.update(editingProduct.id, payload);
      } else {
        await adminProductService.create(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await adminProductService.delete(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleQuickStockUpdate = async (id, newStock) => {
    const stockVal = prompt("Enter updated physical inventory count:", newStock);
    if (stockVal === null || isNaN(stockVal)) return;
    try {
      await adminProductService.updateStock(id, parseInt(stockVal, 10));
      loadData();
    } catch (err) {
      alert(err.message || 'Error updating stock');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCat || String(p.category_id) === String(selectedCat);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Product Catalog</h1>
          <p className="text-xs text-[#727A74] mt-1">Manage product listings, pricing, physical stock, and storefront visibility</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C5A16E]" />
          <span>Create New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7EBE7] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="Search by product name, SKU, or material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#252A27] placeholder:text-[#9DA5A0] focus:outline-none focus:border-[#173D30] transition-colors"
          />
          <Search className="w-4 h-4 text-[#727A74] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl px-3 py-2 text-xs text-[#252A27] focus:outline-none focus:border-[#173D30] transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-xs text-[#727A74] whitespace-nowrap">
            {filtered.length} products
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E7EBE7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F6] text-[#727A74] uppercase tracking-wider text-[10px] border-b border-[#E7EBE7]">
                <th className="p-3.5 font-semibold">Product</th>
                <th className="p-3.5 font-semibold">SKU</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Price (INR)</th>
                <th className="p-3.5 font-semibold">Physical Stock</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBE7]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#727A74]">
                    Loading product catalog...
                  </td>
                </tr>
              ) : filtered.map((p) => {
                const imgUrl = p.image_url || p.images?.[0]?.image_url || '/logo.png';
                const isLowStock = p.stock <= p.low_stock_threshold;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img 
                          src={imgUrl} 
                          alt="" 
                          className="w-12 aspect-[3/4] rounded-lg object-cover bg-[#F7F8F6] border border-[#E7EBE7]" 
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#252A27] truncate max-w-xs">{p.name}</h4>
                          <span className="text-[10px] text-[#727A74]">{p.brand || 'Varshi Enterprises'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#727A74]">{p.sku}</td>
                    <td className="p-3.5 text-[#252A27]">{p.category?.name || "Unassigned"}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#173D30]">₹{Math.round(p.price).toLocaleString('en-IN')}</div>
                      {p.compare_at_price && (
                        <div className="text-[10px] text-[#9DA5A0] line-through">₹{Math.round(p.compare_at_price)}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleQuickStockUpdate(p.id, p.stock)}
                        className={`px-2.5 py-1 rounded-full font-semibold text-xs flex items-center gap-1.5 transition-all ${
                          isLowStock
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF] hover:bg-[#D5E6DF]'
                        }`}
                        title="Click to quickly adjust physical inventory"
                      >
                        <Boxes className="w-3 h-3" />
                        <span>{p.stock} units</span>
                      </button>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        p.status === 'PUBLISHED' 
                          ? 'bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]' 
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-[#727A74] hover:text-[#173D30] hover:bg-[#F7F8F6] border border-[#E7EBE7] transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-[#727A74] hover:text-red-600 hover:bg-red-50 border border-[#E7EBE7] transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#727A74]">
                    No products matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 border border-[#E7EBE7] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBE7]">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#173D30]">
                  {editingProduct ? "Edit Product Listing" : "Create Master Product Listing"}
                </h2>
                <p className="text-xs text-[#727A74]">Enter SKU, pricing, images, and live inventory levels</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-[#727A74] hover:text-[#252A27] hover:bg-[#F7F8F6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight 450GSM Oversized Pullover Hoodie"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, name, slug: editingProduct ? formData.slug : slug });
                    }}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. heavyweight-450gsm-oversized-pullover-hoodie"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] font-mono focus:outline-none focus:border-[#173D30]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] font-mono focus:outline-none focus:border-[#173D30]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live on Store)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Price in INR (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="4899"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#173D30] font-bold focus:outline-none focus:border-[#173D30]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Compare MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="7999"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2800"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Physical Stock Count *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252A27] mb-1">Material / Fabric</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Combed Heavy French Terry Cotton (450 GSM)"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Primary Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.images[0]?.image_url || ''}
                  onChange={(e) => {
                    const newImgs = [...formData.images];
                    newImgs[0] = { image_url: e.target.value, alt_text: formData.name, is_primary: true };
                    setFormData({ ...formData, images: newImgs });
                  }}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="Brief summary displayed on storefront cards"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Full Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed craftsmanship background, weave notes, and styling advice"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#252A27]">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-[#173D30] focus:ring-[#173D30]"
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#252A27]">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="rounded text-[#173D30] focus:ring-[#173D30]"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#E7EBE7]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E7EBE7] text-[#727A74] font-semibold hover:bg-[#F7F8F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  {submitting ? "Saving..." : (editingProduct ? "Save Changes" : "Create Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
