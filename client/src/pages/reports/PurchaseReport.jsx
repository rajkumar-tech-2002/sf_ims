import React, { useState } from 'react';
import {
    Calendar,
    Filter,
    FileSearch,
    Printer,
    Search,
    IndianRupee,
    ChevronDown,
    ShoppingCart,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import PurchaseReportPrint from '../../components/reports/PurchaseReportPrint';

const PurchaseReport = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [tableSearch, setTableSearch] = useState('');

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await api.get(`/purchases/report?${queryParams}`);
            setReportData(response.data);
            if (response.data.length === 0) {
                showToast('info', 'No purchase records found for the selected period');
            }
        } catch (error) {
            showToast('error', 'Failed to fetch purchase report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (reportData.length === 0) {
            showToast('warning', 'Please analyze the data before printing');
            return;
        }
        window.print();
    };

    const totalQty = reportData.reduce((sum, row) => sum + Number(row.qty || 0), 0);
    const totalPurchaseVal = reportData.reduce((sum, row) => sum + (Number(row.qty) * Number(row.purchase_rate)), 0);

    const filteredData = reportData.filter(row =>
        row.product_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.vendor_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.product_code.toLowerCase().includes(tableSearch.toLowerCase())
    );

    const columns = [
        {
            key: 'serial',
            label: 'SNO',
            render: (_, __, idx) => <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
        },
        {
            key: 'purchase_date',
            label: 'DATE',
            render: (val) => <span className="text-xs font-bold text-slate-600">{new Date(val).toLocaleDateString('en-GB')}</span>
        },
        {
            key: 'product_name',
            label: 'PRODUCT',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 uppercase">{val}</span>
                    <span className="text-[10px] font-mono font-bold text-primary-500">{row.product_code}</span>
                </div>
            )
        },
        {
            key: 'vendor_name',
            label: 'VENDOR',
            render: (val) => <span className="text-xs font-semibold text-slate-600 uppercase">{val}</span>
        },
        {
            key: 'qty',
            label: 'QTY',
            className: 'text-center',
            render: (val) => <span className="text-xs font-black text-slate-900">{val}</span>
        },
        {
            key: 'purchase_rate',
            label: 'P. RATE',
            className: 'text-right',
            render: (val) => <span className="text-xs font-bold text-slate-900">₹{parseFloat(val).toLocaleString()}</span>
        },
        {
            key: 'sale_rate',
            label: 'S. RATE',
            className: 'text-right',
            render: (val) => <span className="text-xs font-black text-emerald-600">₹{parseFloat(val).toLocaleString()}</span>
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Purchase Report</h1>
                    <p className="text-slate-500 text-base font-medium">Analyze procurement trends and vendor performance metrics.</p>
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
                    <h2 className="text-lg font-bold text-slate-900">Analysis Parameters</h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500" /> From Date
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
                                <Calendar size={14} className="text-primary-500" /> To Date
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
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><FileSearch size={22} /> Run Intelligence</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <ShoppingCart size={30} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Units Procured</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalQty} Units</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={30} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Procurement Value</p>
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter flex items-center">
                            <IndianRupee size={24} className="mr-1 opacity-70" />
                            {totalPurchaseVal.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    searchTerm={tableSearch}
                    onSearchChange={setTableSearch}
                    searchPlaceholder="Search products or vendors..."
                    emptyMessage="Select date range and run analysis to populate data"
                    pagination={{ itemsPerPage: 10 }}
                />
            </div>

            {/* Print View Component */}
            <PurchaseReportPrint data={reportData} filters={filters} />
        </div>
    );
};

export default PurchaseReport;
