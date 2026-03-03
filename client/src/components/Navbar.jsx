import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { LogOut, User, ChevronDown, Bell, Search, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="h-20 bg-white border-b border-slate-200/60 sticky top-0 z-40 flex items-center px-4 md:px-8 justify-between">
            {/* Mobile Toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden p-2.5 mr-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 shadow-sm"
            >
                <Menu size={22} />
            </button>
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-500/10 placeholder-slate-400 transition-all font-medium"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 ml-auto">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 p-1.5 pl-3 rounded-2xl border transition-all duration-300 ${isProfileOpen ? 'bg-slate-50 border-slate-200' : 'border-transparent hover:bg-slate-50'}`}
                    >
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold text-slate-900 leading-none capitalize">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1 leading-none">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-sm shadow-sm">
                            {user?.name?.[0].toUpperCase()}
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)} />
                            <div className="absolute right-0 mt-3 w-56 card p-2 z-10 animate-fade-in border-slate-200/60 ring-4 ring-slate-900/5">
                                <MenuItem icon={<User size={16} />} label="My Profile" />
                                <div className="h-px bg-slate-100 my-2 mx-2" />
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

const MenuItem = ({ icon, label }) => (
    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
        {icon} {label}
    </button>
);

export default Navbar;
