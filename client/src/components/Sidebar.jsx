import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Database,
    Receipt,
    BarChart3,
    TrendingUp,
    FileSearch,
    LogOut,
    UserPlus,
    History,
    HelpCircle,
    Package,
    ShoppingCart,
    Box,
    Users,
    HardDrive,
    Truck,
    Wallet,
    Briefcase,
    BookOpen,
    Settings,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    X,
    Menu
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { isSidebarOpen, closeSidebar } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState({});
    const location = useLocation();

    const menuConfig = [
        {
            title: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            path: '/dashboard',
            roles: ['admin', 'manager', 'staff']
        },
        {
            title: 'File',
            icon: <FileText size={20} />,
            roles: ['admin', 'manager'],
            children: [
                { title: 'User Creation', icon: <UserPlus size={18} />, path: '/user-creation', roles: ['admin'] },
                { title: 'Log Details', icon: <History size={18} />, path: '/log-details', roles: ['admin'] },
                { title: 'Help', icon: <HelpCircle size={18} />, path: '/help', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: 'Master Data',
            icon: <Database size={20} />,
            roles: ['admin', 'manager'],
            children: [
                { title: 'Stock Entry', icon: <Package size={18} />, path: '/stock-entry', roles: ['admin', 'manager'] },
                { title: 'Vendor', icon: <Truck size={18} />, path: '/vendor', roles: ['admin', 'manager'] },
                { title: 'Purchase Entry', icon: <ShoppingCart size={18} />, path: '/purchase-entry', roles: ['admin', 'manager'] },
                { title: 'Enquiry Detail', icon: <FileSearch size={18} />, path: '/enquiry', roles: ['admin', 'manager'] },
                { title: 'Customer Details', icon: <Users size={18} />, path: '/customers', roles: ['admin', 'manager'] },
                { title: 'Raw Material Stock', icon: <HardDrive size={18} />, path: '/raw-material-stock', roles: ['admin', 'manager'] },
                { title: 'Raw Material Purchase', icon: <ShoppingCart size={18} />, path: '/raw-material-purchase', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: 'Billing',
            icon: <Receipt size={20} />,
            roles: ['admin', 'manager', 'staff'],
            children: [
                { title: 'Invoice', icon: <FileText size={18} />, path: '/invoice', roles: ['admin', 'manager', 'staff'] },
                { title: 'Quotation', icon: <FileText size={18} />, path: '/quotation', roles: ['admin', 'manager', 'staff'] },
            ]
        },
        {
            title: 'Return Billing',
            icon: <History size={20} />,
            roles: ['admin', 'manager', 'staff'],
            children: [
                { title: 'Stock Return', icon: <Package size={18} />, path: '/stock-return', roles: ['admin', 'manager', 'staff'] },
            ]
        },
        {
            title: 'Billing Report',
            icon: <BarChart3 size={20} />,
            roles: ['admin', 'manager'],
            children: [
                { title: 'Bill Report', icon: <FileSearch size={18} />, path: '/reports', roles: ['admin', 'manager'] },
                { title: 'Credit Collection', icon: <Wallet size={18} />, path: '/credit-collection', roles: ['admin', 'manager'] },
                { title: 'Stock Report', icon: <Package size={18} />, path: '/stock-report', roles: ['admin', 'manager'] },
                { title: 'Customer Report', icon: <Users size={18} />, path: '/customer-report', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: 'Income Expense',
            icon: <TrendingUp size={20} />,
            roles: ['admin'],
            children: [
                { title: 'Income / Expense', icon: <TrendingUp size={18} />, path: '/income-expense', roles: ['admin'] },
                { title: 'Vendor Detail', icon: <Truck size={18} />, path: '/vendors', roles: ['admin'] },
                { title: 'Transaction', icon: <Wallet size={18} />, path: '/transactions', roles: ['admin'] },
                { title: 'Asset', icon: <Briefcase size={18} />, path: '/assets', roles: ['admin'] },
            ]
        },
        {
            title: 'Report',
            icon: <BookOpen size={20} />,
            roles: ['admin'],
            children: [
                { title: 'Cash Book', icon: <BookOpen size={18} />, path: '/cash-book', roles: ['admin'] },
                { title: 'Vendor Report', icon: <Truck size={18} />, path: '/vendor-report', roles: ['admin'] },
                { title: 'Asset Report', icon: <Briefcase size={18} />, path: '/asset-report', roles: ['admin'] },
            ]
        }
    ];

    const userRole = (user?.user_role || user?.role || 'staff').toLowerCase();

    const filteredMenu = menuConfig.filter(group => {
        if (group.roles && !group.roles.includes(userRole) && userRole !== 'admin') return false;
        if (group.children) {
            group.children = group.children.filter(child =>
                userRole === 'admin' || (child.roles && child.roles.includes(userRole))
            );
            return group.children.length > 0;
        }
        return true;
    });

    const toggleGroup = (title) => {
        setOpenGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // Auto-expand groups that contain the active route
    useEffect(() => {
        const activeGroup = filteredMenu.find(group =>
            group.children?.some(child => location.pathname === child.path)
        );
        if (activeGroup) {
            setOpenGroups(prev => ({ ...prev, [activeGroup.title]: true }));
        }
    }, [location.pathname]);

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
                <nav className="flex-1 px-4 mt-2 space-y-1 overflow-y-auto no-scrollbar pb-10">
                    {filteredMenu.map((item) => (
                        <div key={item.title}>
                            {item.children ? (
                                <SidebarGroup
                                    item={item}
                                    isOpen={openGroups[item.title]}
                                    toggle={() => toggleGroup(item.title)}
                                    isCollapsed={isCollapsed}
                                    activePath={location.pathname}
                                />
                            ) : (
                                <SidebarLink item={item} isCollapsed={isCollapsed} />
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className="p-4 mt-auto">
                    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all duration-300 ${isCollapsed ? 'items-center px-2' : ''}`}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                    {user?.user_name?.[0].toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate capitalize">{user?.user_name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{userRole}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={logout}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl bg-danger-600/10 text-danger-600 hover:bg-danger-600 hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-wider ${isCollapsed ? 'w-10 h-10' : 'w-full px-4'}`}
                            >
                                <LogOut size={18} />
                                {!isCollapsed && <span>Logout</span>}
                            </button>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className={`flex items-center justify-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-300 shadow-sm ${isCollapsed ? 'w-10 h-10' : 'w-full'}`}
                            >
                                {isCollapsed ? <Menu size={18} /> :
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <ChevronLeft size={16} /> Collapse Sidebar
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

const SidebarLink = ({ item, isCollapsed, isSubItem = false }) => (
    <NavLink
        to={item.path}
        className={({ isActive }) =>
            `flex items-center gap-4 transition-all duration-300 group rounded-xl
            ${isSubItem ? 'pl-11 pr-4 py-2.5' : 'px-4 py-3.5'}
            ${isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`
        }
    >
        <span className="shrink-0">{item.icon}</span>
        {!isCollapsed && <span className={`${isSubItem ? 'text-[13px] font-medium' : 'text-sm font-semibold'} tracking-wide`}>{item.title}</span>}
    </NavLink>
);

const SidebarGroup = ({ item, isOpen, toggle, isCollapsed, activePath }) => {
    const isAnyChildActive = item.children.some(child => child.path === activePath);

    return (
        <div className="space-y-1">
            <button
                onClick={toggle}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group
                ${isAnyChildActive ? 'text-primary-400 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
                <div className="flex items-center gap-4">
                    <span className="shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="text-sm font-semibold tracking-wide">{item.title}</span>}
                </div>
                {!isCollapsed && (
                    <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} />
                    </span>
                )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !isCollapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-1 py-1">
                    {item.children.map((child) => (
                        <SidebarLink key={child.path} item={child} isCollapsed={isCollapsed} isSubItem={true} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
