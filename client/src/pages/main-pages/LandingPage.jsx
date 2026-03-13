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
    RefreshCw,
    Globe,
    Cpu,
    Activity,
    TrendingUp
} from 'lucide-react';
import HeroImage from '../../assets/ims_hero.png';

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
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold tracking-widest text-slate-500 uppercase">
                        <a href="#features" className="hover:text-primary-600 transition-all hover:scale-105">Capabilities</a>
                        <a href="#solutions" className="hover:text-primary-600 transition-all hover:scale-105">Ecosystem</a>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<Cpu className="text-primary-600" />}
                            title="Cognitive Engine"
                            desc="Proprietary algorithms that optimize stock levels across multi-tenant infrastructures."
                        />
                        <FeatureCard
                            icon={<Globe className="text-emerald-600" />}
                            title="Global Presence"
                            desc="Synchronize supply chains across continents with atomic-grade consistency."
                        />
                        <FeatureCard
                            icon={<Activity className="text-purple-600" />}
                            title="Vitality Metrics"
                            desc="Harness deep telemetry to understand every pulse of your warehouse operations."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Package className="text-primary-600" size={24} />
                        <span className="text-xl font-bold text-slate-900">StockWise</span>
                    </div>
                    <p className="text-slate-400 text-sm">© 2026 StockWise System. Designed for high performance.</p>
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
