import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Package, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/stocks/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (id) => {
        setIsOpen(false);
        navigate(`/stock-entry?id=${id}`);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen
                        ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-500/10'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-slate-900/5">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" /> Notifications
                        </h3>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black">
                            {notifications.length} LOW STOCK
                        </span>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center space-y-3">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <Bell size={24} className="text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-400">All stock levels are healthy!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(item.id)}
                                        className="w-full p-4 flex gap-4 hover:bg-slate-50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                                            <Package size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">
                                                {item.product_name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                                    Qty: {item.qty} {item.scale}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    Limit: {item.reorder_level}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors self-center" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <button
                            onClick={() => { navigate('/stock-entry'); setIsOpen(false); }}
                            className="w-full p-3 bg-slate-50 border-t border-slate-100 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            Manage Stock Registry
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
