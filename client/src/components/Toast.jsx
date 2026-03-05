import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const Toast = ({ toast, onRemove }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
            case 'error': return <AlertCircle className="text-rose-500" size={20} />;
            case 'info': return <Info className="text-blue-500" size={20} />;
            case 'confirm': return <AlertCircle className="text-amber-500" size={20} />;
            default: return null;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'success': return 'bg-emerald-50 border-emerald-100';
            case 'error': return 'bg-rose-50 border-rose-100';
            case 'info': return 'bg-blue-50 border-blue-100';
            case 'confirm': return 'bg-amber-50 border-amber-100';
            default: return 'bg-white border-slate-100';
        }
    };

    return (
        <div className={`pointer-events-auto p-4 rounded-2xl border shadow-xl animate-slide-in-right ${getBgColor()}`}>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <p className="text-sm font-bold text-slate-800">{toast.message}</p>
                    </div>
                    <button onClick={onRemove} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {toast.type === 'confirm' && (
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                            onClick={onRemove}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white/50 rounded-lg transition-colors border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.onConfirm();
                                onRemove();
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm"
                        >
                            {toast.confirmLabel || 'Confirm'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToastContainer;
