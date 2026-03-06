import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Filter,
    FileSearch,
    Printer,
    X,
    ChevronRight,
    Search,
    IndianRupee,
    ChevronDown
} from 'lucide-react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';
import BillReportPrint from '../components/BillReportPrint';

const BillReport = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [products, setProducts] = useState([]);
    const [descriptions, setDescriptions] = useState([]);
    const [tableSearch, setTableSearch] = useState('');

    // Filter State
    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        productName: 'All',
        description: 'All'
    });

    // Fetch Unique Products on Mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/invoices/unique-products');
                setProducts(['All', ...response.data]);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    // Fetch Descriptions when Product Changes
    useEffect(() => {
        const fetchDescriptions = async () => {
            if (filters.productName === 'All') {
                setDescriptions([]);
                setFilters(prev => ({ ...prev, description: 'All' }));
                return;
            }

            try {
                const response = await api.get(`/invoices/descriptions/${filters.productName}`);
                setDescriptions(['All', ...response.data]);
                setFilters(prev => ({ ...prev, description: 'All' }));
            } catch (error) {
                console.error('Error fetching descriptions:', error);
            }
        };
        fetchDescriptions();
    }, [filters.productName]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await api.get(`/invoices/report?${queryParams}`);
            setReportData(response.data);
            if (response.data.length === 0) {
                showToast('info', 'No records found for the selected filters');
            }
        } catch (error) {
            showToast('error', 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (reportData.length === 0) {
            showToast('warning', 'Please show the report before printing');
            return;
        }
        window.print();
    };

    const columns = [
        {
            key: 'serial',
            label: 'SNO',
            render: (_, __, idx) => <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
        },
        {
            key: 'invoice_date',
            label: 'DATE',
            render: (val) => <span className="text-xs font-bold text-slate-600">{new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        },
        {
            key: 'invoice_no',
            label: 'BILL NO',
            render: (val) => <span className="text-xs font-bold text-slate-600">{val}</span>
        },
        {
            key: 'customer_name',
            label: 'CUSTOMER NAME',
            render: (val) => <span className="text-xs font-bold text-slate-600">{val}</span>
        },
        {
            key: 'product_name',
            label: 'PRODUCT NAME',
            render: (val) => <span className="text-xs font-bold text-slate-600">{val}</span>
        },
        {
            key: 'description',
            label: 'DESCRIPTION',
            render: (val) => <span className="text-xs font-bold text-slate-600">{val}</span>
        },
        {
            key: 'gst_percent',
            label: 'GST %',
            render: (val) => <span className="text-xs font-bold text-slate-600">{val}%</span>
        },
        {
            key: 'taxable_amount',
            label: 'AMOUNT',
            render: (val) => <span className="text-xs font-bold text-slate-600">₹{parseFloat(val).toLocaleString()}</span>
        },
        {
            key: 'total_amount',
            label: 'GRAND TOTAL',
            render: (_, row) => <span className="font-black text-slate-900">₹{parseFloat(row.grand_total).toLocaleString()}</span>
        }
    ];

    const totalGrand = reportData.reduce((sum, row) => sum + parseFloat(row.grand_total || 0), 0);
    const filteredData = reportData.filter(row =>
        row.customer_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.invoice_no.toLowerCase().includes(tableSearch.toLowerCase()) ||
        row.product_name.toLowerCase().includes(tableSearch.toLowerCase())
    );

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Bill Report</h1>
                    <p className="text-slate-500 text-base font-medium">Enterprise-grade analytics for your completed sales cycles.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="btn btn-secondary h-12 gap-2 shadow-sm px-8 hover:shadow-md transition-all font-bold">
                        <Printer size={18} /> Print Report
                    </button>
                </div>
            </div>

            <div className="card !p-0 bg-white border-slate-200/60 shadow-premium relative overflow-hidden ring-1 ring-slate-100">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Report Filter Console</h2>
                </div>
                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-end">
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500" /> From Date
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    type="date"
                                    className="input-field pl-12 h-14 font-semibold text-slate-800 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    value={filters.fromDate}
                                    onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500" /> To Date
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    type="date"
                                    className="input-field pl-12 h-14 font-semibold text-slate-800 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    value={filters.toDate}
                                    onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Filter size={14} className="text-primary-500" /> Product Category
                            </label>
                            <div className="relative group">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <select
                                    className="input-field pl-12 h-14 appearance-none cursor-pointer font-semibold text-slate-800 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    value={filters.productName}
                                    onChange={(e) => handleFilterChange('productName', e.target.value)}
                                >
                                    {products.map((p, idx) => (
                                        <option key={idx} value={p}>{p === 'All' ? 'All Products' : p}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Search size={14} className="text-primary-500" /> Item Description
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <select
                                    className="input-field pl-12 h-14 appearance-none cursor-pointer font-semibold text-slate-800 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                    value={filters.description}
                                    onChange={(e) => handleFilterChange('description', e.target.value)}
                                >
                                    <option value="All">All Variations</option>
                                    {descriptions.map((d, idx) => (
                                        <option key={idx} value={d} className={d === 'All' ? 'font-bold' : ''}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="lg:col-span-4 xl:col-span-1">
                            <button
                                onClick={fetchReport}
                                disabled={loading}
                                className="w-full btn btn-primary h-14 text-sm uppercase tracking-[0.2em] font-black flex items-center gap-3 justify-center shadow-xl shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><FileSearch size={22} /> Analyze</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights Dashboard Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <FileSearch size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Intelligence Log</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Cross-referenced historical archives</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-white p-7 px-10 rounded-[2.5rem] border border-slate-200 shadow-premium group hover:border-primary-200 transition-all duration-500">
                        <div className="flex flex-col items-end border-r border-slate-100 pr-10">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2 text-right">Records Found</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{filteredData.length}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-2 text-right">Total Net Volume</span>
                            <span className="text-4xl font-black text-emerald-600 tracking-tighter flex items-center">
                                <IndianRupee size={24} className="mr-1 opacity-70" />
                                {totalGrand.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        loading={loading}
                        searchTerm={tableSearch}
                        onSearchChange={setTableSearch}
                        searchPlaceholder="Query bill archives..."
                        emptyMessage="Execute analysis to retrieve business intelligence"
                        pagination={{ itemsPerPage: 10 }}
                    />
                </div>
            </div>

            {/* System Generated Print Matrix */}
            <BillReportPrint data={reportData} filters={filters} />
        </div>
    );
};

export default BillReport;
