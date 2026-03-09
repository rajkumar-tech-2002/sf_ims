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
    FileCheck,
    CreditCard,
    Wallet,
    PlusCircle,
    X,
    Layers,
    Tag,
    Edit2,
    Trash2
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

const IncomeExpense = () => {
    const { showToast, confirmToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [distinctFields, setDistinctFields] = useState({
        groups: [],
        categories: [],
        persons: [],
        authorizations: []
    });

    const [formData, setFormData] = useState({
        income_expense_date: new Date().toISOString().split('T')[0],
        group_name: '',
        category_name: '',
        person_name: '',
        authorization_name: '',
        income_expense_type: 'Cash',
        details: '',
        bill_no: '',
        income: 0,
        expense: 0
    });

    const [hasBill, setHasBill] = useState(false);
    const [addingModes, setAddingModes] = useState({
        group_name: false,
        category_name: false,
        person_name: false,
        authorization_name: false
    });

    const fetchEntries = async () => {
        try {
            const response = await api.get('/income-expenses');
            setEntries(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch transaction records');
        }
    };

    const fetchDistinctFields = async () => {
        try {
            const response = await api.get('/income-expenses/distinct');
            setDistinctFields(response.data);
        } catch (error) {
            console.error('Error fetching distinct fields', error);
        }
    };

    useEffect(() => {
        fetchEntries();
        fetchDistinctFields();
    }, []);

    const resetForm = () => {
        setFormData({
            income_expense_date: new Date().toISOString().split('T')[0],
            group_name: '',
            category_name: '',
            person_name: '',
            authorization_name: '',
            income_expense_type: 'Cash',
            details: '',
            bill_no: '',
            income: 0,
            expense: 0
        });
        setHasBill(false);
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!formData.group_name || !formData.category_name) {
            showToast('warning', 'Group and Category are required');
            return;
        }

        if (formData.income <= 0 && formData.expense <= 0) {
            showToast('warning', 'Please enter either Income or Expense amount');
            return;
        }

        const message = isEditing
            ? 'Are you sure you want to update this transaction?'
            : 'Are you sure you want to save this transaction?';

        confirmToast(
            message,
            async () => {
                setLoading(true);
                try {
                    const payload = {
                        ...formData,
                        bill_no: hasBill ? formData.bill_no : ''
                    };

                    if (isEditing) {
                        await api.put(`/income-expenses/${currentId}`, payload);
                        showToast('success', 'Transaction updated successfully');
                    } else {
                        await api.post('/income-expenses', payload);
                        showToast('success', 'Transaction saved successfully');
                    }

                    resetForm();
                    fetchEntries();
                    fetchDistinctFields();
                } catch (error) {
                    showToast('error', error.response?.data?.message || 'Error processing transaction');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const handleEdit = (entry) => {
        setFormData({
            income_expense_date: entry.income_expense_date ? new Date(entry.income_expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            group_name: entry.group_name || '',
            category_name: entry.category_name || '',
            person_name: entry.person_name || '',
            authorization_name: entry.authorization_name || '',
            income_expense_type: entry.income_expense_type || 'Cash',
            details: entry.details || '',
            bill_no: entry.bill_no || '',
            income: entry.income || 0,
            expense: entry.expense || 0
        });
        setHasBill(!!entry.bill_no);
        setCurrentId(entry.id);
        setIsEditing(true);
        setShowTable(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast(
            'Are you sure you want to delete this transaction permanently?',
            async () => {
                try {
                    await api.delete(`/income-expenses/${id}`);
                    showToast('success', 'Transaction deleted successfully');
                    fetchEntries();
                    fetchDistinctFields();
                } catch (error) {
                    showToast('error', 'Failed to delete transaction');
                }
            }
        );
    };

    const filteredEntries = entries.filter(e =>
        (e.group_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.category_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.details?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.person_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const columns = [
        { key: 'income_expense_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'group_name', label: 'Group' },
        { key: 'category_name', label: 'Category' },
        { key: 'person_name', label: 'Person' },
        {
            key: 'income_expense_type', label: 'Type', render: (val) => (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${val === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {val}
                </span>
            )
        },
        { key: 'income', label: 'Income', render: (val) => val > 0 ? `₹${val.toLocaleString()}` : '-' },
        { key: 'expense', label: 'Expense', render: (val) => val > 0 ? `₹${val.toLocaleString()}` : '-' },
        { key: 'bill_no', label: 'Bill No' },
        { key: 'details', label: 'Details' }
    ];

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Income & Expense</h1>
                        <p className="text-slate-500 text-base font-medium">Manage daily financial transactions and vouchers.</p>
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
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h2>
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
                                        value={formData.income_expense_date}
                                        onChange={(e) => setFormData({ ...formData, income_expense_date: e.target.value })}
                                    />
                                </div>

                                <DropdownWithAdd label="Group" field="group_name" options={distinctFields.groups} icon={Layers} formData={formData} setFormData={setFormData} addingModes={addingModes} setAddingModes={setAddingModes} />
                                <DropdownWithAdd label="Category" field="category_name" options={distinctFields.categories} icon={Tag} formData={formData} setFormData={setFormData} addingModes={addingModes} setAddingModes={setAddingModes} />
                                <DropdownWithAdd label="Person" field="person_name" options={distinctFields.persons} icon={User} formData={formData} setFormData={setFormData} addingModes={addingModes} setAddingModes={setAddingModes} />
                                <DropdownWithAdd label="Authorization" field="authorization_name" options={distinctFields.authorizations} icon={FileCheck} formData={formData} setFormData={setFormData} addingModes={addingModes} setAddingModes={setAddingModes} />

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] text-center ml-1">
                                        Payment Mode
                                    </label>
                                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-sm h-[52px]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, income_expense_type: 'Cash' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.income_expense_type === 'Cash' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <Wallet size={14} /> Cash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, income_expense_type: 'Cheque' })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.income_expense_type === 'Cheque' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            <CreditCard size={14} /> Cheque
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 lg:col-span-1 xl:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <FileText size={14} className="text-primary-500" /> Details
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                        placeholder="Enter transaction details..."
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3 flex flex-col items-center justify-end pb-1">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                        Bill
                                    </label>
                                    <div className="flex items-center justify-center h-[52px]">
                                        <input
                                            type="checkbox"
                                            checked={hasBill}
                                            onChange={(e) => setHasBill(e.target.checked)}
                                            className="w-6 h-6 text-primary-600 rounded-lg border-slate-300 focus:ring-primary-500 cursor-pointer shadow-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <Hash size={14} className="text-primary-500" /> Bill Number
                                    </label>
                                    <input
                                        type="text"
                                        disabled={!hasBill}
                                        className={`w-full px-5 py-3.5 border rounded-2xl outline-none text-sm font-bold transition-all ${hasBill ? 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500' : 'bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'}`}
                                        placeholder="No Bill"
                                        value={formData.bill_no}
                                        onChange={(e) => setFormData({ ...formData, bill_no: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-green-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <IndianRupee size={14} className="text-green-500" /> Income
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-5 py-3.5 bg-green-50 border border-green-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-sm font-bold text-green-700 transition-all placeholder:text-green-300"
                                            placeholder="0.00"
                                            value={formData.income || ''}
                                            onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-rose-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <IndianRupee size={14} className="text-rose-500" /> Expense
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-5 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-sm font-bold text-rose-700 transition-all placeholder:text-rose-300"
                                            placeholder="0.00"
                                            value={formData.expense || ''}
                                            onChange={(e) => setFormData({ ...formData, expense: parseFloat(e.target.value) || 0 })}
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
                                    className="w-full md:w-1/3 bg-white text-slate-600 border border-slate-200 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    <FileText size={16} /> Voucher
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
                                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm">{entries.length} Records</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-premium border border-slate-100 overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={filteredEntries}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                searchPlaceholder="Search groups, categories, or details..."
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

export default IncomeExpense;
