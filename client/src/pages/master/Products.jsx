import React, { useState } from 'react';
import {
    Package,
    Trash2,
    Plus,
    Search,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    Edit3,
    MoreHorizontal,
    Filter
} from 'lucide-react';

const Products = () => {
    const [activeTab, setActiveTab] = useState('all');

    const products = [
        { id: 1, name: 'MacBook Pro M2', sku: 'SKU-001', category: 'Laptops', price: 1999, stock: 45, imageColor: 'bg-blue-500' },
        { id: 2, name: 'Sony WH-1000XM5', sku: 'SKU-002', category: 'Audio', price: 349, stock: 3, imageColor: 'bg-indigo-500' },
        { id: 3, name: 'iPad Air M1', sku: 'SKU-007', category: 'Tablets', price: 599, stock: 8, imageColor: 'bg-purple-500' },
        { id: 4, name: 'iPhone 15 Pro', sku: 'SKU-009', category: 'Phones', price: 999, stock: 12, imageColor: 'bg-slate-800' },
        { id: 5, name: 'AirPods Max', sku: 'SKU-012', category: 'Audio', price: 549, stock: 0, imageColor: 'bg-rose-500' },
        { id: 6, name: 'Studio Display', sku: 'SKU-015', category: 'Monitors', price: 1599, stock: 5, imageColor: 'bg-emerald-500' },
    ];

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div className="space-y-1">
                    <h1 className="section-title text-4xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-slate-500 text-base font-medium">Manage your global inventory specifications and pricing with absolute precision.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary px-8 py-3.5 rounded-[1.25rem] font-black uppercase text-xs tracking-widest gap-2">
                        <Filter size={16} /> Category
                    </button>
                    <button className="btn btn-primary px-8 py-3.5 rounded-[1.25rem] font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary-500/20">
                        <Plus size={20} /> New Product
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard
                    label="Active SKUs"
                    value="1,204"
                    icon={<Package size={24} />}
                    color="bg-primary-50 text-primary-600"
                />
                <MetricCard
                    label="Stock Value"
                    value="$1.2M"
                    icon={<TrendingUp size={24} />}
                    color="bg-emerald-50 text-emerald-600"
                />
                <MetricCard
                    label="Restock Alerts"
                    value="8"
                    icon={<AlertCircle size={24} />}
                    color="bg-rose-50 text-rose-600"
                />
            </div>

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                        {['all', 'active', 'low_stock', 'archived'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 text-xs font-bold rounded-xl capitalize transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white text-slate-900 shadow-md transform scale-105'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Universal product search..."
                            className="input-field pl-12 py-3"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {products.map((product) => (
                        <div key={product.id} className="group card p-0 border-none bg-white shadow-premium overflow-hidden hover:shadow-2xl transition-all duration-500">
                            <div className={`aspect-[16/10] ${product.imageColor} relative flex items-center justify-center p-12 overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Package size={64} className="text-white/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 ease-out" />
                                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <button className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white transition-colors">
                                        <Edit3 size={16} className="text-slate-700" />
                                    </button>
                                    <button className="p-2.5 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white transition-colors">
                                        <MoreHorizontal size={16} className="text-slate-700" />
                                    </button>
                                </div>
                                {product.stock === 0 && (
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{product.name}</h3>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 block">Ref: {product.sku}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900">${product.price}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Per Unit</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{product.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-black uppercase tracking-tight ${product.stock <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                                            {product.stock} Units Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, color }) => (
    <div className="card flex items-center gap-6 p-8 border-none shadow-premium hover:shadow-xl transition-all duration-300">
        <div className={`p-5 rounded-2xl ${color} shadow-sm`}>
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1.5 tracking-tighter">{value}</p>
        </div>
    </div>
);

export default Products;
