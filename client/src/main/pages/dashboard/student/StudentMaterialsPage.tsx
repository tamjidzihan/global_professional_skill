/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    FileSpreadsheet,
    FileImage,
    FileCode,
    FileArchive,
    Download,
    Eye,
    Clock,
    User,
    Loader2,
    BookOpen,
    Info,
    AlertCircle,
} from 'lucide-react';
import { useCourseMaterials } from '../../../../hooks/useCourseMaterials';
import { useCourses } from '../../../../hooks/useCourses';
import { useEnrollments } from '../../../../hooks/useEnrollments';
import { useAuth } from '../../../../hooks/useAuth';
import SEO from '../../../components/SEO';
import toast from 'react-hot-toast';

export default function StudentMaterialsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const targetMaterialId = searchParams.get('id');

    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();
    const { enrollments, getMyEnrollments, loading: enrollmentsLoading } = useEnrollments();
    const { materials, fetchMaterials, loading: materialsLoading } = useCourseMaterials();

    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Clear selections when materials change
    useEffect(() => {
        setSelectedIds([]);
    }, [materials]);

    const handleBulkDownload = async () => {
        const selectedMaterials = materials.filter(m => selectedIds.includes(m.id));
        if (selectedMaterials.length === 0) return;
        const toastId = toast.loading(`Preparing to download ${selectedMaterials.length} file(s)...`);
        try {
            for (let i = 0; i < selectedMaterials.length; i++) {
                const mat = selectedMaterials[i];
                if (mat.file) {
                    const a = document.createElement('a');
                    a.href = mat.file;
                    a.download = mat.title;
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    if (i < selectedMaterials.length - 1) {
                        await new Promise(r => setTimeout(r, 350));
                    }
                }
            }
            toast.success(`Downloaded ${selectedMaterials.length} file(s)`, { id: toastId });
        } catch (error) {
            toast.error("Download failed", { id: toastId });
        }
    };

    useEffect(() => {
        getMyEnrollments();
        if (courseId) {
            fetchCourseDetail(courseId);
            fetchMaterials(courseId);
        }
    }, [courseId, fetchCourseDetail, fetchMaterials, getMyEnrollments]);

    // Set target material if query parameter exists
    useEffect(() => {
        if (materials.length > 0) {
            if (targetMaterialId && materials.some(m => m.id === targetMaterialId)) {
                setSelectedMaterialId(targetMaterialId);
            } else {
                setSelectedMaterialId(materials[0].id);
            }
        }
    }, [materials, targetMaterialId]);

    // Check if the user is enrolled or has permission (instructor/admin)
    useEffect(() => {
        if (course && user && enrollments.length > 0) {
            const isEnrolled = enrollments.some(e => e.course.id === courseId);
            const isInstructor = course.instructor.id === user.id;
            const isAdmin = user.role === 'ADMIN';

            if (!isEnrolled && !isInstructor && !isAdmin) {
                toast.error("You must be enrolled in this course to access the materials.");
                navigate('/dashboard/student/my-courses');
            }
        }
    }, [course, user, enrollments, courseId, navigate]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF':
                return <FileText className="w-6 h-6 text-rose-500 shrink-0" />;
            case 'IMAGE':
                return <FileImage className="w-6 h-6 text-emerald-500 shrink-0" />;
            case 'WORD':
                return <FileText className="w-6 h-6 text-blue-500 shrink-0" />;
            case 'EXCEL':
                return <FileSpreadsheet className="w-6 h-6 text-green-600 shrink-0" />;
            case 'POWERPOINT':
                return <FileCode className="w-6 h-6 text-orange-500 shrink-0" />;
            case 'ARCHIVE':
                return <FileArchive className="w-6 h-6 text-amber-600 shrink-0" />;
            default:
                return <FileText className="w-6 h-6 text-gray-500 shrink-0" />;
        }
    };

    const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

    const loading = courseLoading || enrollmentsLoading || materialsLoading;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
                <Link to="/dashboard/student/my-courses" className="text-violet-600 font-semibold hover:underline">
                    Back to My Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
            <SEO title={`Download Materials: ${course.title}`} noindex />

            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    to={`/dashboard/student/my-courses/${courseId}`}
                    className="p-2 bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Course Materials</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        View and download resources for <span className="font-semibold text-gray-800">{course.title}</span>
                    </p>
                </div>
            </div>

            {materials.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Pane: Materials List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 h-[600px] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                            <div className="flex items-center gap-2">
                                {materials.length > 0 && (
                                    <input
                                        type="checkbox"
                                        checked={materials.length > 0 && selectedIds.length === materials.length}
                                        onChange={() => {
                                            if (selectedIds.length === materials.length) {
                                                setSelectedIds([]);
                                            } else {
                                                setSelectedIds(materials.map(m => m.id));
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                    />
                                )}
                                <h2 className="text-sm font-bold text-gray-800">Available Resources</h2>
                            </div>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDownload}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-violet-600 hover:bg-violet-755 text-white font-bold rounded-lg text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                                >
                                    <Download className="w-3 h-3" /> Download ({selectedIds.length})
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            {materials.map((mat) => {
                                const isSelected = mat.id === selectedMaterialId;
                                const isChecked = selectedIds.includes(mat.id);
                                return (
                                    <button
                                        key={mat.id}
                                        onClick={() => setSelectedMaterialId(mat.id)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all border text-left cursor-pointer ${
                                            isSelected
                                                ? 'bg-violet-50/70 border-violet-100 text-violet-900 shadow-sm'
                                                : 'bg-white hover:bg-gray-50/70 border-transparent text-gray-700'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => {
                                                setSelectedIds(prev =>
                                                    prev.includes(mat.id)
                                                        ? prev.filter(id => id !== mat.id)
                                                        : [...prev, mat.id]
                                                );
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0 mt-0.5"
                                        />
                                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                            {getFileIcon(mat.file_type)}
                                            <div className="min-w-0 flex-1">
                                                <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-violet-950' : 'text-gray-900'}`}>
                                                    {mat.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-semibold">
                                                    <span>{mat.file_size_formatted}</span>
                                                    <span>•</span>
                                                    <span className="uppercase">{mat.file_type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Pane: Selected Material Details & Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedMaterial ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                                {/* File details header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-50 pb-5">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 self-start">
                                            {getFileIcon(selectedMaterial.file_type)}
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                                {selectedMaterial.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(selectedMaterial.uploaded_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span>By {selectedMaterial.uploaded_by_name || 'Instructor'}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                    {selectedMaterial.file_type} · {selectedMaterial.file_size_formatted}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedMaterial.file && (
                                        <a
                                            href={selectedMaterial.file}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all text-sm shrink-0"
                                        >
                                            <Download className="w-4 h-4" /> Download File
                                        </a>
                                    )}
                                </div>

                                {/* Preview Pane */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                        <Eye className="w-4 h-4 text-gray-400" />
                                        <h3>Document Preview</h3>
                                    </div>

                                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 flex flex-col items-center justify-center min-h-[350px]">
                                        {selectedMaterial.file ? (
                                            <>
                                                {selectedMaterial.file_type === 'IMAGE' && (
                                                    <div className="p-4 flex items-center justify-center w-full">
                                                        <img
                                                            src={selectedMaterial.file}
                                                            alt={selectedMaterial.title}
                                                            className="max-w-full max-h-[450px] object-contain rounded-xl shadow-sm border border-white"
                                                        />
                                                    </div>
                                                )}

                                                {selectedMaterial.file_type === 'PDF' && (
                                                    <iframe
                                                        src={`${selectedMaterial.file}#toolbar=0`}
                                                        title={selectedMaterial.title}
                                                        className="w-full h-[450px] border-none"
                                                    />
                                                )}

                                                {selectedMaterial.file_type !== 'IMAGE' && selectedMaterial.file_type !== 'PDF' && (
                                                    <div className="text-center p-8 max-w-sm">
                                                        <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                                                            {getFileIcon(selectedMaterial.file_type)}
                                                        </div>
                                                        <h4 className="text-sm font-bold text-gray-800">Preview not available</h4>
                                                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                                            We can only preview PDFs and Images inline. For Word, Excel, PowerPoint, text, or archive files, please download to view.
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center p-8 max-w-sm">
                                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                                <h4 className="text-sm font-bold text-gray-800">Access Restricted</h4>
                                                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                                    You do not have access to view or download this file. Please verify your enrollment status.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center text-gray-400">
                                <Info className="w-8 h-8 mb-2" />
                                <p className="text-sm font-medium">Select a file from the list to display details and download.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-xl mx-auto">
                    <div className="w-16 h-16 bg-violet-50 rounded-2xl border border-violet-100 flex items-center justify-center mx-auto mb-6 text-violet-400 shadow-sm">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">No Materials Uploaded</h2>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                        Your instructor hasn't uploaded any study materials, lecture sheets, or slide templates for this course yet.
                    </p>
                </div>
            )}
        </div>
    );
}
