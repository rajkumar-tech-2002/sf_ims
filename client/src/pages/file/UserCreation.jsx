import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Plus, Shield, Users, Phone, Lock, Eye, EyeOff, Save, Trash2, Edit2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, User, Briefcase, GraduationCap, Hash, Check, X } from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const MODULE_CATEGORIES = [
    {
        name: 'Dashboard',
        modules: [
            { id: 'dashboard', label: 'Dashboard' },
        ]
    },
    {
        name: 'File',
        modules: [
            { id: 'user-creation', label: 'User Creation' },
            { id: 'log-details', label: 'Log Details' },
        ]
    },
    {
        name: 'Master Data',
        modules: [
            { id: 'stock-entry', label: 'Stock Entry' },
            { id: 'vendor', label: 'Vendor' },
            { id: 'purchase-entry', label: 'Purchase Entry' },
            { id: 'enquiry', label: 'Enquiry Detail' },
            { id: 'customers', label: 'Customer Details' },
            { id: 'raw-material-stock', label: 'Raw Material Stock' },
            { id: 'raw-material-purchase', label: 'Raw Material Purchase' },
        ]
    },
    {
        name: 'Billing',
        modules: [
            { id: 'invoice', label: 'Invoice' },
            { id: 'quotation', label: 'Quotation' },
            { id: 'credit-collection', label: 'Credit Collection' },
        ]
    },
    {
        name: 'Return Billing',
        modules: [
            { id: 'stock-return', label: 'Stock Return' },
        ]
    },
    {
        name: 'Income Expense',
        modules: [
            { id: 'income-expense', label: 'Income / Expense' },
            { id: 'transactions', label: 'Transaction' },
            { id: 'assets', label: 'Asset' },
        ]
    },
    {
        name: 'Reports',
        modules: [
            { id: 'bill-report', label: 'Bill Report' },
            { id: 'purchase-report', label: 'Purchase Report' },
            { id: 'daily-report', label: 'Daily Report' },
            { id: 'return-report', label: 'Return Report' },
            { id: 'raw-material-purchase-report', label: 'RM Purchase Report' },
            { id: 'credit-collection-report', label: 'Credit Collection Report' },
            { id: 'income-expense-report', label: 'Income & Expense' },
            { id: 'cash-book', label: 'Cash Book' },
            { id: 'customer-report', label: 'Customer Report' },
        ]
    }
];

const UserCreation = () => {
    const { showToast, confirmToast } = useToast();
    const [users, setUsers] = useState([]);
    const [bankMasterList, setBankMasterList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [userRoles, setUserRoles] = useState(['Staff', 'Manager', 'Admin']);
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        user_name: '',
        user_id: '',
        password: '',
        user_role: 'Staff',
        qualification: '',
        department: '',
        contact: '',
        permissions: {},
        basic_salary: '',
        bank_name: '',
        bank_account: '',
        ifsc_code: '',
        other_bank_account: '',
        join_date: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const response = await api.get('/payroll/banks');
            setBankMasterList(response.data);
        } catch (error) {
            console.error('Failed to fetch banks:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/users/roles');
            // Ensure we have at least the defaults if the table is empty or roles are missing
            const roles = response.data.length > 0 ? response.data : ['Staff', 'Manager', 'Admin'];
            setUserRoles(roles);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

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

    const handlePermissionChange = (moduleId, level) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [moduleId]: level
            }
        }));
    };

    const handleSetAllPermissions = (level) => {
        const newPermissions = {};
        MODULE_CATEGORIES.forEach(cat => {
            cat.modules.forEach(mod => {
                newPermissions[mod.id] = level;
            });
        });
        setFormData(prev => ({
            ...prev,
            permissions: newPermissions
        }));
    };

    const resetForm = () => {
        setFormData({
            user_name: '',
            user_id: '',
            password: '',
            user_role: 'Staff',
            qualification: '',
            department: '',
            contact: '',
            permissions: {},
            basic_salary: '',
            bank_name: '',
            bank_account: '',
            ifsc_code: '',
            other_bank_account: '',
            join_date: ''
        });
        setIsEditing(false);
        setEditingUserId(null);
        setIsAddingRole(false);
        setNewRoleName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // In a real app, you might want a separate update endpoint for basic info
                // and a separate one for permissions, but here we'll assume updatePermissions
                // or a full update if available. Since we only added updatePermissions:
                await api.put(`/users/${editingUserId}/permissions`, { permissions: formData.permissions });
                showToast('success', 'User permissions updated successfully');
            } else {
                await api.post('/users/add', formData);
                showToast('success', 'User created successfully');
            }
            resetForm();
            fetchUsers();
            fetchRoles();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to process user');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            user_name: user.user_name || '',
            user_id: user.user_id || '',
            password: '', // Don't show password
            user_role: user.user_role || 'Staff',
            qualification: user.qualification || '',
            department: user.department || '',
            contact: user.contact || '',
            permissions: user.permissions || {},
            basic_salary: user.basic_salary || '',
            bank_name: user.bank_name || '',
            bank_account: user.bank_account || '',
            ifsc_code: user.ifsc_code || '',
            other_bank_account: user.other_bank_account || '',
            join_date: user.join_date ? user.join_date.split('T')[0] : ''
        });
        setEditingUserId(user.id);
        setIsEditing(true);
        setIsAddingRole(false);
        setShowTable(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddRole = () => {
        if (!newRoleName.trim()) {
            showToast('warning', 'Please enter a role name');
            return;
        }

        const roleExists = userRoles.some(role =>
            role.toLowerCase() === newRoleName.trim().toLowerCase()
        );

        if (roleExists) {
            showToast('error', 'This role already exists');
            return;
        }

        const roleToAdd = newRoleName.trim();
        setUserRoles(prev => [...prev, roleToAdd]);
        setFormData(prev => ({ ...prev, user_role: roleToAdd }));
        setNewRoleName('');
        setIsAddingRole(false);
        showToast('success', 'New role added to selection');
    };

    const handleDelete = (id) => {
        confirmToast('Are you sure you want to delete this user permanently?', async () => {
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
            render: (_, __, index) => (
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
                    <Shield size={14} className="text-primary-500" />
                    <span className="font-bold text-slate-600">{value || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'payroll_info',
            label: 'Payroll Info',
            render: (_, user) => (
                <div className="flex flex-col gap-0.5 text-xs">
                    {user.basic_salary ? (
                        <>
                            <span className="font-bold text-emerald-600">₹{user.basic_salary}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.bank_name || 'No Bank'} - {user.bank_account || 'N/A'}</span>
                        </>
                    ) : (
                        <span className="text-slate-400 italic">Not set</span>
                    )}
                </div>
            )
        },
        {
            key: 'permissions',
            label: 'Module Access',
            render: (val) => {
                const count = val ? Object.values(val).filter(v => v !== 'none').length : 0;
                return (
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${count > 0 ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                        {count} Modules Active
                    </span>
                );
            }
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
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">User Management & Access Control</h1>
                        <p className="text-slate-500 text-base font-medium">Define granular module-level permissions and manage system users.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setShowTable(!showTable);
                                if (isEditing) resetForm();
                            }}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                        >
                            {showTable ? <><ChevronUp size={18} /> Hide List</> : <><ChevronDown size={18} /> View Registry</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {/* Entry Form */}
                    {!showTable && (
                        <div className="card !p-0 transition-all duration-300">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                        {isEditing ? <Edit2 size={20} /> : <UserPlus size={20} />}
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">{isEditing ? `Edit Access: ${formData.user_name}` : 'Create New System User'}</h2>
                                </div>
                                {isEditing && (
                                    <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-12">
                                {/* Basic Info Row */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black text-primary-600 uppercase tracking-[0.25em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span> Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <User size={14} className="text-primary-500" /> Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="user_name"
                                                value={formData.user_name}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="e.g. John Doe"
                                                required
                                                disabled={isEditing}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="input-label flex items-center gap-2">
                                                    <Shield size={14} className="text-primary-500" /> Access Role
                                                </label>
                                                {!isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAddingRole(!isAddingRole)}
                                                        className="text-primary-600 hover:text-primary-700 p-0.5 rounded-md hover:bg-primary-50 transition-colors"
                                                        title="Add New Role"
                                                    >
                                                        <Plus size={14} strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                            {isAddingRole ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="input-field py-2 text-xs"
                                                        placeholder="Role Name"
                                                        value={newRoleName}
                                                        onChange={(e) => setNewRoleName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddRole}
                                                        className="px-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-sm"
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAddingRole(false)}
                                                        className="px-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        name="user_role"
                                                        value={formData.user_role}
                                                        onChange={handleInputChange}
                                                        className="input-field appearance-none cursor-pointer"
                                                        disabled={isEditing}
                                                    >
                                                        {userRoles.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                        <ChevronDown size={18} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <GraduationCap size={14} className="text-primary-500" /> Qualification
                                            </label>
                                            <input
                                                type="text"
                                                name="qualification"
                                                value={formData.qualification}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="e.g. B.Tech / MBA"
                                                disabled={isEditing}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Briefcase size={14} className="text-primary-500" /> Department
                                            </label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="Sales/Accounts"
                                                disabled={isEditing}
                                            />
                                        </div>

                                        <div className="space-y-3 relative">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Hash size={14} className="text-primary-500" /> Login ID
                                            </label>
                                            <input
                                                type="text"
                                                name="user_id"
                                                value={formData.user_id}
                                                onChange={handleInputChange}
                                                className="input-field font-mono font-bold text-primary-600"
                                                placeholder="unique_id"
                                                required
                                                disabled={isEditing}
                                            />
                                        </div>

                                        {!isEditing && (
                                            <div className="space-y-3">
                                                <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                    <Lock size={14} className="text-primary-500" /> Security Key
                                                </label>
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
                                        )}

                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Phone size={14} className="text-primary-500" /> Mobile Contact
                                            </label>
                                            <input
                                                type="text"
                                                name="contact"
                                                value={formData.contact}
                                                maxLength={10}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="10-digit number"
                                                disabled={isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payroll & Employee Details Row */}
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black text-primary-600 uppercase tracking-[0.25em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span> Payroll & Employee Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-10">
                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Briefcase size={14} className="text-primary-500" /> Basic Salary
                                            </label>
                                            <input
                                                type="number"
                                                name="basic_salary"
                                                value={formData.basic_salary}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="e.g. 50000"
                                                disabled={isEditing}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Hash size={14} className="text-primary-500" /> Bank Name
                                            </label>
                                            <input
                                                list="bank-names"
                                                name="bank_name"
                                                value={formData.bank_name}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="e.g. State Bank of India"
                                                disabled={isEditing}
                                                autoComplete="off"
                                            />
                                            <datalist id="bank-names">
                                                {bankMasterList.map(bank => (
                                                    <option key={bank.id} value={bank.bank_name} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Hash size={14} className="text-primary-500" /> Bank Account
                                            </label>
                                            <input
                                                type="text"
                                                name="bank_account"
                                                value={formData.bank_account}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="Account Number"
                                                disabled={isEditing}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Hash size={14} className="text-primary-500" /> IFSC Code
                                            </label>
                                            <input
                                                type="text"
                                                name="ifsc_code"
                                                value={formData.ifsc_code}
                                                onChange={handleInputChange}
                                                className="input-field uppercase"
                                                placeholder="e.g. SBIN0001234"
                                                disabled={isEditing}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Hash size={14} className="text-primary-500" /> Other Bank Acct (Opt)
                                            </label>
                                            <input
                                                type="text"
                                                name="other_bank_account"
                                                value={formData.other_bank_account}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                placeholder="Other Account Number"
                                                disabled={isEditing}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="input-label mb-2 ml-1 flex items-center gap-2">
                                                <Check size={14} className="text-primary-500" /> Joining Date
                                            </label>
                                            <input
                                                type="date"
                                                name="join_date"
                                                value={formData.join_date}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                disabled={isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 pt-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <h3 className="text-[11px] font-black text-primary-600 uppercase tracking-[0.25em] flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span> Module Access Control Matrix
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                                                <button type="button" onClick={() => handleSetAllPermissions('none')} className="px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all hover:bg-white hover:text-slate-600 text-slate-500">Clear All</button>
                                                <button type="button" onClick={() => handleSetAllPermissions('view')} className="px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all hover:bg-blue-600 hover:text-white text-slate-500">View All</button>
                                                <button type="button" onClick={() => handleSetAllPermissions('edit')} className="px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all hover:bg-emerald-600 hover:text-white text-slate-500">Edit All</button>
                                            </div>

                                            <div className="hidden xl:flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 border-l border-slate-200">
                                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div> No Access</span>
                                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> View Only</span>
                                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Edit & Save</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10">
                                        {MODULE_CATEGORIES.map((cat) => (
                                            <div key={cat.name} className="break-inside-avoid bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">{cat.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400">{cat.modules.length} Modules</span>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    {cat.modules.map((mod) => (
                                                        <div key={mod.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100 group hover:border-primary-200 transition-all">
                                                            <span className="text-xs font-bold text-slate-700 tracking-tight">{mod.label}</span>
                                                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handlePermissionChange(mod.id, 'none')}
                                                                    className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${(!formData.permissions[mod.id] || formData.permissions[mod.id] === 'none') ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                                >
                                                                    None
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handlePermissionChange(mod.id, 'view')}
                                                                    className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${formData.permissions[mod.id] === 'view' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handlePermissionChange(mod.id, 'edit')}
                                                                    className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${formData.permissions[mod.id] === 'edit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-emerald-600'}`}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button type="submit" className="w-full md:w-auto min-w-[300px] btn btn-primary flex items-center justify-center gap-3 py-4 px-10 text-base shadow-xl shadow-primary-500/25 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        {isEditing ? <><CheckCircle2 size={20} /> Update System Permissions</> : <><Save size={20} /> Deploy New User Account</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}


                    {/* Table Section - Bottom */}
                    {showTable && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="card !p-0 overflow-hidden">
                                <DataTable
                                    columns={columns}
                                    data={users}
                                    loading={loading}
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    searchPlaceholder="Search system users by ID or Name..."
                                    actions={(user) => (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                title="Edit Access"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserCreation;
