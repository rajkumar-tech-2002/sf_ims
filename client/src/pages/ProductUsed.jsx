import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Trash2,
    Calendar,
    FileText,
    Hash,
    ChevronDown,
    ChevronUp,
    History
} from 'lucide-react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';

const ProductUsed = () => {
    const { showToast, confirmToast } = useToast();
    const [usages, setUsages] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTable, setShowTable] = useState(false);

    const [selectedProductInfo, setSelectedProductInfo] = useState({ code: '---', currentStock: 0 });

    const [formData, setFormData] = useState({
        used_date: new Date().toISOString().split('T')[0],
        product_code: '',
        product_name: '',
        description: '',
        qty: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [usageRes, stockRes] = await Promise.all([
                api.get('/product-used'),
                api.get('/stocks')
            ]);
            setUsages(usageRes.data);
            setStocks(stockRes.data);
        } catch (error) {
            showToast('error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'product_name') {
            const product = stocks.find(s => s.product_name === value);
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    product_code: product.product_code
                }));
                setSelectedProductInfo({
                    code: product.product_code,
                    currentStock: product.qty || 0
                });
            } else {
                setSelectedProductInfo({ code: '---', currentStock: 0 });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(formData.qty) > selectedProductInfo.currentStock) {
            showToast('error', `Insufficient stock! Only ${selectedProductInfo.currentStock} units available.`);
            return;
        }

        try {
            await api.post('/product-used', formData);
            showToast('success', 'Product usage recorded successfully');
            resetForm();
            fetchInitialData();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = (id) => {
        confirmToast('Delete this usage record and revert stock?', async () => {
            try {
                await api.delete(`/product-used/${id}`);
                showToast('success', 'Usage record deleted and stock reverted');
                fetchInitialData();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            used_date: new Date().toISOString().split('T')[0],
            product_code: '',
            product_name: '',
            description: '',
            qty: ''
        });
        setSelectedProductInfo({ code: '---', currentStock: 0 });
    };

    const filteredUsages = usages.filter(u =>
        u.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="section-title">Product Consumption</h1>
                        <p className="text-slate-500 text-base mt-2 font-medium">Record and subtract products used for operations.</p>
                    </div>
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                        ${showTable
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-white text-rose-600 border-rose-100 hover:border-rose-300 hover:bg-rose-50'}`}
                    >
                        {showTable ? <><ChevronUp size={20} /> Hide Registry</> : <><History size={20} /> Usage History</>}
                    </button>
                </div>

                {/* Consumption Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
                                <Package size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">New Usage Entry</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Stock Summary */}
                        <div className="flex flex-wrap items-center gap-10 bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                            <div className="flex items-center gap-4 pr-10 border-r border-rose-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-rose-600">
                                    <Hash size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Code</span>
                                    <span className="text-xl font-black text-rose-700">{selectedProductInfo.code}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Stock</span>
                                    <span className={`text-xl font-black ${selectedProductInfo.currentStock <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                                        {selectedProductInfo.currentStock}
                                    </span>
                                </div>
                                <div className="text-slate-300 font-black">-</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">To be Used</span>
                                    <span className="text-xl font-black text-rose-600">{formData.qty || 0}</span>
                                </div>
                                <div className="text-slate-300 font-black">=</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</span>
                                    <span className="text-lg font-black text-slate-400">
                                        {Math.max(0, Number(selectedProductInfo.currentStock) - Number(formData.qty || 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar size={12} /> Usage Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    name="used_date"
                                    className="input-field"
                                    value={formData.used_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Product Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Package size={12} /> Product Name
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="product_name"
                                        className="input-field appearance-none bg-white"
                                        value={formData.product_name}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Product</option>
                                        {stocks.map(stock => (
                                            <option key={stock.id} value={stock.product_name}>{stock.product_name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Qty */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} /> Quantity to Use</label>
                                <input
                                    type="number"
                                    required
                                    name="qty"
                                    className="input-field"
                                    value={formData.qty}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 lg:col-span-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FileText size={12} /> Usage Description / Operations Note
                                </label>
                                <textarea
                                    name="description"
                                    className="input-field min-h-[100px] py-4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Used for maintenance work in Department A..."
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={!formData.qty || Number(formData.qty) > selectedProductInfo.currentStock}
                                className="w-full md:w-1/3 btn btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={24} /> Confirm Consumption
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Table */}
                {showTable && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <DataTable
                            columns={[
                                {
                                    key: 'serial',
                                    label: 'S.No',
                                    render: (_, __, index) => (
                                        <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                                    )
                                },
                                {
                                    key: 'used_date',
                                    label: 'Date',
                                    render: (value) => (
                                        <span className="text-xs font-bold text-slate-700">
                                            {new Date(value).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    )
                                },
                                {
                                    key: 'product_name',
                                    label: 'Product',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase">{value}</span>
                                            <span className="text-[10px] font-mono font-bold text-rose-500">{row.product_code}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'description',
                                    label: 'Description',
                                    render: (value) => <span className="text-xs text-slate-500 italic max-w-xs truncate block">{value || '---'}</span>
                                },
                                {
                                    key: 'qty',
                                    label: 'Used Qty',
                                    className: 'text-center',
                                    render: (value) => <span className="font-black text-rose-600">-{value}</span>
                                }
                            ]}
                            data={filteredUsages}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search usage history..."
                            actions={(usage) => (
                                <div className="flex items-center justify-end gap-2 text-right">
                                    <button
                                        onClick={() => handleDelete(usage.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                            emptyMessage="No usage history found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductUsed;
