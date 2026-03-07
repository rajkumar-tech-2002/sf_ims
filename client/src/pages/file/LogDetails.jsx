import React, { useState, useEffect } from 'react';
import { History, Shield, Calendar, User, Activity } from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const LogDetails = () => {
    const { showToast } = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            setLogs(response.data);
        } catch (err) {
            console.error('Failed to fetch logs', err);
            showToast('error', 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            key: 'username',
            label: 'User',
            render: (value, log) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">
                        {value?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{value}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{log.role}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'action',
            label: 'Activity',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Activity size={12} className="text-primary-500" />
                    <span className="text-xs font-medium text-slate-600">{value}</span>
                </div>
            )
        },
        {
            key: 'login_date',
            label: 'Timestamp',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-primary-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {new Date(value).toLocaleString()}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="section-title text-2xl font-bold text-slate-800">Audit Logs</h1>
                    <p className="text-slate-500 text-base font-medium">Real-time monitoring of system access and activity.</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">System Status</p>
                        <p className="text-sm font-bold text-primary-900">Secure & Online</p>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredLogs}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search audit events (User, Action)..."
                emptyMessage="No activity logs found"
                pagination={{ itemsPerPage: 20 }}
            />
        </div>
    );
};

export default LogDetails;
