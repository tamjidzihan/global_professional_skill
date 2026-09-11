import { type JSX, useState } from 'react'
import {
    Globe,
    MousePointerClick,
    User,
    Mail,
    Phone,
    Lock,
    CheckCircle2,
    Building2,
    BookOpen,
    Download,
    FileText,
    Bell,
    AlertTriangle,
    ShieldCheck,
    Check,
    Smartphone,
    Laptop,
    Sparkles,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    GraduationCap,
    ArrowDown,
    Layers,
} from 'lucide-react'
import gpiLogo from '../../assets/gpilogo_1.png'

export function RegistrationInfographic(): JSX.Element {
    const [showFullGuide, setShowFullGuide] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(true)

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden text-slate-800 font-sans transition-all">
            {/* Top Accent Strip with GPI Brand Colors */}
            <div className="h-2 w-full bg-gradient-to-r from-[#0F2C59] via-[#0066CC] via-[#76C043] via-[#7C3AED] via-[#F59E0B] to-[#EF4444]" />

            {/* Mobile Header / Quick Toggle for small screens */}
            <div className="lg:hidden p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <img src={gpiLogo} alt="GPI Logo" className="h-8 w-auto object-contain" />
                    <div>
                        <span className="text-xs font-bold text-[#0F2C59] block leading-tight">
                            GPI Registration Guide
                        </span>
                        <span className="text-[11px] text-slate-500">
                            রেজিস্ট্রেশন ও পরীক্ষার নির্দেশনা
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0066CC] text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                >
                    <span>{isMobileOpen ? 'Hide Guide' : 'View Guide'}</span>
                    {isMobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Main Infographic Body */}
            <div className={`${isMobileOpen ? 'block' : 'hidden lg:block'} p-6 sm:p-8 space-y-6`}>

                {/* ─── 00. BRAND HEADER ─── */}
                <div className="text-center pb-6 border-b border-slate-100 relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066CC] border border-blue-100 text-xs font-semibold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-[#76C043]" />
                        Official Student Guide
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <img
                            src={gpiLogo}
                            alt="Global Professional Institute (GPI)"
                            className="h-14 sm:h-16 w-auto object-contain drop-shadow-xs"
                        />
                    </div>

                    {/* Main Title */}
                    <h2 className="text-xl sm:text-2xl font-black text-[#0F2C59] tracking-tight uppercase">
                        GPI Registration &amp; Exam Instructions
                    </h2>

                    {/* Subtitle in Bengali */}
                    <p className="text-sm sm:text-base font-semibold text-[#0066CC] mt-1.5">
                        সহজ ধাপে রেজিস্ট্রেশন ও পরীক্ষার নির্দেশনা
                    </p>
                </div>

                {/* ─── NUMBERED SECTIONS ─── */}
                <div className="space-y-6">

                    {/* ──── SECTION 01 (was 03) ──── */}
                    <div className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3.5">
                            {/* Number Badge */}
                            <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#76C043] to-[#16A34A] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                01
                            </div>
                            <div className="grow">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-[#0F2C59]">
                                        প্রয়োজনীয় তথ্য পূরণ করুন
                                    </h3>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Step 01
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                    সঠিকভাবে নিচের তথ্যগুলো প্রদান করুন:
                                </p>

                                {/* Required Fields Grid */}
                                <div className="mt-3">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#76C043]" />
                                        Required Fields (আবশ্যক):
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                        {[
                                            { label: 'First Name', icon: User },
                                            { label: 'Last Name', icon: User },
                                            { label: 'Email Address', icon: Mail },
                                            { label: 'Phone (WhatsApp)', icon: Phone },
                                            { label: 'Password', icon: Lock },
                                            { label: 'Confirm Password', icon: Lock },
                                        ].map((field) => {
                                            const Icon = field.icon
                                            return (
                                                <div
                                                    key={field.label}
                                                    className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 shadow-2xs"
                                                >
                                                    <Icon className="w-3 h-3 text-[#0066CC] shrink-0" />
                                                    <span className="truncate">{field.label}</span>
                                                    <span className="text-red-500 font-bold">*</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Optional Fields */}
                                <div className="mt-2.5">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                                        Additional Optional Fields (ঐচ্ছিক):
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        <div className="flex items-center gap-1.5 bg-purple-50/60 border border-purple-100 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-purple-900">
                                            <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
                                            <span>Organization Name (Optional)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-purple-50/60 border border-purple-100 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-purple-900">
                                            <ShieldCheck className="w-3 h-3 text-purple-600 shrink-0" />
                                            <span>Employee ID (Optional)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Highlighted Note for Working Professionals */}
                                <div className="mt-3 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                                    <span className="text-base leading-none">💡</span>
                                    <p className="leading-relaxed">
                                        <strong>পরামর্শ:</strong> যারা চাকরি/কর্মরত আছেন, তারা চাইলে <strong className="text-amber-950">Organization Name</strong> ও <strong className="text-amber-950">Employee ID</strong> প্রদান করতে পারবেন। এগুলো <em>Optional</em>।
                                    </p>
                                </div>

                                {/* Password Requirement Note */}
                                <div className="mt-2 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
                                    <Lock className="w-3.5 h-3.5 text-[#0066CC] shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                        <strong>Password Note:</strong> কমপক্ষে ৮টি অক্ষর ব্যবহার করুন এবং Letters, Numbers ও Symbols-এর সমন্বয় রাখুন।
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ─── STANDOUT "VIEW MORE / LESS" CTA BUTTON (Centered, Simple Colors) ─── */}
                <div className="my-6 flex flex-col items-center justify-center">
                    <button
                        type="button"
                        onClick={() => setShowFullGuide(!showFullGuide)}
                        className={`group relative overflow-hidden rounded-full font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
                            showFullGuide
                                ? 'bg-slate-700 hover:bg-slate-800'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        <div className="relative z-10 flex items-center gap-3 px-8 py-4">
                            {/* Left icon bubble */}
                            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                                {showFullGuide ? (
                                    <Layers className="w-5 h-5 text-white" />
                                ) : (
                                    <GraduationCap className="w-5 h-5 text-white" />
                                )}
                            </div>

                            {/* Center label */}
                            <div className="flex flex-col items-center text-center">
                                <span className="text-sm sm:text-base font-extrabold tracking-tight leading-tight">
                                    {showFullGuide ? 'Hide Steps 02–05' : 'View Full Guide: Steps 02–05'}
                                </span>
                                <span className="text-[11px] font-medium text-white/80 leading-tight">
                                    {showFullGuide
                                        ? 'সংক্ষেপ করুন — Click to collapse'
                                        : 'ভেরিফিকেশন, পরীক্ষা ও কোর্স দেখুন'}
                                </span>
                            </div>

                            {/* Right chevron / arrow */}
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                {showFullGuide ? (
                                    <ChevronUp className="w-5 h-5 text-slate-700" />
                                ) : (
                                    <ArrowDown className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Small hint below */}
                    <span className="mt-3 text-[11px] text-slate-500 font-medium tracking-wide">
                        {showFullGuide ? 'Show less ↑' : 'Tap to expand ↓'}
                    </span>
                </div>

                {/* ─── EXPANDABLE FULL SECTIONS 02 - 05 ─── */}
                {showFullGuide && (
                    <div className="space-y-6 pt-2 border-t-2 border-dashed border-blue-200/80 animate-fadeIn">

                        {/* ──── SECTION 02 (was 04) ──── */}
                        <div className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-3.5">
                                {/* Number Badge */}
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                    02
                                </div>
                                <div className="grow">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-[#0F2C59]">
                                            Email এবং SMS Verify করুন
                                        </h3>
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Step 02
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        Registration সম্পন্ন করার পর আপনার <strong>Email Inbox</strong>-এ Verification Link এবং মোবাইল নম্বরে <strong>SMS</strong>-এর মাধ্যমে Verification Code পাবেন। দুটি মাধ্যমেই Verification সম্পন্ন করুন।
                                    </p>

                                    {/* Verification Dual Mockup */}
                                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {/* Email Box */}
                                        <div className="bg-white rounded-xl border border-purple-200 p-2.5 flex items-center gap-2.5 shadow-2xs">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[11px] font-bold text-slate-800 block truncate">Email Verification</span>
                                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                                    <Check className="w-3 h-3" /> Link Sent to Inbox
                                                </span>
                                            </div>
                                        </div>

                                        {/* SMS Box */}
                                        <div className="bg-white rounded-xl border border-purple-200 p-2.5 flex items-center gap-2.5 shadow-2xs">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[11px] font-bold text-slate-800 block truncate">Mobile SMS Code</span>
                                                <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-0.5">
                                                    <Check className="w-3 h-3" /> OTP via Mobile SMS
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ──── SECTION 03 (was 05) ──── */}
                        <div className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-3.5">
                                {/* Number Badge */}
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EA580C] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                    03
                                </div>
                                <div className="grow">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-[#0F2C59]">
                                            কোর্সে Enroll করুন
                                        </h3>
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Step 03
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        Verification সম্পন্ন হলে GPI Website-এ <strong>Login</strong> করে আপনার পছন্দের Course নির্বাচন করে <strong>Enroll</strong> করুন।
                                    </p>

                                    {/* Course Enroll UI Mockup */}
                                    <div className="mt-2.5 bg-white rounded-xl border border-amber-200/80 p-2.5 flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-[11px] font-bold text-slate-800 block truncate">Select Your Course</span>
                                                <span className="text-[10px] text-slate-500">Explore Curriculum &amp; Modules</span>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 bg-gradient-to-r from-[#76C043] to-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs shrink-0">
                                            Enroll Now
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ──── SECTION 04 (was 06) ──── */}
                        <div className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-3.5">
                                {/* Number Badge */}
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#0066CC] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                    04
                                </div>
                                <div className="grow">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-[#0F2C59]">
                                            Course Materials ও Lecture Sheet ব্যবহার করুন
                                        </h3>
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Step 04
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        Course-এ Enroll করার পর <strong>Course Materials</strong> থেকে প্রয়োজনীয় Lecture Sheet, Study Materials ও অন্যান্য শিক্ষাসামগ্রী দেখতে ও Download করতে পারবেন।
                                    </p>

                                    {/* Materials Mockup */}
                                    <div className="mt-2.5 bg-white rounded-xl border border-indigo-100 p-2.5 flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-bold text-slate-800 block">Lecture Sheets &amp; Slides</span>
                                                <span className="text-[10px] text-slate-500">PDF • DOCX • Practice Sets</span>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                            <Download className="w-3 h-3" /> Download
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ──── SECTION 05 (was 07) ──── */}
                        <div className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-red-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start gap-3.5">
                                {/* Number Badge */}
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                    05
                                </div>
                                <div className="grow">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-bold text-[#0F2C59]">
                                            Notifications &amp; Email Updates পান
                                        </h3>
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Step 05
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        আপনার Course সম্পর্কিত গুরুত্বপূর্ণ Notifications, Course Updates, Exam Information, Result/Pass-Fail Notification এবং অন্যান্য আপডেট GPI Platform ও Registered Email-এ পাবেন।
                                    </p>

                                    {/* Notification Mockup */}
                                    <div className="mt-2.5 bg-white rounded-xl border border-red-100 p-2.5 flex items-center justify-between shadow-2xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-[11px] font-bold text-slate-800 block truncate">Exam &amp; Result Alerts</span>
                                                <span className="text-[10px] text-slate-500">Instant Platform &amp; Email Updates</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md shrink-0">
                                            Live Alerts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* ─── IMPORTANT INSTRUCTION BOX ─── */}
                <div className="rounded-2xl bg-gradient-to-br from-red-50 via-amber-50 to-orange-50 border-2 border-red-200/90 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-black text-red-900 flex items-center gap-1.5">
                                গুরুত্বপূর্ণ নির্দেশনা
                            </h4>
                            <p className="text-xs sm:text-sm font-medium text-red-800/95 leading-relaxed">
                                Registration করার সময় অবশ্যই <strong>সঠিক নাম</strong>, <strong>Email Address</strong> এবং <strong>WhatsApp Number</strong> ব্যবহার করুন। Email ও SMS Verification সম্পন্ন করা <u>বাধ্যতামূলক</u>।
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── FOOTER ─── */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-[#0F2C59] tracking-tight">
                        Global Professional Institute (GPI)
                    </p>
                    <p className="text-xs font-semibold text-[#76C043] tracking-widest uppercase">
                        Learn • Grow • Achieve
                    </p>
                </div>

            </div>
        </div>
    )
}