import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="relative mb-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full scale-150" />
                <Compass size={160} className="text-primary-600 relative z-10 animate-pulse duration-[4000ms]" strokeWidth={1} />
                <span className="absolute text-[180px] font-black text-slate-100 -z-10 select-none">404</span>
            </div>

            <div className="text-center relative z-10">
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Signal Interrupted</h1>
                <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto leading-relaxed">
                    The logistics pathway you followed does not currently exist in our global registry.
                </p>

                <Link to="/" className="btn btn-primary px-10 py-4 flex items-center gap-3 mx-auto shadow-primary-500/30">
                    <ArrowLeft size={18} /> Re-route to Hub
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
