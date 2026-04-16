import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout'
import SEO from '../components/SEO';
import { useAuth } from '../../hooks/useAuth';

const VerifyEmailPromptPage: React.FC = () => {
    const location = useLocation();
    const { resendVerification, loading } = useAuth();
    const [email, setEmail] = useState(location.state?.email || '');
    const [resent, setResent] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(!location.state?.email);

    const handleResend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email) {
            setShowEmailInput(true);
            return;
        }

        const success = await resendVerification(email);
        if (success) {
            setResent(true);
            // Hide input after success if it was shown
            if (showEmailInput && location.state?.email) {
                setShowEmailInput(false);
            }
        }
    };

    return (
        <AuthLayout type="info">
            <SEO
                title="Verify Your Email"
                description="Please verify your email address to activate your account and access all features of Global Professional Institute."
            />
            <div className="flex flex-col items-center justify-center text-center px-4">
                <MailCheck className="h-24 w-24 text-[#0066CC] mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Email Address</h1>
                <p className="text-gray-600 mb-6 max-w-md">
                    Thank you for registering! We've sent an email to your address with a verification link.
                    Please check your  <span className="bg-yellow-100 text-yellow-800 font-semibold px-2 py-1 rounded-md mx-1">inbox</span> to activate your account.
                </p>
                
                {email && !showEmailInput && (
                    <p className="text-sm text-gray-500 mb-4">
                        Verification email sent to: <span className="font-semibold text-gray-700">{email}</span>
                    </p>
                )}

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 max-w-md w-full text-left">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 mr-2 shrink-0" />
                        <div>
                            <p className="text-sm text-amber-700">
                                <span className="font-bold">Pro Tip:</span> If you don't see our email, don't forget to check your
                                <span className="bg-yellow-200 px-1.5 py-0.5 rounded font-medium mx-1">Spam</span>
                                or <span className="bg-yellow-200 px-1.5 py-0.5 rounded font-medium mx-1">Junk</span> folder!
                            </p>
                        </div>
                    </div>
                </div>

                {showEmailInput ? (
                    <form onSubmit={handleResend} className="w-full max-w-md mb-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                                placeholder="Enter your registered email"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-[#0066CC] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Resending...
                                </>
                            ) : (
                                'Resend Verification Email'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Didn't receive the email?
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                            <button
                                onClick={() => handleResend()}
                                disabled={loading || resent}
                                className="border cursor-pointer border-[#0066CC] text-[#0066CC] px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        Resending...
                                    </>
                                ) : resent ? (
                                    'Email Sent!'
                                ) : (
                                    'Resend Email'
                                )}
                            </button>
                            <button
                                onClick={() => setShowEmailInput(true)}
                                className="text-sm text-gray-500 hover:text-[#0066CC] transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-center">
                    <Link
                        to="/login"
                        className="text-[#0066CC] font-medium hover:underline flex items-center"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmailPromptPage;