import React, { useState, useMemo } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    Filter
} from 'lucide-react';

const EMPTY_ARRAY = [];

const DataTable = ({
    columns,
    data,
    loading = false,
    searchTerm = '',
    onSearchChange,
    searchPlaceholder = "Search...",
    filters = EMPTY_ARRAY,
    pagination = { itemsPerPage: 10 },
    actions = null,
    emptyMessage = "No records found"
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(pagination.itemsPerPage);

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

    const processedData = useMemo(() => {
        let result = [...data];

        // Search logic handled by parent via searchTerm prop? 
        // Or internal search if onSearchChange not provided?
        // Let's keep it flexible. If onSearchChange is provided, parent handles search.
        // Otherwise, this component could handle it, but for custom filtering it's better if parent does it.
        // For now, let's assume data passed in is already filtered by search if needed.

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [data, sortConfig]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="card !p-0 overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-all duration-300" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="input-field pl-12 py-3.5 bg-white border-slate-200 focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            onSearchChange && onSearchChange(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    {filters.map((filter, index) => (
                        <div key={filter.label || index} className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filter.label}:</span>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-slate-700 hover:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer shadow-sm"
                                    value={filter.value}
                                    onChange={(e) => {
                                        filter.onChange(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {filter.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    ))}

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
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="px-4 py-2.5 bg-primary-100/50 rounded-xl border border-primary-200">
                        <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Matched: <span className="text-primary-800">{processedData.length} Records</span></span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable !== false && requestSort(col.key)}
                                    className={`th-cell group ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-100/50' : ''} transition-colors ${col.className || ''}`}
                                >
                                    <div className={`flex items-center gap-2 ${col.headerClassName || ''}`}>
                                        {col.label}
                                        {col.sortable !== false && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="th-cell text-right pr-10">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Archives...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? paginatedData.map((item, index) => (
                            <tr key={item.id || index} className="tr-body tr-zebra group">
                                {columns.map((col) => (
                                    <td key={col.key} className={`td-cell ${col.cellClassName || ''}`}>
                                        {col.render ? col.render(item[col.key], item, (currentPage - 1) * itemsPerPage + index) : item[col.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="td-cell text-right pr-6">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                            {actions(item)}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <Search size={48} className="text-slate-300" />
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                    <span>PAGE <span className="text-slate-900">{currentPage}</span> OF {totalPages || 1}</span>
                    <div className="h-4 w-px bg-slate-200" />
                    <span>RECORDS <span className="text-slate-900">{Math.max(0, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, processedData.length)}</span></span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all duration-300 border ${currentPage === pageNum
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-20 disabled:cursor-not-allowed group"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
