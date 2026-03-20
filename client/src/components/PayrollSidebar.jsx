import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Banknote,
    LogOut,
    Menu,
    ChevronDown,
    ChevronLeft,
    X,
    Briefcase,
    FileText
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const PayrollSidebar = () => {
    const { user, logout } = useAuth();
    const { isSidebarOpen, closeSidebar, searchQuery } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState({});
    const location = useLocation();

    const menuConfig = [
        {
            title: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            path: '/payroll/dashboard',
            roles: ['admin', 'manager']
        },
        {
            title: 'Employees',
            icon: <Users size={20} />,
            path: '/payroll/employees',
            roles: ['admin', 'manager']
        },
        {
            title: 'Attendance',
            icon: <CalendarCheck size={20} />,
            path: '/payroll/attendance',
            roles: ['admin', 'manager']
        },
        {
            title: 'Salary Processing',
            icon: <Banknote size={20} />,
            path: '/payroll/salary',
            roles: ['admin', 'manager']
        },
        {
            title: 'Reports',
            icon: <FileText size={20} />,
            path: '/payroll/reports',
            roles: ['admin', 'manager']
        }
    ];

    const userRole = (user?.user_role || user?.role || 'staff').toLowerCase();

    const checkAccess = (item) => {
        if (userRole === 'admin') return true;
        return item.roles && item.roles.map(r => r.toLowerCase()).includes(userRole);
    };

    const filteredMenu = menuConfig
        .map(group => {
            const query = searchQuery.toLowerCase().trim();
            if (query) {
                const groupMatches = group.title.toLowerCase().includes(query);
                if (groupMatches) return group;
                return null;
            }
            return checkAccess(group) ? group : null;
        })
        .filter(Boolean);

    useEffect(() => {
        const activeGroup = filteredMenu.find(group =>
            group.children?.some(child => location.pathname === child.path)
        );
        if (activeGroup) {
            setOpenGroups(prev => ({ ...prev, [activeGroup.title]: true }));
        }
    }, [location.pathname, searchQuery]);

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={closeSidebar}
                    onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
                    role="presentation"
                    tabIndex={-1}
                />
            )}

            <aside
                className={`fixed md:relative inset-y-0 left-0 bg-gradient-to-b from-primary-950 to-slate-900 border-r border-slate-800/50 h-screen transition-all duration-500 ease-in-out flex flex-col z-50 
                ${isCollapsed ? 'md:w-20' : 'md:w-72'}
                ${isSidebarOpen ? 'translate-x-0 w-72 shadow-2xl shadow-slate-900/50' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Mobile Close Button */}
                {isSidebarOpen && (
                    <button
                        onClick={closeSidebar}
                        className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full md:hidden hover:bg-white/20 transition-all backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Logo Section */}
                <div className="h-24 flex items-center justify-between px-7 flex-shrink-0">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Briefcase className="text-white" size={18} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white uppercase">PAYROLL</span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="mx-auto bg-primary-600/10 w-10 h-10 rounded-xl flex items-center justify-center border border-primary-500/20">
                            <Briefcase className="text-primary-500" size={20} />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-4 space-y-1.5 overflow-y-auto no-scrollbar pb-10">
                    {filteredMenu.map((item) => (
                        <div key={item.title}>
                             <SidebarLink item={item} isCollapsed={isCollapsed} />
                        </div>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className="p-4 mt-auto">
                    <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md transition-all duration-300 ${isCollapsed ? 'items-center px-1 py-3' : ''}`}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                                    {user?.user_name?.[0].toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate capitalize">{user?.user_name}</p>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">{userRole}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={logout}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-full bg-danger-500/10 text-danger-400 hover:bg-danger-500 hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-wider ${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-full px-4'}`}
                            >
                                <LogOut size={16} />
                                {!isCollapsed && <span>Logout</span>}
                            </button>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className={`flex items-center justify-center py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 shadow-sm ${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-full'}`}
                            >
                                {isCollapsed ? <Menu size={16} /> :
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                                        <ChevronLeft size={16} /> Collapse
                                    </div>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

const SidebarLink = ({ item, isCollapsed }) => (
    <NavLink
        to={item.path}
        className={({ isActive }) =>
            `flex items-center gap-3.5 transition-all duration-300 group rounded-full mx-3
            px-4 py-3
            ${isActive
                ? 'bg-primary-500/20 text-primary-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`
        }
    >
        <span className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
        {!isCollapsed && <span className="text-sm font-medium tracking-wide">{item.title}</span>}
    </NavLink>
);

export default PayrollSidebar;
