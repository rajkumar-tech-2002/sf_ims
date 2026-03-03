import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    BarChart3,
    ShieldCheck,
    Zap,
    Package,
    ArrowRight,
    Search,
    RefreshCw
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
                        <span className="text-2xl font-bold tracking-tight text-slate-900">StockWise</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-primary-600 transition-colors">Solutions</a>
                        <a href="#contact" className="hover:text-primary-600 transition-colors">Contact</a>
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
                        <Zap size={14} /> <span>THE FUTURE OF INVENTORY IS HERE</span>
                    </div>
                    <h1 className="section-title text-5xl md:text-7xl mb-8 leading-[1.1]">
                        Manage Your Stock with <br />
                        <span className="text-primary-600">Intelligence & Clarity.</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        The all-in-one inventory ecosystem designed for high-performing teams.
                        Track, analyze, and scale with enterprise-grade tools.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary px-10 py-4 text-base w-full sm:w-auto"
                        >
                            Get Started Free <ArrowRight size={20} className="ml-2" />
                        </button>
                        <button className="btn btn-secondary px-10 py-4 text-base w-full sm:w-auto">
                            Watch Demo
                        </button>
                    </div>

                    {/* Visual Element / Mockup Placeholder */}
                    <div className="mt-20 relative px-4 max-w-5xl mx-auto">
                        <div className="absolute inset-0 bg-primary-500/10 blur-[120px] rounded-full" />
                        <div className="relative card p-4 md:p-6 bg-white shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
                            <div className="bg-slate-50 rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 flex flex-col">
                                <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    </div>
                                    <div className="flex-1 max-w-md mx-auto h-6 bg-slate-100 rounded-md" />
                                </div>
                                <div className="flex-1 p-8 flex items-center justify-center italic text-slate-300">
                                    [ Interactive Dashboard Preview ]
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="section-title mb-4">Precision Engineering for Logistics</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Everything you need to maintain a perfect balance between supply and demand.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Search className="text-primary-600" />}
                            title="Instant Discovery"
                            desc="Locate any item across multiple warehouses with sub-second search latency."
                        />
                        <FeatureCard
                            icon={<RefreshCw className="text-emerald-600" />}
                            title="Real-time Sync"
                            desc="Always-on data reconciliation keeps your stock levels accurate to the millisecond."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-purple-600" />}
                            title="Predictive Insights"
                            desc="AI-driven reports help you anticipate shortages before they affect your bottom line."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto card bg-slate-900 border-none relative overflow-hidden text-center p-16">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px]" />
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to optimize?</h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
                        Join 1,000+ companies using StockWise to run their logistics smoother than ever.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary px-12 py-4 shadow-primary-500/40"
                    >
                        Launch Your Dashboard
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Package className="text-primary-600" size={24} />
                        <span className="text-xl font-bold text-slate-900">StockWise</span>
                    </div>
                    <p className="text-slate-400 text-sm">© 2024 StockWise System. Designed for high performance.</p>
                    <div className="flex gap-6 text-sm font-medium text-slate-500">
                        <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="group p-8 rounded-3xl border border-slate-100 hover:border-primary-100 hover:bg-slate-50/50 transition-all duration-300">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

export default LandingPage;
