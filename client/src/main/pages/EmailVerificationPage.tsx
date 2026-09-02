import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Mail,
    Smartphone,
    ArrowRight,
    RefreshCw,
    UserPlus,
} from 'lucide-react';
import { api, endpoints } from '../../lib/api';
import SEO from '../components/SEO';

const EmailVerificationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState<string>('Verifying your account...');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [countdown, setCountdown] = useState<number>(3);
    const hasRequestedRef = useRef<boolean>(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setMessage('Verification link is invalid or missing token.');
            toast.error('Invalid verification link.');
            setIsSuccess(false);
            setLoading(false);
            return;
        }

        if (hasRequestedRef.current) return;
        hasRequestedRef.current = true;

        const verifyAccount = async () => {
            try {
                const response = await api.post(endpoints.auth.verifyEmail, { token });

                const successMessage =
                    response.data.message ||
                    response.data.detail ||
                    'Account verified successfully!';

                setMessage(successMessage);
                setIsSuccess(true);
                toast.success(successMessage);
            } catch (error: any) {
                let errorMessage = 'Verification failed.';
                const errorData = error.response?.data;

                if (errorData?.error?.message) {
                    errorMessage = errorData.error.message;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                } else if (errorData?.detail) {
                    errorMessage = errorData.detail;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }

                if (errorMessage.toLowerCase().includes('expired')) {
                    setIsExpired(true);
                }

                setMessage(errorMessage);
                setIsSuccess(false);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        verifyAccount();
    }, [searchParams]);

    // Auto-redirect timer on success
    useEffect(() => {
        if (!isSuccess) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSuccess, navigate]);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50/70 via-gray-50 to-slate-100 flex items-center justify-center p-4">
            <SEO
                title="Account Verification | Global Professional Skill"
                description="Account verification page for Global Professional Skill LMS."
            />
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <div className="text-center">
                    {loading ? (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 shadow-inner">
                                <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Account
                            </h1>
                            <p className="text-sm text-gray-500">{message}</p>
                        </>
                    ) : (
                        <>
                            {/* Icon status */}
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                                    isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}
                            >
                                {isSuccess ? (
                                    <CheckCircle2 className="w-9 h-9" />
                                ) : (
                                    <XCircle className="w-9 h-9" />
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {isSuccess ? 'Verification Successful!' : 'Verification Failed'}
                            </h1>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>

                            {/* Dual Verified Badges if Success */}
                            {isSuccess && (
                                <div className="grid grid-cols-2 gap-2.5 mb-6">
                                    <div className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
                                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Email Verified</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
                                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Mobile Verified</span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-3">
                                {isSuccess ? (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold bg-[#0066CC] text-white hover:bg-blue-700 transition-colors shadow-sm text-sm cursor-pointer"
                                    >
                                        <span>Continue to Sign In</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate('/verify-email-prompt')}
                                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm cursor-pointer"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>
                                                {isExpired ? 'Request New Verification Link' : 'Resend Verification Link'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => navigate('/register')}
                                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-gray-700 font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                                        >
                                            <UserPlus className="w-4 h-4 text-gray-500" />
                                            <span>Create New Account</span>
                                        </button>

                                        <div className="pt-2">
                                            <Link
                                                to="/login"
                                                className="text-xs text-[#0066CC] font-semibold hover:underline"
                                            >
                                                Back to Sign In
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Auto-redirect notice */}
                            {isSuccess && (
                                <div className="mt-5 text-xs text-gray-400">
                                    <p>
                                        Redirecting to sign in page in{' '}
                                        <span className="font-bold text-gray-700">{countdown}</span> seconds...
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Help text */}
                <div className="mt-8 pt-5 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Need assistance?{' '}
                        <Link
                            to="/contact"
                            className="text-[#0066CC] hover:underline font-semibold"
                        >
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;