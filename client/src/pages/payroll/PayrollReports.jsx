import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Users, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const PayrollReports = () => {
    const { showToast } = useToast();
    const currentDate = new Date();
    
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [activeTab, setActiveTab] = useState('attendance');
    const [loading, setLoading] = useState(false);
    
    // Data states
    const [users, setUsers] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [salarySlips, setSalarySlips] = useState([]);
    
    useEffect(() => {
        fetchReportData();
    }, [selectedMonth, selectedYear]);
    
    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [usersRes, attRes, salaryRes] = await Promise.all([
                api.get('/users'),
                api.get(`/payroll/attendance?month=${selectedMonth}&year=${selectedYear}`),
                api.get(`/payroll/salary?month=${selectedMonth}&year=${selectedYear}`)
            ]);
            
            setUsers(usersRes.data.filter(u => u.status !== 'Inactive'));
            setAttendanceRecords(attRes.data || []);
            setSalarySlips(salaryRes.data || []);
            
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToast('error', 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };
    
    // Process Attendance Data
    const attendanceSummary = users.map(user => {
        const userRecords = attendanceRecords.filter(r => parseInt(r.employee_id) === parseInt(user.id));
        let present = 0, absent = 0, halfDay = 0, paidLeave = 0;
        
        userRecords.forEach(r => {
            if (r.status === 'Present') present++;
            else if (r.status === 'Absent') absent++;
            else if (r.status === 'Half-Day') halfDay++;
            else if (r.status === 'Paid Leave') paidLeave++;
        });
        
        return {
            ...user,
            present,
            absent,
            halfDay,
            paidLeave,
            totalLogged: userRecords.length
        };
    });
    
    // Process Salary Data
    const salarySummary = users.map(user => {
        const slip = salarySlips.find(s => parseInt(s.employee_id) === parseInt(user.id));
        return {
            ...user,
            hasSlip: !!slip,
            basic_salary: slip ? slip.basic_salary : user.basic_salary,
            allowances: slip ? slip.allowances : 0,
            deductions: slip ? slip.deductions : 0,
            net_salary: slip ? slip.net_salary : 0,
            payment_status: slip ? slip.payment_status : 'Not Generated'
        };
    });

    const attendanceColumns = [
        {
            key: 'user_name',
            label: 'Employee Name',
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{value}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.user_role}</span>
                </div>
            )
        },
        {
            key: 'present',
            label: 'Present (Days)',
            render: (value) => <span className="font-black text-emerald-600">{value}</span>
        },
        {
            key: 'absent',
            label: 'Absent',
            render: (value) => <span className="font-black text-rose-600">{value}</span>
        },
        {
            key: 'halfDay',
            label: 'Half-Days',
            render: (value) => <span className="font-black text-amber-600">{value}</span>
        },
        {
            key: 'paidLeave',
            label: 'Leaves Paid',
            render: (value) => <span className="font-black text-blue-600">{value}</span>
        },
        {
            key: 'totalLogged',
            label: 'Recorded Entry',
            render: (value) => <span className="font-mono text-slate-500 font-bold">{value} days</span>
        }
    ];

    const salaryColumns = [
        {
            key: 'user_name',
            label: 'Employee Name',
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{value}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.user_role}</span>
                </div>
            )
        },
        {
            key: 'basic_salary',
            label: 'Basic Pay',
            render: (value) => <span className="font-mono text-slate-600">₹{parseFloat(value || 0).toLocaleString()}</span>
        },
        {
            key: 'allowances',
            label: 'Allowances',
            render: (value) => <span className="font-mono text-emerald-600">+ ₹{parseFloat(value || 0).toLocaleString()}</span>
        },
        {
            key: 'deductions',
            label: 'Deductions',
            render: (value) => <span className="font-mono text-rose-600">- ₹{parseFloat(value || 0).toLocaleString()}</span>
        },
        {
            key: 'net_salary',
            label: 'Net Disbursed',
            render: (value, row) => row.hasSlip ? <span className="font-mono font-black text-primary-600 text-sm">₹{parseFloat(value || 0).toLocaleString()}</span> : <span className="text-slate-300">-</span>
        },
        {
            key: 'payment_status',
            label: 'Status',
            render: (value) => (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    value === 'Paid' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                    value === 'Pending' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                    'bg-slate-100 text-slate-500'
                }`}>
                    {value}
                </span>
            )
        }
    ];

    const exportToCSV = () => {
        let csvContent = "";
        
        if (activeTab === 'attendance') {
            csvContent += "Employee,Role,Present,Absent,Half-Days,Paid Leaves,Total Logged\n";
            attendanceSummary.forEach(row => {
                csvContent += `"${row.user_name}","${row.user_role}",${row.present},${row.absent},${row.halfDay},${row.paidLeave},${row.totalLogged}\n`;
            });
        } else {
            csvContent += "Employee,Role,Basic Salary,Allowances,Deductions,Net Salary,Payment Status\n";
            salarySummary.forEach(row => {
                csvContent += `"${row.user_name}","${row.user_role}",${row.basic_salary},${row.allowances},${row.deductions},${row.net_salary},"${row.payment_status}"\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `payroll_${activeTab}_report_${selectedYear}_${selectedMonth}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-1">
                    <h1 className="section-title text-2xl font-bold text-slate-800">Payroll Reports</h1>
                    <p className="text-slate-500 text-base font-medium">Comprehensive analytics and tabular historical data.</p>
                </div>
                
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

            <div className="card !p-0 mt-4 overflow-hidden shadow-xl shadow-slate-200/40 border-slate-200/60">
                {/* Tabs Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 pt-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`px-5 py-3 text-sm font-bold tracking-wide uppercase transition-all border-b-2 rounded-t-xl ${
                                activeTab === 'attendance'
                                    ? 'border-primary-500 text-primary-600 bg-white shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            <span className="flex items-center gap-2"><Users size={16} /> Attendance Log</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('salary')}
                            className={`px-5 py-3 text-sm font-bold tracking-wide uppercase transition-all border-b-2 rounded-t-xl ${
                                activeTab === 'salary'
                                    ? 'border-emerald-500 text-emerald-600 bg-white shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            <span className="flex items-center gap-2"><TrendingUp size={16} /> Salary Rolls</span>
                        </button>
                    </div>
                    
                    <div className="pb-3 pr-2">
                         <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-slate-800/20"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white">
                    {activeTab === 'attendance' ? (
                        <DataTable
                            columns={attendanceColumns}
                            data={attendanceSummary}
                            loading={loading}
                            searchTerm=""
                            onSearchChange={() => {}}
                        />
                    ) : (
                        <DataTable
                            columns={salaryColumns}
                            data={salarySummary}
                            loading={loading}
                            searchTerm=""
                            onSearchChange={() => {}}
                        />
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default PayrollReports;
