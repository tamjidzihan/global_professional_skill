import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { getMediaUrl, getSpecialOffers } from "../../lib/api"
import type { SpecialOffer } from "../../types"

const AUTOPLAY_INTERVAL = 6000

interface SpecialOffersSliderProps {
    onOffersLoaded: (hasOffers: boolean) => void
}

const SpecialOffersSlider = ({ onOffersLoaded }: SpecialOffersSliderProps) => {
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const touchStartX = useRef<number | null>(null)

    useEffect(() => {
        let isMounted = true
        getSpecialOffers()
            .then(({ data }) => {
                if (!isMounted) return
                setOffers(data.data)
                onOffersLoaded(data.data.length > 0)
            })
            .catch((error: unknown) => {
                console.error("Failed to load homepage special offers.", error)
                if (isMounted) onOffersLoaded(false)
            })

        return () => {
            isMounted = false
        }
    }, [onOffersLoaded])

    useEffect(() => {
        if (
            offers.length < 2 ||
            isPaused ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return
        }
        const timer = window.setInterval(() => {
            setActiveIndex((index) => (index + 1) % offers.length)
        }, AUTOPLAY_INTERVAL)
        return () => window.clearInterval(timer)
    }, [isPaused, offers.length])

    if (offers.length === 0) return null

    const activeOffer = offers[activeIndex]
    const moveBy = (offset: number) => {
        setActiveIndex((index) => (index + offset + offers.length) % offers.length)
    }

    const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
        setIsPaused(true)
        touchStartX.current = event.touches[0]?.clientX ?? null
    }

    const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
        const startX = touchStartX.current
        const endX = event.changedTouches[0]?.clientX
        touchStartX.current = null
        setIsPaused(false)
        if (startX === null || endX === undefined || Math.abs(startX - endX) < 40) return
        moveBy(startX > endX ? 1 : -1)
    }

    const callToAction = (
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-950 shadow-lg transition duration-200 group-hover:bg-yellow-300">
            {activeOffer.cta_text}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
    )

    return (
        <section
            aria-label="Special offers"
            aria-roledescription="carousel"
            className="mx-auto w-full max-w-xl lg:mx-0 lg:ml-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Featured for you
                </div>
                {offers.length > 1 && (
                    <span className="text-xs font-medium tabular-nums text-gray-400">
                        {String(activeIndex + 1).padStart(2, "0")}{" "}
                        <span className="px-1 text-gray-300">/</span>{" "}
                        {String(offers.length).padStart(2, "0")}
                    </span>
                )}
            </div>

            <div className="relative isolate min-h-[390px] overflow-hidden rounded-[1.75rem] bg-gray-900 shadow-[0_24px_70px_-24px_rgba(30,27,75,0.55)] sm:min-h-[450px] lg:min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.article
                        key={activeOffer.id}
                        aria-label={`Offer ${activeIndex + 1} of ${offers.length}`}
                        initial={{ opacity: 0, scale: 1.025 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={getMediaUrl(activeOffer.image)}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/45 to-gray-950/5" />
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5 sm:p-7">
                            {activeOffer.badge_text ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                    {activeOffer.badge_text}
                                </span>
                            ) : <span />}
                            <span className="rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
                                GPI Special
                            </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-9">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeOffer.id}-copy`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.28, delay: 0.08 }}
                                >
                                    {activeOffer.subtitle && (
                                        <p className="mb-2 text-sm font-medium text-white/75 sm:text-base">
                                            {activeOffer.subtitle}
                                        </p>
                                    )}
                                    <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                                        {activeOffer.title}
                                    </h2>
                                    {activeOffer.description && (
                                        <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                                            {activeOffer.description}
                                        </p>
                                    )}
                                    <div className="mt-6">
                                        {activeOffer.target_url.startsWith("/") ? (
                                            <Link to={activeOffer.target_url} className="group inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                                {callToAction}
                                            </Link>
                                        ) : (
                                            <a
                                                href={activeOffer.target_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                            >
                                                {callToAction}
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.article>
                </AnimatePresence>

                {offers.length > 1 && (
                    <div className="absolute bottom-6 right-5 z-10 flex items-center gap-2 sm:bottom-8 sm:right-7">
                        <button
                            type="button"
                            aria-label="Previous offer"
                            onClick={() => moveBy(-1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Next offer"
                            onClick={() => moveBy(1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:bg-white hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {offers.length > 1 && (
                <div className="mt-4 flex justify-center gap-2 lg:justify-start" aria-label="Choose offer">
                    {offers.map((offer, index) => (
                        <button
                            key={offer.id}
                            type="button"
                            aria-label={`Show offer ${index + 1}`}
                            aria-current={index === activeIndex}
                            onClick={() => setActiveIndex(index)}
                            className={`h-2 rounded-full transition-all ${
                                index === activeIndex
                                    ? "w-7 bg-violet-700"
                                    : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default SpecialOffersSlider
