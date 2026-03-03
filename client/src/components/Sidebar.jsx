import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Box,
    List,
    BarChart3,
    UserCircle,
    Menu,
    ChevronLeft,
    Package,
    Settings,
    HelpCircle,
    X
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
    const { user } = useAuth();
    const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['admin', 'manager', 'staff'] },
        { title: 'Products', icon: <Box size={20} />, path: '/products', roles: ['admin', 'manager'] },
        { title: 'Inventory', icon: <List size={20} />, path: '/inventory', roles: ['admin', 'manager', 'staff'] },
        { title: 'Stock Entry', icon: <Package size={20} />, path: '/stock-entry', roles: ['admin', 'manager'] },
        { title: 'Reports', icon: <BarChart3 size={20} />, path: '/reports', roles: ['admin'] },
        { title: 'Profile', icon: <UserCircle size={20} />, path: '/profile', roles: ['admin', 'manager', 'staff'] },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        const userRole = user?.user_role || user?.role;
        if (userRole?.toLowerCase() === 'admin') return true;
        return item.roles.includes(userRole?.toLowerCase());
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`fixed md:relative inset-y-0 left-0 bg-slate-900 h-screen transition-all duration-500 ease-in-out flex flex-col z-50 
                ${isCollapsed ? 'md:w-24' : 'md:w-72'}
                ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Mobile Close Button */}
                {isSidebarOpen && (
                    <button
                        onClick={closeSidebar}
                        className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-xl md:hidden hover:bg-white/20 transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
                {/* Logo Section */}
                <div className="h-24 flex items-center justify-between px-7 flex-shrink-0">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Package className="text-white" size={18} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white uppercase">StockWise</span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="mx-auto bg-primary-600/10 w-10 h-10 rounded-xl flex items-center justify-center border border-primary-500/20">
                            <Package className="text-primary-500" size={20} />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto no-scrollbar">
                    <div className={`px-4 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isCollapsed ? 'text-center' : ''}`}>
                        {isCollapsed ? '•••' : 'Main Menu'}
                    </div>
                    {filteredMenuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <span className="shrink-0">{item.icon}</span>
                            {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{item.title}</span>}
                        </NavLink>
                    ))}

                    <div className={`px-4 mt-10 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${isCollapsed ? 'text-center' : ''}`}>
                        {isCollapsed ? '•••' : 'System'}
                    </div>
                    <SidebarExtraItem icon={<Settings size={20} />} label="Settings" isCollapsed={isCollapsed} />
                    <SidebarExtraItem icon={<HelpCircle size={20} />} label="Help Center" isCollapsed={isCollapsed} />
                </nav>

                {/* User Profile / Collapse Toggle */}
                <div className="p-4 mt-auto">
                    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all duration-300 ${isCollapsed ? 'items-center px-2' : ''}`}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                    {user?.user_name?.[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate capitalize">{user?.user_name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{user?.user_role}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-300 shadow-sm ${isCollapsed ? 'h-10' : ''}`}
                        >
                            {isCollapsed ? <Menu size={18} /> : <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><ChevronLeft size={16} /> Collapse</div>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

const SidebarExtraItem = ({ icon, label, isCollapsed }) => (
    <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 group">
        <span className="shrink-0">{icon}</span>
        {!isCollapsed && <span className="font-semibold text-sm tracking-wide">{label}</span>}
    </button>
);

export default Sidebar;
