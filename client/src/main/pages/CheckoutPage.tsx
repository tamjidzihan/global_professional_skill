import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    CreditCard,
    ShieldCheck,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    BookOpen
} from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../components/Breadcrumb';

const CheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();
    const { initiatePayment, loading: paymentLoading } = usePayments();

    const [paymentMethod, setPaymentMethod] = useState<'BKASH'>('BKASH');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCourseDetail(id);
        }
    }, [id, fetchCourseDetail]);

    // If already enrolled, redirect to course detail
    useEffect(() => {
        if (course?.is_enrolled) {
            navigate(`/courses/${id}`);
        }
    }, [course, id, navigate]);

    const handlePayment = async () => {
        if (!course || !user) return;

        const paymentData = {
            course: course.id,
            amount: course.price,
            currency: 'USD',
            payment_method: paymentMethod,
            metadata: {
                student_name: user.full_name || user.email,
                course_title: course.title
            }
        };

        const result = await initiatePayment(paymentData);
        if (result) {
            setIsSuccess(true);
            // In a real app, you'd redirect to the provider's checkout page here
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h2>
                    <p className="text-gray-600 mb-8">
                        Your payment order for <strong>{course.title}</strong> has been created.
                        Once payment is verified, you will be automatically enrolled.
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
                    {/* Left Side: Payment Methods */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                                <CreditCard className="w-5 h-5 text-[#0066CC] mr-3" />
                                <h2 className="text-lg font-bold text-gray-800">Select Payment Method</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div
                                    onClick={() => setPaymentMethod('BKASH')}
                                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'BKASH'
                                        ? 'border-[#0066CC] bg-blue-50'
                                        : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'BKASH' ? 'border-[#0066CC]' : 'border-gray-300'
                                        }`}>
                                        {paymentMethod === 'BKASH' && <div className="w-2.5 h-2.5 bg-[#0066CC] rounded-full" />}
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className="font-bold text-gray-800">bKash</span>
                                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-bold">POPULAR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-4">
                            <ShieldCheck className="w-8 h-8 text-[#0066CC] shrink-0" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-1">Secure Checkout</h3>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Your payment information is encrypted and processed securely. We never store your card details on our servers.
                                </p>
                            </div>
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
                                        <span>Original Price</span>
                                        <span className="font-medium">TK. {parseFloat(course.price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Discount</span>
                                        <span className="text-green-600 font-medium">- TK. 0</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="text-2xl font-black text-[#0066CC]">
                                            TK. {parseFloat(course.price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={handlePayment}
                                    disabled={paymentLoading}
                                    className="w-full bg-[#76C043] hover:bg-[#65a838] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {paymentLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span className='font-extrabold'>৳</span>
                                            Confirm Purchase
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    By clicking Confirm Purchase, you agree to our <Link to="/terms" className="underline">Terms of Service</Link>.
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
