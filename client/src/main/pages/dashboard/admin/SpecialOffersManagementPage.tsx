import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Eye,
    EyeOff,
    Filter,
    ImagePlus,
    Loader2,
    Megaphone,
    Pencil,
    Plus,
    Search,
    Sparkles,
    ToggleLeft,
    ToggleRight,
    Trash2,
    X,
} from "lucide-react"
import { isAxiosError } from "axios"
import { toast } from "react-hot-toast"
import {
    createSpecialOffer,
    deleteSpecialOffer,
    getMediaUrl,
    getSpecialOffers,
    updateSpecialOffer,
    updateSpecialOfferStatus,
} from "../../../../lib/api"
import type { SpecialOffer } from "../../../../types"
import SEO from "../../../components/SEO"

interface OfferForm {
    title: string
    subtitle: string
    description: string
    cta_text: string
    target_url: string
    badge_text: string
    start_date: string
    end_date: string
    display_order: string
    is_published: boolean
    is_active: boolean
}

type OfferFilter = "ALL" | "PUBLISHED" | "DRAFT" | "INACTIVE"

const OFFER_FILTERS: { value: OfferFilter; label: string }[] = [
    { value: "ALL", label: "All offers" },
    { value: "PUBLISHED", label: "Published" },
    { value: "DRAFT", label: "Draft" },
    { value: "INACTIVE", label: "Inactive" },
]

const EMPTY_FORM: OfferForm = {
    title: "",
    subtitle: "",
    description: "",
    cta_text: "Explore Now",
    target_url: "/courses",
    badge_text: "",
    start_date: "",
    end_date: "",
    display_order: "0",
    is_published: false,
    is_active: true,
}

const optimizeOfferImage = async (file: File): Promise<File> => {
    if (file.type === "image/gif") return file

    const bitmap = await createImageBitmap(file)
    try {
        const scale = Math.min(1, 2400 / bitmap.width, 1600 / bitmap.height)
        if (scale === 1) return file

        const canvas = document.createElement("canvas")
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        const context = canvas.getContext("2d")
        if (!context) throw new Error("Your browser could not process this image.")
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, file.type, 0.85)
        })
        if (!blob) throw new Error("Your browser could not optimize this image.")
        return new File([blob], file.name, { type: blob.type || file.type, lastModified: file.lastModified })
    } finally {
        bitmap.close()
    }
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
        const responseData = error.response?.data
        if (typeof responseData === "object" && responseData !== null) {
            const body = responseData as Record<string, unknown>
            const nestedError = body.error
            if (typeof nestedError === "object" && nestedError !== null) {
                const message = (nestedError as Record<string, unknown>).message
                if (typeof message === "string") return message
            }
            if (typeof body.detail === "string") return body.detail
            for (const [field, value] of Object.entries(body)) {
                if (field === "success" || field === "error") continue
                const messages = Array.isArray(value) ? value : [value]
                const firstMessage = messages.find((message): message is string => typeof message === "string")
                if (firstMessage) return `${field}: ${firstMessage}`
            }
        }
        return fallback
    }
    return error instanceof Error ? error.message : fallback
}

const SpecialOffersManagementPage = () => {
    const navigate = useNavigate()
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<OfferFilter>("ALL")
    const [saving, setSaving] = useState(false)
    const [isOptimizingImage, setIsOptimizingImage] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null)
    const [previewingOffer, setPreviewingOffer] = useState<SpecialOffer | null>(null)
    const [form, setForm] = useState<OfferForm>(EMPTY_FORM)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [savedImagePreview, setSavedImagePreview] = useState<string | null>(null)
    const [localImagePreview, setLocalImagePreview] = useState<string | null>(null)

    useEffect(() => {
        if (!imageFile) {
            setLocalImagePreview(null)
            return
        }
        const objectUrl = URL.createObjectURL(imageFile)
        setLocalImagePreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [imageFile])

    const loadOffers = async () => {
        setLoading(true)
        setLoadError("")
        try {
            const response = await getSpecialOffers(true)
            if (!response.data.success) {
                throw new Error("The server did not return special offers.")
            }
            setOffers(response.data.data)
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to load special offers.")
            setLoadError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadOffers()
    }, [])

    const openForm = (offer?: SpecialOffer) => {
        setEditingOffer(offer ?? null)
        setImageFile(null)
        setSavedImagePreview(offer ? getMediaUrl(offer.image) : null)
        setForm(offer ? {
            title: offer.title,
            subtitle: offer.subtitle,
            description: offer.description,
            cta_text: offer.cta_text,
            target_url: offer.target_url,
            badge_text: offer.badge_text,
            start_date: offer.start_date ?? "",
            end_date: offer.end_date ?? "",
            display_order: String(offer.display_order),
            is_published: offer.is_published,
            is_active: offer.is_active,
        } : EMPTY_FORM)
        setIsFormOpen(true)
    }

    const closeForm = () => {
        if (saving) return
        setIsFormOpen(false)
        setEditingOffer(null)
        setImageFile(null)
        setSavedImagePreview(null)
    }

    const handleImageChange = async (file?: File) => {
        if (!file) return
        if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
            toast.error("Choose a JPG, PNG, GIF, or WebP image.")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Offer images must be 5 MB or smaller.")
            return
        }
        setIsOptimizingImage(true)
        try {
            setImageFile(await optimizeOfferImage(file))
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Could not process this image.")
        } finally {
            setIsOptimizingImage(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!editingOffer && !imageFile) {
            toast.error("Upload an image for this offer.")
            return
        }

        const data = new FormData()
        data.append("title", form.title.trim())
        data.append("subtitle", form.subtitle.trim())
        data.append("description", form.description.trim())
        data.append("cta_text", form.cta_text.trim())
        data.append("target_url", form.target_url.trim())
        data.append("badge_text", form.badge_text.trim())
        data.append("start_date", form.start_date)
        data.append("end_date", form.end_date)
        data.append("display_order", form.display_order)
        data.append("is_published", String(form.is_published))
        data.append("is_active", String(form.is_active))
        if (imageFile) data.append("image", imageFile)

        setSaving(true)
        try {
            if (editingOffer) {
                await updateSpecialOffer(editingOffer.id, data)
                toast.success("Special offer updated.")
            } else {
                await createSpecialOffer(data)
                toast.success("Special offer created.")
            }
            closeForm()
            await loadOffers()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to save the offer."))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (offer: SpecialOffer) => {
        if (!window.confirm(`Delete "${offer.title}"? This cannot be undone.`)) return
        try {
            await deleteSpecialOffer(offer.id)
            toast.success("Special offer deleted.")
            await loadOffers()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to delete the offer."))
        }
    }

    const handleStatusChange = async (
        offer: SpecialOffer,
        action: "publish" | "unpublish" | "activate" | "deactivate",
    ) => {
        try {
            await updateSpecialOfferStatus(offer.id, action)
            toast.success(
                action === "publish" ? "Offer published."
                    : action === "unpublish" ? "Offer unpublished."
                        : action === "activate" ? "Offer activated."
                            : "Offer deactivated.",
            )
            await loadOffers()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to update offer status."))
        }
    }

    const filteredOffers = offers.filter((offer) => {
        const query = searchTerm.trim().toLowerCase()
        const matchesSearch = !query || [offer.title, offer.subtitle, offer.description]
            .some((value) => value.toLowerCase().includes(query))
        const matchesStatus = statusFilter === "ALL"
            || (statusFilter === "PUBLISHED" && offer.is_published && offer.is_active)
            || (statusFilter === "DRAFT" && !offer.is_published)
            || (statusFilter === "INACTIVE" && !offer.is_active)
        return matchesSearch && matchesStatus
    })
    const activeCount = offers.filter((offer) => offer.is_active).length
    const publishedCount = offers.filter((offer) => offer.is_published).length
    const scheduledCount = offers.filter((offer) => offer.start_date || offer.end_date).length

    const card = "bg-white rounded-xl border border-gray-100 shadow-sm"
    const cardHeader = "flex items-center justify-between px-5 py-4 border-b border-gray-100"
    const previewImage = localImagePreview || savedImagePreview

    return (
        <div className="space-y-5 px-4 py-6 md:px-6">
            <SEO title="Special Offers Management" noindex />

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mb-2 flex cursor-pointer items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-violet-600"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                    </button>
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">Special Offers</h1>
                    <p className="mt-0.5 text-sm text-gray-400">Manage the promotions featured on your homepage.</p>
                </div>
                <button
                    type="button"
                    onClick={() => openForm()}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                >
                    <Plus className="h-3.5 w-3.5" /> Create Offer
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: "Total Offers", value: offers.length, icon: Megaphone, iconBg: "bg-violet-50", iconText: "text-violet-600" },
                    { label: "Published", value: publishedCount, icon: CheckCircle2, iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
                    { label: "Active", value: activeCount, icon: Eye, iconBg: "bg-blue-50", iconText: "text-blue-600" },
                    { label: "Scheduled", value: scheduledCount, icon: CalendarDays, iconBg: "bg-amber-50", iconText: "text-amber-600" },
                ].map(({ label, value, icon: Icon, iconBg, iconText }) => (
                    <div key={label} className={`${card} flex items-center gap-3 p-4`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                            <Icon className={`h-4 w-4 ${iconText}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                            <p className="mt-0.5 text-xl font-bold leading-none text-gray-900">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loadError && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                    <span>{loadError}</span>
                    <button type="button" onClick={() => void loadOffers()} className="font-semibold underline">Retry</button>
                </div>
            )}

            <div className={card}>
                <div className={`${cardHeader} flex-col gap-3 sm:flex-row`}>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Offer List</p>
                        <p className="mt-0.5 text-xs text-gray-400">{filteredOffers.length} of {offers.length} offers</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search offers..."
                                aria-label="Search special offers"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-50 sm:w-52"
                            />
                        </div>
                        <div className="relative">
                            <select
                                aria-label="Filter offers by status"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value as OfferFilter)}
                                className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm text-gray-700 outline-none transition-all focus:border-violet-300 focus:ring-2 focus:ring-violet-50 sm:w-auto"
                            >
                                {OFFER_FILTERS.map((filter) => (
                                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                                ))}
                            </select>
                            <Filter className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-100 px-5 py-3">
                    {OFFER_FILTERS.map(({ value, label }) => {
                        const active = statusFilter === value
                        const activeStyle = value === "ALL"
                            ? "bg-gray-900 text-white shadow-sm"
                            : value === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 shadow-sm"
                                : value === "DRAFT"
                                    ? "bg-amber-50 text-amber-700 ring-2 ring-amber-200 shadow-sm"
                                    : "bg-gray-100 text-gray-700 ring-2 ring-gray-200 shadow-sm"
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatusFilter(value)}
                                className={`inline-flex cursor-pointer items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ${
                                    active ? activeStyle : "border border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Offer", "Display Order", "Schedule", "Status", "Actions"].map((heading) => (
                                    <th key={heading} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(4)].map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan={5} className="px-5 py-3">
                                            <div className="h-12 animate-pulse rounded-lg bg-gray-50" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredOffers.length > 0 ? (
                                filteredOffers.map((offer) => (
                                    <tr key={offer.id} className="group transition-colors duration-100 hover:bg-gray-50/60">
                                        <td className="max-w-md px-5 py-3">
                                            <div className="flex min-w-56 items-center gap-3">
                                                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                    <img src={getMediaUrl(offer.image)} alt="" className="h-full w-full object-contain" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-800">{offer.title}</p>
                                                    {offer.subtitle && <p className="mt-0.5 truncate text-xs text-gray-400">{offer.subtitle}</p>}
                                                    {offer.badge_text && <span className="mt-1 inline-flex rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">{offer.badge_text}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3">
                                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-50 px-2 text-xs font-semibold text-gray-600">
                                                {offer.display_order}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3">
                                            <div className="text-xs text-gray-500">
                                                {offer.start_date || offer.end_date ? (
                                                    <>
                                                        {offer.start_date && <p>From {offer.start_date}</p>}
                                                        {offer.end_date && <p className="mt-0.5">Until {offer.end_date}</p>}
                                                    </>
                                                ) : <span className="text-gray-400">No schedule</span>}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                                !offer.is_active
                                                    ? "bg-gray-100 text-gray-600"
                                                    : offer.is_published
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-amber-50 text-amber-700"
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${
                                                    !offer.is_active ? "bg-gray-400" : offer.is_published ? "bg-emerald-500" : "bg-amber-500"
                                                }`} />
                                                {!offer.is_active ? "Inactive" : offer.is_published ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3">
                                            <div className="flex items-center justify-end gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                                <button type="button" onClick={() => setPreviewingOffer(offer)} title="Preview offer" aria-label={`Preview ${offer.title}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => openForm(offer)} title="Edit offer" aria-label={`Edit ${offer.title}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleStatusChange(offer, offer.is_published ? "unpublish" : "publish")}
                                                    title={offer.is_published ? "Unpublish offer" : "Publish offer"}
                                                    aria-label={`${offer.is_published ? "Unpublish" : "Publish"} ${offer.title}`}
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                                                >
                                                    {offer.is_published ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleStatusChange(offer, offer.is_active ? "deactivate" : "activate")}
                                                    title={offer.is_active ? "Deactivate offer" : "Activate offer"}
                                                    aria-label={`${offer.is_active ? "Deactivate" : "Activate"} ${offer.title}`}
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                                                >
                                                    {offer.is_active ? <Eye className="h-4 w-4 text-violet-500" /> : <EyeOff className="h-4 w-4" />}
                                                </button>
                                                <button type="button" onClick={() => void handleDelete(offer)} title="Delete offer" aria-label={`Delete ${offer.title}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <Sparkles className="mx-auto h-8 w-8 text-gray-300" />
                                        <p className="mt-3 text-sm font-semibold text-gray-700">
                                            {offers.length === 0 ? "No special offers yet" : "No offers match your filters"}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {offers.length === 0
                                                ? "Create your first offer to feature a promotion on the homepage."
                                                : "Try another search or status filter."}
                                        </p>
                                        {offers.length === 0 && (
                                            <button type="button" onClick={() => openForm()} className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700">
                                                <Plus className="h-3.5 w-3.5" /> Create your first offer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-3 sm:p-6">
                    <div role="dialog" aria-modal="true" aria-labelledby="offer-form-title" className="my-auto max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                            <div>
                                <h2 id="offer-form-title" className="font-semibold text-gray-900">{editingOffer ? "Edit offer" : "Create offer"}</h2>
                                <p className="mt-0.5 text-xs text-gray-400">Changes are reflected on the homepage when the offer is eligible.</p>
                            </div>
                            <button type="button" onClick={closeForm} aria-label="Close offer form" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Offer title <span className="text-rose-500">*</span>
                                    <input required maxLength={255} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                </label>
                                <label className="block text-sm font-medium text-gray-700">
                                    Subtitle
                                    <input maxLength={500} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                </label>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                    <textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                </label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        CTA button text
                                        <input required maxLength={80} value={form.cta_text} onChange={(event) => setForm({ ...form, cta_text: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                    </label>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Badge / label
                                        <input maxLength={80} value={form.badge_text} onChange={(event) => setForm({ ...form, badge_text: event.target.value })} placeholder="Limited time" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                    </label>
                                </div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Destination URL <span className="text-rose-500">*</span>
                                    <input required maxLength={500} value={form.target_url} onChange={(event) => setForm({ ...form, target_url: event.target.value })} placeholder="/courses or https://example.com" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                    <span className="mt-1 block text-xs font-normal text-gray-400">Use a site path such as /courses or a secure http(s) URL.</span>
                                </label>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Start date
                                        <input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                    </label>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Expiration date
                                        <input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                    </label>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Display order
                                        <input type="number" min="0" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50" />
                                    </label>
                                </div>
                                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 hover:border-violet-300">
                                    <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-gray-800">Offer image {!editingOffer && <span className="text-rose-500">*</span>}</span>
                                        <span className="mt-1 block text-xs leading-5 text-gray-400">
                                            Recommended: <strong className="font-semibold text-gray-600">1200 × 750 px (16:10 landscape)</strong> for the homepage slider. Other sizes work too; the full image is shown without cropping. JPG, PNG, GIF, or WebP, up to 5 MB. Large images are resized to 2400 × 1600 for faster loading.
                                        </span>
                                        <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={(event) => void handleImageChange(event.target.files?.[0])} className="mt-2 block w-full text-xs text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:font-semibold file:text-violet-700 hover:file:bg-violet-100" />
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-5">
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                                        Published
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                                        Active
                                    </label>
                                </div>
                            </div>

                            <aside aria-label="Offer preview" className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Eye className="h-4 w-4 text-violet-600" /> Live preview
                                </div>
                                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Offer preview" className="h-44 w-full object-cover" />
                                    ) : (
                                        <div className="flex h-44 items-center justify-center bg-gray-100 text-gray-400">
                                            <ImagePlus className="h-8 w-8" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        {form.badge_text && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{form.badge_text}</span>}
                                        <h3 className="mt-3 text-lg font-bold text-gray-900">{form.title || "Your offer title"}</h3>
                                        {form.subtitle && <p className="mt-1 text-sm font-medium text-gray-600">{form.subtitle}</p>}
                                        {form.description && <p className="mt-2 line-clamp-3 text-sm text-gray-500">{form.description}</p>}
                                        <span className="mt-4 inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white">{form.cta_text || "Explore Now"}</span>
                                    </div>
                                </div>
                            </aside>

                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 lg:col-span-2">
                                <button type="button" onClick={closeForm} disabled={saving} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={saving || isOptimizingImage} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                                    {(saving || isOptimizingImage) && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isOptimizingImage ? "Optimizing image..." : editingOffer ? "Save changes" : "Create offer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewingOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4" onClick={() => setPreviewingOffer(null)}>
                    <div role="dialog" aria-modal="true" aria-label="Special offer preview" className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => setPreviewingOffer(null)} aria-label="Close preview" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-700 shadow">
                            <X className="h-5 w-5" />
                        </button>
                        <img src={getMediaUrl(previewingOffer.image)} alt={previewingOffer.title} className="max-h-[70vh] w-full bg-gray-100 object-cover" />
                        <div className="p-5">
                            {previewingOffer.badge_text && <span className="text-xs font-semibold uppercase tracking-wide text-violet-700">{previewingOffer.badge_text}</span>}
                            <h2 className="mt-1 text-xl font-bold text-gray-900">{previewingOffer.title}</h2>
                            {previewingOffer.subtitle && <p className="mt-1 font-medium text-gray-600">{previewingOffer.subtitle}</p>}
                            {previewingOffer.description && <p className="mt-2 text-sm text-gray-500">{previewingOffer.description}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SpecialOffersManagementPage
