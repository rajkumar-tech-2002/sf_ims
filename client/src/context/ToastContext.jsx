import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((type, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const confirmToast = useCallback((message, onConfirm, confirmLabel = 'Confirm') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type: 'confirm', message, onConfirm, confirmLabel }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, confirmToast, removeToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};
