import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

const VerifyEmailPromptPage: React.FC = () => {
    return (
        <AuthLayout type="info">
            <div className="flex flex-col items-center justify-center text-center px-4">
                <MailCheck className="h-24 w-24 text-[#0066CC] mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Email Address</h1>
                <p className="text-gray-600 mb-6 max-w-md">
                    Thank you for registering! We've sent an email to your address with a verification link.
                    Please check your inbox (and spam folder) to activate your account.
                </p>
                <p className="text-gray-600 mb-6 max-w-md">
                    If you don't receive the email within a few minutes, you can try
                    <Link to="/resend-verification" className="text-[#0066CC] hover:underline ml-1">
                        resending the verification email.
                    </Link>
                </p>
                <div className="flex space-x-4">
                    <Link
                        to="/login"
                        className="bg-[#0066CC] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </Link>
                    {/* Optionally, add a button to resend verification email */}
                    {/* <button className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                        Resend Email
                    </button> */}
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmailPromptPage;