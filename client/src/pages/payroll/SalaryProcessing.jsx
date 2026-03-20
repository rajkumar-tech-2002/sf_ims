import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, DollarSign, Calculator, Settings } from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const SalaryProcessing = () => {
    const { showToast } = useToast();
    const currentDate = new Date();
    // Default to current month (1-12) and year
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    
    const [users, setUsers] = useState([]);
    const [salarySlips, setSalarySlips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allowancesMap, setAllowancesMap] = useState({});
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, slipsRes] = await Promise.all([
                api.get('/users'),
                api.get(`/payroll/salary?month=${month}&year=${year}`)
            ]);
            
            setUsers(usersRes.data.filter(u => u.status !== 'Inactive'));
            setSalarySlips(slipsRes.data || []);
            
            // Initialize allowances
            const initAllowances = {};
            usersRes.data.forEach(u => initAllowances[u.id] = 0);
            setAllowancesMap(initAllowances);
            
        } catch (error) {
            console.error('Error fetching salary data:', error);
            showToast('error', 'Failed to load salary information');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (employeeId) => {
        setProcessingId(employeeId);
        try {
            await api.post('/payroll/salary/generate', {
                employee_id: employeeId,
                month,
                year,
                allowances: allowancesMap[employeeId] || 0
            });
            showToast('success', 'Salary slip generated successfully');
            fetchData();
        } catch (error) {
            console.error('Error generating salary:', error);
            showToast('error', error.response?.data?.message || 'Failed to generate salary slip');
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkPaid = async (slipId) => {
        try {
            await api.put(`/payroll/salary/${slipId}/status`, { status: 'Paid' });
            showToast('success', 'Salary marked as Paid');
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('error', 'Failed to update payment status');
        }
    };

    const columns = [
        {
            key: 'user_name',
            label: 'Employee Name',
            render: (value, user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold border border-primary-100 shadow-sm">
                        {value?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.user_role}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'basic_salary',
            label: 'Basic Salary',
            render: (value) => (
                <span className="font-mono font-medium text-slate-700 font-semibold">
                    ₹{parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (_, user) => {
                const slip = salarySlips.find(s => parseInt(s.employee_id) === parseInt(user.id));
                if (!slip) {
                    return <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">Not Generated</span>;
                }
                if (slip.payment_status === 'Paid') {
                    return <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Paid</span>;
                }
                return <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-wider shadow-sm">Pending</span>;
            }
        },
        {
            key: 'net_salary',
            label: 'Net Pay',
            render: (_, user) => {
                const slip = salarySlips.find(s => parseInt(s.employee_id) === parseInt(user.id));
                if (!slip) return <span className="text-slate-300">-</span>;
                return (
                    <div className="flex flex-col">
                        <span className="font-mono text-emerald-600 font-black text-sm">
                            ₹{parseFloat(slip.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                            Ded: ₹{slip.deductions}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Action',
            render: (_, user) => {
                const slip = salarySlips.find(s => parseInt(s.employee_id) === parseInt(user.id));
                
                if (!slip) {
                    return (
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Allowances (₹)"
                                className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                                value={allowancesMap[user.id] || ''}
                                onChange={(e) => setAllowancesMap(prev => ({...prev, [user.id]: e.target.value}))}
                            />
                            <button
                                onClick={() => handleGenerate(user.id)}
                                disabled={processingId === user.id}
                                className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md shadow-primary-500/20"
                            >
                                {processingId === user.id ? 'Wait...' : <><Calculator size={14} /> Generate</>}
                            </button>
                        </div>
                    );
                }

                if (slip.payment_status === 'Pending') {
                    return (
                        <button
                            onClick={() => handleMarkPaid(slip.id)}
                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                        >
                            <DollarSign size={14} /> Mark Paid
                        </button>
                    );
                }

                return (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Settled
                    </span>
                );
            }
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen pb-20">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Salary Processing</h1>
                        <p className="text-slate-500 text-[15px] font-medium">Generate monthly slips and manage payroll distribution.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                            <Calendar className="text-primary-500" size={16} />
                            <select 
                                value={month} 
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                {Array.from({length: 12}, (_, i) => (
                                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en-US', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div className="px-3">
                            <select 
                                value={year} 
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="card !p-0 overflow-hidden shadow-xl shadow-slate-200/40 border-slate-200/60">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="text-slate-400" size={18} />
                            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Payroll Roster</h2>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>Total Generated: {salarySlips.length}</span>
                            <span>|</span>
                            <span>Pending: {salarySlips.filter(s => s.payment_status === 'Pending').length}</span>
                        </div>
                    </div>
                    
                    <DataTable
                        columns={columns}
                        data={users}
                        loading={loading}
                        searchTerm=""
                        onSearchChange={() => {}}
                        searchPlaceholder="Search employees..."
                    />
                </div>
            </div>
        </div>
    );
};

export default SalaryProcessing;
