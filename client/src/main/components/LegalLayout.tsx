import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ShieldCheck,
    FileText,
    RefreshCw,
    Cookie,
    Printer,
    Mail,
    Clock,
    Calendar,
    Search,
    HelpCircle,
    ChevronRight,
    CheckCircle2,
    Lock,
    ExternalLink,
} from 'lucide-react';
import SEO from './SEO';
import Breadcrumb from './Breadcrumb';

export interface TocItem {
    id: string;
    title: string;
}

interface LegalLayoutProps {
    title: string;
    subtitle: string;
    lastUpdated: string;
    effectiveDate: string;
    version: string;
    readTime: string;
    icon: React.ElementType;
    tocItems: TocItem[];
    children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
    title,
    subtitle,
    lastUpdated,
    effectiveDate,
    version,
    readTime,
    icon: PageIcon,
    tocItems,
    children,
}) => {
    const location = useLocation();
    const [tocSearch, setTocSearch] = useState('');

    const legalTabs = [
        {
            name: 'Privacy Policy',
            path: '/privacy',
            icon: ShieldCheck,
            desc: 'How we collect & protect your personal data',
        },
        {
            name: 'Terms of Service',
            path: '/terms',
            icon: FileText,
            desc: 'Platform rules, licensing & user agreements',
        },
        {
            name: 'Refund Policy',
            path: '/refund',
            icon: RefreshCw,
            desc: '7-day guarantee & refund conditions',
        },
        {
            name: 'Cookie Policy',
            path: '/cookies',
            icon: Cookie,
            desc: 'Tracking technologies & cookie preferences',
        },
    ];

    const filteredToc = tocItems.filter((item) =>
        item.title.toLowerCase().includes(tocSearch.toLowerCase())
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            <SEO
                title={`${title} | Global Professional Skill`}
                description={`${subtitle} Official legal documentation and compliance policy for Global Professional Skill (GPI).`}
            />

            {/* Breadcrumb Header */}
            <Breadcrumb name={title} subtitle="Legal & Compliance" icon={PageIcon} />

            {/* Hero Banner */}
            <div className="bg-linear-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-12 md:py-16 relative overflow-hidden border-b border-slate-800">
                {/* Background decorative glows */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0066CC]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                <span>Official Legal Documentation & Transparency</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
                                {title}
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                {subtitle}
                            </p>

                            {/* Meta Badges */}
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-6 text-xs text-slate-300">
                                <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Last Updated: <strong className="text-white font-semibold">{lastUpdated}</strong></span>
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Effective: <strong className="text-white font-semibold">{effectiveDate}</strong></span>
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <span>Version <strong className="text-white font-semibold">{version}</strong></span>
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <span>Read time: <strong className="text-white font-semibold">{readTime}</strong></span>
                                </span>
                            </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
                            <button
                                onClick={handlePrint}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors shadow-sm cursor-pointer"
                            >
                                <Printer className="w-4 h-4 text-blue-400" />
                                <span>Print / Save PDF</span>
                            </button>
                            <a
                                href="mailto:support@gpibd.com"
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0066CC] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Contact Legal Team</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs Strip */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
                        {legalTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = location.pathname === tab.path;
                            return (
                                <Link
                                    key={tab.path}
                                    to={tab.path}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                                        isActive
                                            ? 'bg-[#0066CC] text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    <span>{tab.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 max-w-6xl py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    {/* Left Sticky Sidebar (Table of Contents + Support card) */}
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
                        {/* Table of Contents Card */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
                            <div className="flex items-center justify-between mb-3.5">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    On This Page
                                </h2>
                                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {tocItems.length} Sections
                                </span>
                            </div>

                            {/* TOC Quick Search */}
                            {tocItems.length > 5 && (
                                <div className="relative mb-3">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={tocSearch}
                                        onChange={(e) => setTocSearch(e.target.value)}
                                        placeholder="Filter sections..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
                                    />
                                </div>
                            )}

                            {/* TOC Links */}
                            <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1 text-xs">
                                {filteredToc.map((item, index) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="group flex items-start gap-2 px-2.5 py-2 rounded-lg text-gray-600 hover:text-[#0066CC] hover:bg-blue-50/60 transition-colors leading-snug"
                                    >
                                        <span className="font-mono text-[10px] text-gray-400 group-hover:text-blue-500 shrink-0 mt-0.5">
                                            {String(index + 1).padStart(2, '0')}.
                                        </span>
                                        <span className="flex-1 font-medium">{item.title}</span>
                                        <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                                    </a>
                                ))}
                                {filteredToc.length === 0 && (
                                    <p className="text-xs text-gray-400 py-2 text-center">
                                        No section matched your filter.
                                    </p>
                                )}
                            </nav>
                        </div>

                        {/* Security & Compliance Callout */}
                        <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border border-slate-700">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Trust & Security</p>
                                    <p className="text-[11px] text-slate-300">ISO & GDPR compliant standards</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                                All data transmitted across Global Professional Skill is protected by 256-bit SSL encryption and strict role-based access controls.
                            </p>
                            <div className="space-y-1.5 text-[11px] text-slate-200">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Encrypted user credentials</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Secure tokenized payment processing</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Zero unauthorized data sharing</span>
                                </div>
                            </div>
                        </div>

                        {/* Need Help Box */}
                        <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-100 text-xs space-y-2.5">
                            <div className="flex items-center gap-2 text-[#0066CC] font-bold">
                                <HelpCircle className="w-4 h-4" />
                                <span>Have Questions or Concerns?</span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Our legal & compliance support team is ready to assist you with any questions regarding our terms, refunds, or privacy practices.
                            </p>
                            <div className="pt-1">
                                <a
                                    href="mailto:support@gpibd.com"
                                    className="inline-flex items-center gap-1.5 text-[#0066CC] font-semibold hover:underline"
                                >
                                    <span>support@gpibd.com</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Right Main Article Content */}
                    <main className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-[#0066CC] prose-a:font-semibold hover:prose-a:underline">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default LegalLayout;
