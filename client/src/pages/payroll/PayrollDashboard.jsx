import React, { useState, useEffect } from 'react';
import { 
    Users, 
    CalendarCheck, 
    CalendarX, 
    TrendingUp, 
    UserMinus, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const PIE_COLORS = {
    'Present': '#10b981', // emerald
    'Absent': '#f43f5e',  // rose
    'Half-Day': '#f59e0b', // amber
    'Paid Leave': '#3b82f6' // blue
};

const StatCard = ({ title, value, icon, color, change, trend }) => (
    <div className="card group hover:-translate-y-1 duration-500 overflow-hidden relative border border-slate-200">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${color}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                {change && (
                    <div className={`flex items-center text-[11px] font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
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

const PayrollDashboard = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        todayLeave: 0
    });
    
    // Exact month picker for the dashboard mapping
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    
    const [pieData, setPieData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [topAbsentees, setTopAbsentees] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedMonth, selectedYear]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const todayRaw = new Date();
            const todayString = new Date(todayRaw.getTime() - todayRaw.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            const isCurrentMonth = (todayRaw.getMonth() + 1 === selectedMonth && todayRaw.getFullYear() === selectedYear);

            const [usersRes, attRes] = await Promise.all([
                api.get('/users'),
                api.get(`/payroll/attendance?month=${selectedMonth}&year=${selectedYear}`)
            ]);

            const activeUsers = usersRes.data.filter(u => u.status !== 'Inactive');
            const totalEmps = activeUsers.length;
            const records = attRes.data;

            let presentCount = 0;
            let absentCount = 0;
            let halfDayCount = 0;
            let leaveCount = 0;

            const absentCountsByEmpId = {};
            const dailyAbsenceTrend = {};

            // Initialize daily trend for chart
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const dStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                dailyAbsenceTrend[dStr] = 0;
            }

            if (isCurrentMonth) {
                const todayRecords = records.filter(r => {
                    const d = new Date(r.date);
                    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                    return localDate === todayString;
                });

                const todayStatuses = {};
                activeUsers.forEach(u => todayStatuses[u.id] = 'Present');
                todayRecords.forEach(r => todayStatuses[r.employee_id] = r.status);

                Object.values(todayStatuses).forEach(status => {
                    if (status === 'Present') presentCount++;
                    else if (status === 'Absent') absentCount++;
                    else if (status === 'Half-Day') halfDayCount++;
                    else if (status === 'Paid Leave') leaveCount++;
                });
            }

            records.forEach(r => {
                const d = new Date(r.date);
                const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                
                let absenceVal = 0;
                if (r.status === 'Absent') absenceVal = 1;
                else if (r.status === 'Half-Day') absenceVal = 0.5;

                if (absenceVal > 0) {
                    if (!absentCountsByEmpId[r.employee_id]) absentCountsByEmpId[r.employee_id] = 0;
                    absentCountsByEmpId[r.employee_id] += absenceVal;

                    if (dailyAbsenceTrend[localDate] !== undefined) {
                        dailyAbsenceTrend[localDate] += absenceVal;
                    }
                }
                
                if (r.status === 'Paid Leave') {
                     if (!absentCountsByEmpId[r.employee_id]) absentCountsByEmpId[r.employee_id] = 0;
                     absentCountsByEmpId[r.employee_id] += 1;
                     
                     if (dailyAbsenceTrend[localDate] !== undefined) {
                         dailyAbsenceTrend[localDate] += 1;
                     }
                }
            });

            const newPieData = [
                { name: 'Present', value: presentCount },
                { name: 'Absent', value: absentCount },
                { name: 'Half-Day', value: halfDayCount },
                { name: 'Paid Leave', value: leaveCount }
            ].filter(d => d.value > 0);
            
            const newTrendData = Object.keys(dailyAbsenceTrend).map(dateStr => ({
                day: parseInt(dateStr.split('-')[2]),
                Leaves: dailyAbsenceTrend[dateStr]
            }));

            const sortedAbsentees = Object.keys(absentCountsByEmpId)
                .map(empId => {
                    const emp = activeUsers.find(u => parseInt(u.id) === parseInt(empId));
                    return {
                        id: empId,
                        name: emp ? emp.user_name : 'Unknown',
                        role: emp ? emp.user_role : '',
                        count: absentCountsByEmpId[empId]
                    };
                })
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setStats({
                totalEmployees: totalEmps,
                todayPresent: presentCount,
                todayAbsent: absentCount,
                todayLeave: leaveCount + halfDayCount
            });
            setPieData(newPieData);
            setTrendData(newTrendData);
            setTopAbsentees(sortedAbsentees);

        } catch (error) {
            console.error('Failed to load dashboard data', error);
            showToast('error', 'Error loading dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="page-container flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Live Data...</p>
            </div>
        </div>
    );

    const statCardsData = [
        {
            title: 'Total Personnel',
            value: stats.totalEmployees,
            icon: <Users className="text-indigo-600" size={24} />,
            color: 'bg-indigo-50 text-indigo-600',
            change: 'Active Roster',
            trend: 'up'
        },
        {
            title: 'Present Today',
            value: stats.todayPresent,
            icon: <CalendarCheck className="text-emerald-600" size={24} />,
            color: 'bg-emerald-50 text-emerald-600',
            change: 'Available',
            trend: 'up'
        },
        {
            title: 'Absent Today',
            value: stats.todayAbsent,
            icon: <CalendarX className="text-rose-600" size={24} />,
            color: 'bg-rose-50 text-rose-600',
            change: stats.todayAbsent > 0 ? 'Critical' : 'Nominal',
            trend: stats.todayAbsent > 0 ? 'down' : 'up'
        },
        {
            title: 'On Leave',
            value: stats.todayLeave,
            icon: <TrendingUp className="text-amber-600" size={24} />,
            color: 'bg-amber-50 text-amber-600',
            change: 'Approved',
            trend: 'down'
        }
    ];

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Operational Intelligence</h1>
                    <p className="text-slate-500 text-base font-medium">Real-time attendance metrics and payroll insights.</p>
                </div>
                
                {/* Date Picker Section mimicking Inventory Dashboard */}
                <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</span>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-transparent text-[11px] font-bold text-slate-700 outline-none p-1.5 focus:bg-slate-50 rounded-xl transition-all cursor-pointer"
                        >
                            {Array.from({length: 12}, (_, i) => (
                                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en-US', { month: 'short' })}</option>
                            ))}
                        </select>
                        <span className="text-slate-300 text-xs">/</span>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-transparent text-[11px] font-bold text-slate-700 outline-none p-1.5 focus:bg-slate-50 rounded-xl transition-all cursor-pointer"
                        >
                            {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
                {statCardsData.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
                {/* Monthly Leave Vector (Area Chart) copying Inventory Design */}
                <div className="card !p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Absence Vector</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Total operational downtime per day (Leaves + Absences)</p>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAbsence" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    allowDecimals={false}
                                />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Leaves" 
                                    stroke="#f43f5e" 
                                    strokeWidth={3} 
                                    fillOpacity={1}
                                    fill="url(#colorAbsence)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-8">
                {/* Today's Distribution (Pie Chart) adapted for card !p-8 flow */}
                <div className="lg:col-span-2 card !p-8">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Live Status Assets</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Current attendance snapshot distribution</p>
                    <div className="h-64 w-full">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontWeight: 800 }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="text-xs uppercase tracking-widest font-bold">No Records Today</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts/Top Leaves Widget adapted from Inventory Alerts Widget */}
                <div className="card p-10 bg-white border-rose-100 shadow-xl shadow-rose-500/5 col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                            <UserMinus size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Leave Anomalies</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {topAbsentees.length > 0 ? topAbsentees.map((emp, idx) => (
                            <div key={emp.id} className="p-4 bg-rose-50/40 rounded-3xl border border-rose-100/50 flex items-center justify-between transition-all hover:bg-rose-50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white border border-rose-100 flex items-center justify-center text-xs font-black text-rose-500 shadow-sm">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-sm leading-tight">{emp.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.role}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black text-rose-600 leading-none">{emp.count}</span>
                                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Days Off</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 flex flex-col items-center justify-center bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                    <CalendarCheck size={24} />
                                </div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Absences Healthy</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">No threshold breaches this month</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PayrollDashboard;
