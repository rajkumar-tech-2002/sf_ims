import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    Calendar,
    Package,
    Truck,
    Hash,
    IndianRupee,
    Percent,
    Tag
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const RawMaterialPurchaseEntry = () => {
    const { showToast, confirmToast } = useToast();
    const [purchases, setPurchases] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const [selectedProductInfo, setSelectedProductInfo] = useState({ code: '---', rate: '0', currentStock: 0 });

    const [formData, setFormData] = useState({
        purchase_date: new Date().toISOString().split('T')[0],
        product_code: '',
        product_name: '',
        vendor_name: '',
        bill_no: '',
        purchase_qty: '',
        purchase_rate: '',
        gst_percent: '0',
        normal_amount: '0',
        gst_amount: '0',
        total_amount: '0'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Recalculate amounts when qty, rate, or gst% changes
    useEffect(() => {
        const qty = parseFloat(formData.purchase_qty) || 0;
        const rate = parseFloat(formData.purchase_rate) || 0;
        const gstPercent = parseFloat(formData.gst_percent) || 0;

        const normalAmount = qty * rate;
        const gstAmount = normalAmount * (gstPercent / 100);
        const totalAmount = normalAmount + gstAmount;

        setFormData(prev => ({
            ...prev,
            normal_amount: normalAmount.toFixed(2),
            gst_amount: gstAmount.toFixed(2),
            total_amount: totalAmount.toFixed(2)
        }));
    }, [formData.purchase_qty, formData.purchase_rate, formData.gst_percent]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [purchaseRes, stockRes, vendorRes] = await Promise.all([
                api.get('/raw-material-purchases'),
                api.get('/raw-material-stocks'),
                api.get('/vendors')
            ]);
            setPurchases(purchaseRes.data);
            setStocks(stockRes.data);
            setVendors(vendorRes.data);
        } catch (error) {
            showToast('error', 'Failed to fetch initial data');
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
                    product_code: product.product_code,
                    gst_percent: product.gst || '0'
                }));
                setSelectedProductInfo({
                    code: product.product_code,
                    rate: product.price_rate,
                    currentStock: product.qty || 0
                });
            } else {
                setSelectedProductInfo({ code: '---', rate: '0', currentStock: 0 });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/raw-material-purchases/${currentId}`, formData);
                showToast('success', 'Purchase record updated successfully');
            } else {
                await api.post('/raw-material-purchases', formData);
                showToast('success', 'Purchase record added successfully');
            }
            resetForm();
            fetchInitialData();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = (id) => {
        confirmToast('Delete this purchase record permanently?', async () => {
            try {
                await api.delete(`/raw-material-purchases/${id}`);
                showToast('success', 'Purchase record deleted successfully');
                fetchInitialData();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            purchase_date: new Date().toISOString().split('T')[0],
            product_code: '',
            product_name: '',
            vendor_name: '',
            bill_no: '',
            purchase_qty: '',
            purchase_rate: '',
            gst_percent: '0',
            normal_amount: '0',
            gst_amount: '0',
            total_amount: '0'
        });
        setSelectedProductInfo({ code: '---', rate: '0', currentStock: 0 });
        setIsEditing(false);
        setCurrentId(null);
    };

    const filteredPurchases = purchases.filter(p =>
        (p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.product_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.bill_no || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="section-title text-2xl font-bold text-slate-800">Raw Material Purchase Entry</h1>
                        <p className="text-slate-500 text-base font-medium">Record and track raw material procurement from vendors.</p>
                    </div>
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                        ${showTable
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-white text-primary-600 border-primary-100 hover:border-primary-300 hover:bg-primary-50'}`}
                    >
                        {showTable ? <><ChevronUp size={20} /> Hide Registry</> : <><ChevronDown size={20} /> Show Registry</>}
                    </button>
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <ShoppingCart size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">New Purchase Entry</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Summary Display */}
                        <div className="flex flex-wrap items-center gap-10 bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
                            <div className="flex items-center gap-4 pr-10 border-r border-primary-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-primary-600">
                                    <Hash size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Code</span>
                                    <span className="text-xl font-black text-primary-700">{selectedProductInfo.code}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Old Stock</span>
                                    <span className="text-lg font-black text-slate-400">{selectedProductInfo.currentStock}</span>
                                </div>
                                <div className="text-slate-300 font-black">+</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Purchased</span>
                                    <span className="text-lg font-black text-primary-600">{formData.purchase_qty || 0}</span>
                                </div>
                                <div className="text-slate-300 font-black">=</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">New Total</span>
                                    <span className="text-xl font-black text-emerald-600">
                                        {Number(selectedProductInfo.currentStock) + Number(formData.purchase_qty || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 ml-auto pl-10 border-l border-primary-100">
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</span>
                                    <span className="text-2xl font-black text-emerald-700">₹{formData.total_amount}</span>
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                                    <IndianRupee size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar size={12} className="text-primary-500" /> Purchase Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    name="purchase_date"
                                    className="input-field"
                                    value={formData.purchase_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Package size={12} className="text-primary-500" /> Material Name
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="product_name"
                                        className="input-field appearance-none bg-white font-bold"
                                        value={formData.product_name}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Material</option>
                                        {stocks.map(stock => (
                                            <option key={stock.id} value={stock.product_name}>{stock.product_name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Truck size={12} className="text-primary-500" /> Vendor Name
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="vendor_name"
                                        className="input-field appearance-none bg-white font-bold"
                                        value={formData.vendor_name}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Vendor</option>
                                        {vendors.map(vendor => (
                                            <option key={vendor.id} value={vendor.vendor_name}>{vendor.vendor_name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} className="text-primary-500" /> Bill Number
                                </label>
                                <input
                                    type="text"
                                    name="bill_no"
                                    className="input-field font-bold"
                                    value={formData.bill_no}
                                    onChange={handleInputChange}
                                    placeholder="Enter Bill No"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} className="text-primary-500" /> Purchase Quantity
                                </label>
                                <input
                                    type="number"
                                    required
                                    name="purchase_qty"
                                    className="input-field font-bold"
                                    value={formData.purchase_qty}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <IndianRupee size={12} className="text-primary-500" /> Purchase Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        name="purchase_rate"
                                        className="input-field pl-8 font-bold"
                                        value={formData.purchase_rate}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Percent size={12} className="text-primary-500" /> GST
                                </label>
                                <input
                                    type="number"
                                    name="gst_percent"
                                    className="input-field font-bold text-primary-600 border-primary-100"
                                    value={formData.gst_percent}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <IndianRupee size={12} className="text-emerald-500" /> GST Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                                    <input
                                        type="text"
                                        readOnly
                                        className="input-field pl-8 bg-emerald-50/30 font-bold text-emerald-700"
                                        value={formData.gst_amount}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Normal Amount</span>
                                        <span className="text-xl font-bold text-slate-700">₹{formData.normal_amount}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] font-black text-primary-500 uppercase">Grand Total</span>
                                        <span className="text-xl font-black text-primary-700">₹{formData.total_amount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end">
                                <button type="submit" className="w-full btn btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                                    <Plus size={24} /> Submit Purchase
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
                                    render: (_, __, index) => (
                                        <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                                    )
                                },
                                {
                                    key: 'purchase_date',
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
                                    label: 'Material',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase">{value}</span>
                                            <span className="text-[10px] font-mono font-bold text-primary-500">{row.product_code}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'vendor_name',
                                    label: 'Vendor / Bill',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600">{value}</span>
                                            <span className="text-[10px] text-slate-400">Bill: {row.bill_no || 'N/A'}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'purchase_qty',
                                    label: 'Qty',
                                    className: 'text-center',
                                    render: (value) => <span className="font-bold text-slate-900">{value}</span>
                                },
                                {
                                    key: 'total_amount',
                                    label: 'Total Amount',
                                    className: 'text-right',
                                    render: (value) => <span className="font-black text-emerald-600">₹{parseFloat(value).toLocaleString()}</span>
                                }
                            ]}
                            data={filteredPurchases}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search material, vendor or bill..."
                            actions={(purchase) => (
                                <div className="flex items-center justify-end gap-2 text-right">
                                    <button
                                        onClick={() => handleDelete(purchase.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                            emptyMessage="No purchase entries found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RawMaterialPurchaseEntry;
