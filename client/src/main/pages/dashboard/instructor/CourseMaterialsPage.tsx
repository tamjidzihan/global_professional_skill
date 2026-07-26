/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    FileSpreadsheet,
    FileImage,
    FileCode,
    FileArchive,
    UploadCloud,
    Trash2,
    CheckCircle,
    AlertCircle,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { useCourseMaterials } from '../../../../hooks/useCourseMaterials';
import { useCourses } from '../../../../hooks/useCourses';
import { useAuth } from '../../../../hooks/useAuth';
import SEO from '../../../components/SEO';
import toast from 'react-hot-toast';

interface UploadQueueItem {
    id: string;
    fileName: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    fileObj?: File;
}

export default function CourseMaterialsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { course, fetchCourseDetail, loading: courseLoading } = useCourses();
    const { materials, fetchMaterials, uploadMaterial, deleteMaterial, deleteMaterialsBulk, loading: materialsLoading } = useCourseMaterials();

    const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clear selections when materials change (e.g. after uploading or individual deletion)
    useEffect(() => {
        setSelectedIds([]);
    }, [materials]);

    useEffect(() => {
        if (courseId) {
            fetchCourseDetail(courseId);
            fetchMaterials(courseId);
        }
    }, [courseId, fetchCourseDetail, fetchMaterials]);

    // Role verification: only instructor of course or admin can access
    useEffect(() => {
        if (course && user) {
            const isInstructor = course.instructor.id === user.id;
            const isAdmin = user.role === 'ADMIN';
            if (!isInstructor && !isAdmin) {
                toast.error("Access denied. You do not have permission to manage materials for this course.");
                navigate('/dashboard/instructor/my-courses');
            }
        }
    }, [course, user, navigate]);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF':
                return <FileText className="w-8 h-8 text-rose-500 shrink-0" />;
            case 'IMAGE':
                return <FileImage className="w-8 h-8 text-emerald-500 shrink-0" />;
            case 'WORD':
                return <FileText className="w-8 h-8 text-blue-500 shrink-0" />;
            case 'EXCEL':
                return <FileSpreadsheet className="w-8 h-8 text-green-600 shrink-0" />;
            case 'POWERPOINT':
                return <FileCode className="w-8 h-8 text-orange-500 shrink-0" />;
            case 'ARCHIVE':
                return <FileArchive className="w-8 h-8 text-amber-600 shrink-0" />;
            default:
                return <FileText className="w-8 h-8 text-gray-500 shrink-0" />;
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFiles = (files: FileList) => {
        if (!courseId) return;
        const newQueueItems: UploadQueueItem[] = [];

        // Check file sizes first and build queue items
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const sizeLimit = 10 * 1024 * 1024; // 10MB

            if (file.size > sizeLimit) {
                toast.error(`"${file.name}" exceeds 10MB limit.`);
                continue;
            }

            const id = Math.random().toString(36).substr(2, 9);
            newQueueItems.push({
                id,
                fileName: file.name,
                progress: 0,
                status: 'pending',
                fileObj: file,
            });
        }

        if (newQueueItems.length === 0) return;

        // Add to uploading queue
        setUploadQueue(prev => [...prev, ...newQueueItems]);
    };

    const handleConfirmUpload = async () => {
        if (!courseId) return;
        const pendingItems = uploadQueue.filter(item => item.status === 'pending');
        if (pendingItems.length === 0) return;

        // Upload sequentially
        for (let i = 0; i < pendingItems.length; i++) {
            const queueItem = pendingItems[i];
            const file = queueItem.fileObj;
            if (!file) continue;

            // Update queue item to uploading
            setUploadQueue(prev =>
                prev.map(item =>
                    item.id === queueItem.id ? { ...item, status: 'uploading' } : item
                )
            );

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name.substring(0, file.name.lastIndexOf('.')) || file.name);

            try {
                await uploadMaterial(courseId, formData, (progressEvent) => {
                    const total = progressEvent.total || file.size;
                    const progress = Math.round((progressEvent.loaded * 100) / total);
                    setUploadQueue(prev =>
                        prev.map(item =>
                            item.id === queueItem.id ? { ...item, progress } : item
                        )
                    );
                });

                setUploadQueue(prev =>
                    prev.map(item =>
                        item.id === queueItem.id ? { ...item, status: 'success', progress: 100 } : item
                    )
                );
            } catch (err: any) {
                const errMsg = err.response?.data?.error?.message || "Upload failed";
                setUploadQueue(prev =>
                    prev.map(item =>
                        item.id === queueItem.id ? { ...item, status: 'error', error: errMsg } : item
                    )
                );
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFiles(e.target.files);
        }
    };

    const handleDelete = async (materialId: string) => {
        if (!courseId) return;
        if (window.confirm("Are you sure you want to delete this course material?")) {
            await deleteMaterial(courseId, materialId);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const clearQueue = () => {
        setUploadQueue([]);
    };

    const isUploading = uploadQueue.some(item => item.status === 'uploading');

    if (courseLoading || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
            <SEO title={`Manage Materials: ${course.title}`} noindex />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to={`/dashboard/instructor/my-courses/${courseId}`}
                        className="p-2 bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Course Materials</h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                                <Sparkles className="w-3 h-3 text-violet-500 animate-pulse" />
                                Premium
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Upload and manage materials for <span className="font-semibold text-gray-800">{course.title}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left pane: Upload Area & Queue */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
                        <h2 className="text-base font-bold text-gray-950">Upload New Material</h2>
                        
                        {/* Drag and Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                            className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                                dragActive
                                    ? 'border-violet-500 bg-violet-50/50'
                                    : 'border-gray-200 hover:border-violet-400 bg-gray-50/30'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileInput}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.svg,.webp,.txt,.zip,.rar"
                            />
                            <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100">
                                <UploadCloud className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Drag & drop files here</p>
                                <p className="text-xs text-gray-400 mt-1">or click to browse from device</p>
                            </div>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                Maximum size 10MB per file
                            </span>
                        </div>

                        {/* File Format Instructions */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Supported Formats</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                PDF, Images (JPG, PNG, SVG), Word (Doc, Docx), Excel (Xls, Xlsx), PowerPoint, Text files, and Archive folders (Zip, Rar).
                            </p>
                        </div>
                    </div>

                    {/* Upload Queue Section */}
                    {uploadQueue.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">Uploading Queue ({uploadQueue.length})</h3>
                                {!isUploading && (
                                    <button
                                        onClick={clearQueue}
                                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                                    >
                                        Clear completed
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {uploadQueue.map((item) => (
                                    <div key={item.id} className="p-3 border border-gray-100 rounded-xl space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-xs font-semibold text-gray-700 truncate flex-1">{item.fileName}</p>
                                            {item.status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                                            {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                            {item.status === 'uploading' && <Loader2 className="w-4 h-4 text-violet-600 animate-spin shrink-0" />}
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        setUploadQueue(prev => prev.filter(q => q.id !== item.id));
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="space-y-1">
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        item.status === 'error' ? 'bg-red-500' : 'bg-violet-600'
                                                    }`}
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                                                <span>{item.progress}%</span>
                                                {item.status === 'error' && <span className="text-red-500">{item.error}</span>}
                                                {item.status === 'pending' && <span className="text-amber-500 font-bold uppercase text-[9px] bg-amber-50 px-1 rounded">Pending</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {uploadQueue.some(item => item.status === 'pending') && (
                                <button
                                    onClick={handleConfirmUpload}
                                    disabled={isUploading}
                                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" /> Confirm & Upload {uploadQueue.filter(item => item.status === 'pending').length} File(s)
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right pane: Materials List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
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
                                        className="w-4.5 h-4.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                    />
                                )}
                                <div>
                                    <h2 className="text-base font-bold text-gray-950">Materials List</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Students will download files from this list</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                {materials.length} files
                            </span>
                        </div>

                        {/* Bulk actions bar */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl p-3.5 animate-fade-in">
                                <span className="text-xs font-bold text-violet-900">
                                    {selectedIds.length} file{selectedIds.length > 1 ? 's' : ''} selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={async () => {
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
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-violet-100 border border-violet-200 text-violet-700 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5 rotate-180" /> Download Selected
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!courseId) return;
                                            if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected material(s)?`)) {
                                                const success = await deleteMaterialsBulk(courseId, selectedIds);
                                                if (success) {
                                                    setSelectedIds([]);
                                                }
                                            }
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        {materialsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                                <p className="text-xs text-gray-400 font-medium">Loading course materials...</p>
                            </div>
                        ) : materials.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {materials.map((mat) => {
                                    const isSelected = selectedIds.includes(mat.id);
                                    return (
                                        <div key={mat.id} className={`py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group rounded-xl px-2 -mx-2 transition-all ${isSelected ? 'bg-violet-50/20' : ''}`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setSelectedIds(prev =>
                                                            prev.includes(mat.id)
                                                                ? prev.filter(id => id !== mat.id)
                                                                : [...prev, mat.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                                                />
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {getFileIcon(mat.file_type)}
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-semibold text-gray-800 truncate" title={mat.title}>
                                                            {mat.title}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                                                            <span>{mat.file_size_formatted}</span>
                                                            <span>•</span>
                                                            <span className="uppercase font-bold text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                                {mat.file_type}
                                                            </span>
                                                            <span>•</span>
                                                            <span>Uploaded {new Date(mat.uploaded_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {mat.file && (
                                                    <a
                                                        href={mat.file}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-violet-50 text-gray-400 hover:text-violet-600 rounded-lg transition-colors border border-transparent hover:border-violet-100"
                                                    >
                                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(mat.id)}
                                                    className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400 shadow-sm">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">No materials uploaded yet</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                    Get started by uploading PDFs, templates, images, or assignment briefs in the panel on the left.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
