/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react"
import { Search, Play, Globe, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { getSiteSettings } from "../../lib/api"
import type { SiteSettings } from "../../types"

const HeroSection = () => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSiteSettings()
                if (res.data.success) {
                    setSettings(res.data.data)
                }
            } catch (err) {
                console.error("Failed to load site settings for campus tour video", err)
            }
        }
        fetchSettings()
    }, [])

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCloseModal()
            }
        }
        if (isVideoModalOpen) {
            window.addEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "hidden"
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "unset"
        }
    }, [isVideoModalOpen])

    const handleOpenModal = () => {
        setIsVideoModalOpen(true)
    }

    const handleCloseModal = () => {
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
        setIsVideoModalOpen(false)
    }

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/courses')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const videoUrl = settings?.campus_tour_video || null
    const thumbnailUrl = settings?.campus_tour_thumbnail || null
    const heading = settings?.campus_tour_heading?.trim() || "Virtual Campus Tour"
    const subtext = settings?.campus_tour_subtext?.trim() || "Experience our state-of-the-art facilities"

    return (
        <div className="bg-white">
            <section className="bg-[#FCF8F1] bg-opacity-30 pb-8 lg:pb-10 pt-6 lg:pt-8 relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">

                        {/* Left Content */}
                        <div>
                            <h1 className="mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-6xl xl:text-7xl leading-tight">
                                Connect & learn from the experts
                            </h1>

                            <p className="mt-4 text-base text-black lg:mt-6 sm:text-xl">
                                Grow your career fast with right mentor.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mt-8">
                                <input
                                    type="text"
                                    placeholder="Search courses, skills, mentors..."
                                    className="w-full h-14 px-6 pr-14 rounded-full bg-white shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 transition cursor-pointer"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            {!user && (
                                <div>
                                    <Link
                                        to={'/register'}
                                        title=""
                                        className="inline-flex items-center px-6 py-4 mt-8 font-semibold text-black transition-all duration-200 bg-yellow-300 rounded-full lg:mt-12 hover:bg-yellow-400 focus:bg-yellow-400"
                                        role="button"
                                    >
                                        Join for free
                                        <svg
                                            className="w-6 h-6 ml-8 -mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.5"
                                                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </Link>
                                    <p className="mt-5 text-gray-600">
                                        Already joined us?{" "}
                                        <Link
                                            to={'/login'}
                                            title=""
                                            className="text-black transition-all duration-200 hover:underline"
                                        >
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Campus Tour Video / Image Card */}
                        <div className="w-full max-w-4xl mx-auto">
                            <div className="relative group">
                                {/* Tilted Glow Gradient */}
                                <div className="absolute inset-0 bg-linear-to-br from-green-400 to-blue-500 rounded-3xl transform -rotate-2 group-hover:-rotate-3 transition-transform duration-300"></div>

                                <div
                                    onClick={handleOpenModal}
                                    className="relative bg-linear-to-br from-blue-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-100 sm:h-110 cursor-pointer select-none"
                                >
                                    {/* Thumbnail Background if uploaded */}
                                    {thumbnailUrl && (
                                        <img
                                            src={thumbnailUrl}
                                            alt={heading}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}

                                    {/* Pattern / Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent"></div>

                                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 10px)`,
                                            }}
                                        />
                                    </div>

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center group/play">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
                                            <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
                                                <Play className="w-9 h-9 text-blue-600 fill-blue-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Content / Labels */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Globe className="w-5 h-5 text-blue-400 shrink-0" />
                                            <span className="text-white font-bold text-lg leading-snug line-clamp-1">{heading}</span>
                                        </div>
                                        <p className="text-white/80 text-sm line-clamp-2">{subtext}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── Video Player Modal with Dark Blur Backdrop ── */}
            {isVideoModalOpen && (
                <div
                    onClick={handleCloseModal}
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
                >
                    {/* Modal Container */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-6xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Header bar */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-950/80 border-b border-white/10 text-white">
                            <div className="flex items-center gap-2 min-w-0 pr-4">
                                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="font-semibold text-sm truncate">{heading}</span>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Close (Esc)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Video player or fallback */}
                        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                            {videoUrl ? (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                    poster={thumbnailUrl || undefined}
                                />
                            ) : (
                                <div className="text-center p-8 text-white space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                                        <Play className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h4 className="text-lg font-bold">{heading}</h4>
                                    <p className="text-xs text-white/60 max-w-md mx-auto">
                                        No custom video file has been uploaded yet by the admin in the dashboard.
                                        You can upload a video in <strong>Admin Dashboard → Platform Settings</strong>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HeroSection

