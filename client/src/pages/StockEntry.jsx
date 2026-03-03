import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Filter
} from 'lucide-react';
import api from '../utils/api';

const StockEntry = () => {
    const [stocks, setStocks] = useState([]);
    const [formData, setFormData] = useState({
        hsn_code: '',
        product_code: '',
        product_name: '',
        detail: '',
        qty: 0,
        sale_price: 0,
        scale: '',
        gst: 12.00,
        discount_percent: 0.00,
        reorder_level: 0
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await api.get('/stocks');
            setStocks(response.data);
        } catch (err) {
            showMsg('error', 'Failed to fetch stocks');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'product_name' || name === 'hsn_code' || name === 'product_code' || name === 'detail' || name === 'scale'
                ? value
                : parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/stocks/${editingId}`, formData);
                showMsg('success', 'Stock updated successfully');
            } else {
                await api.post('/stocks', formData);
                showMsg('success', 'Stock added successfully');
            }
            resetForm();
            fetchStocks();
        } catch (err) {
            showMsg('error', editingId ? 'Failed to update stock' : 'Failed to add stock');
        }
    };

    const handleEdit = (stock) => {
        setFormData({
            hsn_code: stock.hsn_code,
            product_code: stock.product_code,
            product_name: stock.product_name,
            detail: stock.detail,
            qty: stock.qty,
            sale_price: stock.sale_price,
            scale: stock.scale,
            gst: stock.gst,
            discount_percent: stock.discount_percent,
            reorder_level: stock.reorder_level
        });
        setEditingId(stock.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this stock?')) return;
        try {
            await api.delete(`/stocks/${id}`);
            showMsg('success', 'Stock deleted successfully');
            fetchStocks();
        } catch (err) {
            showMsg('error', 'Failed to delete stock');
        }
    };

    const resetForm = () => {
        setFormData({
            hsn_code: '',
            product_code: '',
            product_name: '',
            detail: '',
            qty: 0,
            sale_price: 0,
            scale: '',
            gst: 12.00,
            discount_percent: 0.00,
            reorder_level: 0
        });
        setEditingId(null);
    };

    const filteredStocks = stocks.filter(stock =>
        stock.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.hsn_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stock Entry</h1>
                        <p className="text-slate-500 mt-1">Manage your inventory and product masters</p>
                    </div>
                    {message.text && (
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span className="text-sm font-semibold">{message.text}</span>
                        </div>
                    )}
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Stock Record' : 'Add New Stock'}</h2>
                        </div>
                        {editingId && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">HSN Code</label>
                                <input
                                    type="text"
                                    name="hsn_code"
                                    className="input-field"
                                    value={formData.hsn_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter HSN"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Product Code</label>
                                <input
                                    type="text"
                                    name="product_code"
                                    className="input-field"
                                    value={formData.product_code}
                                    onChange={handleInputChange}
                                    placeholder="SKU-001"
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    name="product_name"
                                    className="input-field"
                                    value={formData.product_name}
                                    onChange={handleInputChange}
                                    placeholder={'5" JACQUARD'}
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Detail / Description</label>
                                <textarea
                                    name="detail"
                                    rows="2"
                                    className="input-field py-3 min-h-[80px]"
                                    value={formData.detail}
                                    onChange={handleInputChange}
                                    placeholder="Additional product details..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    name="qty"
                                    className="input-field"
                                    value={formData.qty}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Sale Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        name="sale_price"
                                        className="input-field pl-8"
                                        value={formData.sale_price}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Scale / Unit</label>
                                <select
                                    name="scale"
                                    className="input-field appearance-none"
                                    value={formData.scale}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Unit</option>
                                    <option value="Meter">Meter</option>
                                    <option value="Pcs">Pcs</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Roll">Roll</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">GST %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="gst"
                                    className="input-field"
                                    value={formData.gst}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Discount %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="discount_percent"
                                    className="input-field"
                                    value={formData.discount_percent}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ReOrder Level</label>
                                <input
                                    type="number"
                                    name="reorder_level"
                                    className="input-field"
                                    value={formData.reorder_level}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="lg:col-span-2 flex items-end">
                                <button type="submit" className="w-full btn btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                                    {editingId ? <><Save size={20} /> Update Record</> : <><Plus size={20} /> Submit Entry</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-800">Stock Details</h2>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                {filteredStocks.length} Records
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="bg-slate-50 border-none rounded-xl pl-12 pr-4 py-2.5 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">Product Info</th>
                                    <th className="px-6 py-5">HSN / SKU</th>
                                    <th className="px-6 py-5 text-center">Qty / Scale</th>
                                    <th className="px-6 py-5 text-right">Sale Price</th>
                                    <th className="px-6 py-5 text-center text-primary-600">GST / Disc</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-medium">Loading stocks...</td>
                                    </tr>
                                ) : filteredStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-medium whitespace-pre-wrap">No stock records found</td>
                                    </tr>
                                ) : filteredStocks.map((stock) => (
                                    <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{stock.product_name}</span>
                                                <span className="text-xs text-slate-400 truncate max-w-[200px]">{stock.detail || 'No description'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-slate-500">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] w-fit">HSN: {stock.hsn_code || 'N/A'}</span>
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] w-fit">SKU: {stock.product_code || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-sm font-bold ${stock.qty <= stock.reorder_level ? 'text-rose-600' : 'text-slate-900'}`}>{stock.qty}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{stock.scale}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-slate-900">
                                            ₹{parseFloat(stock.sale_price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">GST: {stock.gst}%</span>
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold">Disc: {stock.discount_percent}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(stock)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(stock.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockEntry;
