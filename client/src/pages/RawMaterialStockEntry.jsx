import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    Hash,
    ChevronDown,
    ChevronUp,
    Tag,
    IndianRupee,
    Layers,
    Percent,
    AlertTriangle,
    Printer
} from 'lucide-react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';
import RawMaterialStockReportPrint from '../components/RawMaterialStockReportPrint';

const RawMaterialStockEntry = () => {
    const { showToast, confirmToast } = useToast();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [formData, setFormData] = useState({
        hsn_code: '',
        product_code: '',
        product_name: '',
        detail: '',
        qty: 0,
        price_rate: 0,
        scale: 'PCS',
        gst: 0,
        reorder_level: 10
    });

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await api.get('/raw-material-stocks');
            setStocks(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch raw material stock records');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/raw-material-stocks/${currentId}`, formData);
                showToast('success', 'Raw material stock updated successfully');
            } else {
                await api.post('/raw-material-stocks', formData);
                showToast('success', 'Raw material stock added successfully');
            }
            resetForm();
            fetchStocks();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (stock) => {
        setFormData({
            hsn_code: stock.hsn_code || '',
            product_code: stock.product_code || '',
            product_name: stock.product_name || '',
            detail: stock.detail || '',
            qty: stock.qty || 0,
            price_rate: stock.price_rate || 0,
            scale: stock.scale || 'PCS',
            gst: stock.gst || 0,
            reorder_level: stock.reorder_level || 0
        });
        setCurrentId(stock.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this raw material stock record permanently?', async () => {
            try {
                await api.delete(`/raw-material-stocks/${id}`);
                showToast('success', 'Raw material stock deleted successfully');
                fetchStocks();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            hsn_code: '',
            product_code: '',
            product_name: '',
            detail: '',
            qty: 0,
            price_rate: 0,
            scale: 'PCS',
            gst: 0,
            reorder_level: 10
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const filteredStocks = stocks.filter(stock =>
        (stock.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.product_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.hsn_code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="section-title text-2xl font-bold text-slate-800">Raw Material Registry</h1>
                        <p className="text-slate-500 text-base font-medium">Manage and monitor your raw material inventory levels.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-100 hover:border-primary-300 hover:bg-primary-50'}`}
                        >
                            {showTable ? <><ChevronUp size={20} /> Hide Registry</> : <><ChevronDown size={20} /> Show Registry</>}
                        </button>
                        {showTable && (
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <Printer size={20} /> Print Report
                            </button>
                        )}
                    </div>
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Raw Material' : 'Add New Raw Material'}</h2>
                        </div>
                        {isEditing && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} className="text-primary-500" /> HSN Code</label>
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
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} className="text-primary-500" /> Product Code</label>
                                <input
                                    type="text"
                                    name="product_code"
                                    className="input-field"
                                    value={formData.product_code}
                                    onChange={handleInputChange}
                                    placeholder="RM-001"
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Tag size={12} className="text-primary-500" /> Product Name</label>
                                <input
                                    type="text"
                                    required
                                    name="product_name"
                                    className="input-field"
                                    value={formData.product_name}
                                    onChange={handleInputChange}
                                    placeholder='Raw Silk'
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-4">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Package size={12} className="text-primary-500" /> Detail / Description</label>
                                <textarea
                                    name="detail"
                                    rows="2"
                                    className="input-field py-3 min-h-[80px]"
                                    value={formData.detail}
                                    onChange={handleInputChange}
                                    placeholder="Additional raw material details..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} className="text-primary-500" /> Opening Quantity</label>
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
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <IndianRupee size={12} className="text-primary-500" /> Price Rate</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        name="price_rate"
                                        className="input-field pl-8"
                                        value={formData.price_rate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Layers size={12} className="text-primary-500" /> Scale / Unit</label>
                                <div className="relative">
                                    <select
                                        name="scale"
                                        className="input-field appearance-none bg-white font-bold"
                                        value={formData.scale}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Unit</option>
                                        <option value="Meter">Meter</option>
                                        <option value="Pcs">Pcs</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Roll">Roll</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Percent size={12} className="text-primary-500" /> GST</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="gst"
                                    className="input-field font-bold"
                                    value={formData.gst}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <AlertTriangle size={12} className="text-primary-500" /> ReOrder Level</label>
                                <input
                                    type="number"
                                    name="reorder_level"
                                    className="input-field font-bold"
                                    value={formData.reorder_level}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="lg:col-span-2 flex items-end">
                                <button type="submit" className="w-full btn btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                                    {isEditing ? <><Save size={20} /> Update Record</> : <><Plus size={20} /> Submit Entry</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                {showTable && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <DataTable
                            columns={[
                                {
                                    key: 'serial',
                                    label: 'S.No',
                                    render: (value, row, index) => (
                                        <span className="text-xs font-bold text-slate-600">
                                            {index + 1}
                                        </span>
                                    )
                                },
                                {
                                    key: 'product_name',
                                    label: 'Material Info',
                                    render: (value, stock) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase">{value}</span>
                                            <span className="text-xs text-slate-400 truncate max-w-[200px]">{stock.detail || 'No description'}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'product_code',
                                    label: 'HSN / SKU',
                                    render: (_, stock) => (
                                        <div className="flex flex-col gap-1">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] w-fit font-mono font-bold">HSN: {stock.hsn_code || 'N/A'}</span>
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] w-fit font-mono font-bold">SKU: {stock.product_code || 'N/A'}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'qty',
                                    label: 'Current Qty',
                                    className: 'text-center',
                                    render: (value, stock) => (
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-bold ${value <= stock.reorder_level ? 'text-rose-600' : 'text-slate-900'}`}>{value}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{stock.scale}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'price_rate',
                                    label: 'Price Rate',
                                    className: 'text-right',
                                    render: (value) => <span className="font-bold text-slate-900">₹{parseFloat(value).toLocaleString()}</span>
                                },
                                {
                                    key: 'gst',
                                    label: 'GST %',
                                    className: 'text-center',
                                    render: (value) => <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">{value}%</span>
                                }
                            ]}
                            data={filteredStocks}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search material by name or code..."
                            actions={(stock) => (
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
                            )}
                            emptyMessage="No raw material records found"
                        />
                    </div>
                )}
            </div>

            {/* Print Component */}
            <RawMaterialStockReportPrint data={stocks} />
        </div>
    );
};

export default RawMaterialStockEntry;
