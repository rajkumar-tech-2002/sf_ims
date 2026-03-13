import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    BarChart3,
    Package,
    ArrowRight,
    Search,
    RefreshCw,
    Activity,
    ClipboardList,
    FileText,
    Wallet,
    Boxes,
    ShieldCheck,
    Zap
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-50 glass border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Package className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">IMS</span>
                    </div>
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-widest text-slate-500 uppercase">
                        <a href="#modules" className="hover:text-primary-600 transition-all hover:scale-105">Modules</a>
                        <a href="#analytics" className="hover:text-primary-600 transition-all hover:scale-105">Analytics</a>
                        <a href="#contact" className="hover:text-primary-600 transition-all hover:scale-105">Support</a>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                    >
                        Sign In <ChevronRight size={16} className="ml-1" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs font-bold mb-8 animate-fade-in">
                        <Zap size={14} /> <span>THE COMPLETE INVENTORY ECOSYSTEM</span>
                    </div>
                    <h1 className="section-title text-5xl md:text-7xl mb-8 leading-[1.1]">
                        Steamline Your <br />
                        <span className="text-primary-600">Operations with Precision.</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        A robust, enterprise-grade Inventory Management System tailored for scalability. 
                        Manage stocks, automate billing, and track financials in one unified platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary px-10 py-4 text-base w-full sm:w-auto"
                        >
                            Get Started Now <ArrowRight size={20} className="ml-2" />
                        </button>
                        <a href="#modules" className="btn btn-secondary px-10 py-4 text-base w-full sm:w-auto">
                            Explore Modules
                        </a>
                    </div>
                </div>
            </section>

            {/* Modules Grid */}
            <section id="modules" className="py-24 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="section-title mb-4">Core Integrated Modules</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Our system is built on specialized modules that work seamlessly together 
                            to drive efficiency across your entire business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Package className="text-primary-600" />}
                            title="Inventory Master"
                            desc="Comprehensive stock control including entry, purchase management, vendor tracking and raw material handling."
                            tags={['Stock Entry', 'Purchase', 'Vendors']}
                        />
                        <FeatureCard
                            icon={<FileText className="text-emerald-600" />}
                            title="Billing & Sales"
                            desc="Professional quotation and invoice generation with integrated sales return and credit collection workflows."
                            tags={['Invoice', 'Quotation', 'Returns']}
                        />
                        <FeatureCard
                            icon={<Wallet className="text-amber-600" />}
                            title="Finance Hub"
                            desc="Real-time tracking of assets, income, and expenses. Maintain your cash book with complete transparency."
                            tags={['Income/Expense', 'Assets', 'Cash Book']}
                        />
                        <FeatureCard
                            icon={<ClipboardList className="text-purple-600" />}
                            title="Advanced Reports"
                            desc="Deep-dive into your business performance with automated daily, billing, purchase, and financial reports."
                            tags={['Daily Reports', 'Tax Summary', 'Logs']}
                        />
                    </div>
                </div>
            </section>

            {/* Stats/Callout Section */}
            <section id="analytics" className="py-24 bg-slate-50 px-6">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-slate-900 p-12 md:p-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-600/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Data-Driven <span className="text-primary-400">Insights</span> at Your Fingertips.
                            </h2>
                            <p className="text-slate-400 text-lg mb-8">
                                Every transaction and stock movement is distilled into actionable intelligence, 
                                helping you make smarter business decisions.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                                    <div className="text-slate-500 text-sm">Accuracy Rate</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                                    <div className="text-slate-500 text-sm">Log Monitoring</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
                            <BarChart3 className="text-primary-400 mb-6" size={48} />
                            <h3 className="text-xl font-bold text-white mb-4">Unified Control Center</h3>
                            <ul className="space-y-4">
                                {[
                                    'Automated Stock Reordering',
                                    'Multi-tier Access Control',
                                    'Real-time Financial Vitals',
                                    'Audit Logs & Traceability'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <ShieldCheck className="text-primary-500" size={18} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-200 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-6">
                                <Package className="text-primary-600" size={28} />
                                <span className="text-2xl font-bold text-slate-900">IMS</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Empowering businesses with smart inventory solutions. Designed for modern operations and financial clarity.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div>
                                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Modules</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li>Inventory</li>
                                    <li>Billing</li>
                                    <li>Finance</li>
                                    <li>Reporting</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Platform</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li>Dashboard</li>
                                    <li>Analytics</li>
                                    <li>User Roles</li>
                                    <li>Log Audit</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li>Help Center</li>
                                    <li>Contact Us</li>
                                    <li>Documentation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-400 text-sm">© 2026 Inventory Management System. All rights reserved.</p>
                        <div className="flex gap-8 text-sm font-medium text-slate-400">
                            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, tags = [] }) => (
    <div className="group p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-primary-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-50 group-hover:border-primary-100 transition-all duration-500">
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm mb-6">
            {desc}
        </p>
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            {tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {tag}
                </span>
            ))}
        </div>
    </div>
);

export default LandingPage;
