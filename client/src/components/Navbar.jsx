import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { LogOut, User, ChevronDown, Calendar, Search, Menu, Plus } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar, searchQuery, setSearchQuery } = useSidebar();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="h-[76px] glass sticky top-0 z-40 flex items-center px-4 md:px-8 gap-4 justify-between transition-all">
            {/* Mobile Toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 shadow-sm"
            >
                <Menu size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-sm relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search globally..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100/50 border border-transparent rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 focus:bg-white placeholder-slate-400 transition-all text-slate-700"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                {/* <div className="hidden lg:flex items-center gap-2 mr-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200 border border-slate-200/60 rounded-full transition-all">
                        <Calendar size={14} />
                        <span>Today</span>
                    </button>
                    <button className="btn btn-primary !py-1.5 !px-3 !rounded-full !text-xs flex items-center gap-1.5">
                        <Plus size={14} />
                        <span>Quick Action</span>
                    </button>
                </div> */}

                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full border transition-all duration-300 bg-white ${isProfileOpen ? 'border-primary-200 shadow-sm ring-2 ring-primary-50' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            {user?.user_name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[13px] font-semibold text-slate-800 leading-none capitalize">{user?.user_name}</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)} onKeyDown={(e) => e.key === 'Escape' && setIsProfileOpen(false)} role="presentation" tabIndex={-1} />
                            <div className="absolute right-0 mt-2 w-56 card !p-2 z-10 animate-fade-in border-slate-200/60">
                                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                    <p className="text-sm font-semibold text-slate-800 capitalize">{user?.user_name}</p>
                                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{user?.user_role}</p>
                                </div>
                                <MenuItem
                                    icon={<User size={16} />}
                                    label="My Profile"
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsProfileOpen(false);
                                    }}
                                />
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50 rounded-xl transition-colors"
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

const MenuItem = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
    >
        {icon} {label}
    </button>
);

export default Navbar;
