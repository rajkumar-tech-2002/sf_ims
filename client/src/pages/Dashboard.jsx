import React from 'react';
import {
    Package,
    AlertTriangle,
    Layers,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Plus,
    Filter
} from 'lucide-react';

const StatCard = ({ title, value, icon, color, change, trend }) => (
    <div className="card group hover:-translate-y-1 duration-500">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-4xl font-bold mt-3 text-slate-900 tracking-tight">{value}</h3>
                {change && (
                    <div className={`flex items-center mt-4 text-xs font-bold px-2 py-1 rounded-lg w-fit ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        <span>{change} vs last month</span>
                    </div>
                )}
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const stats = [
        {
            title: 'Total Products',
            value: '1,284',
            icon: <Package className="text-blue-600" size={24} />,
            color: 'bg-blue-50',
            change: '12%',
            trend: 'up'
        },
        {
            title: 'Low Stock Items',
            value: '12',
            icon: <AlertTriangle className="text-amber-600" size={24} />,
            color: 'bg-amber-50',
            change: '2 items',
            trend: 'down'
        },
        {
            title: 'Total Categories',
            value: '24',
            icon: <Layers className="text-purple-600" size={24} />,
            color: 'bg-purple-50'
        },
        {
            title: 'Total Sales',
            value: '$42,500',
            icon: <TrendingUp className="text-emerald-600" size={24} />,
            color: 'bg-emerald-50',
            change: '8.5%',
            trend: 'up'
        },
    ];

    const recentActivities = [
        { id: 1, type: 'stock_in', product: 'MacBook Pro M2', qty: '+50', user: 'Admin', time: '2 hours ago' },
        { id: 2, type: 'sale', product: 'iPhone 15 Pro', qty: '-3', user: 'Staff Sarah', time: '4 hours ago' },
        { id: 3, id_str: 'ACT-902', type: 'low_stock', product: 'Sony WH-1000XM5', qty: '3 units left', user: 'System', time: '6 hours ago' },
        { id: 4, type: 'stock_in', product: 'Samsung S23 Ultra', qty: '+20', user: 'Manager Mike', time: 'Yesterday' },
    ];

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="section-title">Enterprise Dashboard</h1>
                    <p className="text-slate-500 text-base mt-2">Precision management for your global inventory ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary gap-2">
                        <Filter size={18} /> Filters
                    </button>
                    <button className="btn btn-primary gap-2">
                        <Plus size={18} /> New Allocation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 card p-10 h-full">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Inventory Liquidity</h3>
                            <p className="text-slate-400 text-sm mt-1">Real-time stock value throughput analysis</p>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl">
                            <button className="px-4 py-1.5 text-xs font-bold bg-white text-slate-900 rounded-lg shadow-sm">Trend</button>
                            <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">Volume</button>
                        </div>
                    </div>
                    <div className="h-80 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                        <TrendingUp size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-semibold italic text-sm">Interactive Visualization Engine Placeholder</p>
                    </div>
                </div>

                <div className="card p-10 h-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-10">Operational Log</h3>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-1 before:w-0.5 before:-translate-x-px before:bg-slate-100">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="relative flex items-start gap-4 pl-8">
                                <div className={`absolute left-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ring-2 ${activity.type === 'stock_in' ? 'bg-emerald-500 ring-emerald-100' :
                                        activity.type === 'sale' ? 'bg-blue-500 ring-blue-100' : 'bg-amber-500 ring-amber-100'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm text-slate-900 font-bold truncate">{activity.product}</p>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2 uppercase tracking-tighter">{activity.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Action: <span className="font-semibold text-slate-700">{activity.type.replace('_', ' ')}</span> by {activity.user}
                                    </p>
                                    <div className="mt-2 text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md w-fit">
                                        {activity.qty}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-10 btn btn-secondary text-xs uppercase tracking-widest font-bold">
                        Full Audit Trail
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
