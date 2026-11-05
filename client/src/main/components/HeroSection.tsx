import { useState } from "react"
import { ArrowRight, Search } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import SpecialOffersSlider from "./SpecialOffersSlider"

const HeroSection = () => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()
    const shouldReduceMotion = useReducedMotion()

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/courses')
        }
    }

    return (
        <div className="bg-white">
            <section className="relative isolate overflow-hidden bg-[#FCF8F1]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={shouldReduceMotion ? undefined : { y: [0, -12, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl"
                    />
                    <div className="absolute -bottom-48 right-[20%] h-96 w-96 rounded-full bg-violet-200/20 blur-3xl" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.07)_1px,transparent_0)] bg-size-[28px_28px] opacity-40" />
                </div>

                <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8 lg:py-10 xl:grid-cols-[0.88fr_1.12fr]">
                    <motion.div
                        className="w-full text-left"
                    >
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: 0 }}
                            className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/70 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-800 shadow-sm backdrop-blur"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50 motion-reduce:animate-none" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
                            </span>
                            Learn. Grow. Lead.
                        </motion.div>

                        <motion.h1
                            initial={shouldReduceMotion ? false : "hidden"}
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        delayChildren: shouldReduceMotion ? 0 : 0.18,
                                        staggerChildren: shouldReduceMotion ? 0 : 0.28,
                                    },
                                },
                            }}
                            className="mt-5 text-[clamp(2.55rem,5.6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.045em] text-gray-950 sm:mt-6"
                        >
                            <span className="block overflow-hidden pb-[0.08em]">
                                <motion.span
                                    variants={{
                                        hidden: { y: shouldReduceMotion ? 0 : "110%" },
                                        visible: {
                                            y: "0%",
                                            transition: {
                                                duration: shouldReduceMotion ? 0 : 0.72,
                                                ease: [0.22, 1, 0.36, 1],
                                            },
                                        },
                                    }}
                                    className="block"
                                >
                                    Connect & learn
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden pb-[0.08em]">
                                <motion.span
                                    variants={{
                                        hidden: { y: shouldReduceMotion ? 0 : "110%" },
                                        visible: {
                                            y: "0%",
                                            transition: {
                                                duration: shouldReduceMotion ? 0 : 0.78,
                                                ease: [0.22, 1, 0.36, 1],
                                            },
                                        },
                                    }}
                                    className="block font-serif font-medium italic tracking-[-0.055em] text-gray-950"
                                >
                                    from the experts
                                </motion.span>
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 1.15 }}
                            className="mt-3 max-w-lg text-base leading-7 text-gray-600 sm:mt-4 sm:text-lg sm:leading-8"
                        >
                            Grow your career fast with the right mentor.
                        </motion.p>

                        <motion.form
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 1.28 }}
                            onSubmit={handleSearch}
                            role="search"
                            className="group relative mt-8 flex h-15.5 max-w-xl items-center rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.35)] transition duration-200 hover:border-violet-200 hover:shadow-[0_16px_40px_-20px_rgba(109,40,217,0.3)] focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100"
                        >
                            <Search aria-hidden="true" className="ml-3.5 h-5 w-5 shrink-0 text-gray-400 transition-colors group-focus-within:text-violet-600" />
                            <input
                                type="search"
                                placeholder="Search courses, skills, mentors..."
                                aria-label="Search courses, skills, and mentors"
                                className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 sm:text-base"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-white transition duration-200 hover:bg-violet-800 active:scale-95 sm:w-12"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </motion.form>

                        {!user && (
                            <motion.div
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 1.4 }}
                                className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"
                            >
                                <Link
                                    to="/register"
                                    className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-yellow-300 px-6 py-3 font-semibold text-gray-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 motion-reduce:transform-none"
                                >
                                    Join for free
                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" />
                                </Link>
                                <p className="text-sm text-gray-500">
                                    Already joined us?{" "}
                                    <Link to="/login" className="font-semibold text-gray-800 underline decoration-gray-300 underline-offset-4 transition hover:text-violet-700 hover:decoration-violet-400">
                                        Log in
                                    </Link>
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.12 }}
                        className="min-w-0"
                    >
                        <SpecialOffersSlider />
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default HeroSection
