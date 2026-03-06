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
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Filter,
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
import StockReportPrint from '../components/StockReportPrint';

const StockEntry = () => {
    const { showToast, confirmToast } = useToast();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [scaleUnits, setScaleUnits] = useState([]);
    const [isAddingUnit, setIsAddingUnit] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');
    const [formData, setFormData] = useState({
        product_name: '',
        product_code: '',
        hsn_code: '',
        qty: '',
        scale: 'PCS',
        purchase_price: '',
        sale_price: '',
        gst: '0',
        discount_percent: '0',
        reorder_level: '10',
        detail: ''
    });

    useEffect(() => {
        fetchStocks();
        fetchScaleUnits();
    }, []);

    const fetchScaleUnits = async () => {
        try {
            const response = await api.get('/scale-units');
            setScaleUnits(response.data);
        } catch (error) {
            console.error('Error fetching scale units:', error);
        }
    };

    const fetchStocks = async () => {
        try {
            const response = await api.get('/stocks');
            setStocks(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch stock records');
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
                await api.put(`/stocks/${currentId}`, formData);
                showToast('success', 'Stock updated successfully');
            } else {
                await api.post('/stocks', formData);
                showToast('success', 'Stock added successfully');
            }
            resetForm();
            fetchStocks();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (stock) => {
        setFormData({
            product_name: stock.product_name,
            product_code: stock.product_code,
            hsn_code: stock.hsn_code,
            qty: stock.qty,
            scale: stock.scale,
            purchase_price: stock.purchase_price,
            sale_price: stock.sale_price,
            gst: stock.gst,
            discount_percent: stock.discount_percent,
            reorder_level: stock.reorder_level,
            detail: stock.detail
        });
        setCurrentId(stock.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this stock record permanently?', async () => {
            try {
                await api.delete(`/stocks/${id}`);
                showToast('success', 'Stock deleted successfully');
                fetchStocks();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const handlePrint = () => {
        if (filteredStocks.length === 0) {
            showToast('warning', 'No stock records to print');
            return;
        }
        window.print();
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
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleAddScaleUnit = async () => {
        if (!newUnitName.trim()) {
            showToast('warning', 'Please enter a unit name');
            return;
        }

        try {
            const response = await api.post('/scale-units', { unit_name: newUnitName.trim() });
            showToast('success', 'New scale unit added');
            setNewUnitName('');
            setIsAddingUnit(false);
            fetchScaleUnits();
            setFormData(prev => ({ ...prev, scale: newUnitName.trim() }));
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to add unit');
        }
    };

    const filteredStocks = stocks.filter(stock =>
        stock.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.hsn_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Stock Registry</h1>
                        <p className="text-slate-500 text-base font-medium">Manage and monitor your warehouse inventory levels with enterprise precision.</p>
                    </div>
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                        ${showTable
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                    >
                        {showTable ? <><ChevronUp size={18} /> Hide Registry</> : <><ChevronDown size={18} /> Show Detail</>}
                    </button>
                    {showTable && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 hover:shadow-md"
                        >
                            <Printer size={18} /> Print Report
                        </button>
                    )}
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Stock Record' : 'Add New Stock'}</h2>
                        </div>
                        {isEditing && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Hash size={14} className="text-primary-500" /> HSN Code
                                </label>
                                <input
                                    type="text"
                                    name="hsn_code"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.hsn_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter HSN"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Hash size={14} className="text-primary-500" /> Product Code
                                </label>
                                <input
                                    type="text"
                                    name="product_code"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.product_code}
                                    onChange={handleInputChange}
                                    placeholder="SKU-001"
                                />
                            </div>
                            <div className="space-y-3 lg:col-span-2">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Tag size={14} className="text-primary-500" /> Brand / Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="product_name"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.product_name}
                                    onChange={handleInputChange}
                                    placeholder={'e.g. 5" JACQUARD Premium'}
                                />
                            </div>
                            <div className="space-y-3 lg:col-span-4">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Package size={14} className="text-primary-500" /> Technical Description
                                </label>
                                <textarea
                                    name="detail"
                                    rows="2"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all min-h-[100px]"
                                    value={formData.detail}
                                    onChange={handleInputChange}
                                    placeholder="Specify material, batch info or additional details..."
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Hash size={14} className="text-primary-500" /> Current Stock
                                </label>
                                <input
                                    type="number"
                                    required
                                    name="qty"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.qty}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <IndianRupee size={14} className="text-primary-500" /> Unit Sale Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                                    <input
                                        type="number"
                                        required
                                        name="sale_price"
                                        className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        value={formData.sale_price}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Layers size={14} className="text-primary-500" /> Measurement Unit
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingUnit(!isAddingUnit)}
                                        className="text-primary-600 hover:text-primary-700 p-0.5 rounded-md hover:bg-primary-50 transition-colors"
                                        title="Add New Unit"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                                {isAddingUnit ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input-field py-2 text-xs"
                                            placeholder="Unit Name"
                                            value={newUnitName}
                                            onChange={(e) => setNewUnitName(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddScaleUnit}
                                            className="px-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-sm"
                                        >
                                            <Save size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingUnit(false)}
                                            className="px-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            name="scale"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-black text-slate-700 uppercase appearance-none cursor-pointer transition-all"
                                            value={formData.scale}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Unit</option>
                                            {scaleUnits.map(unit => (
                                                <option key={unit.id} value={unit.unit_name}>{unit.unit_name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Percent size={14} className="text-primary-500" /> GST Rate
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="gst"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.gst}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Percent size={14} className="text-primary-500" /> Max Discount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="discount_percent"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.discount_percent}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-rose-500" /> Alert Threshold
                                </label>
                                <input
                                    type="number"
                                    name="reorder_level"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    value={formData.reorder_level}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="lg:col-span-2 flex items-end">
                                <button type="submit" className="w-full btn btn-primary py-4 text-base flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                                    {isEditing ? <><Save size={20} strokeWidth={2.5} /> Update Stock Record</> : <><Plus size={20} strokeWidth={2.5} /> Confirm & Add Stock</>}
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
                                    label: 'Product Info',
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
                                    label: 'Qty / Scale',
                                    className: 'text-center',
                                    render: (value, stock) => (
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-bold ${value <= stock.reorder_level ? 'text-rose-600' : 'text-slate-900'}`}>{value}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{stock.scale}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'sale_price',
                                    label: 'Sale Price',
                                    className: 'text-right',
                                    render: (value) => <span className="font-bold text-slate-900">₹{parseFloat(value).toLocaleString()}</span>
                                },
                                {
                                    key: 'gst',
                                    label: 'GST / Disc',
                                    className: 'text-center',
                                    render: (_, stock) => (
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">GST: {stock.gst}%</span>
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold">Disc: {stock.discount_percent}%</span>
                                        </div>
                                    )
                                }
                            ]}
                            data={filteredStocks}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search by name or code..."
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
                            emptyMessage="No stock records found"
                        />
                    </div>
                )}
            </div>

            {/* System Generated Print Matrix */}
            <StockReportPrint data={filteredStocks} />
        </div>
    );
};

export default StockEntry;
