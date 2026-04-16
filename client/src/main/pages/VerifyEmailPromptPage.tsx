import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout'
import SEO from '../components/SEO';

const VerifyEmailPromptPage: React.FC = () => {
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
                <p className="text-gray-600 mb-6 max-w-md">
                    If you don't receive the email within a few minutes, you can try
                    <span className="text-[#0066CC] bg-yellow-100 px-2 py-1 ml-1 font-medium">
                        resending the verification email.
                    </span>
                </p>
                <div className="flex space-x-4">
                    <Link
                        to="/login"
                        className="bg-[#0066CC] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </Link>
                    {/* Optionally, add a button to resend verification email */}
                    <button className="border cursor-pointer border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                        Resend Email
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmailPromptPage;