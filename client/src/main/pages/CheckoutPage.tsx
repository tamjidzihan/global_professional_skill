import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    CreditCard,
    ShieldCheck,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    QrCode,
    Phone,
    Hash,
    Info
} from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';
import { toast } from 'react-hot-toast';
import { getSiteSettings } from '../../lib/api';
import type { SiteSettings } from '../../types';

const CheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();
    const { initiatePayment, loading: paymentLoading } = usePayments();

    const [paymentMethod] = useState<'BKASH'>('BKASH');
    const [transactionId, setTransactionId] = useState('');
    const [senderNumber, setSenderNumber] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        if (id) {
            fetchCourseDetail(id);
        }
        fetchSettings();
    }, [id, fetchCourseDetail]);

    const fetchSettings = async () => {
        try {
            const response = await getSiteSettings();
            if (response.data.success) {
                setSiteSettings(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch site settings', error);
        }
    };

    // If already enrolled, redirect to course detail
    useEffect(() => {
        if (course?.is_enrolled) {
            navigate(`/courses/${id}`);
        }
    }, [course, id, navigate]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!course || !user) return;
        
        if (!transactionId || !senderNumber) {
            toast.error("Please provide both Transaction ID and Sender Number");
            return;
        }

        const paymentData = {
            course: course.id,
            amount: course.price,
            currency: 'USD',
            payment_method: paymentMethod,
            transaction_id: transactionId,
            sender_number: senderNumber,
            metadata: {
                student_name: user.full_name || user.email,
                course_title: course.title
            }
        };

        const result = await initiatePayment(paymentData);
        if (result) {
            setIsSuccess(true);
        }
    };

    if (courseLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
                    <p className="text-gray-600 mb-6">The course you are trying to purchase does not exist or is no longer available.</p>
                    <Link to="/courses" className="inline-block bg-[#0066CC] text-white px-6 py-3 rounded-lg hover:bg-[#004c99] transition-colors w-full">
                        Browse Other Courses
                    </Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Details Submitted!</h2>
                    <p className="text-gray-600 mb-8">
                        Your payment details for <strong>{course.title}</strong> have been submitted for verification.
                        Our team will verify the payment and enroll you within 24 hours.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboard/student/my-courses')}
                            className="w-full bg-[#0066CC] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#004c99] transition-colors"
                        >
                            Go to My Courses
                        </button>
                        <Link
                            to="/"
                            className="block w-full text-gray-600 hover:text-gray-800 font-medium py-2"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Breadcrumb
                name="Checkout"
                subtitle={`Complete your purchase for ${course.title}`}
                icon={CreditCard}
            />

            <div className="container mx-auto px-4 mt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-[#0066CC] mb-6 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Course Details
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side: Payment Instructions and Form */}
                    <div className="flex-1 space-y-6">
                        {/* Step 1: Instructions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-pink-50 px-6 py-4 border-b border-pink-100 flex items-center">
                                <QrCode className="w-5 h-5 text-[#D12053] mr-3" />
                                <h2 className="text-lg font-bold text-[#D12053]">Step 1: Make Payment</h2>
                            </div>

                            <div className="p-6 grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">bKash Merchant Number</p>
                                        <p className="text-xl font-black text-gray-800 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-pink-500" />
                                            {siteSettings?.bkash_merchant_number || "01XXXXXXXXX"}
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-blue-500" />
                                            Payment Instructions:
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                                            <li>Open your <strong>bKash App</strong> or Dial <strong>*247#</strong></li>
                                            <li>Select <strong>Payment</strong> option</li>
                                            <li>Enter Merchant Number: <strong>{siteSettings?.bkash_merchant_number || "01XXXXXXXXX"}</strong></li>
                                            <li>Enter Amount: <strong>TK. {parseFloat(course.price).toLocaleString()}</strong></li>
                                            <li>Complete the transaction and save the <strong>TrxID</strong></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                    <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-inner mb-4 flex items-center justify-center">
                                        {siteSettings?.bkash_qr_code ? (
                                            <img 
                                                src={siteSettings.bkash_qr_code} 
                                                alt="bKash QR Code" 
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <QrCode className="w-32 h-32 text-gray-300" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center font-medium">Scan this QR code with bKash App to pay instantly</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Verification Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center">
                                <ShieldCheck className="w-5 h-5 text-[#0066CC] mr-3" />
                                <h2 className="text-lg font-bold text-[#0066CC]">Step 2: Submit Details</h2>
                            </div>

                            <form onSubmit={handlePayment} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Your bKash Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 01XXXXXXXXX"
                                        value={senderNumber}
                                        onChange={(e) => setSenderNumber(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">The number you used to send the payment</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        Transaction ID (TrxID)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 9K28JL9W"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-all outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Enter the 8-10 digit Transaction ID from your bKash SMS</p>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start gap-3 mt-6">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">
                                        Please make sure you have sent the correct amount. Incorrect details may lead to delay or cancellation of your enrollment.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-8">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

                                <div className="flex gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#0066CC]/10 text-[#0066CC]">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{course.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">By {course.instructor.full_name || course.instructor.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Course Price</span>
                                        <span className="font-medium">TK. {parseFloat(course.price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Platform Fee</span>
                                        <span className="text-green-600 font-medium">TK. 0</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="text-2xl font-black text-[#D12053]">
                                            TK. {parseFloat(course.price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={handlePayment}
                                    disabled={paymentLoading || !transactionId || !senderNumber}
                                    className="w-full bg-[#D12053] hover:bg-[#b01a45] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {paymentLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit for Verification
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    By clicking Submit, you agree to our <Link to="/terms" className="underline">Terms of Service</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
