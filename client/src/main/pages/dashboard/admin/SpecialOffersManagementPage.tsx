import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Eye,
    ImagePlus,
    Loader2,
    Pencil,
    Plus,
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

    const card = "overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
    const previewImage = localImagePreview || savedImagePreview

    return (
        <div className="space-y-5 px-4 py-6 md:px-6">
            <SEO title="Special Offers Management" noindex />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mb-2 flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-violet-600"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
                    </button>
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">Special Offers</h1>
                    <p className="mt-0.5 text-sm text-gray-400">Create and schedule homepage promotions.</p>
                </div>
                <button
                    type="button"
                    onClick={() => openForm()}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
                >
                    <Plus className="h-4 w-4" /> Create Offer
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    ["All offers", offers.length],
                    ["Published", offers.filter((offer) => offer.is_published).length],
                    ["Active", offers.filter((offer) => offer.is_active).length],
                    ["Scheduled", offers.filter((offer) => offer.start_date || offer.end_date).length],
                ].map(([label, value]) => (
                    <div key={label} className={`${card} p-4`}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                ))}
            </div>

            {loadError && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                    <span>{loadError}</span>
                    <button type="button" onClick={() => void loadOffers()} className="font-semibold underline">Retry</button>
                </div>
            )}

            {loading ? (
                <div className={`${card} grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3`}>
                    {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-lg bg-gray-100" />)}
                </div>
            ) : offers.length === 0 && !loadError ? (
                <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
                    <Sparkles className="h-9 w-9 text-violet-400" />
                    <h2 className="mt-3 text-base font-semibold text-gray-900">No special offers yet</h2>
                    <p className="mt-1 text-sm text-gray-400">Create an offer to feature it in the homepage hero.</p>
                    <button type="button" onClick={() => openForm()} className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                        Create your first offer
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {offers.map((offer) => (
                        <article key={offer.id} className={card}>
                            <div className="relative h-48 bg-gray-100">
                                <img src={getMediaUrl(offer.image)} alt="" className="h-full w-full object-cover" />
                                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    !offer.is_active ? "bg-gray-900 text-white"
                                        : offer.is_published ? "bg-emerald-100 text-emerald-800"
                                            : "bg-amber-100 text-amber-800"
                                }`}>
                                    {!offer.is_active ? "Inactive" : offer.is_published ? "Published" : "Draft"}
                                </span>
                                {offer.badge_text && (
                                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                        {offer.badge_text}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3 p-4">
                                <div>
                                    <h2 className="font-semibold text-gray-900">{offer.title}</h2>
                                    {offer.subtitle && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{offer.subtitle}</p>}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Order {offer.display_order}
                                    {offer.start_date && ` · Starts ${offer.start_date}`}
                                    {offer.end_date && ` · Ends ${offer.end_date}`}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                                    <button type="button" onClick={() => setPreviewingOffer(offer)} title="Preview offer" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-violet-200 hover:text-violet-700">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => openForm(offer)} title="Edit offer" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-violet-200 hover:text-violet-700">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleStatusChange(offer, offer.is_published ? "unpublish" : "publish")}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-violet-200 hover:text-violet-700"
                                    >
                                        {offer.is_published ? "Unpublish" : "Publish"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleStatusChange(offer, offer.is_active ? "deactivate" : "activate")}
                                        title={offer.is_active ? "Deactivate offer" : "Activate offer"}
                                        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-violet-200 hover:text-violet-700"
                                    >
                                        {offer.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                    </button>
                                    <button type="button" onClick={() => void handleDelete(offer)} title="Delete offer" className="ml-auto rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-rose-200 hover:text-rose-700">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

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
                                        <span className="mt-1 block text-xs text-gray-400">JPG, PNG, GIF or WebP; maximum 5 MB. Large images are resized to 2400 × 1600 for faster loading.</span>
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
