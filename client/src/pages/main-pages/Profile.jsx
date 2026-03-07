import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
    Hash
} from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('general');

    const sections = [
        { id: 'general', label: 'General Info', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
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
                                <button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-xl shadow-xl hover:scale-110 transition-transform">
                                    <Camera size={18} />
                                </button>
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
                            <div className="space-y-10 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <User size={12} /> Full Name</label>
                                        <input type="text" className="input-field py-4" defaultValue={user?.user_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Hash size={12} /> Login User ID</label>
                                        <input type="text" className="input-field py-4" defaultValue={user?.user_id} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Globe size={12} /> Primary Language</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <select className="input-field pl-12 py-4 appearance-none bg-white w-full">
                                                <option>English (United States)</option>
                                                <option>Spanish (International)</option>
                                                <option>German (Europe)</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Smartphone size={12} /> Device Auth</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input type="text" className="input-field pl-12 py-4" defaultValue="iPhone 15 Pro Max" disabled />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-100 flex justify-end">
                                    <button className="btn btn-primary px-10 py-4 shadow-primary-500/30">Save Modifications</button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-10 animate-fade-in">
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-slate-100">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Two-Factor Authentication</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1">Enhanced security for administrative actions.</p>
                                    </div>
                                    <button className="ml-auto btn btn-secondary text-[10px] font-black uppercase tracking-widest py-2 px-4">Enable 2FA</button>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Lock size={12} /> Current Password</label>
                                        <input type="password" placeholder="••••••••" className="input-field py-4" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Lock size={12} /> New Password</label>
                                            <input type="password" placeholder="••••••••" className="input-field py-4" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Lock size={12} /> Confirm Identity</label>
                                            <input type="password" placeholder="••••••••" className="input-field py-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-slate-100 flex justify-end">
                                    <button className="btn btn-primary px-10 py-4 shadow-primary-500/30">Update Security Keys</button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <Bell size={48} className="text-slate-300 mb-4" />
                                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Standard broadcast settings loaded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
