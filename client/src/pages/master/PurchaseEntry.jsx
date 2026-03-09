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
import { usePermissions } from '../../hooks/usePermissions';

const PurchaseEntry = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit } = usePermissions();
    const moduleId = 'purchase-entry';
    const [purchases, setPurchases] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);

    // For displaying dynamic info
    const [selectedProductInfo, setSelectedProductInfo] = useState({ code: '---', salePrice: '0', currentStock: 0 });

    const [formData, setFormData] = useState({
        purchase_date: new Date().toISOString().split('T')[0],
        product_code: '',
        product_name: '',
        vendor_name: '',
        qty: '',
        purchase_rate: '',
        sale_rate: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [purchaseRes, stockRes, vendorRes] = await Promise.all([
                api.get('/purchases'),
                api.get('/stocks'),
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
                    sale_rate: product.sale_price
                }));
                setSelectedProductInfo({
                    code: product.product_code,
                    salePrice: product.sale_price,
                    currentStock: product.qty || 0
                });
            } else {
                setSelectedProductInfo({ code: '---', salePrice: '0' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/purchases/${currentId}`, formData);
                showToast('success', 'Purchase record updated successfully');
            } else {
                await api.post('/purchases', formData);
                showToast('success', 'Purchase record added successfully');
            }
            resetForm();
            fetchInitialData();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (purchase) => {
        setFormData({
            purchase_date: purchase.purchase_date.split('T')[0],
            product_code: purchase.product_code,
            product_name: purchase.product_name,
            vendor_name: purchase.vendor_name,
            qty: purchase.qty,
            purchase_rate: purchase.purchase_rate,
            sale_rate: purchase.sale_rate
        });

        // Update product info display
        const product = stocks.find(s => s.product_name === purchase.product_name);
        if (product) {
            setSelectedProductInfo({
                code: product.product_code,
                salePrice: product.sale_price
            });
        }

        setCurrentId(purchase.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this purchase record permanently?', async () => {
            try {
                await api.delete(`/purchases/${id}`);
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
            qty: '',
            purchase_rate: '',
            sale_rate: ''
        });
        setSelectedProductInfo({ code: '---', salePrice: '0' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const filteredPurchases = purchases.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Purchase Entry</h1>
                        <p className="text-slate-500 text-base font-medium">Record and track inventory procurement from vendors with enterprise-grade precision.</p>
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
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <ShoppingCart size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Purchase Record' : 'New Purchase Entry'}</h2>
                        </div>
                        {isEditing && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Summary Display (Matches user's second image requirement) */}
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
                                    <span className="text-lg font-black text-primary-600">{formData.qty || 0}</span>
                                </div>
                                <div className="text-slate-300 font-black">=</div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">New Total</span>
                                    <span className="text-xl font-black text-emerald-600">
                                        {Number(selectedProductInfo.currentStock) + Number(formData.qty || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-auto pl-10 border-l border-primary-100">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                                    <IndianRupee size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock Sale Price</span>
                                    <span className="text-xl font-black text-emerald-700">₹{selectedProductInfo.salePrice}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Date */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Calendar size={14} className="text-primary-500" /> Procurement Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    name="purchase_date"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                    value={formData.purchase_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Product Dropdown */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Package size={14} className="text-primary-500" /> Stock Product
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="product_name"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-black text-slate-700 uppercase appearance-none cursor-pointer transition-all"
                                        value={formData.product_name}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Product</option>
                                        {stocks.map(stock => (
                                            <option key={stock.id} value={stock.product_name}>{stock.product_name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Dropdown */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Truck size={12} className="text-primary-500" /> Vendor Name
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="vendor_name"
                                        className="input-field appearance-none bg-white"
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

                            {/* Qty */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Hash size={14} className="text-primary-500" /> Procurement Qty
                                </label>
                                <input
                                    type="number"
                                    required
                                    name="qty"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                    value={formData.qty}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>

                            {/* Purchase Rate */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <IndianRupee size={12} className="text-primary-500" /> Purchase Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        name="purchase_rate"
                                        className="input-field pl-8"
                                        value={formData.purchase_rate}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Sale Rate (Auto populated but editable) */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <IndianRupee size={12} /> Final Sale Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        name="sale_rate"
                                        className="input-field pl-8 border-emerald-100 focus:ring-emerald-500/10"
                                        value={formData.sale_rate}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={!canEdit(moduleId)}
                                className={`w-full md:w-1/3 btn btn-primary py-4 text-base flex items-center justify-center gap-3 shadow-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${!canEdit(moduleId) ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'shadow-primary-500/25'}`}
                            >
                                {isEditing ? <><Save size={24} strokeWidth={2.5} /> Update Purchase Record</> : <><Plus size={24} strokeWidth={2.5} /> Confirm Purchase Entry</>}
                            </button>
                        </div>
                        {!canEdit(moduleId) && (
                            <div className="lg:col-span-4 text-center">
                                <p className="text-xs font-black text-rose-500 uppercase tracking-widest bg-rose-50 py-2 rounded-xl border border-rose-100 mt-2">
                                    Restricted: View Only Mode
                                </p>
                            </div>
                        )}
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
                                    label: 'Product',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase">{value}</span>
                                            <span className="text-[10px] font-mono font-bold text-primary-500">{row.product_code}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'vendor_name',
                                    label: 'Vendor',
                                    render: (value) => <span className="text-xs font-bold text-slate-600">{value}</span>
                                },
                                {
                                    key: 'qty',
                                    label: 'Quantity',
                                    className: 'text-center',
                                    render: (value) => <span className="font-bold text-slate-900">{value}</span>
                                },
                                {
                                    key: 'purchase_rate',
                                    label: 'Rate (P/S)',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">P: ₹{value}</span>
                                            <span className="text-[10px] font-bold text-emerald-600">S: ₹{row.sale_rate}</span>
                                        </div>
                                    )
                                }
                            ]}
                            data={filteredPurchases}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search products or vendors..."
                            actions={(purchase) => (
                                <div className="flex items-center justify-end gap-2 text-right">
                                    <button
                                        onClick={() => handleEdit(purchase)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title={canEdit(moduleId) ? "Edit Record" : "View Details"}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {canEdit(moduleId) && (
                                        <button
                                            onClick={() => handleDelete(purchase.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
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

export default PurchaseEntry;
