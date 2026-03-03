import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { SidebarProvider } from '../context/SidebarContext';

const MainLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full relative">
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default MainLayout;
