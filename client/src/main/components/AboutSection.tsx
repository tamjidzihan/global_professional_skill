/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react"
import {
    Target,
    Sparkles,
    Rocket,
    Shield,
    X,
    Images,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    Camera,
} from "lucide-react"
import { getSiteSettings, getAlbumPhotos, getMediaUrl } from "../../lib/api"
import type { SiteSettings, AlbumPhoto } from "../../types"

const AboutSection: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isCanvasOpen, setIsCanvasOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Canvas viewer state (zoom, panning)
    const [zoomScale, setZoomScale] = useState(1)
    const canvasModalRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, photosRes] = await Promise.all([
                    getSiteSettings(),
                    getAlbumPhotos(),
                ])
                if (settingsRes?.data?.success) {
                    setSettings(settingsRes.data.data)
                }
                const photosData: any = photosRes?.data
                let list: AlbumPhoto[] = []
                if (Array.isArray(photosData)) {
                    list = photosData
                } else if (photosData?.data && Array.isArray(photosData.data)) {
                    list = photosData.data
                } else if (photosData?.results && Array.isArray(photosData.results)) {
                    list = photosData.results
                }
                setAlbumPhotos(list.filter((p: AlbumPhoto) => p.is_active !== false))
            } catch (err) {
                console.error("Failed to load about section album or settings", err)
            }
        }
        fetchData()
    }, [])

    const activePhotos = albumPhotos

    // Clamp currentIndex if photos change
    useEffect(() => {
        if (activePhotos.length > 0 && currentIndex >= activePhotos.length) {
            setCurrentIndex(0)
        }
    }, [activePhotos.length, currentIndex])

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement))
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    // Keyboard navigation when Canvas viewer is open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isCanvasOpen) return

            if (e.key === "Escape") {
                if (document.fullscreenElement) {
                    // Let browser exit fullscreen or handle gracefully
                } else {
                    handleCloseCanvas()
                }
            } else if (e.key === "ArrowLeft") {
                handlePrev()
            } else if (e.key === "ArrowRight") {
                handleNext()
            } else if (e.key === "+" || e.key === "=") {
                handleZoomIn()
            } else if (e.key === "-") {
                handleZoomOut()
            } else if (e.key === "f" || e.key === "F") {
                toggleFullscreen()
            }
        }

        if (isCanvasOpen) {
            window.addEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "hidden"
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "unset"
        }
    }, [isCanvasOpen, activePhotos.length])

    const handleNext = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (activePhotos.length <= 1) return
        setCurrentIndex((prev) => (prev + 1) % activePhotos.length)
        setZoomScale(1)
    }

    const handlePrev = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (activePhotos.length <= 1) return
        setCurrentIndex((prev) => (prev - 1 + activePhotos.length) % activePhotos.length)
        setZoomScale(1)
    }

    const handleOpenCanvas = () => {
        if (activePhotos.length === 0) return
        setZoomScale(1)
        setIsCanvasOpen(true)
    }

    const handleCloseCanvas = () => {
        if (document.fullscreenElement) {
            try {
                document.exitFullscreen()
            } catch (err) {
                console.error("Error exiting fullscreen", err)
            }
        }
        setIsCanvasOpen(false)
        setZoomScale(1)
    }

    const handleZoomIn = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setZoomScale((prev) => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setZoomScale((prev) => Math.max(prev - 0.25, 0.5))
    }

    const handleResetZoom = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setZoomScale(1)
    }

    const toggleFullscreen = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        if (!document.fullscreenElement) {
            if (canvasModalRef.current?.requestFullscreen) {
                canvasModalRef.current.requestFullscreen().catch((err) => {
                    console.warn("Fullscreen request error:", err)
                })
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch((err) => {
                    console.warn("Exit fullscreen error:", err)
                })
            }
        }
    }

    const currentPhoto = activePhotos.length > 0 ? activePhotos[currentIndex] || activePhotos[0] : null
    const albumHeading = settings?.album_heading?.trim() || "Campus & Event Gallery"
    const albumSubtext = settings?.album_subtext?.trim() || "Explore our vibrant campus life, workshops, and student achievements"

    return (
        <section className="relative py-20 sm:py-28 overflow-hidden from-white to-[#FCF8F1] bg-linear-to-b">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-linear-to-tr from-green-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Asymmetric Header */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        {/* Left Side - Main Title */}
                        <div className="lg:max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold mb-6 shadow-lg">
                                <Sparkles className="w-4 h-4" />
                                Pioneering Digital Education Since 2007
                            </div>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
                                Building Bangladesh's
                                <span className="block mt-2 bg-linear-to-r from-[#0066CC] via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Tech Leaders
                                </span>
                            </h2>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                We transform ambitious learners into industry-ready professionals through
                                cutting-edge curriculum and hands-on experience.
                            </p>
                        </div>

                        {/* Right Side - Quick Stats */}
                        <div className="flex gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-200 min-w-35">
                                <div className="text-4xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    #1
                                </div>
                                <p className="text-sm font-semibold text-gray-700">IT Training Institute</p>
                            </div>
                            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white min-w-35">
                                <Rocket className="w-10 h-10 mb-3" />
                                <p className="text-sm font-bold">Fast-Track Career Growth</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-5 gap-8 mb-16">
                    {/* Left Column - 3/5 width */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Story Card with Diagonal Design */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                            <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-white">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-linear-to-br from-blue-500 to-purple-500 p-4 rounded-2xl shadow-lg">
                                        <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-black mb-2">Our Mission</h3>
                                        <div className="h-1 w-20 bg-linear-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                    </div>
                                </div>

                                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                                    To provide <strong className="text-blue-600">high-quality, industry-focused training</strong> that equips
                                    students and professionals with practical skills and professional competencies for today's competitive world.
                                </p>

                                <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                        <h4 className="font-bold text-gray-900">Our Vision</h4>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        To become a <strong>leading skill development institute</strong> recognized for excellence in education and workforce development.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 2/5 width: Photo Album Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative group">
                            {/* Tilted colorful accent backdrop (preserves identical design) */}
                            <div className="absolute inset-0 bg-linear-to-br from-green-400 to-blue-500 rounded-3xl transform -rotate-2 group-hover:-rotate-3 transition-transform duration-300"></div>

                            {/* Main Card Container */}
                            <div
                                onClick={handleOpenCanvas}
                                className="relative bg-linear-to-br from-blue-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-100 cursor-pointer select-none flex flex-col justify-between"
                            >
                                {/* Active Photo Image with smooth scale transition */}
                                {currentPhoto ? (
                                    <img
                                        key={currentPhoto.id || currentIndex}
                                        src={getMediaUrl(currentPhoto.image)}
                                        alt={currentPhoto.title || albumHeading}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-linear-to-br from-blue-950/90 to-purple-950/90 z-0">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
                                            <Camera className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <h4 className="font-bold text-base text-white mb-1">{albumHeading}</h4>
                                        <p className="text-xs text-white/60 max-w-xs leading-relaxed">
                                            {albumSubtext}
                                        </p>
                                    </div>
                                )}

                                {/* Top & Bottom Gradient Overlays for high readability */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/60 pointer-events-none"></div>

                                {/* Diagonal pattern overlay for depth */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 10px)`,
                                        }}
                                    />
                                </div>

                                {/* Top Toolbar inside card */}
                                <div className="relative p-4 z-20 flex items-center justify-between">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold border border-white/20 shadow-lg">
                                        <Images className="w-3.5 h-3.5 text-green-400" />
                                        <span className="truncate max-w-36 sm:max-w-44">{albumHeading}</span>
                                    </div>

                                    {activePhotos.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            {/* Photo Counter */}
                                            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20 shadow-lg">
                                                {currentIndex + 1} / {activePhotos.length}
                                            </span>

                                            {/* Expand Canvas Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOpenCanvas()
                                                }}
                                                title="Open Photo Canvas Viewer"
                                                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Center Click-to-Expand Prompt & Side Arrow Navigation */}
                                {activePhotos.length > 0 && (
                                    <div className="relative flex items-center justify-between px-3 z-20 pointer-events-none my-auto">
                                        {/* Prev Button */}
                                        {activePhotos.length > 1 ? (
                                            <button
                                                type="button"
                                                onClick={handlePrev}
                                                title="Previous Photo"
                                                className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                        ) : <div />}

                                        {/* View Canvas Action Badge */}
                                        <div className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-full font-bold text-xs shadow-2xl backdrop-blur-md cursor-pointer hover:scale-105">
                                            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                                            View Canvas
                                        </div>

                                        {/* Next Button */}
                                        {activePhotos.length > 1 ? (
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                title="Next Photo"
                                                className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        ) : <div />}
                                    </div>
                                )}

                                {/* Bottom Info & Indicators */}
                                <div className="relative p-5 z-10">
                                    <h4 className="text-white font-bold text-base leading-snug line-clamp-1 mb-1">
                                        {currentPhoto?.title || albumHeading}
                                    </h4>
                                    <p className="text-white/80 text-xs line-clamp-2 mb-3">
                                        {currentPhoto?.caption || albumSubtext}
                                    </p>

                                    {/* Dots Indicator */}
                                    {activePhotos.length > 1 && (
                                        <div className="flex items-center gap-1.5">
                                            {activePhotos.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setCurrentIndex(idx)
                                                    }}
                                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                        idx === currentIndex
                                                            ? "w-6 bg-green-400"
                                                            : "w-1.5 bg-white/40 hover:bg-white/70"
                                                    }`}
                                                    title={`Go to photo ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── High-End Fullscreen Photo Canvas / Lightbox Viewer ── */}
            {isCanvasOpen && currentPhoto && (
                <div
                    ref={canvasModalRef}
                    onClick={handleCloseCanvas}
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-200 select-none"
                >
                    {/* Top Canvas Toolbar */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 sm:px-6 py-3.5 bg-gray-950/80 border-b border-white/10 flex items-center justify-between text-white z-30"
                    >
                        {/* Title & Counter */}
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <Images className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm text-white truncate">
                                    {currentPhoto.title || albumHeading}
                                </h3>
                                <p className="text-xs text-white/50 truncate">
                                    Photo {currentIndex + 1} of {activePhotos.length} · {albumHeading}
                                </p>
                            </div>
                        </div>

                        {/* Interactive Canvas Controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {/* Zoom In */}
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                title="Zoom In (+)"
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>

                            {/* Zoom Out */}
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                title="Zoom Out (-)"
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>

                            {/* Reset Zoom Indicator */}
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                title="Reset Zoom / 1:1"
                                className="px-2.5 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                {Math.round(zoomScale * 100)}%
                            </button>

                            {/* Fullscreen Toggle */}
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Maximize className="w-4 h-4" />
                                )}
                            </button>

                            <div className="h-5 w-px bg-white/20 mx-1"></div>

                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={handleCloseCanvas}
                                title="Close (Esc)"
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Canvas Stage Area */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8"
                    >
                        {/* Prev Button */}
                        {activePhotos.length > 1 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                title="Previous Photo (Left Arrow)"
                                className="absolute left-4 sm:left-8 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Interactive Image Container with Zoom */}
                        <div
                            onDoubleClick={toggleFullscreen}
                            className="w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in"
                            title="Double-click to toggle fullscreen"
                        >
                            <img
                                key={currentPhoto.id || currentIndex}
                                src={getMediaUrl(currentPhoto.image)}
                                alt={currentPhoto.title || "Canvas Photo"}
                                style={{
                                    transform: `scale(${zoomScale})`,
                                    transition: zoomScale === 1 ? "transform 0.3s ease-out" : "none",
                                }}
                                className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-xl cursor-grab active:cursor-grabbing select-none"
                                draggable={false}
                            />
                        </div>

                        {/* Next Button */}
                        {activePhotos.length > 1 && (
                            <button
                                type="button"
                                onClick={handleNext}
                                title="Next Photo (Right Arrow)"
                                className="absolute right-4 sm:right-8 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Filmstrip & Caption Bar */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 sm:px-6 py-3.5 bg-gray-950/85 border-t border-white/10 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        {/* Photo Caption */}
                        <div className="max-w-xl">
                            <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-1">
                                {currentPhoto.caption || currentPhoto.title || albumSubtext}
                            </p>
                        </div>

                        {/* Thumbnail Strip (Scrollbar completely hidden across all browsers) */}
                        {activePhotos.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {activePhotos.map((photo, idx) => (
                                    <button
                                        key={photo.id || idx}
                                        type="button"
                                        onClick={() => {
                                            setCurrentIndex(idx)
                                            setZoomScale(1)
                                        }}
                                        className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                                            idx === currentIndex
                                                ? "border-green-400 scale-105 shadow-md shadow-green-500/30 ring-2 ring-green-400/40"
                                                : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/60"
                                        }`}
                                    >
                                        <img
                                            src={getMediaUrl(photo.image)}
                                            alt={photo.title || `Thumb ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

export default AboutSection