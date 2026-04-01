/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { requestPasswordReset } from '../../lib/api';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const response = await requestPasswordReset({ email });
            if (response.data.success) {
                setSubmitted(true);
                toast.success('Password reset link sent!');
            } else {
                setError(response.data.error?.message || 'Something went wrong. Please try again.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <AuthLayout type="login">
                <SEO 
                    title="Check Your Email" 
                    description="A password reset link has been sent to your email address."
                />
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                    <p className="text-gray-600 mb-8">
                        We've sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>. 
                        Please check your inbox and click the link to reset your password.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center text-[#0066CC] font-medium hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout type="login">
            <SEO 
                title="Forgot Password" 
                description="Reset your Global Professional Institute account password."
            />
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all"
                            placeholder="student@gpis.org.bd"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full cursor-pointer flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-linear-to-r from-[#0066CC] to-blue-600 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Link...</span>
                        </>
                    ) : (
                        <span>Send Reset Link</span>
                    )}
                </button>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-[#0066CC] font-medium hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
