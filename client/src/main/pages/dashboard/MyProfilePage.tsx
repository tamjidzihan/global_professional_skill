/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    Mail,
    Phone,
    Shield,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Pencil,
    X,
    Save,
    Camera,
    User as UserIcon,
    Globe,
    Award,
    BookOpen,
    Star,
    Lock,
    RefreshCw,
} from 'lucide-react'
import { useMyProfile } from '../../../hooks/useMyProfile'
import { useAuth } from '../../../hooks/useAuth'
import type { User } from '../../../types'

export function MyProfilePage() {
    const navigate = useNavigate()
    const { isAuthenticated, loading: authLoading } = useAuth()
    const {
        profile,
        isLoading,
        error,
        updateProfile,
        isUpdating,
        updateError,
        updateSuccess,
        fetchProfile,
    } = useMyProfile()

    const [isEditing, setIsEditing] = useState(false)
    const [form, setForm] = useState(() => ({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone_number: profile?.phone_number || '',
        bio: profile?.bio || '',
    }))

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'personal' | 'account'>('personal')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLDivElement>(null)

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    // Initialize form state when profile loads or editing mode changes
    useEffect(() => {
        if (profile && !isEditing) {
            setForm({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone_number: profile.phone_number || '',
                bio: profile.bio || '',
            })
        }
    }, [profile, isEditing])

    // Toast feedback
    useEffect(() => {
        if (updateSuccess) {
            toast.success('Profile updated successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
            fetchProfile()
            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        if (updateError) {
            toast.error(updateError, {
                position: 'top-right',
                autoClose: 5000,
            })
        }
    }, [updateSuccess, updateError, fetchProfile])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.warning('Please select an image under 5MB')
                return
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.warning('Please select a valid image file')
                return
            }

            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleRemovePhoto = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSave = async () => {
        if (!profile) return

        // Validate required fields
        if (!form.first_name.trim() || !form.last_name.trim()) {
            toast.warning('First name and last name are required')
            return
        }

        let dataToUpdate: Partial<User> | FormData = form

        if (selectedFile) {
            const formData = new FormData()
            formData.append('profile_picture', selectedFile)

            Object.keys(form).forEach(key => {
                const formValue = form[key as keyof typeof form]
                if (formValue !== undefined && formValue !== null &&
                    formValue !== profile[key as keyof typeof profile]) {
                    formData.append(key, formValue.toString())
                }
            })

            dataToUpdate = formData
        }

        await updateProfile(dataToUpdate)
        setIsEditing(false)
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    const handleCancel = () => {
        if (profile) {
            setForm({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone_number: profile.phone_number || '',
                bio: profile.bio || '',
            })
        }
        setSelectedFile(null)
        setPreviewUrl(null)
        setIsEditing(false)
    }

    const roleBadgeColor: Record<string, string> = {
        STUDENT: 'bg-blue-50 text-blue-700 border border-blue-200',
        INSTRUCTOR: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
    }

    const roleIcon: Record<string, React.ReactNode> = {
        STUDENT: <BookOpen className="w-3.5 h-3.5" />,
        INSTRUCTOR: <Award className="w-3.5 h-3.5" />,
        ADMIN: <Shield className="w-3.5 h-3.5" />,
    }

    const displayData = profile
    const initials =
        (displayData?.first_name?.[0] || '') +
        (displayData?.last_name?.[0] || '') ||
        displayData?.email?.[0]?.toUpperCase() ||
        '?'

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Loading state with skeleton
    if (authLoading || (isLoading && !profile)) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="h-32 bg-linear-to-r from-blue-400 to-blue-600" />
                        <div className="px-6 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white" />
                                <div className="flex-1">
                                    <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 w-64 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                                    <div className="space-y-4">
                                        <div className="h-10 bg-gray-200 rounded" />
                                        <div className="h-10 bg-gray-200 rounded" />
                                        <div className="h-24 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                                <div className="space-y-4">
                                    <div className="h-16 bg-gray-200 rounded" />
                                    <div className="h-16 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error && !profile) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                        Unable to Load Profile
                    </h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchProfile()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={formRef}>
            {/* Error Message */}
            {updateError && (
                <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-slideDown">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="flex-1">{updateError}</span>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-red-700 hover:text-red-900 font-medium cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Profile Header Card - Enhanced */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md">
                <div className="px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 ">
                        {/* Avatar with improved interaction */}
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isUpdating}
                                id="profile-photo-input"
                            />

                            {(previewUrl || displayData?.profile_picture) ? (
                                <div className="relative">
                                    <img
                                        src={previewUrl || displayData?.profile_picture || ''}
                                        alt={`${displayData?.first_name} ${displayData?.last_name}`}
                                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-white ring-offset-2"
                                    />
                                    {isEditing && (
                                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                                            <label
                                                htmlFor="profile-photo-input"
                                                className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                                                title="Change photo"
                                            >
                                                <Camera className="w-4 h-4 text-gray-600" />
                                            </label>
                                            {(selectedFile || displayData?.profile_picture) && (
                                                <button
                                                    onClick={handleRemovePhoto}
                                                    className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 text-red-500 cursor-pointer"
                                                    title="Remove photo"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                                        {initials}
                                    </div>
                                    {isEditing && (
                                        <div className="absolute -bottom-1 -right-1">
                                            <label
                                                htmlFor="profile-photo-input"
                                                className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                                                title="Upload photo"
                                            >
                                                <Camera className="w-4 h-4 text-gray-600" />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 sm:pb-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {displayData?.first_name} {displayData?.last_name}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${roleBadgeColor[displayData?.role || 'STUDENT']}`}>
                                    {roleIcon[displayData?.role || 'STUDENT']}
                                    {displayData?.role}
                                </span>
                            </div>
                            <p className="text-gray-500 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {displayData?.email}
                            </p>
                        </div>

                        {/* Verification Badge & Edit Button */}
                        <div className="flex items-center gap-3 sm:pb-1">
                            {displayData?.email_verified ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 ">
                                    <CheckCircle className="w-4 h-4" />
                                    Verified
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200">
                                    <AlertCircle className="w-4 h-4" />
                                    Pending Verification
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(true)
                                        setSelectedFile(null)
                                        setPreviewUrl(null)
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                {[
                    { id: 'personal', label: 'Personal Info', icon: UserIcon },
                    { id: 'account', label: 'Account Details', icon: Shield },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                            ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md cursor-pointer'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Dynamic based on tab */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'personal' && (
                        <>
                            {/* Personal Information */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                                <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={form.first_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                                placeholder="Enter your first name"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                                                {displayData?.first_name || '—'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={form.last_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                                placeholder="Enter your last name"
                                            />
                                        ) : (
                                            <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                                                {displayData?.last_name || '—'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email (readonly) */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {displayData?.email || '—'}
                                            <Lock className="w-4 h-4 text-gray-400 ml-auto" />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone_number"
                                                value={form.phone_number}
                                                onChange={handleChange}
                                                maxLength={20}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {displayData?.phone_number || '—'}
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>

                            {/* Bio */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">About Me</h2>
                                {isEditing ? (
                                    <div>
                                        <textarea
                                            name="bio"
                                            value={form.bio}
                                            onChange={handleChange}
                                            maxLength={500}
                                            rows={5}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-400">
                                                Share your story with the community
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {form.bio.length}/500 characters
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {displayData?.bio || 'No bio added yet. Click edit to share something about yourself!'}
                                    </p>
                                )}
                            </div>


                        </>
                    )}

                    {activeTab === 'account' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Account Settings
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Password</p>
                                            <p className="text-xs text-gray-500">Last changed 30 days ago</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                                        Change
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-xs text-gray-500">Receive updates about your courses</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                                        Configure
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Privacy Settings</p>
                                            <p className="text-xs text-gray-500">Manage who can see your profile</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Sidebar - Account Details */}
                <div className="space-y-6">
                    {/* Account Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            Account Overview
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Member Since
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(displayData?.date_joined)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Last Login
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {formatDateTime(displayData?.last_login)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                    <Star className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Account Status
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {displayData?.is_active !== false ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                                                <AlertCircle className="w-3 h-3" />
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Mode Actions */}
            {isEditing && (
                <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:right-6 sm:w-auto bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-slideUp">
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg cursor-pointer"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}