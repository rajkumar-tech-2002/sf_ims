import React from 'react';
import {
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Calendar,
    DollarSign,
    Box,
    Users,
    Filter,
    PieChart
} from 'lucide-react';

const ReportStat = ({ label, value, change, trend, icon, color }) => (
    <div className="card group hover:-translate-y-1 transition-all duration-500">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">{value}</h3>
                <div className={`flex items-center mt-4 text-[11px] font-bold px-2 py-1 rounded-lg w-fit ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    <span>{change} vs last period</span>
                </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

const Reports = () => {
    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="section-title">Intelligence & Analytics</h1>
                    <p className="text-slate-500 text-base mt-2">Data-driven insights to power your strategic logistics decisions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar size={18} /> Last 30 Days
                    </button>
                    <button className="btn btn-primary gap-2">
                        <Download size={18} /> Export Performance
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ReportStat
                    label="Gross Revenue"
                    value="$128,450"
                    change="+14.2%"
                    trend="up"
                    icon={<DollarSign size={20} />}
                    color="bg-emerald-50 text-emerald-600"
                />
                <ReportStat
                    label="Orders Fulfilled"
                    value="1,024"
                    change="+5.1%"
                    trend="up"
                    icon={<Box size={20} />}
                    color="bg-blue-50 text-blue-600"
                />
                <ReportStat
                    label="Customer Growth"
                    value="84"
                    change="-2.4%"
                    trend="down"
                    icon={<Users size={20} />}
                    color="bg-purple-50 text-purple-600"
                />
                <ReportStat
                    label="Operating Margin"
                    value="24.8%"
                    change="+1.2%"
                    trend="up"
                    icon={<TrendingUp size={20} />}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="card p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-none">Sales Velocity</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tight">Units sold per 24h cycle</p>
                        </div>
                        <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                    <div className="aspect-[16/9] bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                        <BarChart3 size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic text-sm">Revenue Distribution Matrix</p>
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
                    </div>
                </div>

                <div className="card p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-none">Inventory Turnover</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tight">Stock lifecycle efficiency</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary-500" />
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                        </div>
                    </div>
                    <div className="aspect-[16/9] bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                        <PieChart size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic text-sm">Category Concentration Indices</p>
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
                    </div>
                </div>
            </div>

            <div className="card p-10 bg-slate-900 border-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 blur-[120px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-primary-500/20" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black text-white mb-2">Automated Report Scheduling</h3>
                        <p className="text-slate-400 text-sm max-w-md">Get your high-level intelligence reports delivered directly to your inbox every Monday at 08:00 AM.</p>
                    </div>
                    <button className="btn btn-primary px-10 py-4 shadow-primary-500/40">
                        Configure Automation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
