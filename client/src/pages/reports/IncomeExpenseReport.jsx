import React, { useState } from 'react';
import {
    Calendar,
    Filter,
    Printer,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    Wallet,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import IncomeExpenseReportPrint from '../../components/reports/IncomeExpenseReportPrint';

const IncomeExpenseReport = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [tableSearch, setTableSearch] = useState('');
    const [distinctFields, setDistinctFields] = useState({
        groups: [],
        authorizations: [],
        bills: [],
        details: []
    });

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        group: 'All',
        head: 'All',
        description: 'All',
        billNo: 'All'
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchDistinctFields = async () => {
        try {
            const response = await api.get('/income-expenses/distinct');
            setDistinctFields(response.data);
        } catch (error) {
            console.error('Error fetching distinct fields', error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                fromDate: filters.fromDate,
                toDate: filters.toDate
            }).toString();
            const response = await api.get(`/income-expenses/report?${queryParams}`);
            setReportData(response.data);
            if (response.data.length === 0) {
                showToast('info', 'No transactions found for the selected period');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            showToast('error', 'Failed to generate income & expense report');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDistinctFields();
    }, []);

    const handlePrint = () => {
        if (reportData.length === 0) {
            showToast('warning', 'Please analyze data before printing');
            return;
        }
        window.print();
    };

    const totalIncome = reportData.reduce((sum, row) => sum + Number(row.income || 0), 0);
    const totalExpense = reportData.reduce((sum, row) => sum + Number(row.expense || 0), 0);
    const balance = totalIncome - totalExpense;

    const filteredData = reportData.filter(row => {
        const matchesSearch =
            row.group_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
            row.authorization_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
            (row.details && row.details.toLowerCase().includes(tableSearch.toLowerCase())) ||
            (row.bill_no && row.bill_no.toLowerCase().includes(tableSearch.toLowerCase()));

        const matchesGroup = filters.group === 'All' || row.group_name === filters.group;
        const matchesHead = filters.head === 'All' || row.authorization_name === filters.head;
        const matchesDescription = filters.description === 'All' || row.details === filters.description;
        const matchesBill = filters.billNo === 'All' || row.bill_no === filters.billNo;

        return matchesSearch && matchesGroup && matchesHead && matchesDescription && matchesBill;
    });

    const columns = [
        {
            key: 'serial',
            label: 'SNO',
            render: (_, __, idx) => <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
        },
        {
            key: 'income_expense_date',
            label: 'DATE',
            render: (val) => <span className="text-xs font-medium text-slate-600">{new Date(val).toLocaleDateString('en-GB')}</span>
        },
        {
            key: 'group_name',
            label: 'GROUP',
            render: (val) => <span className="text-xs font-bold text-slate-900 uppercase">{val}</span>
        },
        {
            key: 'authorization_name',
            label: 'HEAD',
            render: (val) => <span className="text-xs font-bold text-primary-700 uppercase">{val}</span>
        },
        {
            key: 'details',
            label: 'DESCRIPTION',
            render: (val) => <span className="text-xs text-slate-500 uppercase italic truncate max-w-[200px]">{val || '---'}</span>
        },
        {
            key: 'bill_no',
            label: 'BILL NO',
            render: (val) => <span className="text-xs font-mono font-bold text-slate-700">{val || '---'}</span>
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
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Income & Expense Report</h1>
                    <p className="text-slate-500 text-base font-medium">Financial overview of your business transactions.</p>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    <Printer size={18} /> Print Report
                </button>
            </div>

            {/* Filter Section */}
            <div className="card !p-0 overflow-hidden mb-10">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Report Configuration</h2>
                </div>
                <div className="p-8 space-y-8">
                    {/* Row 1: Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500" /> Start Date
                            </label>
                            <input
                                type="date"
                                name="fromDate"
                                className="input-field"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500" /> End Date
                            </label>
                            <input
                                type="date"
                                name="toDate"
                                className="input-field"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="btn btn-primary h-[52px] flex items-center gap-3 justify-center shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><BarChart3 size={22} /> Generate Report</>}
                        </button>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Row 2: Advanced Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1">
                                Group
                            </label>
                            <select
                                name="group"
                                className="input-field !py-3"
                                value={filters.group}
                                onChange={handleFilterChange}
                            >
                                <option value="All">All Groups</option>
                                {distinctFields.groups.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1">
                                Head (Auth)
                            </label>
                            <select
                                name="head"
                                className="input-field !py-3"
                                value={filters.head}
                                onChange={handleFilterChange}
                            >
                                <option value="All">All Heads</option>
                                {distinctFields.authorizations.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1">
                                Description
                            </label>
                            <select
                                name="description"
                                className="input-field !py-3"
                                value={filters.description}
                                onChange={handleFilterChange}
                            >
                                <option value="All">All Descriptions</option>
                                {distinctFields.details.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1">
                                Bill No
                            </label>
                            <select
                                name="billNo"
                                className="input-field !py-3"
                                value={filters.billNo}
                                onChange={handleFilterChange}
                            >
                                <option value="All">All Bills</option>
                                {distinctFields.bills.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Income</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingDown size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Expense</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-primary-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 ${balance >= 0 ? 'bg-primary-50 text-primary-600' : 'bg-orange-50 text-orange-600'} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Wallet size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Net Balance</p>
                            <h3 className={`text-2xl font-black ${balance >= 0 ? 'text-slate-900' : 'text-orange-600'} tracking-tight`}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    searchTerm={tableSearch}
                    onSearchChange={setTableSearch}
                    searchPlaceholder="Search group, category, description or bill no..."
                    emptyMessage="Select date range and generate to see financial report"
                    pagination={{ itemsPerPage: 15 }}
                />
            </div>

            {/* Print Component */}
            <IncomeExpenseReportPrint data={reportData} filters={filters} />
        </div>
    );
};

export default IncomeExpenseReport;
