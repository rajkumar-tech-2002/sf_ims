import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, Users, Phone, Lock, Eye, EyeOff, Save, Trash2, Edit2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, User, Briefcase, GraduationCap, Hash } from 'lucide-react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';

const UserCreation = () => {
    const { showToast, confirmToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showTable, setShowTable] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        user_name: '',
        user_id: '',
        password: '',
        user_role: 'Staff',
        department: '',
        contact: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/add', formData);
            showToast('success', 'User created successfully');
            setFormData({
                user_name: '',
                user_id: '',
                password: '',
                user_role: 'Staff',
                department: '',
                contact: ''
            });
            fetchUsers();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = (id) => {
        confirmToast('Are you sure you want to delete this user?', async () => {
            try {
                await api.delete(`/users/${id}`);
                showToast('success', 'User deleted successfully');
                fetchUsers();
            } catch (error) {
                showToast('error', 'Failed to delete user');
            }
        });
    };

    const columns = [
        {
            key: 'serial',
            label: 'S.No',
            render: (value, row, index) => (
                <span className="text-xs font-bold text-slate-600">
                    {index + 1}
                </span>
            )
        },
        {
            key: 'user_name',
            label: 'User Info',
            render: (value, user) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold border border-primary-100">
                        {value?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{value}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.user_role}</span>
                    </div>
                </div>
            )
        },
        { key: 'user_id', label: 'User ID', cellClassName: 'font-mono text-primary-600 font-bold' },
        {
            key: 'department',
            label: 'Department',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Shield size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{value || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Contact',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{value || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {value || 'Active'}
                </span>
            )
        }
    ];

    return (
        <div className="page-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="section-title text-2xl font-bold text-slate-800">User Registry</h1>
                    <p className="text-slate-500 mt-2 font-medium">Create and manage access for your system personnel.</p>
                </div>
                <button
                    onClick={() => setShowTable(!showTable)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                    ${showTable
                            ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            : 'bg-white text-primary-600 border-primary-100 hover:border-primary-300 hover:bg-primary-50'}`}
                >
                    {showTable ? <><ChevronUp size={20} /> Hide Registry</> : <><ChevronDown size={20} /> Show Detail</>}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">New User</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <User size={12} /> Full Name</label>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Shield size={12} /> Role</label>
                                <div className="relative">
                                    <select
                                        name="user_role"
                                        value={formData.user_role}
                                        onChange={handleInputChange}
                                        className="input-field appearance-none"
                                    >
                                        <option>Staff</option>
                                        <option>Manager</option>
                                        <option>Admin</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Briefcase size={12} /> Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="e.g. Sales"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <GraduationCap size={12} /> Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="e.g. Diploma"
                                />
                            </div>

                            <div className="space-y-1.5 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} /> Login User ID</label>
                                <input
                                    type="text"
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="Enter User ID"
                                    required
                                />
                                <p className="absolute -bottom-5 left-1 text-[12px] text-danger-600 whitespace-nowrap">
                                    Note: No special characters or spaces.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Lock size={12} /> Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="input-field pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Phone size={12} /> Contact Number</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    maxLength={10}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="e.g. 8778290919"
                                />
                            </div>

                            <div className="flex items-end">
                                <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-2 group py-4 text-base shadow-lg shadow-primary-500/20 rounded-xl">
                                    <Save size={20} className="group-hover:translate-y-[-1px] transition-transform" />
                                    <span>Create Account</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>


                {/* Table Section - Bottom */}
                {showTable && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <DataTable
                            columns={columns}
                            data={users}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search system users (ID, Name)..."
                            actions={(user) => (
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCreation;
