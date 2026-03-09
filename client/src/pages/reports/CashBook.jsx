import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Calendar,
    Filter,
    Printer,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    Wallet,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import CashBookPrint from '../../components/reports/CashBookPrint';

const CashBook = () => {
    const { showToast } = useToast();
    const { canAccess } = usePermissions();
    const moduleId = 'cash-book';
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [tableSearch, setTableSearch] = useState('');
    const isInitialMount = useRef(true);

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        type: 'Cash' // 'Cash' or 'Cheque'
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                type: filters.type
            }).toString();
            const response = await api.get(`/reports/cashbook?${queryParams}`);

            // Calculate running balance
            let runningBalance = 0;
            const dataWithBalance = response.data.map(row => {
                runningBalance += (Number(row.income) - Number(row.expense));
                return { ...row, balance: runningBalance };
            });

            setReportData(dataWithBalance);
            if (response.data.length === 0) {
                showToast('info', 'No transactions found for the selected period');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            showToast('error', 'Failed to generate cash book report');
        } finally {
            setLoading(false);
        }
    }, [filters.fromDate, filters.toDate, filters.type, showToast]);

    useEffect(() => {
        if (isInitialMount.current) {
            fetchReport();
            isInitialMount.current = false;
        }
    }, [fetchReport]);

    const handlePrint = () => {
        if (reportData.length === 0) {
            showToast('warning', 'Please generate report before printing');
            return;
        }
        window.print();
    };

    const totalIncome = reportData.reduce((sum, row) => sum + Number(row.income || 0), 0);
    const totalExpense = reportData.reduce((sum, row) => sum + Number(row.expense || 0), 0);
    const netBalance = totalIncome - totalExpense;

    const columns = [
        {
            key: 'serial',
            label: 'SNO',
            render: (_, __, idx) => <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
        },
        {
            key: 'trans_date',
            label: 'DATE',
            render: (val) => <span className="text-xs font-medium text-slate-600">{new Date(val).toLocaleDateString('en-GB')}</span>
        },
        {
            key: 'type_name',
            label: 'TYPE / PARTICULARS',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 uppercase">{val}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{row.source === 'INVOICE' ? 'Sales Invoice' : 'General Entry'}</span>
                </div>
            )
        },
        {
            key: 'income',
            label: 'INCOME',
            className: 'text-right',
            render: (val) => val > 0 ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    ₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ) : <span className="text-slate-300">---</span>
        },
        {
            key: 'expense',
            label: 'EXPENSE',
            className: 'text-right',
            render: (val) => val > 0 ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                    ₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ) : <span className="text-slate-300">---</span>
        },
        {
            key: 'balance',
            label: 'BALANCE',
            className: 'text-right',
            render: (val) => (
                <span className={`text-xs font-black ${val >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    ₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            )
        }
    ];

    if (!canAccess(moduleId)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
                        <X size={32} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Access Restricted</h2>
                    <p className="text-slate-500 font-medium">You do not have permission to view the Cash Book registry.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 no-print">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Cash Book Registry</h1>
                    <p className="text-slate-500 text-base font-medium">Daily transaction ledger for cash and bank reconciliations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                        <Printer size={18} /> Print Report
                    </button>
                </div>
            </div>

            {/* Config & Filters */}
            <div className="card !p-0 bg-white border-slate-200 shadow-premium overflow-hidden mb-10 no-print">
                <div className="p-8">
                    <div className="flex flex-wrap items-center gap-8 justify-between">
                        <div className="flex items-center gap-6 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                            <button
                                onClick={() => setFilters(f => ({ ...f, type: 'Cheque' }))}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.type === 'Cheque' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${filters.type === 'Cheque' ? 'bg-white' : 'bg-slate-300'}`} />
                                Cheque
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, type: 'Cash' }))}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.type === 'Cash' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${filters.type === 'Cash' ? 'bg-white' : 'bg-slate-300'}`} />
                                by Cash
                            </button>
                        </div>

                        <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={16} />
                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={filters.fromDate}
                                        onChange={handleFilterChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={16} />
                                    <input
                                        type="date"
                                        name="toDate"
                                        value={filters.toDate}
                                        onChange={handleFilterChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={fetchReport}
                                disabled={loading}
                                className="mt-6 px-10 h-[48px] bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[160px]"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'CASH BOOK'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 no-print">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Income</p>
                        <h3 className="text-xl font-black text-slate-900">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                        <ArrowDownRight size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Expense</p>
                        <h3 className="text-xl font-black text-slate-900">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl flex items-center gap-5 border border-white/5">
                    <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary-300 opacity-60 uppercase tracking-widest leading-none mb-1.5">Closing Balance</p>
                        <h3 className="text-xl font-black text-white">₹{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DataTable
                    columns={columns}
                    data={reportData}
                    loading={loading}
                    searchTerm={tableSearch}
                    onSearchChange={setTableSearch}
                    searchPlaceholder="Search particulars..."
                    emptyMessage="Generate report to view cash book details"
                    pagination={{ itemsPerPage: 100 }}
                />
            </div>

            {/* Print Layout */}
            <CashBookPrint data={reportData} filters={filters} summary={{ totalIncome, totalExpense, netBalance }} />
        </div>
    );
};

export default CashBook;
