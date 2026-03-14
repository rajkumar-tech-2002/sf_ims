import React, { useState, useEffect } from 'react';
import {
    Plus,
    Save,
    Search,
    Calendar,
    Briefcase,
    FileText,
    Hash,
    IndianRupee,
    ChevronDown,
    ChevronUp,
    X,
    Edit2,
    Trash2,
    Layers,
    Package,
    Printer
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import AssetReportPrint from '../../components/reports/AssetReportPrint';

const DropdownWithAdd = ({ label, field, options, icon: Icon, formData, setFormData, addingModes, setAddingModes }) => {
    const isAdding = addingModes[field];
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
                <label className="input-label mb-2 flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-primary-500" />} {label}
                </label>
                <button
                    type="button"
                    onClick={() => setAddingModes(prev => ({ ...prev, [field]: !isAdding }))}
                    className="text-primary-600 hover:text-primary-700 p-0.5 rounded-md hover:bg-primary-50 transition-colors"
                    title={isAdding ? "Cancel" : "Add New"}
                >
                    {isAdding ? <X size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                </button>
            </div>
            <div className="relative">
                {isAdding ? (
                    <input
                        type="text"
                        className="w-full px-5 py-3.5 bg-white border border-primary-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold shadow-sm transition-all"
                        placeholder={`Enter new ${label}`}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        autoFocus
                    />
                ) : (
                    <div className="relative">
                        <select
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-black text-slate-700 uppercase appearance-none cursor-pointer transition-all"
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        >
                            <option value="">Select {label}</option>
                            {options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Assets = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit } = usePermissions();
    const moduleId = 'assets';
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [assetNames, setAssetNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [addingModes, setAddingModes] = useState({ asset_name: false });

    const [formData, setFormData] = useState({
        entry_date: new Date().toISOString().split('T')[0],
        asset_name: '',
        description: '',
        qty: 0,
        rate: 0,
        amount: 0
    });

    useEffect(() => {
        fetchAssets();
        fetchAssetNames();
    }, []);

    // Auto-calculate amount
    useEffect(() => {
        const qty = parseFloat(formData.qty) || 0;
        const rate = parseFloat(formData.rate) || 0;
        setFormData(prev => ({ ...prev, amount: (qty * rate).toFixed(2) }));
    }, [formData.qty, formData.rate]);

    const fetchAssets = async () => {
        try {
            const response = await api.get('/assets');
            setAssets(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch assets');
        }
    };

    const fetchAssetNames = async () => {
        try {
            const response = await api.get('/assets/distinct-names');
            setAssetNames(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch asset names');
        }
    };

    const handleSave = async () => {
        if (!formData.asset_name) {
            showToast('warning', 'Please select or enter an asset name');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                await api.put(`/assets/${currentId}`, formData);
                showToast('success', 'Asset updated successfully');
            } else {
                await api.post('/assets', formData);
                showToast('success', 'Asset saved successfully');
            }
            resetForm();
            fetchAssets();
            fetchAssetNames();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to save asset');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (asset) => {
        setFormData({
            entry_date: asset.entry_date.split('T')[0],
            asset_name: asset.asset_name,
            description: asset.description || '',
            qty: asset.qty,
            rate: asset.rate,
            amount: asset.amount
        });
        setCurrentId(asset.id);
        setIsEditing(true);
        setShowTable(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this asset permanently?', async () => {
            try {
                await api.delete(`/assets/${id}`);
                showToast('success', 'Asset deleted successfully');
                fetchAssets();
            } catch (error) {
                showToast('error', 'Failed to delete asset');
            }
        });
    };

    const handlePrint = () => {
        if (filteredAssets.length === 0) {
            showToast('warning', 'No asset records to print');
            return;
        }
        window.print();
    };

    const resetForm = () => {
        setFormData({
            entry_date: new Date().toISOString().split('T')[0],
            asset_name: '',
            description: '',
            qty: 0,
            rate: 0,
            amount: 0
        });
        setIsEditing(false);
        setCurrentId(null);
        setAddingModes({ asset_name: false });
    };

    const columns = [
        {
            key: 'entry_date',
            label: 'Date',
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
            )
        },
        { key: 'asset_name', label: 'Asset', render: (val) => <span className="font-bold text-slate-700 uppercase">{val}</span> },
        { key: 'description', label: 'Description' },
        {
            key: 'qty',
            label: 'Quantity',
            render: (val) => <span className="font-bold text-primary-600">{val}</span>
        },
        {
            key: 'rate',
            label: 'Rate',
            render: (val) => `₹${parseFloat(val).toLocaleString()}`
        },
        {
            key: 'amount',
            label: 'Total Amount',
            render: (val) => <span className="font-bold text-slate-900">₹{parseFloat(val).toLocaleString()}</span>
        }
    ];

    const filteredAssets = assets.filter(a =>
        a.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Asset Management</h1>
                        <p className="text-slate-500 text-base font-medium">Catalog and monitor company assets with financial tracking.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {showTable && (
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 hover:shadow-md"
                            >
                                <Printer size={18} /> Print Report
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setShowTable(!showTable);
                                if (isEditing) resetForm();
                            }}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                        >
                            {showTable ? (
                                <><ChevronUp size={18} /> Add New Assets</>
                            ) : (
                                <><ChevronDown size={18} /> View List</>
                            )}
                        </button>
                    </div>
                </div>

                {!showTable ? (
                    <div className="card !p-0 overflow-hidden transition-all duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                    {isEditing ? <Edit2 size={20} /> : <Briefcase size={20} />}
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">{isEditing ? 'Edit Asset Record' : 'Record New Asset'}</h2>
                            </div>
                            {isEditing && (
                                <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div className="p-8 lg:p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-3">
                                    <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                        <Calendar size={14} className="text-primary-500" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        value={formData.entry_date}
                                        onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                                    />
                                </div>

                                <DropdownWithAdd label="Asset" field="asset_name" options={assetNames} icon={Layers} formData={formData} setFormData={setFormData} addingModes={addingModes} setAddingModes={setAddingModes} />

                                <div className="space-y-3 lg:col-span-2">
                                    <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                        <FileText size={14} className="text-primary-500" /> Description
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        placeholder="Enter asset description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                        <Package size={14} className="text-primary-500" /> Quantity
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        placeholder="0"
                                        value={formData.qty || ''}
                                        min="0"
                                        onChange={(e) => setFormData({ ...formData, qty: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                        <IndianRupee size={14} className="text-primary-500" /> Rate Per Qty
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                            placeholder="0.00"
                                            value={formData.rate || ''}
                                            min="0"
                                            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 lg:col-span-2">
                                    <label className="input-label mb-2 ml-1 flex items-center gap-2 !text-green-600">
                                        <IndianRupee size={14} className="text-green-500" /> Total Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-5 py-3.5 bg-green-50 border border-green-100 rounded-2xl focus:ring-4 focus:green-500/10 focus:border-green-500 outline-none text-sm font-bold text-green-700 transition-all cursor-not-allowed"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex justify-end pt-4 gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={loading || !canEdit(moduleId)}
                                    className={`w-full md:w-1/3 btn btn-primary py-4 text-base flex items-center justify-center gap-3 shadow-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${!canEdit(moduleId) ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'shadow-primary-500/25 bg-primary-600 text-white'}`}
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            <Save size={18} />
                                            {!canEdit(moduleId) ? 'VIEW ONLY MODE' : (isEditing ? 'Update Asset' : 'Confirm & Save')}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full md:w-1/3 bg-white text-slate-600 border border-slate-200 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    <X size={16} /> Reset
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* History Table */
                    <div className="space-y-6 pb-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Asset Inventory Registry</h2>
                                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm">{assets.length} Assets Found</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={filteredAssets}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                searchPlaceholder="Search assets or descriptions..."
                                actions={(row) => (
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title={canEdit(moduleId) ? "Edit" : "View Details"}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {canEdit(moduleId) && (
                                            <button
                                                onClick={() => handleDelete(row.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* System Generated Print Matrix */}
            <AssetReportPrint data={filteredAssets} />
        </div>
    );
};

export default Assets;
