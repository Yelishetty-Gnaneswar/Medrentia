import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import { handleImageError, getExactMedicalImage } from '../../utils/imageFallback';

const ProviderEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const handleOpenEdit = (item) => {
    setEditItem({
      ...item,
      imageUrl: item.images?.[0] || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setEditSaving(true);
    try {
      const res = await api.put(`/equipment/${editItem._id}`, {
        name: editItem.name,
        dailyPrice: editItem.dailyPrice,
        weeklyPrice: editItem.weeklyPrice,
        monthlyPrice: editItem.monthlyPrice,
        quantity: editItem.quantity,
        availableQuantity: editItem.availableQuantity,
        securityDeposit: editItem.securityDeposit,
        images: editItem.images?.length > 0 ? editItem.images : [editItem.imageUrl],
      });
      if (res.data.success) {
        setEquipmentList((prev) =>
          prev.map((eq) => (eq._id === editItem._id ? res.data.data : eq))
        );
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update equipment.');
    } finally {
      setEditSaving(false);
    }
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provider/equipment');
      if (res.data.success) {
        setEquipmentList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medical equipment listing?')) return;
    try {
      const res = await api.delete(`/equipment/${id}`);
      if (res.data.success) {
        setEquipmentList((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete equipment');
    }
  };

  const handleToggleMaintenance = async (item) => {
    const newStatus = item.availability === 'Under Maintenance' ? 'Available' : 'Under Maintenance';
    try {
      const res = await api.put(`/equipment/${item._id}`, {
        availability: newStatus,
        hygieneStatus: newStatus === 'Available' ? 'Certified Sanitized & Sealed' : 'Under Sterilization',
      });
      if (res.data.success) {
        setEquipmentList((prev) =>
          prev.map((eq) => (eq._id === item._id ? res.data.data : eq))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy-950">My Medical Equipment Inventory</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage equipment availability, sterilization statuses, and pricing plans in ₹.
            </p>
          </div>

          <Link
            to="/provider/equipment/add"
            className="px-6 py-3 bg-medgreen-600 hover:bg-medgreen-700 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Equipment</span>
          </Link>
        </div>

        {equipmentList.length > 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Device Details</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Daily / Weekly / Monthly (₹)</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Hygiene</th>
                    <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipmentList.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.images?.[0] || getExactMedicalImage(item.name, item.categoryName)}
                            alt={item.name}
                            onError={(e) => handleImageError(e, item.name, item.categoryName)}
                            className="w-12 h-12 rounded-xl object-cover border shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <span className="text-[10px] text-slate-400">Condition: {item.condition}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{item.categoryName}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">₹{item.dailyPrice}/day</p>
                        <span className="text-[10px] text-slate-500">₹{item.weeklyPrice}/wk • ₹{item.monthlyPrice}/mo</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{item.availableQuantity}</span>
                        <span className="text-slate-400"> / {item.quantity} total</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.availability === 'Available'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.availability}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{item.hygieneStatus?.split(' ')[0] || 'Sanitized'}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Equipment Details & Image"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleMaintenance(item)}
                          title="Toggle Maintenance"
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold"
                        >
                          {item.availability === 'Under Maintenance' ? 'Mark Available' : 'Maintenance'}
                        </button>
                        <Link
                          to={`/equipment/${item._id}`}
                          title="View Live Listing"
                          className="p-1.5 inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
                          title="Delete Listing"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No equipment listed yet"
            description="Start listing your certified wheelchairs, hospital beds, oxygen concentrators and patient devices to receive rental orders."
            actionText="Add First Equipment"
            actionLink="/provider/equipment/add"
          />
        )}

        {/* EDIT EQUIPMENT MODAL */}
        {isEditModalOpen && editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-100 my-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy-950">Edit Medical Equipment</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Daily (₹)</label>
                    <input
                      type="number"
                      required
                      value={editItem.dailyPrice}
                      onChange={(e) => setEditItem({ ...editItem, dailyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Weekly (₹)</label>
                    <input
                      type="number"
                      required
                      value={editItem.weeklyPrice}
                      onChange={(e) => setEditItem({ ...editItem, weeklyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Monthly (₹)</label>
                    <input
                      type="number"
                      required
                      value={editItem.monthlyPrice}
                      onChange={(e) => setEditItem({ ...editItem, monthlyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Stock</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editItem.quantity}
                      onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value), availableQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      required
                      value={editItem.securityDeposit}
                      onChange={(e) => setEditItem({ ...editItem, securityDeposit: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Image upload / URL for Edit */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block">Equipment Image</label>
                  <div className="flex items-center space-x-3">
                    <img
                      src={editItem.images?.[0] || editItem.imageUrl}
                      alt="Current"
                      className="w-14 h-14 rounded-xl object-cover border shrink-0 bg-white"
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={editItem.images?.[0] || editItem.imageUrl || ''}
                        onChange={(e) => setEditItem({ ...editItem, images: [e.target.value] })}
                        placeholder="Image URL or choose file below..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                      />
                      <label className="inline-block text-[10px] text-medblue-600 font-bold hover:underline cursor-pointer">
                        <span>Upload replacement image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setEditItem((prev) => ({ ...prev, images: [reader.result] }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {editSaving ? 'Saving...' : 'Save & Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderEquipment;
