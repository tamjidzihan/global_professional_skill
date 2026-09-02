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
    // Globe,
    Award,
    BookOpen,
    Star,
    Lock,
    RefreshCw,
} from 'lucide-react'
import { useMyProfile } from '../../../hooks/useMyProfile'
import { useAuth } from '../../../hooks/useAuth'
import type { User } from '../../../types'
import SEO from '../../components/SEO'

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
        organization_name: profile?.organization_name || '',
        employee_id: profile?.employee_id || '',
        bio: profile?.bio || '',
    }))

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'personal' | 'account'>('personal')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isAuthenticated && !authLoading) navigate('/login')
    }, [isAuthenticated, authLoading, navigate])

    useEffect(() => {
        if (profile && !isEditing) {
            setForm({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone_number: profile.phone_number || '',
                organization_name: profile.organization_name || '',
                employee_id: profile.employee_id || '',
                bio: profile.bio || '',
            })
        }
    }, [profile, isEditing])

    useEffect(() => {
        if (updateSuccess) {
            toast.success('Profile updated successfully!', { position: 'top-right', autoClose: 3000 })
            fetchProfile()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        if (updateError) {
            toast.error(updateError, { position: 'top-right', autoClose: 5000 })
        }
    }, [updateSuccess, updateError, fetchProfile])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 5 * 1024 * 1024) { toast.warning('Please select an image under 5MB'); return }
            if (!file.type.startsWith('image/')) { toast.warning('Please select a valid image file'); return }
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleRemovePhoto = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = async () => {
        if (!profile) return
        if (!form.first_name.trim() || !form.last_name.trim()) {
            toast.warning('First name and last name are required')
            return
        }
        let dataToUpdate: Partial<User> | FormData = form
        if (selectedFile) {
            const formData = new FormData()
            formData.append('profile_picture', selectedFile)
            Object.keys(form).forEach(key => {
                const v = form[key as keyof typeof form]
                if (v !== undefined && v !== null && v !== profile[key as keyof typeof profile])
                    formData.append(key, v.toString())
            })
            dataToUpdate = formData
        }
        await updateProfile(dataToUpdate)
        setIsEditing(false)
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    const handleCancel = () => {
        if (profile)
            setForm({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone_number: profile.phone_number || '',
                organization_name: profile.organization_name || '',
                employee_id: profile.employee_id || '',
                bio: profile.bio || '',
            })
        setSelectedFile(null)
        setPreviewUrl(null)
        setIsEditing(false)
    }

    const roleConfig: Record<string, { badge: string; icon: React.ReactNode; iconBg: string; iconText: string }> = {
        STUDENT: { badge: 'bg-blue-50 text-blue-700', icon: <BookOpen className="w-3.5 h-3.5" />, iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
        INSTRUCTOR: { badge: 'bg-emerald-50 text-emerald-700', icon: <Award className="w-3.5 h-3.5" />, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
        ADMIN: { badge: 'bg-violet-50 text-violet-700', icon: <Shield className="w-3.5 h-3.5" />, iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
    }

    const displayData = profile
    const initials =
        (displayData?.first_name?.[0] || '') + (displayData?.last_name?.[0] || '') ||
        displayData?.email?.[0]?.toUpperCase() || '?'

    const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
    const formatDateTime = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

    // ── Shared style tokens ──────────────────────────────────────────────────
    const card = 'bg-white rounded-xl border border-gray-100 shadow-sm'
    const cardHeader = 'flex items-center justify-between px-5 py-4 border-b border-gray-100'
    const cardBody = 'p-5'
    const sectionTitle = 'text-sm font-semibold text-gray-900'
    const sectionSub = 'text-xs text-gray-400 mt-0.5'
    const iconBox = (color: string) => `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`
    const inputCls = 'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all'
    const readonlyCls = 'flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700'

    // ── Loading skeleton ─────────────────────────────────────────────────────
    if (authLoading || (isLoading && !profile)) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="animate-pulse space-y-5">
                    <div className={`${card} p-5 h-25`} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 space-y-5">
                            {[1, 2].map(i => <div key={i} className={`${card} h-50`} />)}
                        </div>
                        <div className={`${card} h-60`} />
                    </div>
                </div>
            </div>
        )
    }

    // ── Error state ──────────────────────────────────────────────────────────
    if (error && !profile) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className={`${card} p-10 text-center`}>
                    <div className={`${iconBox('bg-rose-50')} mx-auto mb-4 w-10 h-10`}>
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Unable to Load Profile</p>
                    <p className="text-xs text-gray-400 mb-5">{error}</p>
                    <button
                        onClick={() => fetchProfile()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        )
    }

    const role = displayData?.role || 'STUDENT'
    const rc = roleConfig[role] || roleConfig['STUDENT']

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" ref={formRef}>
            <SEO title={`My Profile | ${displayData?.first_name} ${displayData?.last_name}`} noindex={true} />

            {/* Error banner */}
            {updateError && (
                <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-xs">{updateError}</span>
                    <button onClick={() => window.location.reload()} className="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer">Dismiss</button>
                </div>
            )}

            {/* ── Profile header card ── */}
            <div className={`${card} mb-5`}>
                <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUpdating} id="profile-photo-input" />
                            {(previewUrl || displayData?.profile_picture) ? (
                                <>
                                    <img
                                        src={previewUrl || displayData?.profile_picture || ''}
                                        alt={`${displayData?.first_name} ${displayData?.last_name}`}
                                        className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow ring-2 ring-gray-100"
                                    />
                                    {isEditing && (
                                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                                            <label htmlFor="profile-photo-input" className="w-6 h-6 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" title="Change photo">
                                                <Camera className="w-3 h-3 text-gray-600" />
                                            </label>
                                            {(selectedFile || displayData?.profile_picture) && (
                                                <button onClick={handleRemovePhoto} className="w-6 h-6 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-rose-500 cursor-pointer" title="Remove photo">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow">
                                        {initials}
                                    </div>
                                    {isEditing && (
                                        <label htmlFor="profile-photo-input" className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" title="Upload photo">
                                            <Camera className="w-3 h-3 text-gray-600" />
                                        </label>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Name / email */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h1 className="text-base font-semibold text-gray-900">
                                    {displayData?.first_name} {displayData?.last_name}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold rounded-md ${rc.badge}`}>
                                    {rc.icon} {displayData?.role}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> {displayData?.email}
                            </p>
                        </div>

                        {/* Verification + edit */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {displayData?.email_verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-100">
                                    <CheckCircle className="w-3.5 h-3.5" /> Email Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-md border border-amber-100">
                                    <AlertCircle className="w-3.5 h-3.5" /> Email Unverified
                                </span>
                            )}
                            {displayData?.phone_verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-100">
                                    <CheckCircle className="w-3.5 h-3.5" /> Mobile Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-[11px] font-semibold rounded-md border border-gray-200">
                                    <AlertCircle className="w-3.5 h-3.5 text-gray-400" /> Mobile Unverified
                                </span>
                            )}
                            {!isEditing && (
                                <button
                                    onClick={() => { setIsEditing(true); setSelectedFile(null); setPreviewUrl(null) }}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors cursor-pointer shadow-sm ml-1"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab strip ── */}
            <div className="flex gap-1 mb-5 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                {[
                    { id: 'personal', label: 'Personal Info', icon: UserIcon },
                    { id: 'account', label: 'Account Details', icon: Shield },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === tab.id
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">

                    {activeTab === 'personal' && (
                        <>
                            {/* Personal information */}
                            <div className={card}>
                                <div className={cardHeader}>
                                    <div>
                                        <p className={sectionTitle}>Personal Information</p>
                                        <p className={sectionSub}>Your public profile details</p>
                                    </div>
                                    <div className={iconBox(`${rc.iconBg}`)}>
                                        <UserIcon className={`w-4 h-4 ${rc.iconText}`} />
                                    </div>
                                </div>
                                <div className={cardBody}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* First name */}
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                                                First Name <span className="text-rose-400 normal-case">*</span>
                                            </label>
                                            {isEditing ? (
                                                <input type="text" name="first_name" value={form.first_name} onChange={handleChange} className={inputCls} placeholder="First name" />
                                            ) : (
                                                <p className={readonlyCls}>{displayData?.first_name || '—'}</p>
                                            )}
                                        </div>

                                        {/* Last name */}
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                                                Last Name <span className="text-rose-400 normal-case">*</span>
                                            </label>
                                            {isEditing ? (
                                                <input type="text" name="last_name" value={form.last_name} onChange={handleChange} className={inputCls} placeholder="Last name" />
                                            ) : (
                                                <p className={readonlyCls}>{displayData?.last_name || '—'}</p>
                                            )}
                                        </div>

                                        {/* Email (readonly) */}
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
                                            <div className={`${readonlyCls} text-gray-500`}>
                                                <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                                <span className="flex-1 truncate">{displayData?.email || '—'}</span>
                                                <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Phone Number</label>
                                            {isEditing ? (
                                                <input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} maxLength={20} className={inputCls} placeholder="+880 1712345678" />
                                            ) : (
                                                <div className={readonlyCls}>
                                                    <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                                    <span>{displayData?.phone_number || '—'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Organization Name */}
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Organization Name</label>
                                            {isEditing ? (
                                                <input type="text" name="organization_name" value={form.organization_name} onChange={handleChange} maxLength={255} className={inputCls} placeholder="Company or Institution" />
                                            ) : (
                                                <p className={readonlyCls}>{displayData?.organization_name || '—'}</p>
                                            )}
                                        </div>

                                        {/* Employee ID */}
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Employee ID</label>
                                            {isEditing ? (
                                                <input type="text" name="employee_id" value={form.employee_id} onChange={handleChange} maxLength={100} className={inputCls} placeholder="e.g. EMP-10492" />
                                            ) : (
                                                <p className={readonlyCls}>{displayData?.employee_id || '—'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className={card}>
                                <div className={cardHeader}>
                                    <div>
                                        <p className={sectionTitle}>About Me</p>
                                        <p className={sectionSub}>A short bio visible on your profile</p>
                                    </div>
                                </div>
                                <div className={cardBody}>
                                    {isEditing ? (
                                        <>
                                            <textarea
                                                name="bio"
                                                value={form.bio}
                                                onChange={handleChange}
                                                maxLength={500}
                                                rows={5}
                                                className={`${inputCls} resize-none`}
                                                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-gray-400">Share your story with the community</p>
                                                <p className="text-xs text-gray-400">{form.bio.length}/500</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {displayData?.bio || 'No bio added yet. Click edit to share something about yourself!'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'account' && (
                        <div className={card}>
                            <div className={cardHeader}>
                                <div>
                                    <p className={sectionTitle}>Account Settings</p>
                                    <p className={sectionSub}>Manage your security and privacy</p>
                                </div>
                                <div className={iconBox('bg-violet-50')}>
                                    <Shield className="w-4 h-4 text-violet-600" />
                                </div>
                            </div>
                            <div className={cardBody}>
                                <div className="space-y-2">
                                    {[
                                        { icon: Lock, label: 'Password', sub: 'Last changed 30 days ago', action: 'Change' },
                                        // { icon: Mail, label: 'Email Notifications', sub: 'Receive updates about your courses', action: 'Configure' },
                                        // { icon: Globe, label: 'Privacy Settings', sub: 'Manage who can see your profile', action: 'Manage' },
                                    ].map(({ icon: Icon, label, sub, action }) => (
                                        <div key={label} className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-white transition-all duration-150">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                                <Icon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                                <p className="text-xs text-gray-400">{sub}</p>
                                            </div>
                                            <button className="text-xs font-semibold text-violet-600 hover:text-violet-700 px-2.5 py-1 bg-violet-50 rounded-lg transition-colors cursor-pointer">
                                                {action}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right sidebar ── */}
                <div className="space-y-5">
                    <div className={card}>
                        <div className={cardHeader}>
                            <div>
                                <p className={sectionTitle}>Account Overview</p>
                                <p className={sectionSub}>Your account details</p>
                            </div>
                            <div className={iconBox(`${rc.iconBg}`)}>
                                <Shield className={`w-4 h-4 ${rc.iconText}`} />
                            </div>
                        </div>
                        <div className={cardBody}>
                            <div className="space-y-2.5">
                                {[
                                    { icon: Calendar, label: 'Member Since', value: formatDate(displayData?.date_joined), iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
                                    { icon: Clock, label: 'Last Login', value: formatDateTime(displayData?.last_login), iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
                                    { icon: Star, label: 'Account Type', value: displayData?.role || '—', iconBg: rc.iconBg, iconText: rc.iconText },
                                ].map(({ icon: Icon, label, value, iconBg, iconText }) => (
                                    <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                                            <Icon className={`w-4 h-4 ${iconText}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                                            <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{value}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Account status */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${displayData?.is_active !== false ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                        {displayData?.is_active !== false
                                            ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                                            : <AlertCircle className="w-4 h-4 text-rose-500" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Account Status</p>
                                        <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${displayData?.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                            {displayData?.is_active !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Floating save bar ── */}
            {isEditing && (
                <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:right-6 z-50">
                    <div className={`${card} p-3 shadow-xl`}>
                        <div className="flex items-center gap-2.5 sm:justify-end">
                            <button
                                onClick={handleCancel}
                                className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                            >
                                {isUpdating ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}