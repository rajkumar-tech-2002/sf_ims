import React, { useState } from 'react';
import {
    Calendar,
    Filter,
    FileSearch,
    Printer,
    Search,
    Package,
    ShoppingCart,
    TrendingUp,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import DailyReportPrint from '../../components/reports/DailyReportPrint';

const DailyReport = () => {
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
            const response = await api.get(`/reports/daily?${queryParams}`);
            setReportData(response.data);
            if (response.data.length === 0) {
                showToast('info', 'No activity found for the selected period');
            }
        } catch (error) {
            showToast('error', 'Failed to generate daily report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (reportData.length === 0) {
            showToast('warning', 'Please analyze data before printing');
            return;
        }
        window.print();
    };

    const totalPurchase = reportData.reduce((sum, row) => sum + Number(row.purchase_qty || 0), 0);
    const totalOriginalSold = reportData.reduce((sum, row) => sum + Number(row.original_sold_qty || 0), 0);
    const totalReturn = reportData.reduce((sum, row) => sum + Number(row.return_qty || 0), 0);
    const totalNetSold = reportData.reduce((sum, row) => sum + Number(row.sold_qty || 0), 0);

    const filteredData = reportData.filter(row =>
        row.product_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.product_code.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (row.description && row.description.toLowerCase().includes(tableSearch.toLowerCase()))
    );

    const columns = [
        {
            key: 'serial',
            label: 'SNO',
            render: (_, __, idx) => <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
        },
        {
            key: 'product_code',
            label: 'CODE',
            render: (val) => <span className="text-xs font-mono font-bold text-primary-600">{val}</span>
        },
        {
            key: 'product_name',
            label: 'PRODUCT NAME',
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 uppercase">{val}</span>
                    <span className="text-[10px] text-slate-500 italic uppercase truncate max-w-[200px]">{row.description || '---'}</span>
                </div>
            )
        },
        {
            key: 'current_stock',
            label: 'STOCK',
            className: 'text-center',
            render: (val) => <span className="text-xs font-black text-slate-900">{val}</span>
        },
        {
            key: 'purchase_qty',
            label: 'PURCHASE',
            className: 'text-center',
            render: (val) => (
                <span className={`text-xs font-bold ${val > 0 ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-lg' : 'text-slate-400'}`}>
                    {val > 0 ? `+${val}` : val}
                </span>
            )
        },
        {
            key: 'original_sold_qty',
            label: 'SOLD',
            className: 'text-center',
            render: (val) => (
                <span className={`text-xs font-bold ${val > 0 ? 'text-slate-600 bg-slate-50 px-2 py-1 rounded-lg' : 'text-slate-400'}`}>
                    {val > 0 ? val : val}
                </span>
            )
        },
        {
            key: 'return_qty',
            label: 'RETURN',
            className: 'text-center',
            render: (val) => (
                <span className={`text-xs font-bold ${val > 0 ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded-lg' : 'text-slate-400'}`}>
                    {val > 0 ? val : val}
                </span>
            )
        },
        {
            key: 'sold_qty',
            label: 'NET SOLD',
            className: 'text-center',
            render: (val) => (
                <span className={`text-xs font-bold ${val !== 0 ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-lg' : 'text-slate-400'}`}>
                    {val !== 0 ? val : val}
                </span>
            )
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Daily Inventory Report</h1>
                    <p className="text-slate-500 text-base font-medium">Consolidated view of stock levels and daily transactions.</p>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-3 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    <Printer size={18} /> Print Report
                </button>
            </div>

            {/* Filter Section */}
            <div className="card !p-0 bg-white border-slate-200 shadow-premium overflow-hidden mb-10">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Period Configuration</h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
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
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
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
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><BarChart3 size={22} /> Analyze Inventory</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowUpRight size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Purchases</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalPurchase} Units</h3>
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-3 py-1.5 rounded-full tracking-wider">Inbound</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowDownRight size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Net Sales (Sold - Return)</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalNetSold} Units</h3>
                            <div className="flex gap-4 mt-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Gross: {totalOriginalSold}</span>
                                <span className="text-[10px] font-bold text-amber-600 uppercase">Return: {totalReturn}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-rose-500 uppercase bg-rose-50 px-3 py-1.5 rounded-full tracking-wider">Outbound</div>
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
                    searchPlaceholder="Search products or codes..."
                    emptyMessage="Select date range and analyze to see inventory movement"
                    pagination={{ itemsPerPage: 15 }}
                />
            </div>

            {/* Print Component */}
            <DailyReportPrint data={reportData} filters={filters} />
        </div>
    );
};

export default DailyReport;
