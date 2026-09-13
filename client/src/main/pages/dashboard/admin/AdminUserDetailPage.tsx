/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Shield,
    BookOpen,
    GraduationCap,
    Award,
    AlertCircle,
    User as UserIcon,
    Building2,
    IdCard,
    Edit,
    RotateCcw,
    Send,
    Plus,
    Trash2,
    Download,
    Eye,
    ShieldAlert,
    ShieldCheck,
    Check,
    X,
    Search,
    CreditCard,
    AlertTriangle,
    Percent,
    ExternalLink,
} from 'lucide-react';
import { TbCurrencyTaka } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import SEO from '../../../components/SEO';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
    getUserFullDetail,
    adminUpdateUser,
    adminManualEnroll,
    adminUnenroll,
    adminToggleVerification,
    adminSendPasswordReset,
    adminSendVerification,
    getAnswerSheet,
    undisqualifyStudent,
    deleteQuizSubmission,
    getCourses,
    approvePayment,
    rejectPayment,
} from '../../../../lib/api';
import { extractErrorMessage } from '../../../../lib/errorUtils';
import { generateAnswerSheetPDF } from '../../../../lib/pdfUtilsInstructor';
import type { AdminUserFullDetail, User, CourseDetail } from '../../../../types';

const card = 'bg-white rounded-xl border border-gray-100 shadow-sm';
const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100';

type ActiveTab = 'overview' | 'courses' | 'quizzes' | 'payments';

export const AdminUserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<AdminUserFullDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

    // Filter and search states
    const [courseSearch, setCourseSearch] = useState('');
    const [courseStatusFilter, setCourseStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

    const [quizSearch, setQuizSearch] = useState('');
    const [quizFilter, setQuizFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'DISQUALIFIED'>('ALL');

    const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'REJECTED'>('ALL');

    // Modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showAnswerSheetModal, setShowAnswerSheetModal] = useState(false);

    // Modal data states
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [savingUser, setSavingUser] = useState(false);

    const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('STUDENT');
    const [updatingRole, setUpdatingRole] = useState(false);

    const [allCourses, setAllCourses] = useState<CourseDetail[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
    const [answerSheetData, setAnswerSheetData] = useState<any>(null);
    const [loadingAnswerSheet, setLoadingAnswerSheet] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    // Action loaders
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    const loadUserDetail = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getUserFullDetail(userId);
            if (res.data.success && res.data.data) {
                setData(res.data.data);
                setEditForm(res.data.data.user);
                setSelectedRole(res.data.data.user.role);
            } else {
                setError('Failed to retrieve user details.');
            }
        } catch (err: any) {
            setError(extractErrorMessage(err) || 'Failed to load user details.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadUserDetail();
    }, [loadUserDetail]);

    // Handle Edit User Submit
    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setSavingUser(true);
        try {
            const res = await adminUpdateUser(userId, {
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                email: editForm.email,
                phone_number: editForm.phone_number,
                organization_name: editForm.organization_name,
                employee_id: editForm.employee_id,
                bio: editForm.bio,
                is_active: editForm.is_active,
                email_verified: editForm.email_verified,
                phone_verified: editForm.phone_verified,
            });
            if (res.data.success) {
                toast.success('User updated successfully!');
                setShowEditModal(false);
                loadUserDetail();
            }
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to update user.');
        } finally {
            setSavingUser(false);
        }
    };

    // Handle Role Change
    const handleRoleChange = async () => {
        if (!userId) return;
        setUpdatingRole(true);
        try {
            const res = await adminUpdateUser(userId, { role: selectedRole });
            if (res.data.success) {
                toast.success(`User role updated to ${selectedRole}!`);
                setShowRoleModal(false);
                loadUserDetail();
            }
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to change user role.');
        } finally {
            setUpdatingRole(false);
        }
    };

    // Toggle Account Active / Inactive
    const handleToggleActive = async () => {
        if (!userId || !data) return;
        const newStatus = !data.user.is_active;
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) return;

        setProcessingAction('toggle_active');
        try {
            await adminUpdateUser(userId, { is_active: newStatus });
            toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully.`);
            loadUserDetail();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Action failed.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Toggle Email or Phone Verification
    const handleToggleVerification = async (type: 'email' | 'phone') => {
        if (!userId || !data) return;
        setProcessingAction(`verify_${type}`);
        try {
            await adminToggleVerification(userId, type);
            toast.success(`${type === 'email' ? 'Email' : 'Phone'} verification status updated.`);
            loadUserDetail();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to update verification status.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Send Password Reset Link
    const handleSendPasswordReset = async () => {
        if (!userId || !data) return;
        if (!window.confirm(`Send password reset email to ${data.user.email}?`)) return;

        setProcessingAction('send_reset');
        try {
            await adminSendPasswordReset(userId);
            toast.success(`Password reset link dispatched to ${data.user.email}.`);
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to send password reset email.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Send Verification Link
    const handleSendVerification = async () => {
        if (!userId || !data) return;
        setProcessingAction('send_verification');
        try {
            await adminSendVerification(userId);
            toast.success(`Verification link sent to ${data.user.email}.`);
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to send verification.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Open Enroll Modal and fetch courses
    const handleOpenEnrollModal = async () => {
        setShowEnrollModal(true);
        if (allCourses.length === 0) {
            setLoadingCourses(true);
            try {
                const res = await getCourses({ status: 'PUBLISHED' });
                const resData = res.data as any;
                const courseList = resData?.results?.data || resData?.results || resData?.data || [];
                setAllCourses(Array.isArray(courseList) ? courseList : []);
            } catch (err) {
                console.error('Failed to fetch courses for enrollment', err);
            } finally {
                setLoadingCourses(false);
            }
        }
    };

    // Manual Course Enrollment
    const handleManualEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !selectedCourseToEnroll) return;
        setEnrolling(true);
        try {
            const res = await adminManualEnroll(userId, selectedCourseToEnroll);
            if (res.data.success) {
                toast.success(res.data.message || 'Student enrolled successfully!');
                setShowEnrollModal(false);
                setSelectedCourseToEnroll('');
                loadUserDetail();
            }
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to enroll student.');
        } finally {
            setEnrolling(false);
        }
    };

    // Unenroll from Course
    const handleUnenroll = async (courseId: string, courseTitle: string) => {
        if (!userId) return;
        if (!window.confirm(`Unenroll student from "${courseTitle}"? Progress data will be removed.`)) return;

        setProcessingAction(`unenroll_${courseId}`);
        try {
            await adminUnenroll(userId, courseId);
            toast.success(`Student unenrolled from ${courseTitle}.`);
            loadUserDetail();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to unenroll student.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Open Answer Sheet Modal
    const handleViewAnswerSheet = async (submissionId: string) => {
        setActiveSubmissionId(submissionId);
        setShowAnswerSheetModal(true);
        setLoadingAnswerSheet(true);
        setAnswerSheetData(null);
        try {
            const res = await getAnswerSheet(submissionId);
            if (res.data.success) {
                setAnswerSheetData(res.data.data);
            } else {
                toast.error(res.data.error?.message || 'Failed to load answer sheet');
            }
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to fetch answer sheet details.');
        } finally {
            setLoadingAnswerSheet(false);
        }
    };

    // Download Answer Sheet PDF
    const handleDownloadAnswerSheetPDF = async (submissionId: string) => {
        if (!data) return;
        setDownloadingPdf(true);
        try {
            let sheet = answerSheetData;
            if (!sheet || activeSubmissionId !== submissionId) {
                const res = await getAnswerSheet(submissionId);
                sheet = res.data.data;
            }
            const studentName = data.user.full_name || `${data.user.first_name} ${data.user.last_name}`.trim() || data.user.email;
            await generateAnswerSheetPDF(sheet, studentName);
            toast.success('Answer sheet PDF downloaded successfully.');
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to generate PDF.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    // Undisqualify Student Quiz
    const handleUndisqualifyQuiz = async (submissionId: string, quizTitle: string) => {
        if (!window.confirm(`Reset anti-cheat warnings and undisqualify quiz "${quizTitle}"?`)) return;
        setProcessingAction(`undisqualify_${submissionId}`);
        try {
            await undisqualifyStudent(submissionId);
            toast.success('Student undisqualified. Submission restored.');
            loadUserDetail();
            if (showAnswerSheetModal) {
                handleViewAnswerSheet(submissionId);
            }
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to undisqualify.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Delete Quiz Submission (Allows retake)
    const handleDeleteQuizSubmission = async (submissionId: string, quizTitle: string) => {
        if (!window.confirm(`Delete submission for "${quizTitle}"? This will allow the student to retake the quiz.`)) return;
        setProcessingAction(`delete_sub_${submissionId}`);
        try {
            await deleteQuizSubmission(submissionId);
            toast.success('Quiz submission deleted successfully.');
            if (showAnswerSheetModal) setShowAnswerSheetModal(false);
            loadUserDetail();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to delete quiz submission.');
        } finally {
            setProcessingAction(null);
        }
    };

    // Payment Actions (Approve / Reject)
    const handleApprovePayment = async (paymentId: string) => {
        if (!window.confirm('Approve this payment and enroll student?')) return;
        setProcessingAction(`approve_pay_${paymentId}`);
        try {
            await approvePayment(paymentId);
            toast.success('Payment approved and student enrolled!');
            loadUserDetail();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to approve payment.');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleRejectPayment = async (paymentId: string) => {
        if (!window.confirm('Reject this payment request?')) return;
        setProcessingAction(`reject_pay_${paymentId}`);
        try {
            await rejectPayment(paymentId);
            toast.success('Payment rejected.');
            loadUserDetail();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || 'Failed to reject payment.');
        } finally {
            setProcessingAction(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <LoadingSpinner />
                <p className="text-xs font-medium text-gray-400">Loading user profile and details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="py-8 px-4 md:px-6 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard/admin/users')}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
                </button>
                <div className={`${card} p-8 text-center space-y-4`}>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">User Not Found</h2>
                        <p className="text-sm text-gray-500 mt-1">{error || 'Could not find the requested user.'}</p>
                    </div>
                    <button
                        onClick={loadUserDetail}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const { user, stats, enrollments, quiz_submissions, payments } = data;

    const filteredCourses = enrollments.filter((e) => {
        const matchesSearch = e.course_title.toLowerCase().includes(courseSearch.toLowerCase());
        if (!matchesSearch) return false;
        if (courseStatusFilter === 'COMPLETED') return e.is_completed;
        if (courseStatusFilter === 'IN_PROGRESS') return !e.is_completed;
        return true;
    });

    const filteredQuizzes = quiz_submissions.filter((q) => {
        const matchesSearch =
            q.quiz_title.toLowerCase().includes(quizSearch.toLowerCase()) ||
            q.course_title.toLowerCase().includes(quizSearch.toLowerCase());
        if (!matchesSearch) return false;
        if (quizFilter === 'DISQUALIFIED') return q.is_disqualified;
        if (quizFilter === 'PASSED') return q.passed && !q.is_disqualified;
        if (quizFilter === 'FAILED') return !q.passed && !q.is_disqualified;
        return true;
    });

    const filteredPayments = payments.filter((p) => {
        if (paymentFilter === 'ALL') return true;
        return p.status === paymentFilter;
    });

    const roleBadgeConfig: Record<string, { bg: string; text: string; icon: typeof UserIcon }> = {
        ADMIN: { bg: 'bg-violet-50 text-violet-700 border-violet-100', text: 'Admin', icon: Shield },
        INSTRUCTOR: { bg: 'bg-blue-50 text-blue-700 border-blue-100', text: 'Instructor', icon: BookOpen },
        STUDENT: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'Student', icon: GraduationCap },
    };
    const roleCfg = roleBadgeConfig[user.role] || roleBadgeConfig.STUDENT;
    const RoleIcon = roleCfg.icon;

    return (
        <div className="py-6 px-4 md:px-6 space-y-6 mx-auto">
            <SEO title={`User: ${user.full_name || user.email} | Admin Panel`} noindex={true} />

            {/* Back Nav & Header */}
            <div>
                <button
                    onClick={() => navigate('/dashboard/admin/users')}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors mb-2 cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to User Management
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-violet-200 shrink-0 overflow-hidden">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || user.email[0].toUpperCase()
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email}
                                </h1>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-lg border ${roleCfg.bg}`}>
                                    <RoleIcon className="w-3 h-3" /> {roleCfg.text}
                                </span>
                                {user.is_active ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <CheckCircle className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                        <XCircle className="w-3 h-3" /> Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-3 flex-wrap">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                                {user.phone_number && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone_number}</span>}
                                {user.organization_name && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {user.organization_name}</span>}
                            </p>
                        </div>
                    </div>

                    {/* Quick Admin Actions Bar */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 shadow-xs transition-colors cursor-pointer"
                        >
                            <Edit className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                        <button
                            onClick={() => setShowRoleModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-700 shadow-xs transition-colors cursor-pointer"
                        >
                            <Shield className="w-3.5 h-3.5" /> Change Role
                        </button>
                        <button
                            onClick={handleToggleActive}
                            disabled={processingAction === 'toggle_active'}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer ${user.is_active
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                        >
                            {user.is_active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className={`${card} p-3.5 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Enrollments</p>
                        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{stats.total_enrollments}</p>
                    </div>
                </div>

                <div className={`${card} p-3.5 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Completed</p>
                        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{stats.completed_courses}</p>
                    </div>
                </div>

                <div className={`${card} p-3.5 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">In Progress</p>
                        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{stats.in_progress_courses}</p>
                    </div>
                </div>

                <div className={`${card} p-3.5 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Quizzes Taken</p>
                        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{stats.total_quizzes_taken}</p>
                    </div>
                </div>

                <div className={`${card} p-3.5 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Percent className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Avg Quiz Score</p>
                        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{stats.average_quiz_score}%</p>
                    </div>
                </div>

                <div className={`${card} p-3.5 flex items-center gap-3`}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <TbCurrencyTaka className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total Spent</p>
                        <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">৳{stats.total_spent}</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex items-center gap-1 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'overview'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <UserIcon className="w-4 h-4" /> Overview & Security
                </button>
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'courses'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <BookOpen className="w-4 h-4" /> Enrolled Courses ({enrollments.length})
                </button>
                <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'quizzes'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <Award className="w-4 h-4" /> Quizzes & Results ({quiz_submissions.length})
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'payments'
                            ? 'border-violet-600 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <CreditCard className="w-4 h-4" /> Payments & Transactions ({payments.length})
                </button>
            </div>

            {/* TAB 1: OVERVIEW & SECURITY */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Left 2 Cols: Profile & Identity */}
                    <div className="md:col-span-2 space-y-5">
                        <div className={card}>
                            <div className={cardHeader}>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <IdCard className="w-4 h-4 text-violet-600" /> Personal & Professional Details
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="text-xs text-violet-600 hover:text-violet-700 font-semibold cursor-pointer"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 divide-gray-100">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Full Name</p>
                                    <p className="text-sm font-semibold text-gray-800">{user.full_name || `${user.first_name} ${user.last_name}` || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-800 break-all">{user.email}</p>
                                </div>
                                <div className="space-y-1 pt-3 sm:pt-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Mobile Number</p>
                                    <p className="text-sm font-semibold text-gray-800">{user.phone_number || '—'}</p>
                                </div>
                                <div className="space-y-1 pt-3 sm:pt-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Organization Name</p>
                                    <p className="text-sm font-semibold text-gray-800">{user.organization_name || '—'}</p>
                                </div>
                                <div className="space-y-1 pt-3 sm:pt-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Employee ID</p>
                                    <p className="text-sm font-semibold text-gray-800 font-mono">{user.employee_id || '—'}</p>
                                </div>
                                <div className="space-y-1 pt-3 sm:pt-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Assigned Role</p>
                                    <p className="text-sm font-semibold text-gray-800">{user.role}</p>
                                </div>
                                {user.bio && (
                                    <div className="sm:col-span-2 pt-3 space-y-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Biography</p>
                                        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{user.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity & System Meta */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" /> Account Timestamps & Meta
                                </h3>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Date Joined</p>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {user.date_joined ? format(new Date(user.date_joined), 'MMM d, yyyy · h:mm a') : '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Last Login</p>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy · h:mm a') : 'Never logged in'}
                                        </p>
                                    </div>
                                </div>

                                <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Internal User UUID</p>
                                    <p className="text-xs font-mono text-gray-500 break-all mt-0.5">{user.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Security & Admin Actions */}
                    <div className="space-y-5">
                        <div className={card}>
                            <div className={cardHeader}>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verification Status
                                </h3>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2.5">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">Email Verified</p>
                                            <p className="text-[11px] text-gray-400">{user.email_verified ? 'Account verified' : 'Unverified email'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleVerification('email')}
                                        disabled={processingAction === 'verify_email'}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${user.email_verified
                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                            }`}
                                    >
                                        {user.email_verified ? 'Verified' : 'Unverified'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">Phone Verified</p>
                                            <p className="text-[11px] text-gray-400">{user.phone_verified ? 'SMS confirmed' : 'Unverified phone'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleVerification('phone')}
                                        disabled={processingAction === 'verify_phone'}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${user.phone_verified
                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                            }`}
                                    >
                                        {user.phone_verified ? 'Verified' : 'Unverified'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Triggers */}
                        <div className={card}>
                            <div className={cardHeader}>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Security Operations
                                </h3>
                            </div>

                            <div className="p-5 space-y-3">
                                <button
                                    onClick={handleSendPasswordReset}
                                    disabled={processingAction === 'send_reset'}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shadow-xs"
                                >
                                    <Send className="w-3.5 h-3.5" /> Send Password Reset Email
                                </button>

                                <button
                                    onClick={handleSendVerification}
                                    disabled={processingAction === 'send_verification'}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors cursor-pointer shadow-xs"
                                >
                                    <Mail className="w-3.5 h-3.5" /> Dispatch Verification Instructions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ENROLLED COURSES */}
            {activeTab === 'courses' && (
                <div className="space-y-4">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Status Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {(['ALL', 'IN_PROGRESS', 'COMPLETED'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setCourseStatusFilter(filter)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${courseStatusFilter === filter
                                            ? 'bg-gray-900 text-white shadow-xs'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter === 'ALL' ? 'All Courses' : filter === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-56">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                />
                            </div>

                            <button
                                onClick={handleOpenEnrollModal}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                            >
                                <Plus className="w-3.5 h-3.5" /> Enroll in Course
                            </button>
                        </div>
                    </div>

                    {/* Enrolled Courses Table / List */}
                    <div className={`${card} overflow-hidden`}>
                        {filteredCourses.length === 0 ? (
                            <div className="p-12 text-center">
                                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-800">No enrolled courses found</p>
                                <p className="text-xs text-gray-400 mt-1">This user is not enrolled in any matching courses.</p>
                                <button
                                    onClick={handleOpenEnrollModal}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Enroll in Course Now
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/70">
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Course</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Progress</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Enrolled At</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Certificate</th>
                                            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredCourses.map((e) => (
                                            <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                            {e.course_thumbnail ? (
                                                                <img src={e.course_thumbnail} alt={e.course_title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <BookOpen className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate max-w-xs">{e.course_title}</p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                                {e.category_name} · Instructor: {e.instructor_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="w-36 space-y-1">
                                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                                                            <span>{e.progress_percentage}%</span>
                                                            <span>{e.completed_lessons_count}/{e.total_lessons_count} lessons</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${e.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-violet-600'
                                                                    }`}
                                                                style={{ width: `${Math.min(100, Math.max(0, e.progress_percentage))}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                                                    {format(new Date(e.enrolled_at), 'MMM d, yyyy')}
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {e.is_completed ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            <CheckCircle className="w-3 h-3" /> Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                                            <Clock className="w-3 h-3" /> In Progress
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {e.certificate ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                                            <Award className="w-3 h-3" /> Issued
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/courses/${e.course_id}`)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors cursor-pointer"
                                                            title="View Course"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUnenroll(e.course_id, e.course_title)}
                                                            disabled={processingAction === `unenroll_${e.course_id}`}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors cursor-pointer"
                                                            title="Unenroll Student"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: QUIZZES & PROCTORING RESULTS */}
            {activeTab === 'quizzes' && (
                <div className="space-y-4">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {(['ALL', 'PASSED', 'FAILED', 'DISQUALIFIED'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setQuizFilter(filter)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${quizFilter === filter
                                            ? 'bg-gray-900 text-white shadow-xs'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter === 'ALL'
                                        ? 'All Quizzes'
                                        : filter === 'PASSED'
                                            ? 'Passed'
                                            : filter === 'FAILED'
                                                ? 'Failed'
                                                : 'Disqualified'}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-56">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search quizzes..."
                                value={quizSearch}
                                onChange={(e) => setQuizSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    {/* Submissions List */}
                    <div className={`${card} overflow-hidden`}>
                        {filteredQuizzes.length === 0 ? (
                            <div className="p-12 text-center">
                                <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-800">No quiz submissions found</p>
                                <p className="text-xs text-gray-400 mt-1">No quizzes taken by this user match the selected filter.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/70">
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Quiz & Course</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Score & Result</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Proctoring & Anti-Cheat</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Attempt & Date</th>
                                            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredQuizzes.map((q) => (
                                            <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{q.quiz_title}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">{q.course_title}</p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-900">
                                                                {q.score} / {q.total_marks} ({q.percentage}%)
                                                            </span>
                                                            {q.is_disqualified ? (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                                                    Disqualified
                                                                </span>
                                                            ) : q.passed ? (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                    Passed
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </div>
                                                        {q.disqualification_reason && (
                                                            <p className="text-[10px] text-rose-600 truncate max-w-xs">{q.disqualification_reason}</p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="text-[11px] text-gray-600 space-y-0.5">
                                                        <p className="flex items-center gap-1.5 font-medium">
                                                            <AlertCircle className={`w-3.5 h-3.5 ${q.warnings_count > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
                                                            Warnings: <span className="font-bold">{q.warnings_count}</span>
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">
                                                            Tab Switches: {q.blur_count} · Copies: {q.copy_count} · Fullscreen Exits: {q.fullscreen_exit_count}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                                                    <p className="text-xs font-medium">Attempt #{q.attempt_number}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        {q.submitted_at || q.completed_at
                                                            ? format(new Date(q.submitted_at || q.completed_at!), 'MMM d, yyyy · h:mm a')
                                                            : '—'}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleViewAnswerSheet(q.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer"
                                                            title="Inspect Full Question-by-Question Result"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> Answer Sheet
                                                        </button>

                                                        <button
                                                            onClick={() => handleDownloadAnswerSheetPDF(q.id)}
                                                            disabled={downloadingPdf}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>

                                                        {q.is_disqualified && (
                                                            <button
                                                                onClick={() => handleUndisqualifyQuiz(q.id, q.quiz_title)}
                                                                disabled={processingAction === `undisqualify_${q.id}`}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                                                                title="Reset warnings and undisqualify"
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" /> Undisqualify
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDeleteQuizSubmission(q.id, q.quiz_title)}
                                                            disabled={processingAction === `delete_sub_${q.id}`}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                                                            title="Delete result (Allow retake)"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: PAYMENTS & BILLING */}
            {activeTab === 'payments' && (
                <div className="space-y-4">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {(['ALL', 'COMPLETED', 'PENDING', 'REJECTED'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setPaymentFilter(filter)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${paymentFilter === filter
                                        ? 'bg-gray-900 text-white shadow-xs'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {filter === 'ALL'
                                    ? 'All Transactions'
                                    : filter === 'COMPLETED'
                                        ? 'Approved / Completed'
                                        : filter === 'PENDING'
                                            ? 'Pending Approval'
                                            : 'Rejected'}
                            </button>
                        ))}
                    </div>

                    <div className={`${card} overflow-hidden`}>
                        {filteredPayments.length === 0 ? (
                            <div className="p-12 text-center">
                                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-800">No payment orders found</p>
                                <p className="text-xs text-gray-400 mt-1">This user has not placed any matching checkout orders.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/70">
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Course & TrxID</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Amount</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Method & Sender</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Created At</th>
                                            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPayments.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{p.course_title}</p>
                                                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">Trx: {p.transaction_id || '—'}</p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="text-xs font-bold text-gray-900 flex items-center">
                                                        <TbCurrencyTaka className="w-3.5 h-3.5 inline" />
                                                        {p.amount}
                                                    </span>
                                                    {p.metadata?.promo_code && (
                                                        <span className="text-[10px] text-emerald-600 font-semibold block">
                                                            Promo: {p.metadata.promo_code} (-৳{p.metadata.discount_amount})
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <p className="text-xs font-semibold text-gray-800">{p.payment_method}</p>
                                                    <p className="text-[11px] text-gray-400">{p.sender_number || '—'}</p>
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {p.status === 'COMPLETED' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            <CheckCircle className="w-3 h-3" /> Approved
                                                        </span>
                                                    ) : p.status === 'PENDING' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                                            <Clock className="w-3 h-3" /> Pending
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                                            <XCircle className="w-3 h-3" /> {p.status}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                                                    {format(new Date(p.created_at), 'MMM d, yyyy · h:mm a')}
                                                </td>

                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    {p.status === 'PENDING' && (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleApprovePayment(p.id)}
                                                                disabled={processingAction === `approve_pay_${p.id}`}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                                                            >
                                                                <Check className="w-3 h-3" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectPayment(p.id)}
                                                                disabled={processingAction === `reject_pay_${p.id}`}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                                                            >
                                                                <X className="w-3 h-3" /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL 1: EDIT USER PROFILE */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Edit className="w-4 h-4 text-violet-600" /> Edit User Profile
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={editForm.first_name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={editForm.last_name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    placeholder="+8801XXXXXXXXX"
                                    value={editForm.phone_number || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Organization</label>
                                    <input
                                        type="text"
                                        value={editForm.organization_name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, organization_name: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID</label>
                                    <input
                                        type="text"
                                        value={editForm.employee_id || ''}
                                        onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Biography</label>
                                <textarea
                                    rows={3}
                                    value={editForm.bio || ''}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                                />
                            </div>

                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.is_active ?? true}
                                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                        className="rounded text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700">Account is Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.email_verified ?? false}
                                        onChange={(e) => setEditForm({ ...editForm, email_verified: e.target.checked })}
                                        className="rounded text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700">Email Address is Verified</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.phone_verified ?? false}
                                        onChange={(e) => setEditForm({ ...editForm, phone_verified: e.target.checked })}
                                        className="rounded text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700">Phone Number is Verified</span>
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shadow-xs"
                                >
                                    {savingUser ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: CHANGE ROLE */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-violet-600" /> Change User Role
                            </h3>
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            {(['STUDENT', 'INSTRUCTOR', 'ADMIN'] as const).map((r) => (
                                <label
                                    key={r}
                                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${selectedRole === r
                                            ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-200'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role_radio"
                                        value={r}
                                        checked={selectedRole === r}
                                        onChange={() => setSelectedRole(r)}
                                        className="mt-0.5 text-violet-600 focus:ring-violet-500"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{r}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {r === 'STUDENT' && 'Can enroll in courses, take proctored quizzes, and earn certificates.'}
                                            {r === 'INSTRUCTOR' && 'Can create curriculum, publish quizzes, upload materials, and review submissions.'}
                                            {r === 'ADMIN' && 'Full superuser access over courses, users, site settings, and payments.'}
                                        </p>
                                    </div>
                                </label>
                            ))}

                            <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRoleChange}
                                    disabled={updatingRole}
                                    className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shadow-xs"
                                >
                                    {updatingRole ? 'Updating...' : 'Confirm Role'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: ENROLL IN COURSE */}
            {showEnrollModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-violet-600" /> Manual Course Enrollment
                            </h3>
                            <button
                                onClick={() => setShowEnrollModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleManualEnrollSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Published Course</label>
                                {loadingCourses ? (
                                    <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                        <LoadingSpinner /> Loading published courses...
                                    </div>
                                ) : (
                                    <select
                                        value={selectedCourseToEnroll}
                                        onChange={(e) => setSelectedCourseToEnroll(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 bg-white"
                                        required
                                    >
                                        <option value="">-- Choose a course --</option>
                                        {allCourses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title} (৳{c.price})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed bg-violet-50/60 p-3 rounded-lg border border-violet-100">
                                This will immediately grant full access to the course and initialize progress tracking for this student.
                            </p>

                            <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEnrollModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={enrolling || !selectedCourseToEnroll}
                                    className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    {enrolling ? 'Enrolling...' : 'Enroll Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: FULL ANSWER SHEET & QUESTION-BY-QUESTION REVIEW */}
            {showAnswerSheetModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-violet-600" /> Quiz Answer Sheet & Proctoring Review
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {answerSheetData?.quiz_title || 'Quiz Submission'} · Student: {user.full_name || user.email}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAnswerSheetModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {loadingAnswerSheet ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <LoadingSpinner />
                                    <p className="text-xs text-gray-400">Loading full question responses and answer sheet...</p>
                                </div>
                            ) : answerSheetData ? (
                                <>
                                    {/* Score Overview Banner */}
                                    <div className="p-4 rounded-xl bg-linear-to-r from-violet-50 to-indigo-50 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-violet-600 font-bold text-lg shrink-0">
                                                {answerSheetData.percentage}%
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-gray-900">
                                                        Score: {answerSheetData.score} / {answerSheetData.total_marks} Marks
                                                    </h4>
                                                    {answerSheetData.is_disqualified ? (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700">
                                                            Disqualified
                                                        </span>
                                                    ) : answerSheetData.passed ? (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                                                            Passed
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700">
                                                            Failed
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Warnings: {answerSheetData.warnings_count} · Tab Blurs: {answerSheetData.blur_count || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => activeSubmissionId && handleDownloadAnswerSheetPDF(activeSubmissionId)}
                                            disabled={downloadingPdf}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors shadow-xs cursor-pointer shrink-0"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download PDF Answer Sheet
                                        </button>
                                    </div>

                                    {/* Questions Breakdown */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                            Questions & Responses ({answerSheetData.questions?.length || 0})
                                        </h4>

                                        {answerSheetData.questions?.map((q: any, idx: number) => (
                                            <div
                                                key={q.id || idx}
                                                className={`p-4 rounded-xl border transition-all ${q.is_correct
                                                        ? 'bg-emerald-50/30 border-emerald-100'
                                                        : 'bg-rose-50/30 border-rose-100'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-start gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                                                            {idx + 1}
                                                        </span>
                                                        <p className="text-xs font-bold text-gray-900 leading-relaxed">{q.question_text}</p>
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-1.5">
                                                        {q.is_correct ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                                                                <Check className="w-3 h-3" /> +{q.marks_awarded || q.marks || 1}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800">
                                                                <X className="w-3 h-3" /> 0 Marks
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Options */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                                    {q.options?.map((opt: any, oIdx: number) => {
                                                        const isSelected = String(q.selected_option_id) === String(opt.id) || q.student_answer === opt.text;
                                                        const isCorrect = opt.is_correct || String(q.correct_option_id) === String(opt.id);

                                                        let optClass = 'bg-white border-gray-200 text-gray-700';
                                                        if (isCorrect) {
                                                            optClass = 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold';
                                                        } else if (isSelected && !isCorrect) {
                                                            optClass = 'bg-rose-100/70 border-rose-300 text-rose-900 line-through';
                                                        }

                                                        return (
                                                            <div
                                                                key={opt.id || oIdx}
                                                                className={`px-3 py-2 text-xs rounded-lg border flex items-center justify-between gap-2 ${optClass}`}
                                                            >
                                                                <span className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                                                        {String.fromCharCode(65 + oIdx)}.
                                                                    </span>
                                                                    <span className="truncate">{opt.text}</span>
                                                                </span>
                                                                {isSelected && (
                                                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-900 text-white shrink-0">
                                                                        Chosen
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {q.explanation && (
                                                    <div className="mt-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-600">
                                                        <span className="font-semibold text-gray-800">Explanation: </span>
                                                        {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-6">No answer sheet data available.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
                            {answerSheetData?.is_disqualified && activeSubmissionId ? (
                                <button
                                    onClick={() => handleUndisqualifyQuiz(activeSubmissionId, answerSheetData.quiz_title)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Undisqualify Student
                                </button>
                            ) : <div />}

                            <button
                                onClick={() => setShowAnswerSheetModal(false)}
                                className="px-4 py-2 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetailPage;
