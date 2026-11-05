import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react"
import { Link } from "react-router-dom"
import { getMediaUrl, getSpecialOffers } from "../../lib/api"
import type { SpecialOffer } from "../../types"

const AUTOPLAY_INTERVAL = 6000
type OfferLoadState = "loading" | "ready" | "error"

const SpecialOffersSlider = () => {
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [loadState, setLoadState] = useState<OfferLoadState>("loading")
    const touchStartX = useRef<number | null>(null)
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        let isMounted = true
        getSpecialOffers()
            .then(({ data }) => {
                if (!isMounted) return
                setOffers(data.data)
                setLoadState("ready")
            })
            .catch((error: unknown) => {
                console.error("Failed to load homepage special offers.", error)
                if (isMounted) setLoadState("error")
            })

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (
            offers.length < 2 ||
            isPaused ||
            shouldReduceMotion ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return
        }
        const timer = window.setInterval(() => {
            setActiveIndex((index) => (index + 1) % offers.length)
        }, AUTOPLAY_INTERVAL)
        return () => window.clearInterval(timer)
    }, [isPaused, offers.length, shouldReduceMotion])

    if (loadState !== "ready" || offers.length === 0) {
        return (
            <section
                aria-label={loadState === "loading" ? "Loading special offers" : "Special offers"}
                aria-busy={loadState === "loading"}
                aria-live="polite"
                className="mx-auto w-full max-w-155 lg:mx-0 lg:ml-auto"
            >
                <div className="mb-3 flex items-center justify-between px-1">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-gray-500 sm:text-xs">
                        Featured for you
                    </div>
                </div>

                {loadState === "loading" ? (
                    <div className="overflow-hidden rounded-[1.6rem] border border-white bg-white/80 p-2 shadow-[0_24px_70px_-35px_rgba(54,44,35,0.45)] ring-1 ring-gray-900/4 backdrop-blur-sm motion-reduce:animate-none sm:p-2.5">
                        <div className="aspect-4/3 animate-pulse rounded-[1.15rem] bg-linear-to-br from-violet-100 via-stone-100 to-amber-100 motion-reduce:animate-none sm:aspect-16/10">
                            <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                                <span className="h-7 w-32 rounded-full bg-white/80" />
                                <div className="space-y-3">
                                    <span className="block h-5 w-3/4 rounded-md bg-white/80" />
                                    <span className="block h-4 w-1/2 rounded-md bg-white/70" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 px-3 pb-3 pt-4 sm:px-4">
                            <div className="h-3 w-1/3 animate-pulse rounded bg-violet-100 motion-reduce:animate-none" />
                            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200 motion-reduce:animate-none" />
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 motion-reduce:animate-none" />
                                <div className="h-11 w-36 animate-pulse rounded-full bg-gray-200 motion-reduce:animate-none" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative isolate overflow-hidden rounded-[1.6rem] border border-white/90 bg-white/75 px-6 py-8 shadow-[0_24px_70px_-35px_rgba(54,44,35,0.35)] ring-1 ring-gray-900/[0.04] backdrop-blur-sm sm:px-8 sm:py-10">
                        <div aria-hidden="true" className="absolute -right-12 -top-14 h-40 w-40 rounded-full bg-amber-100/70 blur-2xl" />
                        <div aria-hidden="true" className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-violet-100/70 blur-2xl" />
                        <div className="relative">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                                <CalendarDays className="h-5 w-5" />
                            </span>
                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
                                {loadState === "error" ? "A little pause" : "Good things are growing"}
                            </p>
                            <h2 className="mt-2 max-w-md text-2xl font-bold leading-tight tracking-tight text-gray-950 sm:text-3xl">
                                {loadState === "error" ? "Our featured offers will be back soon." : "A new opportunity could be just around the corner."}
                            </h2>
                            <p className="mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                                {loadState === "error"
                                    ? "We couldn’t load the latest offers right now. Explore our courses while we get things ready."
                                    : "We’re preparing fresh ways to help you learn, grow, and take your next career step. In the meantime, discover a course that inspires you."}
                            </p>
                            <Link
                                to="/courses"
                                className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"
                            >
                                Explore courses
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        )
    }

    const activeOffer = offers[activeIndex]
    const imageUrl = getMediaUrl(activeOffer.image)
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

    const ctaClassName =
        "group inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700"

    return (
        <section
            aria-label="Special offers"
            aria-roledescription="carousel"
            className="mx-auto w-full max-w-[620px] lg:mx-0 lg:ml-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="mb-3 flex items-center justify-between px-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-gray-500 sm:text-xs">
                    Featured for you
                </div>
                {offers.length > 1 && (
                    <span className="text-xs font-medium tabular-nums text-gray-400">
                        {String(activeIndex + 1).padStart(2, "0")}
                        <span className="px-1 text-gray-300">/</span>
                        {String(offers.length).padStart(2, "0")}
                    </span>
                )}
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-white bg-white/80 p-2 shadow-[0_24px_70px_-35px_rgba(54,44,35,0.45)] ring-1 ring-gray-900/4 backdrop-blur-sm sm:p-2.5">
                <div
                    className="relative isolate aspect-4/3 overflow-hidden rounded-[1.15rem] bg-[#e8e4de] sm:aspect-16/10 lg:aspect-16/10"
                    onKeyDown={(event) => {
                        if (event.key === "ArrowLeft") moveBy(-1)
                        if (event.key === "ArrowRight") moveBy(1)
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeOffer.id}
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-2xl"
                                style={{ backgroundImage: `url("${imageUrl}")` }}
                            />
                            <div className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-gray-900/10" />
                            <motion.img
                                src={imageUrl}
                                alt={`${activeOffer.title} promotional artwork`}
                                className="absolute inset-0 h-full w-full object-cover object-center"
                                initial={shouldReduceMotion ? false : { scale: 0.985 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeOut" }}
                                draggable={false}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {activeOffer.badge_text && (
                        <div className="absolute left-3 top-3 z-10 inline-flex max-w-[70%] items-center gap-1.5 truncate rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-md sm:left-4 sm:top-4">
                            <span className="truncate">{activeOffer.badge_text}</span>
                        </div>
                    )}

                    {offers.length > 1 && (
                        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 sm:bottom-4 sm:right-4">
                            <button
                                type="button"
                                aria-label="Previous offer"
                                onClick={() => moveBy(-1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 sm:h-10 sm:w-10"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next offer"
                                onClick={() => moveBy(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 sm:h-10 sm:w-10"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 px-3 pb-2 pt-3 sm:flex-row sm:items-end sm:justify-between sm:px-4 sm:pb-2 sm:pt-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeOffer.id}-details`}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                            className="min-w-0 flex-1"
                        >
                            {activeOffer.subtitle && (
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700 sm:text-sm">
                                    {activeOffer.subtitle}
                                </p>
                            )}
                            <h2 className="text-lg font-bold leading-snug tracking-tight text-gray-950 sm:text-xl">
                                {activeOffer.title}
                            </h2>
                            {activeOffer.description && (
                                <p className="mt-1.5 line-clamp-2 max-w-lg text-sm leading-5 text-gray-500">
                                    {activeOffer.description}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    {activeOffer.target_url.startsWith("/") ? (
                        <Link to={activeOffer.target_url} className={`${ctaClassName} shrink-0 self-start sm:self-auto`}>
                            {activeOffer.cta_text}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    ) : (
                        <a
                            href={activeOffer.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${ctaClassName} shrink-0 self-start sm:self-auto`}
                        >
                            {activeOffer.cta_text}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    )}
                </div>
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
                            className={`h-2 rounded-full transition-all ${index === activeIndex
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
