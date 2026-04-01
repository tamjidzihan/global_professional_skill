/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { confirmPasswordReset } from '../../lib/api';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing password reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await confirmPasswordReset({
                token,
                new_password: newPassword,
                new_password_confirm: confirmPassword
            });

            if (response.data.success) {
                setSuccess(true);
                toast.success('Password reset successful!');
            } else {
                setError(response.data.error?.message || 'Failed to reset password. The link may have expired.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout type="login">
                <SEO
                    title="Password Reset Successful"
                    description="Your password has been successfully reset. You can now log in with your new password."
                />
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
                    <p className="text-gray-600 mb-8">
                        Your password has been reset successfully. You can now use your new password to sign in to your account.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full cursor-pointer flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-[#0066CC] hover:bg-blue-700 transition-all duration-300 shadow-md"
                    >
                        <span>Go to Login</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout type="login">
            <SEO
                title="Reset Password"
                description="Create a new password for your Global Professional Institute account."
            />
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">Create a new, strong password for your account.</p>
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

                {/* New Password */}
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all"
                            placeholder="Enter new password"
                            required
                            minLength={8}
                        />
                        <div
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !token || !newPassword || !confirmPassword}
                    className="w-full cursor-pointer flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-linear-to-r from-[#0066CC] to-blue-600 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Resetting Password...</span>
                        </>
                    ) : (
                        <span>Reset Password</span>
                    )}
                </button>

                {!token && (
                    <div className="text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-[#0066CC] font-medium hover:underline"
                        >
                            Request a new link
                        </Link>
                    </div>
                )}
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
