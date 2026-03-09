import React, { useState, useEffect } from 'react';
import {
    Plus,
    Save,
    Search,
    Calendar,
    User,
    Hash,
    FileText,
    IndianRupee,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Wallet,
    X,
    Edit2,
    Trash2,
    Truck
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const DropdownWithAdd = ({ label, field, options, icon: Icon, formData, setFormData, addingModes, setAddingModes }) => {
    const isAdding = addingModes[field];
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
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

const Transactions = () => {
    const { showToast, confirmToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0],
        vendor_name: '',
        description: '',
        bill_no: '',
        buy: 0,
        paid: 0,
        cash_type: 'Cash'
    });

    useEffect(() => {
        fetchTransactions();
        fetchVendors();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            setTransactions(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch transactions');
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors');
            setVendors(response.data.map(v => v.vendor_name));
        } catch (error) {
            showToast('error', 'Failed to fetch vendors');
        }
    };

    const handleSave = async () => {
        if (!formData.vendor_name) {
            showToast('warning', 'Please select a vendor');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                await api.put(`/transactions/${currentId}`, formData);
                showToast('success', 'Transaction updated successfully');
            } else {
                await api.post('/transactions', formData);
                showToast('success', 'Transaction saved successfully');
            }
            resetForm();
            fetchTransactions();
            fetchVendors(); // Refresh vendor list if a new one was added
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            transaction_date: transaction.transaction_date.split('T')[0],
            vendor_name: transaction.vendor_name,
            description: transaction.description || '',
            bill_no: transaction.bill_no || '',
            buy: transaction.buy,
            paid: transaction.paid,
            cash_type: transaction.cash_type || 'Cash'
        });
        setCurrentId(transaction.id);
        setIsEditing(true);
        setShowTable(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this transaction permanently?', async () => {
            try {
                await api.delete(`/transactions/${id}`);
                showToast('success', 'Transaction deleted successfully');
                fetchTransactions();
            } catch (error) {
                showToast('error', 'Failed to delete transaction');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            transaction_date: new Date().toISOString().split('T')[0],
            vendor_name: '',
            description: '',
            bill_no: '',
            buy: 0,
            paid: 0,
            cash_type: 'Cash'
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const columns = [
        {
            key: 'transaction_date',
            label: 'Date',
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: #{Math.floor(Math.random() * 1000) + 100}</span>
                </div>
            )
        },
        {
            key: 'vendor_name',
            label: 'Vendor',
            render: (val) => <span className="font-bold text-slate-700 uppercase tracking-tight">{val}</span>
        },
        {
            key: 'cash_type',
            label: 'Type',
            render: (val) => (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${val === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {val}
                </span>
            )
        },
        {
            key: 'buy',
            label: 'Buy Amount',
            render: (val) => val > 0 ? `₹${parseFloat(val).toLocaleString()}` : '-'
        },
        {
            key: 'paid',
            label: 'Paid Amount',
            className: 'text-green-600',
            render: (val) => val > 0 ? `₹${parseFloat(val).toLocaleString()}` : '-'
        },
        { key: 'bill_no', label: 'Bill No' },
        { key: 'description', label: 'Description' }
    ];

    const filteredTransactions = transactions.filter(t =>
        t.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.bill_no && t.bill_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Transaction Registry</h1>
                        <p className="text-slate-500 text-base font-medium">Record and manage vendor buy/paid transactions.</p>
                    </div>
                    <div className="flex items-center gap-4">
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
                                <><ChevronUp size={18} /> Add New</>
                            ) : (
                                <><ChevronDown size={18} /> View List</>
                            )}
                        </button>
                    </div>
                </div>

                {!showTable ? (
                    <div className="bg-white rounded-3xl shadow-premium border border-slate-200 overflow-hidden transition-all duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                    {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">{isEditing ? 'Edit Transaction' : 'New Transaction Entry'}</h2>
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
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Calendar size={14} className="text-primary-500" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        value={formData.transaction_date}
                                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                                    />
                                </div>

                                {/* Vendor */}
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Truck size={14} className="text-primary-500" /> Vendor
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-black text-slate-700 uppercase appearance-none cursor-pointer transition-all"
                                            value={formData.vendor_name}
                                            onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] text-center ml-1">
                                        Payment Mode
                                    </label>
                                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm h-[52px]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, cash_type: 'Cash' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.cash_type === 'Cash' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <Wallet size={14} /> Cash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, cash_type: 'Cheque' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.cash_type === 'Cheque' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <CreditCard size={14} /> Cheque
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Hash size={14} className="text-primary-500" /> Bill Number
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        placeholder="Enter Bill No"
                                        value={formData.bill_no}
                                        onChange={(e) => setFormData({ ...formData, bill_no: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3 lg:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <FileText size={14} className="text-primary-500" /> Description
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        placeholder="Enter transaction description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <IndianRupee size={14} className="text-primary-500" /> Buy Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                            placeholder="0.00"
                                            value={formData.buy || ''}
                                            onChange={(e) => setFormData({ ...formData, buy: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-green-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <IndianRupee size={14} className="text-green-500" /> Paid Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-5 py-3.5 bg-green-50 border border-green-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-sm font-bold text-green-700 transition-all"
                                            placeholder="0.00"
                                            value={formData.paid || ''}
                                            onChange={(e) => setFormData({ ...formData, paid: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex justify-end pt-4 gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full md:w-1/3 bg-primary-600 text-white btn btn-primary py-4 text-base flex items-center justify-center gap-3 shadow-xl shadow-primary-500/25 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    {loading ? 'Processing...' : <><Save size={18} /> {isEditing ? 'Update Transaction' : 'Confirm & Save'}</>}
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
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Transaction History</h2>
                                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm">{transactions.length} Records</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={filteredTransactions}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                searchPlaceholder="Search vendors, bills, or descriptions..."
                                actions={(row) => (
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
