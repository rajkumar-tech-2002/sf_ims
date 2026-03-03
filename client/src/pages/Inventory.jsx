import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Calendar,
    ArrowUpRight,
    ChevronDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

const Inventory = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Expanded mock data to better demonstrate pagination/sorting
    const inventoryData = [
        { id: 'INV-1001', name: 'MacBook Pro M2', category: 'Laptops', stock: 45, status: 'In Stock', location: 'Wh-A1', lastUpdated: '2024-03-01' },
        { id: 'INV-1002', name: 'Sony WH-1000XM5', category: 'Audio', stock: 3, status: 'Low Stock', location: 'Wh-B2', lastUpdated: '2024-03-02' },
        { id: 'INV-1003', name: 'iPad Air M1', category: 'Tablets', stock: 8, status: 'In Stock', location: 'Wh-A3', lastUpdated: '2024-02-28' },
        { id: 'INV-1004', name: 'iPhone 15 Pro', category: 'Phones', stock: 12, status: 'In Stock', location: 'Wh-C1', lastUpdated: '2024-03-01' },
        { id: 'INV-1005', name: 'AirPods Max', category: 'Audio', stock: 0, status: 'Out of Stock', location: 'Wh-B2', lastUpdated: '2024-02-25' },
        { id: 'INV-1006', name: 'Studio Display', category: 'Monitors', stock: 5, status: 'Low Stock', location: 'Wh-D4', lastUpdated: '2024-02-27' },
        { id: 'INV-1007', name: 'Magic Mouse', category: 'Accessories', stock: 154, status: 'In Stock', location: 'Wh-E1', lastUpdated: '2024-03-02' },
        { id: 'INV-1008', name: 'Magic Keyboard', category: 'Accessories', stock: 82, status: 'In Stock', location: 'Wh-E1', lastUpdated: '2024-03-01' },
        { id: 'INV-1009', name: 'USB-C Cable', category: 'Accessories', stock: 245, status: 'In Stock', location: 'Wh-E2', lastUpdated: '2024-02-29' },
        { id: 'INV-1010', name: 'Dell UltraSharp', category: 'Monitors', stock: 14, status: 'In Stock', location: 'Wh-D1', lastUpdated: '2024-03-02' },
        { id: 'INV-1011', name: 'Logitech MX Master', category: 'Accessories', stock: 25, status: 'In Stock', location: 'Wh-E1', lastUpdated: '2024-03-03' },
        { id: 'INV-1012', name: 'Herman Miller Embody', category: 'Furniture', stock: 2, status: 'Low Stock', location: 'Wh-F1', lastUpdated: '2024-03-01' },
    ];

    // Sorting Logic
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-primary-600" /> : <ArrowDown size={12} className="text-primary-600" />;
    };

    // Filter & Search Logic
    const processedData = useMemo(() => {
        let result = inventoryData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return result;
    }, [searchTerm, categoryFilter, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'In Stock': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Low Stock': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Out of Stock': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="section-title">Inventory Control</h1>
                    <p className="text-slate-500 text-base mt-2 font-medium">Precision tracking for your global supply chain assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary group">
                        <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        <span className="hidden sm:inline">Export Datapack</span>
                    </button>
                    <button className="btn btn-primary group">
                        <PlusIcon size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Entry</span>
                    </button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden border-none shadow-premium bg-white">
                {/* Data Access Layer / Toolbar */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-all duration-300" size={18} />
                        <input
                            type="text"
                            placeholder="Universal asset search (ID, Name, SKU)..."
                            className="input-field pl-12 py-3.5 bg-white border-slate-200 focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category:</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 hover:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer shadow-sm"
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option>All</option>
                                    <option>Laptops</option>
                                    <option>Audio</option>
                                    <option>Tablets</option>
                                    <option>Phones</option>
                                    <option>Monitors</option>
                                    <option>Accessories</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-200 hidden xl:block" />

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Density:</span>
                            <select
                                className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-slate-100 shadow-sm"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <div className="px-4 py-2.5 bg-primary-100/50 rounded-xl border border-primary-200">
                            <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Matched: <span className="text-primary-800">{processedData.length} Registry Entries</span></span>
                        </div>
                    </div>
                </div>

                {/* Main DataTable View */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th onClick={() => requestSort('id')} className="th-cell group cursor-pointer hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-2">ID {getSortIcon('id')}</div>
                                </th>
                                <th onClick={() => requestSort('name')} className="th-cell group cursor-pointer hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-2">Asset Name {getSortIcon('name')}</div>
                                </th>
                                <th onClick={() => requestSort('category')} className="th-cell group cursor-pointer hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-2">Category {getSortIcon('category')}</div>
                                </th>
                                <th onClick={() => requestSort('stock')} className="th-cell group cursor-pointer hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-2">Current Stock {getSortIcon('stock')}</div>
                                </th>
                                <th className="th-cell">Status</th>
                                <th className="th-cell">Warehouse</th>
                                <th className="th-cell">Last Sync</th>
                                <th className="th-cell text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.length > 0 ? paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                    <td className="td-cell font-black text-primary-600 selection:bg-primary-100">{item.id}</td>
                                    <td className="td-cell font-black text-slate-900 group-hover:text-primary-700 transition-colors">{item.name}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-primary-400 transition-colors" />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-900">{item.stock}</span>
                                            {item.stock < 10 && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                                        </div>
                                    </td>
                                    <td className="td-cell">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${getStatusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="td-cell font-bold text-slate-600 text-xs tracking-tight">{item.location}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            <Calendar size={12} className="opacity-80" />
                                            {item.lastUpdated}
                                        </div>
                                    </td>
                                    <td className="td-cell text-right pr-6">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                            <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all shadow-hover">
                                                <ArrowUpRight size={16} />
                                            </button>
                                            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Search size={48} className="text-slate-300" />
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No matching archives found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Pagination Controls */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                        <span>PAGE <span className="text-slate-900">{currentPage}</span> OF {totalPages || 1}</span>
                        <div className="h-4 w-px bg-slate-200" />
                        <span>RECORDS <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, processedData.length)}</span></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <PaginationButton
                            icon={<ChevronLeft size={18} />}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        />

                        {/* Dynamic Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all duration-300 border ${currentPage === page
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {page}
                            </button>
                        )).filter((_, i) => i < 5)} {/* Simple cap for demo */}

                        <PaginationButton
                            icon={<ChevronRight size={18} />}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Sub-components
const PaginationButton = ({ icon, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-20 disabled:cursor-not-allowed group"
    >
        <div className="group-active:scale-90 transition-transform">{icon}</div>
    </button>
);

const PlusIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default Inventory;
