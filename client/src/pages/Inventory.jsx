import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ArrowUpDown,
    ArrowUpRight,
    Calendar,
    AlertCircle,
    ChevronDown,
    PlusIcon
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';

const Inventory = () => {
    const { showToast } = useToast();
    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Expanded mock data
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'In Stock': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Low Stock': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Out of Stock': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const columns = [
        {
            key: 'id',
            label: 'ID',
            cellClassName: 'font-black text-primary-600 selection:bg-primary-100'
        },
        {
            key: 'name',
            label: 'Asset Name',
            cellClassName: 'font-black text-slate-900 group-hover:text-primary-700 transition-colors'
        },
        {
            key: 'category',
            label: 'Category',
            render: (value) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-primary-400 transition-colors" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{value}</span>
                </div>
            )
        },
        {
            key: 'stock',
            label: 'Current Stock',
            render: (value) => (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">{value}</span>
                    {value < 10 && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${getStatusStyle(value)}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'location',
            label: 'Warehouse',
            cellClassName: 'font-bold text-slate-600 text-xs tracking-tight'
        },
        {
            key: 'lastUpdated',
            label: 'Last Sync',
            render: (value) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <Calendar size={12} className="opacity-80" />
                    {value}
                </div>
            )
        }
    ];

    const actions = (item) => (
        <div className="flex items-center justify-end gap-1">
            <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all shadow-hover">
                <ArrowUpRight size={16} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                <MoreHorizontal size={16} />
            </button>
        </div>
    );

    const filteredData = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, categoryFilter, inventoryData]);

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="section-title">Inventory Control</h1>
                    <p className="text-slate-500 text-base mt-2 font-medium">Precision tracking for your global supply chain assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="btn btn-secondary group"
                        onClick={() => showToast('info', 'Exporting datapack...')}
                    >
                        <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        <span className="hidden sm:inline">Export Datapack</span>
                    </button>
                    <button
                        className="btn btn-primary group"
                        onClick={() => showToast('info', 'Add Entry feature coming soon!')}
                    >
                        <PlusIcon size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Entry</span>
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Universal asset search (ID, Name, SKU)..."
                filters={[
                    {
                        label: 'Category',
                        value: categoryFilter,
                        onChange: setCategoryFilter,
                        options: [
                            { label: 'All', value: 'All' },
                            { label: 'Laptops', value: 'Laptops' },
                            { label: 'Audio', value: 'Audio' },
                            { label: 'Tablets', value: 'Tablets' },
                            { label: 'Phones', value: 'Phones' },
                            { label: 'Monitors', value: 'Monitors' },
                            { label: 'Accessories', value: 'Accessories' },
                        ]
                    }
                ]}
                actions={actions}
                emptyMessage="No matching archives found"
            />
        </div>
    );
};

// Reusable Sub-components (Keep only if needed for other parts, but PlusIcon is already in Lucide as Plus)
const CustomPlusIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default Inventory;
