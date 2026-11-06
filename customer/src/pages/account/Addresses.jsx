import React, { useState, useEffect } from 'react';
import { addressService } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building, Edit2 } from 'lucide-react';

export default function Addresses() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'HOME',
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoading(true);
    try {
      const data = await addressService.getAll();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressService.update(editingId, formData);
        addToast('Address updated successfully', 'success');
      } else {
        await addressService.create(formData);
        addToast('Address saved successfully!', 'success');
      }
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        landmark: '',
        city: '',
        state: '',
        postal_code: '',
        address_type: 'HOME',
        is_default: false,
      });
      loadAddresses();
    } catch (err) {
      addToast(err.message || 'Failed to save address', 'error');
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      address_type: addr.address_type || 'HOME',
      is_default: addr.is_default || false,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    try {
      await addressService.delete(id);
      addToast('Address removed', 'info');
      loadAddresses();
    } catch (err) {
      addToast(err.message || 'Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      addToast('Default address updated', 'success');
      loadAddresses();
    } catch (err) {
      addToast(err.message || 'Failed to set default', 'error');
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-4">
      {/* Header (Pic 6) */}
      <div className="flex items-center justify-between pb-3 border-b border-cream-200">
        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-forest-950">My Addresses</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">{addresses.length} saved addresses</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              full_name: user?.full_name || '',
              phone: user?.phone || '',
              address_line1: '',
              address_line2: '',
              landmark: '',
              city: '',
              state: '',
              postal_code: '',
              address_type: 'HOME',
              is_default: false,
            });
            setShowAddForm(!showAddForm);
          }}
          className="px-3 py-1.5 rounded-lg bg-forest-900 text-gold-300 text-xs font-semibold hover:bg-forest-950 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {showAddForm ? "Cancel" : "Add New Address"}
        </button>
      </div>

      {/* Add / Edit Address Form */}
      {showAddForm && (
        <form onSubmit={handleSaveAddress} className="p-4 rounded-xl bg-cream-50 border border-cream-300 space-y-3 text-xs">
          <h3 className="font-bold text-forest-950">{editingId ? "Edit Address" : "Add New Address"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Full Name *"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-white border border-cream-300 rounded-lg p-2 text-xs"
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-white border border-cream-300 rounded-lg p-2 text-xs"
            />
          </div>
          <input
            type="text"
            placeholder="Flat, House no., Building, Street *"
            required
            value={formData.address_line1}
            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
            className="w-full bg-white border border-cream-300 rounded-lg p-2 text-xs"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="City *"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-white border border-cream-300 rounded-lg p-2 text-xs"
            />
            <input
              type="text"
              placeholder="State *"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="bg-white border border-cream-300 rounded-lg p-2 text-xs"
            />
            <input
              type="text"
              placeholder="PIN Code *"
              required
              maxLength={6}
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value.replace(/\D/g, '') })}
              className="bg-white border border-cream-300 rounded-lg p-2 text-xs"
            />
          </div>
          <div className="flex gap-2 items-center pt-1">
            <select
              value={formData.address_type}
              onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}
              className="bg-white border border-cream-300 rounded-lg p-2 text-xs"
            >
              <option value="HOME">Home</option>
              <option value="WORK">Work</option>
              <option value="OTHER">Other</option>
            </select>
            <label className="flex items-center gap-1.5 text-charcoal-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="text-forest-900 rounded"
              />
              Set as Default
            </label>
            <div className="flex-1 text-right">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-forest-900 text-gold-300 font-bold"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Address Cards List (Pic 6) */}
      {loading ? (
        <div className="p-4 text-xs text-charcoal-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <p className="text-xs text-charcoal-500 py-6 text-center">No addresses saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-xl border text-xs space-y-2 flex flex-col justify-between ${
                addr.is_default ? 'border-forest-900/60 bg-cream-50/60' : 'border-cream-300 bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest-950 text-sm">{addr.full_name}</span>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-cream-200 text-charcoal-700 font-semibold text-[10px] uppercase">
                      {addr.address_type}
                    </span>
                    {addr.is_default && (
                      <span className="px-1.5 py-0.5 rounded bg-forest-900 text-gold-300 font-semibold text-[10px]">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-charcoal-700">
                  {addr.address_line1} {addr.address_line2 && `, ${addr.address_line2}`}
                </p>
                <p className="text-charcoal-700">
                  {addr.city}, {addr.state} - {addr.postal_code}
                </p>
                <p className="font-medium text-forest-900">Phone: {addr.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-cream-200 text-[11px]">
                {!addr.is_default ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-forest-800 hover:text-gold-700 font-semibold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span></span>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-forest-900 hover:text-gold-700 font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Address Button at bottom (Pic 6) */}
      {!showAddForm && (
        <div className="pt-2">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                full_name: user?.full_name || '',
                phone: user?.phone || '',
                address_line1: '',
                address_line2: '',
                landmark: '',
                city: '',
                state: '',
                postal_code: '',
                address_type: 'HOME',
                is_default: false,
              });
              setShowAddForm(true);
            }}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-cream-300 hover:border-forest-900 text-forest-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-cream-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>
      )}
    </div>
  );
}
