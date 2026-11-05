import { useEffect, useRef, useState } from "react"
import { Globe, Play, X } from "lucide-react"
import type { SiteSettings } from "../../types"

interface CampusTourVideoProps {
    settings: SiteSettings | null
}

const CampusTourVideo = ({ settings }: CampusTourVideoProps) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const videoUrl = settings?.campus_tour_video || null
    const thumbnailUrl = settings?.campus_tour_thumbnail || null
    const heading = settings?.campus_tour_heading?.trim() || "Virtual Campus Tour"
    const subtext = settings?.campus_tour_subtext?.trim() || "Experience our state-of-the-art facilities"

    useEffect(() => {
        if (!isVideoModalOpen) return

        const previousOverflow = document.body.style.overflow
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                videoRef.current?.pause()
                if (videoRef.current) videoRef.current.currentTime = 0
                setIsVideoModalOpen(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = previousOverflow
        }
    }, [isVideoModalOpen])

    const handleCloseModal = () => {
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
        setIsVideoModalOpen(false)
    }

    return (
        <>
            <div className="w-full mx-auto">
                <div className="relative group">
                    <div className="absolute inset-0 bg-linear-to-br from-green-400 to-blue-500 rounded-3xl transform -rotate-2 group-hover:-rotate-3 transition-transform duration-300" />

                    <button
                        type="button"
                        onClick={() => setIsVideoModalOpen(true)}
                        aria-label={`Play ${heading}`}
                        className="relative block w-full text-left bg-linear-to-br from-blue-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-100 cursor-pointer select-none"
                    >
                        {thumbnailUrl && (
                            <img
                                src={thumbnailUrl}
                                alt={heading}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        )}

                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center group/play">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping" />
                                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform">
                                    <Play className="w-9 h-9 text-blue-600 fill-blue-600 ml-1" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Globe className="w-5 h-5 text-blue-400 shrink-0" />
                                <span className="text-white font-bold text-lg leading-snug line-clamp-1">{heading}</span>
                            </div>
                            <p className="text-white/80 text-sm line-clamp-2">{subtext}</p>
                        </div>
                    </button>
                </div>
            </div>

            {isVideoModalOpen && (
                <div
                    onClick={handleCloseModal}
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className="relative w-full max-w-6xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                    >
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-950/80 border-b border-white/10 text-white">
                            <div className="flex items-center gap-2 min-w-0 pr-4">
                                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="font-semibold text-sm truncate">{heading}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                title="Close (Esc)"
                                aria-label="Close video player"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

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
        </>
    )
}

export default CampusTourVideo
