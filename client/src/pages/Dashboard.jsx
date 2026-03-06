import React, { useState, useEffect } from 'react';
import {
    Package,
    AlertTriangle,
    Layers,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Filter
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import api from '../utils/api';

const StatCard = ({ title, value, icon, color, change, trend }) => (
    <div className="card group hover:-translate-y-1 duration-500">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">{title}</p>
                <h3 className="text-5xl font-black mt-3 text-slate-900 tracking-tighter">{value}</h3>
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading || !data) {
        return (
            <div className="page-container flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Live Data...</p>
                </div>
            </div>
        );
    }

    const { summary, activities, trend } = data;

    const stats = [
        {
            title: 'Total Products',
            value: summary.totalProducts.toLocaleString(),
            icon: <Package className="text-blue-600" size={24} />,
            color: 'bg-blue-50',
            change: 'Live',
            trend: 'up'
        },
        {
            title: 'Low Stock Items',
            value: summary.lowStockItems,
            icon: <AlertTriangle className="text-amber-600" size={24} />,
            color: 'bg-amber-50',
            change: summary.lowStockItems > 0 ? `${summary.lowStockItems} critical` : 'All clear',
            trend: summary.lowStockItems > 0 ? 'down' : 'up'
        },
        {
            title: 'Total Categories',
            value: summary.totalCategories,
            icon: <Layers className="text-purple-600" size={24} />,
            color: 'bg-purple-50'
        },
        {
            title: 'Total Sales Value',
            value: `₹${summary.totalSales.toLocaleString()}`,
            icon: <TrendingUp className="text-emerald-600" size={24} />,
            color: 'bg-emerald-50',
            change: 'Usage Based',
            trend: 'up'
        },
    ];

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Enterprise Dashboard</h1>
                    <p className="text-slate-500 text-base font-medium">Precision management for your global inventory ecosystem.</p>
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
                <div className="lg:col-span-2 card !p-12 h-full">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Liquidity</h3>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Real-time stock value throughput analysis</p>
                        </div>
                        <div className="flex bg-slate-100 p-2 rounded-2xl">
                            <button className="px-5 py-2 text-xs font-black bg-white text-slate-900 rounded-xl shadow-sm transition-all">Trend</button>
                            <button className="px-5 py-2 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors">Volume</button>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-10 h-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-10">Operational Log</h3>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-1 before:w-0.5 before:-translate-x-px before:bg-slate-100">
                        {activities.map((activity, index) => (
                            <div key={index} className="relative flex items-start gap-4 pl-8">
                                <div className={`absolute left-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ring-2 bg-primary-500 ring-primary-100`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm text-slate-900 font-extrabold truncate">{activity.username}</p>
                                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap ml-2 uppercase tracking-[0.1em]">
                                            {new Date(activity.login_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        "{activity.action}"
                                    </p>
                                    <div className="mt-3 text-[10px] font-black text-primary-600 bg-primary-100/50 px-3 py-1 rounded-lg w-fit uppercase tracking-widest border border-primary-200/50">
                                        {activity.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                                <p className="text-xs font-bold">No recent activity detected</p>
                            </div>
                        )}
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
