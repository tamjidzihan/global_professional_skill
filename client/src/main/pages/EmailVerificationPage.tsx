/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api, endpoints } from '../../lib/api';

const EmailVerificationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState<string>('Verifying your email...');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setMessage('Verification link is invalid or missing token.');
                toast.error('Invalid verification link.');
                setIsSuccess(false);
                setLoading(false);
                return;
            }

            try {
                // Use your configured axios instance
                const response = await api.post(
                    endpoints.auth.verifyEmail,
                    { token }
                );

                const successMessage = response.data.detail ||
                    response.data.message ||
                    'Email verified successfully!';

                setMessage(successMessage);
                setIsSuccess(true);
                toast.success(successMessage);

                // Auto-redirect after 3 seconds
                setTimeout(() => navigate('/login'), 3000);

            } catch (error: any) {
                let errorMessage = 'Email verification failed.';

                if (error.response) {
                    const errorData = error.response.data;

                    // Handle different error response formats
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    }
                } else if (error.request) {
                    errorMessage = 'No response from server. Please check your connection.';
                } else {
                    errorMessage = error.message || 'An unexpected error occurred.';
                }

                setMessage(errorMessage);
                setIsSuccess(false);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    {loading ? (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Email
                            </h1>
                            <p className="text-gray-600">{message}</p>
                        </>
                    ) : (
                        <>
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isSuccess ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {isSuccess ? (
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-600" />
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {isSuccess ? 'Verification Successful!' : 'Verification Failed'}
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isSuccess
                                        ? 'bg-[#0066CC] text-white hover:bg-blue-700'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {isSuccess ? 'Continue to Login' : 'Back to Login'}
                                </button>

                                {!isSuccess && (
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="w-full py-3 px-4 text-[#0066CC] font-medium border-2 border-[#0066CC] rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        Create New Account
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* Countdown timer for auto-redirect */}
                    {isSuccess && (
                        <div className="mt-6 text-sm text-gray-500">
                            <p>Redirecting to login in <span className="font-semibold">3</span> seconds...</p>
                        </div>
                    )}
                </div>

                {/* Help text */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        Need help?{' '}
                        <a
                            href="mailto:support@bitm.com"
                            className="text-[#0066CC] hover:underline font-medium"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;