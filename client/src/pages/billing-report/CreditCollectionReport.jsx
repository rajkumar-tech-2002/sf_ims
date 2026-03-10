import React, { useState, useEffect } from 'react';
import { Search, User, Hash, Printer, IndianRupee, FileText, Calendar, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import CreditCollectionReportPrint from '../../components/reports/CreditCollectionReportPrint';

const CreditCollectionReport = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const fetchCustomerList = async () => {
        try {
            const response = await api.get('/customers');
            setCustomerList(response.data);
        } catch (error) {
            console.error('Error fetching customer list', error);
        }
    };

    useEffect(() => {
        fetchCustomerList();
    }, []);

    const handleCustomerSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            const filtered = customerList.filter(c =>
                c.customer_name.toLowerCase().includes(value.toLowerCase()) ||
                (c.latest_credit_id && c.latest_credit_id.toLowerCase().includes(value.toLowerCase())) ||
                c.customer_id.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectCustomer = async (cust) => {
        setSelectedCustomer(cust);
        setSearchTerm(cust.customer_name);
        setShowSuggestions(false);
        fetchReportData(cust.customer_id);
    };

    const fetchReportData = async (customerId) => {
        setLoading(true);
        try {
            const response = await api.get(`/credit-collections/report/${customerId}`);
            setReportData(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!selectedCustomer) {
            showToast('warning', 'Please select a customer first');
            return;
        }
        window.print();
    };

    const columns = [
        { key: 'serial', label: 'SNo', render: (_, __, index) => index + 1 },
        { key: 'date', label: 'DATE', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'credit_id', label: 'Credit ID' },
        { key: 'description', label: 'Description' },
        { key: 'bill_amount', label: 'Bill Amount', render: (val) => `₹${val.toLocaleString()}` },
        { key: 'paid_amount', label: 'PAID', render: (val) => `₹${val.toLocaleString()}` }
    ];

    // Calculate totals
    const totalBill = reportData.reduce((sum, item) => sum + parseFloat(item.bill_amount || 0), 0);
    const totalPaid = reportData.reduce((sum, item) => sum + parseFloat(item.paid_amount || 0), 0);
    const balance = totalBill - totalPaid;

    return (
        <div className="page-container bg-slate-50/50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-800">Credit Collection Report</h1>
                        <p className="text-slate-500 font-medium font-bold">Monitor customer credit transactions and outstanding balances.</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        disabled={!selectedCustomer || reportData.length === 0}
                        className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Printer size={18} /> PRINT REPORT
                    </button>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 p-8 no-print">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="md:col-span-2 relative">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Search Customer</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                    placeholder="Enter customer name or ID..."
                                    value={searchTerm}
                                    onChange={handleCustomerSearch}
                                    onFocus={() => searchTerm && setShowSuggestions(true)}
                                />
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto anima-in fade-in slide-in-from-top-2 duration-200">
                                        {filteredSuggestions.map((cust) => (
                                            <button
                                                key={cust.customer_id}
                                                className="w-full px-5 py-3 text-left hover:bg-primary-50 border-b border-slate-50 last:border-0 transition-colors"
                                                onClick={() => handleSelectCustomer(cust)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{cust.customer_name}</p>
                                                        <p className="text-[10px] font-bold text-primary-600 font-mono tracking-wider">Credit ID: {cust.latest_credit_id || '-'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400">{cust.customer_mobile}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {showSuggestions && (
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Credit ID</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500"
                                    value={selectedCustomer?.latest_credit_id || '-'}
                                    placeholder="CREDIT-ID"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Table */}
                {selectedCustomer && (
                    <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 no-print">

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Customer: <span className="text-primary-600 uppercase font-black tracking-tight">{selectedCustomer.customer_name}</span>
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Hash size={12} /> Credit ID: {selectedCustomer.latest_credit_id || '-'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Outstanding</p>
                                        <p className={`text-xl font-black ${balance > 0 ? 'text-primary-600' : 'text-slate-900'}`}>₹{balance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DataTable columns={columns} data={reportData} loading={loading} emptyMessage="No transactions found for this customer" />

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <div className="w-full md:w-80 space-y-3">
                                <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Bill</span>
                                    <span className="text-sm font-black text-slate-700">₹{totalBill.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Paid</span>
                                    <span className="text-sm font-black text-primary-600">₹{totalPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-5 py-4 bg-primary-600 rounded-2xl shadow-xl shadow-primary-500/20">
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Net Balance</span>
                                    <span className="text-xl font-black text-white">₹{balance.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CreditCollectionReportPrint
                selectedCustomer={selectedCustomer}
                reportData={reportData}
                totals={{ totalBill, totalPaid, balance }}
            />
        </div>
    );
};

export default CreditCollectionReport;
