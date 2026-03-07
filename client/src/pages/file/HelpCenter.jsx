import React from 'react';
import { Mail, Phone, Clock, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';

const HelpCenter = () => {
    const supportContacts = [
        {
            icon: <Phone className="text-primary-500" size={24} />,
            title: "Contact Hotline",
            value: "+91 95009 79112 / 113",
            description: "Direct line for urgent technical support and billing queries.",
            action: "Call Now",
            link: "tel:+919500979112"
        },
        {
            icon: <Mail className="text-primary-500" size={24} />,
            title: "Email Support",
            value: "support@omegainfotech.com",
            description: "Send us your detailed queries or feature requests anytime.",
            action: "Send Email",
            link: "mailto:support@omegainfotech.com"
        },
        {
            icon: <Clock className="text-primary-500" size={24} />,
            title: "Support Hours",
            value: "Mon - Sat, 9:00 AM - 7:00 PM",
            description: "Our dedicated team is ready to assist you during these hours.",
            action: "View Schedule",
            link: "#"
        }
    ];

    return (
        <div className="page-container space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="mb-4">
                <h1 className="section-title text-2xl font-bold text-slate-800">Help & Support</h1>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Need assistance with StockWise? Our developer support team is here to help you resolve issues,
                    answer questions, and ensure your inventory management is seamless.
                </p>
            </div>

            {/* Support Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportContacts.map((contact, index) => (
                    <div key={index} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            {contact.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{contact.title}</h3>
                        <p className="text-primary-600 font-bold mb-4 text-sm">{contact.value}</p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            {contact.description}
                        </p>
                        <a
                            href={contact.link}
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors"
                        >
                            {contact.action} <ExternalLink size={16} />
                        </a>
                    </div>
                ))}
            </div>

            {/* Developer Details Section */}
            <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 blur-[100px] -ml-32 -mb-32"></div>

                <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <ShieldCheck size={14} /> Official Developer Support
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Developed & Maintained by <span className="text-primary-500">Search First Technologies (P) Ltd.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            We are committed to providing robust and scalable billing solutions.
                            If you encounter any bugs or require custom modifications, please reach out directly to our engineering team.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                                Visit Website
                            </button>
                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all active:scale-95">
                                Documentation
                            </button>
                        </div>
                    </div>

                    <div className="w-full max-w-xs bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="text-primary-400" size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">WhatsApp Support</h4>
                        <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-bold">Quick response</p>
                        <a
                            href="https://wa.me/919500979112"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
                        >
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
