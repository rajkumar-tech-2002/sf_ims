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
    History,
    Calendar,
    RotateCcw
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
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, color, change, trend }) => (
    <div className="card group hover:-translate-y-1 duration-500 overflow-hidden relative border border-slate-200">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                {change && (
                    <div className={`flex items-center text-[11px] font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
                <div className="flex items-baseline gap-1 overflow-hidden">
                    <h3 className="card-metric truncate">{value}</h3>
                </div>
            </div>
        </div>
    </div>
);

const User = ({ size, className }) => (
    <div className={`flex items-center justify-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Date filter state
    const today = new Date().toISOString().split('T')[0];
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(fifteenDaysAgo);
    const [endDate, setEndDate] = useState(today);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/dashboard/stats', {
                params: { startDate, endDate }
            });
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [startDate, endDate]);

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
            title: 'Inventory Reach',
            value: summary.totalProducts.toLocaleString(),
            icon: <Package className="text-blue-600" size={24} />,
            color: 'bg-blue-50',
            change: 'Active Items',
            trend: 'up'
        },
        {
            title: 'Net Sold Count',
            value: summary.netSoldCount.toLocaleString(),
            icon: <ShoppingCart className="text-emerald-600" size={24} />,
            color: 'bg-emerald-50',
            change: 'Sold - Restored',
            trend: 'up'
        },
        {
            title: 'Total Sales Net',
            value: `₹${(summary.totalSales || 0).toLocaleString()}`,
            icon: <TrendingUp className="text-primary-600" size={24} />,
            color: 'bg-primary-50',
            change: 'Net Revenue',
            trend: 'up'
        },
        {
            title: 'Returns Summary',
            value: summary.returnCount,
            icon: <RotateCcw className="text-rose-600" size={24} />,
            color: 'bg-rose-50',
            change: `₹${(summary.returnValue || 0).toLocaleString()}`,
            trend: 'down'
        },
        {
            title: 'Low Stock Matrix',
            value: summary.lowStockItems,
            icon: <AlertTriangle className="text-amber-600" size={24} />,
            color: 'bg-amber-50',
            change: summary.lowStockItems > 0 ? 'Critical Alert' : 'Healthy',
            trend: summary.lowStockItems > 0 ? 'down' : 'up'
        }
    ];

    // Filter Quick Actions based on permissions
    const userPermissions = user?.permissions || {};
    const hasPermission = (modId) => userPermissions[modId] && userPermissions[modId] !== 'none';

    const quickActions = [
        { id: 'stock-entry', icon: <Package size={20} />, title: 'Stock Entry', path: '/stock-entry', color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
        { id: 'invoice', icon: <FileText size={20} />, title: 'New Invoice', path: '/invoice', color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
        { id: 'purchase-entry', icon: <ShoppingCart size={20} />, title: 'Purchase', path: '/purchase-entry', color: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200' },
        { id: 'vendor', icon: <Truck size={20} />, title: 'Vendors', path: '/vendor', color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' },
        { id: 'bill-report', icon: <History size={20} />, title: 'Reports', path: '/bill-report', color: 'hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300' }
    ].filter(action => hasPermission(action.id));

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Operational Intelligence</h1>
                    <p className="text-slate-500 text-base font-medium">Real-time performance metrics and inventory flow analysis.</p>
                </div>
                
                {/* Date Picker Section */}
                <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</span>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-[11px] font-bold text-slate-700 outline-none p-1.5 focus:bg-slate-50 rounded-xl transition-all"
                        />
                        <span className="text-slate-300 text-xs">/</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-[11px] font-bold text-slate-700 outline-none p-1.5 focus:bg-slate-50 rounded-xl transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Access Panel */}
            {quickActions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {quickActions.map(action => (
                        <QuickAccessBtn
                            key={action.id}
                            icon={action.icon}
                            title={action.title}
                            onClick={() => navigate(action.path)}
                            color={action.color}
                        />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Net Financial Throughput (Area Chart) */}
                <div className="card !p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Net Financial Vector</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Monthly Revenue Margin (Invoices - Returns)</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-8">
                {/* Top Products and Stock Health */}
                <div className="lg:col-span-2 card !p-8">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Stock Availability Assets</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Current inventory Volume (Units Available)</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={topProducts} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="product_name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total_qty" radius={[6, 6, 0, 0]} barSize={32}>
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alerts Widget */}
                <div className="card p-10 bg-white border-rose-100 shadow-xl shadow-rose-500/5 col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Security & Thresholds</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {summary.lowStockItems > 0 ? (
                            <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Inventory Breach</p>
                                <div className="text-3xl font-black text-rose-700 leading-none mb-3">
                                    {summary.lowStockItems} <span className="text-sm font-bold text-rose-500 uppercase">Items</span>
                                </div>
                                <p className="text-xs text-slate-600 font-bold mb-6">Critical stock levels detected in catalog.</p>
                                <button
                                    onClick={() => navigate('/daily-report')}
                                    className="w-full py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20"
                                >
                                    Restock Plan
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 flex flex-col items-center justify-center bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                    <Package size={24} />
                                </div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Levels Healthy</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">No threshold breaches</p>
                            </div>
                        )}
                        
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 flex flex-col justify-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync Status</p>
                            <div className="text-2xl font-black text-slate-900 mb-1">Authenticated</div>
                            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{user?.user_role || 'Staff Access'}</p>
                        </div>
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
