import React from 'react';
import { Outlet } from 'react-router-dom';
import PayrollSidebar from '../components/PayrollSidebar';
import Navbar from '../components/Navbar';
import { SidebarProvider } from '../context/SidebarContext';

const PayrollLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex h-screen bg-[var(--color-bg-main)] overflow-hidden">
                <PayrollSidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full relative">
                    <Navbar hideNotification={true} hideProfile={true} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default PayrollLayout;
