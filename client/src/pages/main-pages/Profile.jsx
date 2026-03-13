import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    User,
    Mail,
    Shield,
    Bell,
    Lock,
    Camera,
    CheckCircle2,
    Settings,
    Smartphone,
    Globe,
    ChevronDown,
    Hash,
    School,
    MapPin,
    Phone,
    FileText
} from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth();
    const { showToast } = useToast();
    const [activeSection, setActiveSection] = useState('general');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        user_name: '',
        qualification: '',
        department: '',
        contact: '',
        remark: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                user_name: user.user_name || '',
                qualification: user.qualification || '',
                department: user.department || '',
                contact: user.contact || '',
                remark: user.remark || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            if (response.ok) {
                showToast('success', data.message);
                // Update local auth context
                login({ ...user, ...profileData });
            } else {
                showToast('error', data.message);
            }
        } catch (err) {
            showToast('error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('error', 'Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('success', data.message);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast('error', data.message);
            }
        } catch (err) {
            showToast('error', 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: 'general', label: 'General Info', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    ];

    return (
        <div className="page-container">
            <div className="mb-12">
                <h1 className="section-title text-2xl font-bold text-slate-800">Account Settings</h1>
                <p className="text-slate-500 text-base mt-2">Manage your professional identity and session security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeSection === section.id
                                ? 'bg-white text-primary-600 shadow-premium transform scale-[1.02]'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {section.icon}
                            <span className="text-sm">{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-10">
                    {/* Hero Profile Card */}
                    <div className="card p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px]" />
                        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 text-4xl font-black shadow-inner">
                                    {user?.user_name?.[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-black text-slate-900 capitalize leading-none">{user?.user_name}</h2>
                                <p className="text-slate-400 font-bold mt-3 flex items-center justify-center md:justify-start gap-2">
                                    <Smartphone size={16} /> ID: {user?.user_id}
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary-500/20">
                                        {user?.user_role} Access
                                    </span>
                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                                        Active Account
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Content */}
                    <div className="card p-12">
                        {activeSection === 'general' && (
                            <form onSubmit={handleProfileUpdate} className="space-y-10 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <User size={12} /> Full Name</label>
                                        <input type="text" className="input-field py-4" value={profileData.user_name} onChange={(e) => setProfileData({ ...profileData, user_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Hash size={12} /> Login User ID</label>
                                        <input type="text" className="input-field py-4" defaultValue={user?.user_id} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <School size={12} /> Qualification</label>
                                        <input type="text" className="input-field py-4" value={profileData.qualification} onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })} placeholder="e.g. B.Tech Computer Science" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <MapPin size={12} /> Department</label>
                                        <input type="text" className="input-field py-4" value={profileData.department} onChange={(e) => setProfileData({ ...profileData, department: e.target.value })} placeholder="e.g. IT Department" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Phone size={12} /> Contact Number</label>
                                        <input type="text" maxLength={10} className="input-field py-4" value={profileData.contact} onChange={(e) => setProfileData({ ...profileData, contact: e.target.value })} placeholder="e.g. +91 9876543210" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <FileText size={12} /> Remark</label>
                                        <input type="text" className="input-field py-4" value={profileData.remark} onChange={(e) => setProfileData({ ...profileData, remark: e.target.value })} placeholder="Any additional notes..." />
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-100 flex justify-end">
                                    <button type="submit" disabled={loading} className="btn btn-primary px-10 py-4 shadow-primary-500/30">
                                        {loading ? 'Saving...' : 'Save Modifications'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'security' && (
                            <form onSubmit={handlePasswordChange} className="space-y-10 animate-fade-in">
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-slate-100">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Password Settings</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1">Change your password for enhanced security.</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Lock size={12} /> Current Password</label>
                                        <input type="password" placeholder="••••••••" className="input-field py-4" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Lock size={12} /> New Password</label>
                                            <input type="password" placeholder="••••••••" className="input-field py-4" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Lock size={12} /> Confirm Identity</label>
                                            <input type="password" placeholder="••••••••" className="input-field py-4" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-100 flex justify-end">
                                    <button type="submit" disabled={loading} className="btn btn-primary px-10 py-4 shadow-primary-500/30">
                                        {loading ? 'Updating...' : 'Update Security Keys'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
