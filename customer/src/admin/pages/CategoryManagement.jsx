import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers, Search, Check, X } from 'lucide-react';
import { adminCategoryService } from '../services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await adminCategoryService.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_featured: true,
      display_order: categories.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      is_featured: cat.is_featured,
      display_order: cat.display_order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await adminCategoryService.update(editingCat.id, formData);
      } else {
        await adminCategoryService.create(formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await adminCategoryService.delete(id);
      loadCategories();
    } catch (err) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D30]">Categories & Taxonomies</h1>
          <p className="text-xs text-[#727A74] mt-1">Manage database-driven store categories displayed on the customer storefront</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C5A16E]" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-white border border-[#E7EBE7] rounded-2xl animate-pulse"></div>
          ))
        ) : categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[#E7EBE7] p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#C5A16E]/60 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase bg-[#F7F8F6] text-[#173D30] border border-[#E7EBE7] px-2.5 py-0.5 rounded-full font-semibold">
                    Order: {c.display_order}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    c.is_active !== false ? 'bg-[#EBF5F0] text-[#173D30] border border-[#D5E6DF]' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {c.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {c.is_featured && (
                  <span className="text-[10px] font-semibold text-[#173D30] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#C5A16E]/40">
                    Featured
                  </span>
                )}
              </div>

              {c.image_url && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#F7F8F6] border border-[#E7EBE7]">
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <h3 className="font-serif text-lg font-bold text-[#173D30]">{c.name}</h3>
                <p className="text-[11px] font-mono text-[#727A74] mt-0.5">slug: /{c.slug}</p>
                <p className="text-xs text-[#727A74] mt-2 line-clamp-2 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7EBE7] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#727A74]">{c.product_count || 0} Products</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-[#727A74] hover:text-[#173D30] hover:bg-[#F7F8F6] border border-[#E7EBE7] transition-colors"
                  title="Edit Category"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg text-[#727A74] hover:text-red-600 hover:bg-red-50 border border-[#E7EBE7] transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && categories.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-[#E7EBE7] p-8 text-center text-xs text-[#727A74]">
            No categories defined yet. Click "Add New Category" to create one.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 border border-[#E7EBE7] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EBE7]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#173D30]">
                  {editingCat ? "Edit Category" : "Create New Category"}
                </h3>
                <p className="text-xs text-[#727A74]">Configure taxonomic details</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-[#727A74] hover:text-[#252A27] hover:bg-[#F7F8F6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hoodies"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData({ ...formData, name, slug: editingCat ? formData.slug : slug });
                  }}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] font-mono focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252A27] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Artisanal summary for category banner on customer storefront"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#F7F8F6] border border-[#E7EBE7] rounded-xl p-2.5 text-[#252A27] focus:outline-none focus:border-[#173D30]"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2 border-t border-[#E7EBE7]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E7EBE7] text-[#727A74] font-semibold hover:bg-[#F7F8F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#173D30] hover:bg-[#112F25] text-white font-semibold transition-colors shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
