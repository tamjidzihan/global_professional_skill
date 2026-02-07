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
    Image, // Added Image icon
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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

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

    // Toast feedback (setIsEditing moved to handleSave)
    useEffect(() => {
        if (updateSuccess) {
            toast.success('Profile updated successfully!')
            fetchProfile()
        }
        if (updateError) {
            toast.error(updateError)
        }
    }, [updateSuccess, updateError, fetchProfile])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        // If there's an actual file input element, clear its value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSave = async () => {
        if (!profile) return; // Should not happen if profile is loaded

        // Create FormData if a file is selected, otherwise use plain object
        let dataToUpdate: Partial<User> | FormData = form;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('profile_picture', selectedFile);
            // Append other text fields only if they have changed or are part of the form
            // Note: DRF expects non-file fields for multipart/form-data as text, not JSON
            Object.keys(form).forEach(key => {
                const formValue = form[key as keyof typeof form];
                // Only append if value is not null/undefined and potentially different from profile
                if (formValue !== undefined && formValue !== null && formValue !== profile[key as keyof typeof profile]) {
                     formData.append(key, formValue.toString());
                }
            });
            dataToUpdate = formData;
        }

        await updateProfile(dataToUpdate);
        setIsEditing(false);
        setSelectedFile(null); // Clear selected file after save attempt
        setPreviewUrl(null);
    };

    const handleCancel = () => {
        if (profile) {
            setForm({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone_number: profile.phone_number || '',
                bio: profile.bio || '',
            });
        }
        setSelectedFile(null); // Clear selected file on cancel
        setPreviewUrl(null);
        setIsEditing(false);
    };

    const roleBadgeColor: Record<string, string> = {
        STUDENT: 'bg-blue-100 text-[#0066CC]',
        INSTRUCTOR: 'bg-green-100 text-green-700',
        ADMIN: 'bg-red-100 text-red-700',
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
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Show loading states
    if (authLoading || (isLoading && !profile)) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // Show error state
    if (error && !profile) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold">Error loading profile</h3>
                </div>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div key={profile?.id || 'profile_form'}>
            {/* Error Message */}
            {updateError && (
                <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {updateError}
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="h-28 bg-linear-to-r from-[#0066CC] to-[#004a99]" />
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                        {/* Avatar */}
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isUpdating}
                            />
                            {(previewUrl || displayData?.profile_picture) ? (
                                <img
                                    src={previewUrl || displayData?.profile_picture || ''}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-[#0066CC] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                                    {isEditing ? (
                                        <Image className="w-12 h-12 text-white" /> // Show Image icon when editing
                                    ) : (
                                        initials // Show initials when not editing
                                    )}
                                </div>
                            )}

                            {isEditing && (
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors text-gray-500 mr-1"
                                        title="Change photo"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    {(selectedFile || displayData?.profile_picture) && (
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors text-red-500 ml-1"
                                            title="Remove photo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 sm:pb-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                {displayData?.first_name} {displayData?.last_name}
                            </h2>
                            <p className="text-sm text-gray-500">{displayData?.email}</p>
                        </div>

                        {/* Badges & Edit */}
                        <div className="flex items-center gap-3 sm:pb-1">
                            <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${roleBadgeColor[displayData?.role || 'STUDENT']}`}
                            >
                                {displayData?.role}
                            </span>
                            {displayData?.email_verified ? (
                                <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">
                                    <AlertCircle className="w-3 h-3" /> Unverified
                                </span>
                            )}
                            {!isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setSelectedFile(null); // Clear any previously selected file when entering edit mode
                                        setPreviewUrl(null);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Editable Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-5">
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    First Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
                                        placeholder="Enter first name"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                                        {displayData?.first_name || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Last Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
                                        placeholder="Enter last name"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                                        {displayData?.last_name || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Email (readonly) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Email Address
                                    <span className="ml-1 text-xs text-gray-400">
                                        (read-only)
                                    </span>
                                </label>
                                <div className="flex items-center px-4 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-500">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    {displayData?.email || '—'}
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        maxLength={20}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
                                        placeholder="e.g. +880 1XXXXXXXXX"
                                    />
                                ) : (
                                    <div className="flex items-center px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {displayData?.phone_number || '—'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Bio</h3>
                        {isEditing ? (
                            <div>
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent resize-none transition-shadow"
                                    placeholder="Tell us about yourself..."
                                />
                                <p className="text-xs text-gray-400 mt-1.5 text-right">
                                    {form.bio.length}/500 characters
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {displayData?.bio || 'No bio added yet.'}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a838] disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Account Details */}
                <div className="space-y-6">
                    {/* Account Info */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-5">
                            Account Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-[#0066CC]" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Role
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {displayData?.role || '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-[#0066CC]" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Date Joined
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(displayData?.date_joined)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-[#0066CC]" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Last Login
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(displayData?.last_login)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-5">Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">Email Verified</span>
                                {displayData?.email_verified ? (
                                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                                        <CheckCircle className="w-4 h-4" /> Yes
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                                        <AlertCircle className="w-4 h-4" /> No
                                    </span>
                                )}
                            </div>
                            <div className="border-t border-gray-100" />
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">Account Active</span>
                                {displayData?.is_active !== false ? (
                                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                                        <CheckCircle className="w-4 h-4" /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                                        <AlertCircle className="w-4 h-4" /> Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}