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
    Calculator,
    CreditCard,
    Wallet,
    ChevronDown,
    ChevronUp,
    Download
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';

const CreditCollection = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit } = usePermissions();
    const moduleId = 'credit-collection';
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState([]);
    const [creditInvoices, setCreditInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTable, setShowTable] = useState(true);

    const [formData, setFormData] = useState({
        credit_date: new Date().toISOString().split('T')[0],
        customer_name: '',
        customer_id: '',
        description: '',
        bill_no: '',
        paid_amount: 0
    });

    const fetchCollections = async () => {
        try {
            const response = await api.get('/credit-collections');
            setCollections(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch collection records');
        }
    };

    const fetchCreditInvoices = async () => {
        try {
            const response = await api.get('/credit-collections/credit-invoices');
            setCreditInvoices(response.data);
        } catch (error) {
            console.error('Error fetching credit invoices', error);
        }
    };

    useEffect(() => {
        fetchCollections();
        fetchCreditInvoices();
    }, []);

    const handleCustomerChange = (e) => {
        const custName = e.target.value;
        const invoice = creditInvoices.find(inv => inv.customer_name === custName);
        if (invoice) {
            setFormData({
                ...formData,
                customer_name: custName,
                customer_id: invoice.customer_id,
                bill_no: invoice.invoice_no
            });
        } else {
            setFormData({ ...formData, customer_name: custName, customer_id: '', bill_no: '' });
        }
    };

    const handleBillChange = (e) => {
        const billNo = e.target.value;
        const invoice = creditInvoices.find(inv => inv.invoice_no === billNo);
        if (invoice) {
            setFormData({
                ...formData,
                bill_no: billNo,
                customer_name: invoice.customer_name,
                customer_id: invoice.customer_id
            });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.customer_name || !formData.bill_no || formData.paid_amount <= 0) {
            showToast('warning', 'Please fill all required fields');
            return;
        }

        confirmToast(
            'Are you sure you want to save this credit collection entry?',
            async () => {
                setLoading(true);
                try {
                    await api.post('/credit-collections', formData);
                    showToast('success', 'Collection entry saved successfully');
                    setFormData({
                        credit_date: new Date().toISOString().split('T')[0],
                        customer_name: '',
                        customer_id: '',
                        description: '',
                        bill_no: '',
                        paid_amount: 0
                    });
                    fetchCollections();
                } catch (error) {
                    showToast('error', error.response?.data?.message || 'Error saving collection');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const filteredCollections = collections.filter(c =>
        c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { key: 'credit_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'customer_name', label: 'Customer' },
        { key: 'customer_id', label: 'ID' },
        { key: 'bill_no', label: 'Bill No' },
        { key: 'description', label: 'Description' },
        { key: 'paid_amount', label: 'Paid (Rs)', render: (val) => `₹${val.toLocaleString()}` }
    ];

    // Get unique customers for dropdown
    const uniqueCustomers = Array.from(new Set(creditInvoices.map(inv => inv.customer_name)));
    const selectedCustomerBills = creditInvoices.filter(inv => inv.customer_name === formData.customer_name);

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Credit Collection</h1>
                        <p className="text-slate-500 text-base font-medium">Record and track credit payments from customers.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                        >
                            {showTable ? <><ChevronUp size={18} /> Hide Records</> : <><ChevronDown size={18} /> View Collections</>}
                        </button>
                    </div>
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Plus size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">New Collection Entry</h3>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="date"
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        value={formData.credit_date}
                                        onChange={(e) => setFormData({ ...formData, credit_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <select
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold appearance-none"
                                        value={formData.customer_name}
                                        onChange={handleCustomerChange}
                                    >
                                        <option value="">Select Customer</option>
                                        {uniqueCustomers.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500"
                                        placeholder="CUST-ID"
                                        value={formData.customer_id}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Bill No</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <select
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold appearance-none"
                                        value={formData.bill_no}
                                        onChange={handleBillChange}
                                    >
                                        <option value="">Select Bill</option>
                                        {selectedCustomerBills.map(inv => (
                                            <option key={inv.invoice_no} value={inv.invoice_no}>{inv.invoice_no} (₹{inv.grand_total})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid (Rs)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="number"
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="0"
                                        value={formData.paid_amount}
                                        onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 lg:col-span-6 flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !canEdit(moduleId)}
                                    className={`px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 ${!canEdit(moduleId) ? 'shadow-none grayscale cursor-not-allowed' : 'shadow-primary-500/20 bg-primary-600 text-white hover:bg-primary-700'}`}
                                >
                                    {loading ? 'SUBMITTING...' : (
                                        <>
                                            <Save size={16} />
                                            {canEdit(moduleId) ? 'SUBMIT' : 'VIEW ONLY MODE'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {showTable && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    Collection History
                                    <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded-full uppercase tracking-widest leading-none">{collections.length} RECORDS</span>
                                </h2>
                                <div className="relative w-full md:w-[450px]">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by customer or bill no..."
                                        className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DataTable columns={columns} data={filteredCollections} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditCollection;
