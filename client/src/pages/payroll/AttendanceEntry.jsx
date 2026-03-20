import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const AttendanceEntry = () => {
    const { showToast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [users, setUsers] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsersAndAttendance();
    }, [selectedDate]);

    const fetchUsersAndAttendance = async () => {
        setLoading(true);
        try {
            // Fetch users
            const usersRes = await api.get('/users');
            const employees = usersRes.data.filter(u => u.status !== 'Inactive'); // optional filter based on user fields
            setUsers(employees);

            // Fetch attendance for the month
            const [year, month, day] = selectedDate.split('-');
            const attRes = await api.get(`/payroll/attendance?month=${month}&year=${year}`);
            
            // Filter exactly for the selected date
            const dayRecords = attRes.data.filter(r => {
                const d = new Date(r.date);
                // Adjust for timezone to securely match local YYYY-MM-DD
                const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                return localDate === selectedDate;
            });

            // Map it back
            const newMap = {};
            employees.forEach(emp => {
                const record = dayRecords.find(r => parseInt(r.employee_id) === parseInt(emp.id));
                newMap[emp.id] = record ? record.status : 'Present'; // Default to present
            });
            setAttendanceMap(newMap);

        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('error', 'Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (userId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [userId]: status
        }));
    };

    const handleMarkAll = (status) => {
        const newMap = {};
        users.forEach(emp => newMap[emp.id] = status);
        setAttendanceMap(newMap);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Create batch payload
            const payload = users.map(emp => ({
                employee_id: emp.id,
                date: selectedDate,
                status: attendanceMap[emp.id]
            }));

            // Execute all Promises
            await Promise.all(payload.map(data => api.post('/payroll/attendance', data)));

            showToast('success', 'Attendance synchronized successfully');
            fetchUsersAndAttendance(); // refresh the data visually
        } catch (error) {
            console.error('Error saving attendance:', error);
            showToast('error', 'Failed to save attendance records');
        } finally {
            setSaving(false);
        }
    };

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const columns = [
        {
            key: 'user_name',
            label: 'Employee Name',
            render: (value, user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shadow-sm">
                        {value?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.user_role}</span>
                    </div>
                </div>
            )
        },
        { key: 'user_id', label: 'Login ID', cellClassName: 'font-mono text-slate-500 text-xs' },
        {
            key: 'status',
            label: 'Attendance Status',
            render: (_, user) => {
                const status = attendanceMap[user.id] || 'Present';
                return (
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner w-fit">
                        {['Present', 'Half-Day', 'Absent', 'Paid Leave'].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => handleStatusChange(user.id, s)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-300 min-w-[90px] ${
                                    status === s
                                        ? s === 'Present' ? 'bg-emerald-500 text-white shadow-md ring-1 ring-emerald-600'
                                        : s === 'Half-Day' ? 'bg-amber-500 text-white shadow-md ring-1 ring-amber-600'
                                        : s === 'Absent' ? 'bg-rose-500 text-white shadow-md ring-1 ring-rose-600'
                                        : 'bg-blue-500 text-white shadow-md ring-1 ring-blue-600'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
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
                        <h1 className="section-title text-2xl font-bold text-slate-800">Attendance Registry</h1>
                        <p className="text-slate-500 text-[15px] font-medium">Record and track daily presence across the organization.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => changeDate(-1)} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" size={16} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none shadow-sm cursor-pointer"
                            />
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors" disabled={selectedDate === new Date().toISOString().split('T')[0]}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="card !p-0 overflow-hidden shadow-xl shadow-slate-200/40 border-slate-200/60">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Quick Fill:</span>
                            <button onClick={() => handleMarkAll('Present')} className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Mark All Present</button>
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

                    <div className="px-6 py-5 bg-white border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading || saving}
                            className="btn btn-primary px-8 py-3 text-sm shadow-lg shadow-primary-500/30 flex items-center gap-2 min-w-[200px] justify-center"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Syncing...</span>
                            ) : (
                                <><Save size={18} /> Save Attendance Roll</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceEntry;
