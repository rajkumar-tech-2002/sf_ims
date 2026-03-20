import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, Home, ChevronDown, Shield } from 'lucide-react';

const LoginPage = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('');
    const [roles, setRoles] = useState([]);
    const [moduleType, setModuleType] = useState('inventory');
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Fetch roles on mount
    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/auth/roles');
                if (response.ok) {
                    const data = await response.json();
                    setRoles(data);
                }
            } catch (err) {
                console.error('Failed to fetch roles:', err);
                showToast('error', 'Failed to connect to authentication server');
            }
        };
        fetchRoles();
    }, [showToast]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!userId || !password || !role) {
            showToast('error', 'Please fill in all fields');
            return;
        }

        if (role === 'Staff' && moduleType === 'payroll') {
            showToast('error', 'Staff accounts do not have access to the Payroll module');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, password, user_role: role }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                login(data.user);
                showToast('success', `Welcome back, ${data.user.user_name}!`);
                navigate(moduleType === 'payroll' ? '/payroll/dashboard' : '/dashboard');
            } else {
                showToast('error', data.message || 'Login failed');
            }
        } catch (err) {
            showToast('error', 'Unable to connect to server');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex flex-col justify-between p-22 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-primary-600/10 blur-[150px]" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Package size={20} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">IMS</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Streamline Your <br />
                        Business with <br />
                        <span className="text-primary-400">Precision.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Manage stocks, automate billing, and track financials in one unified, secure platform.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6 text-slate-500 text-sm font-medium">
                    <span>© 2026 Inventory Management System</span>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-24 bg-slate-50/30 relative">
                <Link
                    to="/"
                    className="absolute top-8 right-8 p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
                    title="Back to Home"
                >
                    <Home size={20} className="group-hover:scale-110 transition-transform" />
                </Link>

                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-12 justify-center">
                        <Package className="text-primary-600" size={32} />
                        <span className="text-3xl font-bold text-slate-900">IMS</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="form-group">
                            <label className="input-label flex items-center gap-2">
                                <Shield size={16} className="text-slate-400" /> Select Role</label>
                            <div className="relative">
                                <select
                                    required
                                    className="input-field appearance-none bg-white"
                                    value={role}
                                    onChange={(e) => {
                                        const newRole = e.target.value;
                                        setRole(newRole);
                                        if (newRole === 'Staff' && moduleType === 'payroll') {
                                            setModuleType('inventory');
                                        }
                                    }}
                                >
                                    <option value="">Select your role</option>
                                    {roles.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="input-label flex items-center gap-2">
                                <Package size={16} className="text-slate-400" /> Select Module</label>
                            <div className="relative">
                                <select
                                    required
                                    className="input-field appearance-none bg-white"
                                    value={moduleType}
                                    onChange={(e) => setModuleType(e.target.value)}
                                >
                                    <option value="inventory">Inventory Management</option>
                                    <option value="payroll" disabled={role === 'Staff'}>Payroll System {role === 'Staff' ? '(Restricted)' : ''}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="input-label flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" /> User ID</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-12"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Enter your user ID"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex justify-between items-center">
                                <label className="input-label flex items-center gap-2">
                                    <Lock size={16} className="text-slate-400" /> Password</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="input-field pl-12 pr-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                            <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer">Remember me</label>
                        </div>

                        <button type="submit" className="w-full btn btn-primary py-3.5 text-[15px] mt-6 flex items-center justify-center gap-2">
                            Sign In <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DemoBadge = ({ label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm"
    >
        {label}
    </button>
);

export default LoginPage;
