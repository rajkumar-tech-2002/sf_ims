import React, { useState } from 'react';
import {
    Calendar,
    Filter,
    Printer,
    Search,
    RefreshCw,
    TrendingDown,
    ArrowDownLeft,
    FileBarChart
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import ReturnReportPrint from '../../components/reports/ReturnReportPrint';

const ReturnReport = () => {
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
            const response = await api.get(`/stock-returns/report?${queryParams}`);
            setReportData(response.data);
            if (response.data.length === 0) {
                showToast('info', 'No returns found for the selected period');
            }
        } catch (error) {
            showToast('error', 'Failed to generate return report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (reportData.length === 0) {
            showToast('warning', 'Please generate report before printing');
            return;
        }
        window.print();
    };

    const totalReturnAmount = reportData.reduce((sum, row) => sum + Number(row.return_amount || 0), 0);
    const totalReturnQty = reportData.reduce((sum, row) => sum + Number(row.qty || 0), 0);

    const filteredData = reportData.filter(row =>
        row.product_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.product_code.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.return_no.toLowerCase().includes(tableSearch.toLowerCase())
    );

    const columns = [
        {
            key: 'serial',
            label: 'SNO',
            render: (_, __, idx) => <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
        },
        {
            key: 'return_no',
            label: 'RNO',
            render: (val) => <span className="text-xs font-bold text-primary-600">{val}</span>
        },
        {
            key: 'return_date',
            label: 'DATE',
            render: (val) => <span className="text-xs font-medium text-slate-700">{new Date(val).toLocaleDateString('en-GB')}</span>
        },
        {
            key: 'product_code',
            label: 'PCODE',
            render: (val) => <span className="text-xs font-mono font-bold text-slate-600">{val}</span>
        },
        {
            key: 'product_name',
            label: 'PRODUCT DESCRIPTION',
            render: (val) => (
                <span className="text-xs font-bold text-slate-900 uppercase">{val}</span>
            )
        },
        {
            key: 'qty',
            label: 'QTY',
            className: 'text-center',
            render: (val) => <span className="text-xs font-black text-slate-900">{val}</span>
        },
        {
            key: 'return_amount',
            label: 'RETURN AMOUNT',
            className: 'text-right',
            render: (val) => <span className="text-xs font-black text-rose-600">₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Stock Return Report</h1>
                    <p className="text-slate-500 text-base font-medium">Analyze returned goods and corresponding amounts.</p>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    <Printer size={18} /> Print Report
                </button>
            </div>

            {/* Filter Section */}
            <div className="card !p-0 bg-white border-slate-200 shadow-premium overflow-hidden mb-10">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Configure Filter</h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-rose-500" /> From Date
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
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-rose-500" /> To Date
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
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><RefreshCw size={22} /> Get Report</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingDown size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Returned Amount</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{totalReturnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-rose-500 uppercase bg-rose-50 px-3 py-1.5 rounded-full tracking-wider">Refunds</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowDownLeft size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Returned Quantity</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalReturnQty} Items</h3>
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-amber-500 uppercase bg-amber-50 px-3 py-1.5 rounded-full tracking-wider">Inbound</div>
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
                    searchPlaceholder="Search product, code or RNO..."
                    emptyMessage="Select date range and click 'Get Report' to view return data"
                    pagination={{ itemsPerPage: 15 }}
                />
            </div>

            {/* Print Component */}
            <ReturnReportPrint data={reportData} filters={filters} />
        </div>
    );
};

export default ReturnReport;
