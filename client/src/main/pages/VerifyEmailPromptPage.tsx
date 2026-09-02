import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    MailCheck,
    AlertCircle,
    Mail,
    Phone,
    Loader2,
    CheckCircle2,
    Clock,
    Send,
    Smartphone,
} from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import SEO from '../components/SEO';
import { useAuth } from '../../hooks/useAuth';

const VerifyEmailPromptPage: React.FC = () => {
    const location = useLocation();
    const { resendVerification, loading } = useAuth();
    const [email, setEmail] = useState(location.state?.email || '');
    const phone = location.state?.phone_number || '';
    const [showEmailInput, setShowEmailInput] = useState(!location.state?.email);

    const [emailCooldown, setEmailCooldown] = useState<number>(0);
    const [smsCooldown, setSmsCooldown] = useState<number>(0);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [smsSent, setSmsSent] = useState<boolean>(false);

    useEffect(() => {
        let emailTimer: ReturnType<typeof setTimeout>;
        if (emailCooldown > 0) {
            emailTimer = setTimeout(() => setEmailCooldown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(emailTimer);
    }, [emailCooldown]);

    useEffect(() => {
        let smsTimer: ReturnType<typeof setTimeout>;
        if (smsCooldown > 0) {
            smsTimer = setTimeout(() => setSmsCooldown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(smsTimer);
    }, [smsCooldown]);

    const handleResend = async (channel: 'email' | 'sms') => {
        if (!email) {
            setShowEmailInput(true);
            return;
        }

        const success = await resendVerification(email, channel);
        if (success) {
            if (channel === 'email') {
                setEmailSent(true);
                setEmailCooldown(60);
            } else if (channel === 'sms') {
                setSmsSent(true);
                setSmsCooldown(60);
            }
        }
    };

    return (
        <AuthLayout type="info">
            <SEO
                title="Verify Your Account | Global Professional Skill"
                description="Please verify your account via email or SMS to activate your profile and access all courses."
            />
            <div className="flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto">
                <div className="relative mb-5">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                        <MailCheck className="h-10 w-10 text-[#0066CC]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow">
                        <Smartphone className="w-4 h-4" />
                    </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Verify Your Account
                </h1>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Thank you for joining Global Professional Skill! We have sent verification links to both your registered <span className="font-semibold text-gray-800">Email</span> and your <span className="font-semibold text-gray-800">Mobile Number (via Bangla SMS)</span>.
                </p>

                {/* Recipient Details Card */}
                {email && !showEmailInput && (
                    <div className="w-full bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 mb-5 text-left text-xs space-y-2">
                        <div className="flex items-center justify-between text-gray-600">
                            <span className="flex items-center gap-1.5 text-gray-500">
                                <Mail className="w-3.5 h-3.5 text-[#0066CC]" /> Registered Email:
                            </span>
                            <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                                {email}
                            </span>
                        </div>
                        {phone && (
                            <div className="flex items-center justify-between text-gray-600 pt-1.5 border-t border-gray-200/60">
                                <span className="flex items-center gap-1.5 text-gray-500">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Registered Mobile:
                                </span>
                                <span className="font-mono font-semibold text-gray-800">
                                    {phone}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Bangla SMS Notice Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-5 w-full text-left">
                    <div className="flex items-start gap-2.5">
                        <Smartphone className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-emerald-900 mb-0.5">
                                মোবাইল এসএমএস যাচাইকরণ (Bangla SMS)
                            </p>
                            <p className="text-[11px] text-emerald-700 leading-normal">
                                আপনার মোবাইলে বাংলায় একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। ইনবক্সের লিংকে ক্লিক করে এক ক্লিকে অ্যাকাউন্ট সচল করুন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Spam Advice */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3.5 mb-6 w-full text-left rounded-r-lg">
                    <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 shrink-0" />
                        <p className="text-xs text-amber-800 leading-normal">
                            <span className="font-bold">Email tip:</span> If you don't see our email in your inbox, please check your <span className="bg-amber-200/60 px-1 py-0.5 rounded font-semibold">Spam</span> or <span className="bg-amber-200/60 px-1 py-0.5 rounded font-semibold">Junk</span> folder.
                        </p>
                    </div>
                </div>

                {/* Custom Email Input if not provided */}
                {showEmailInput ? (
                    <div className="w-full mb-6">
                        <div className="relative mb-3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                                placeholder="Enter your registered email address"
                                required
                            />
                        </div>
                    </div>
                ) : null}

                {/* Resend Actions Group */}
                <div className="w-full space-y-3 mb-6">
                    <p className="text-xs text-gray-500 font-medium">
                        Didn't receive the verification message?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Resend Email Button */}
                        <button
                            type="button"
                            onClick={() => handleResend('email')}
                            disabled={loading || emailCooldown > 0 || !email}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold border border-[#0066CC] text-[#0066CC] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            {loading && emailCooldown === 0 ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : emailCooldown > 0 ? (
                                <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Resend Email ({emailCooldown}s)</span>
                                </>
                            ) : emailSent ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Resend Email</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Resend Email</span>
                                </>
                            )}
                        </button>

                        {/* Resend SMS Button */}
                        <button
                            type="button"
                            onClick={() => handleResend('sms')}
                            disabled={loading || smsCooldown > 0 || !email}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                        >
                            {loading && smsCooldown === 0 ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : smsCooldown > 0 ? (
                                <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Resend SMS ({smsCooldown}s)</span>
                                </>
                            ) : smsSent ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    <span>Resend SMS</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Resend SMS</span>
                                </>
                            )}
                        </button>
                    </div>

                    {!showEmailInput && (
                        <button
                            type="button"
                            onClick={() => setShowEmailInput(true)}
                            className="text-xs text-gray-400 hover:text-[#0066CC] transition-colors cursor-pointer"
                        >
                            Change email address
                        </button>
                    )}
                </div>

                <div className="flex justify-center pt-2 border-t border-gray-100 w-full">
                    <Link
                        to="/login"
                        className="text-xs text-[#0066CC] font-semibold hover:underline"
                    >
                        Return to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmailPromptPage;