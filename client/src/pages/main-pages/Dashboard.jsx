import React, { useState, useEffect } from 'react';
import {
    Package,
    AlertTriangle,
    Layers,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Filter,
    ShoppingCart,
    FileText,
    Truck,
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    Cell,
    LineChart,
    Line,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import api from '../../utils/api';

const StatCard = ({ title, value, icon, color, change, trend }) => (
    <div className="card group hover:-translate-y-1 duration-500 overflow-hidden relative">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                {change && (
                    <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                        <span className="uppercase tracking-tighter">{change}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
                <div className="flex items-baseline gap-1 overflow-hidden">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{value}</h3>
                </div>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
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

    const { summary, activities, trend, topProducts, categories, stockStatus } = data;

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
    const STOCK_COLORS = ['#f43f5e', '#10b981'];

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
            value: `₹${(summary.totalSales || 0).toLocaleString()}`,
            icon: <TrendingUp className="text-emerald-600" size={24} />,
            color: 'bg-emerald-50',
            change: 'Net Revenue',
            trend: 'up'
        },
        {
            title: 'Stock Valuation',
            value: `₹${(summary.stockValue || 0).toLocaleString()}`,
            icon: <Layers className="text-indigo-600" size={24} />,
            color: 'bg-indigo-50',
            change: 'Asset Value',
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Access Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <QuickAccessBtn
                    icon={<Package size={20} />}
                    title="Stock Entry"
                    onClick={() => navigate('/stock-entry')}
                    color="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                />
                <QuickAccessBtn
                    icon={<FileText size={20} />}
                    title="New Invoice"
                    onClick={() => navigate('/invoice')}
                    color="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                />
                <QuickAccessBtn
                    icon={<ShoppingCart size={20} />}
                    title="Purchase"
                    onClick={() => navigate('/purchase-entry')}
                    color="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                />
                <QuickAccessBtn
                    icon={<Truck size={20} />}
                    title="Vendors"
                    onClick={() => navigate('/vendor')}
                    color="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                />
                <QuickAccessBtn
                    icon={<History size={20} />}
                    title="Reports"
                    onClick={() => navigate('/bill-report')}
                    color="hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 1. Inventory Liquidity (Line Chart) - Taking 3/4 width on desktop */}
                <div className="lg:col-span-3 card !p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Throughput</h3>
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">15-Day Revenue Vector</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#2563eb"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Category Distribution (Doughnut) */}
                <div className="card !p-10 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Inventory Spread</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">By Product Category</p>
                    <div className="h-60 w-full relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-slate-900">{categories.length}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Groups</span>
                        </div>
                    </div>
                </div>

                {/* 3. Stock Health (Pie Chart) */}
                <div className="card !p-10 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Sync Health</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Stock Level Matrix</p>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={stockStatus}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {stockStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Top Velocity Products (Bar/Column Chart) - Taking middle space */}
                <div className="lg:col-span-2 card !p-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">High Velocity Units</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Top 5 Turnover Leaders</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={topProducts} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="product_name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#1e293b', fontSize: 10, fontWeight: 900 }}
                                />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total_qty" radius={[8, 8, 0, 0]} barSize={40}>
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Critical Alerts Widget */}
                <div className="card p-10 bg-white border-rose-100 shadow-xl shadow-rose-500/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Alerts</h3>
                    </div>
                    <div className="space-y-6">
                        {summary.lowStockItems > 0 ? (
                            <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Attention Required</p>
                                <div className="text-3xl font-black text-rose-700 leading-none mb-3">
                                    {summary.lowStockItems} <span className="text-sm font-bold text-rose-500 uppercase">Items</span>
                                </div>
                                <p className="text-xs text-slate-600 font-bold mb-6">Inventory units falling below critical safety thresholds.</p>
                                <button
                                    onClick={() => navigate('/daily-report')}
                                    className="w-full py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                                >
                                    Restock Intelligence
                                </button>
                            </div>
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                    <Package size={32} />
                                </div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Inventory Solid</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">All levels optimized</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const QuickAccessBtn = ({ icon, title, onClick, color }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-200 rounded-3xl transition-all duration-300 group ${color}`}
    >
        <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest">{title}</span>
    </button>
);

export default Dashboard;
