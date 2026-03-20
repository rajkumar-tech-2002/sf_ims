import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { Users, Briefcase, Calendar, HandCoins } from 'lucide-react';

const EmployeeManagement = () => {
    const { showToast } = useToast();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payroll/employees');
            setEmployees(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'serial',
            label: 'S.No',
            render: (_, __, index) => <span className="text-xs font-bold text-slate-600">{index + 1}</span>
        },
        {
            key: 'employee_info',
            label: 'Employee Details',
            render: (_, emp) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                        {emp.user_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{emp.user_name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.user_role}</span>
                    </div>
                </div>
            )
        },
        { key: 'user_id', label: 'Emp ID', cellClassName: 'font-mono text-primary-600 font-bold' },
        {
            key: 'department',
            label: 'Department',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-primary-500" />
                    <span className="font-bold text-slate-600">{value || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'salary',
            label: 'Basic Salary',
            render: (_, emp) => (
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <HandCoins size={14} />
                    ₹{emp.basic_salary}
                </div>
            )
        },
        {
            key: 'join_date',
            label: 'Joining Date',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${value === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {value || 'Active'}
                </span>
            )
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Employee Registry</h1>
                        <p className="text-slate-500 text-base font-medium">View and manage payroll information for all staff.</p>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="card !p-0 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={employees}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search employees by ID or Name..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagement;
