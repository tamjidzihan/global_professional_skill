import { useState } from "react"
import { Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import SpecialOffersSlider from "./SpecialOffersSlider"

const HeroSection = () => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [hasOffers, setHasOffers] = useState(false)
    const navigate = useNavigate()

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

    return (
        <div className="bg-white">
            <section className="bg-[#FCF8F1] bg-opacity-30 pb-8 lg:pb-10 pt-6 lg:pt-8 relative overflow-hidden">
                <div className={`mx-auto max-w-7xl px-4 ${hasOffers ? "grid items-center gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12" : ""}`}>
                    <div className={hasOffers ? "py-4 text-left lg:py-10" : "mx-auto max-w-4xl text-center"}>
                        <div>
                            <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-700 ${hasOffers ? "mt-2" : "mt-4"}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                                Learn. Grow. Lead.
                            </span>
                            <h1 className={`mt-4 text-4xl font-bold leading-tight text-black sm:text-6xl ${hasOffers ? "lg:text-5xl xl:text-6xl" : "lg:mt-8 xl:text-7xl"}`}>
                                Connect & learn from the experts
                            </h1>

                            <p className={`mt-4 text-base text-gray-700 sm:text-xl ${hasOffers ? "max-w-xl lg:mt-5" : "lg:mt-6"}`}>
                                Grow your career fast with right mentor.
                            </p>

                            {/* Search Bar */}
                            <div className={`relative mt-8 max-w-xl ${hasOffers ? "" : "mx-auto"}`}>
                                <input
                                    type="text"
                                    placeholder="Search courses, skills, mentors..."
                                    aria-label="Search courses, skills, and mentors"
                                    className="h-14 w-full rounded-full border border-gray-200 bg-white px-6 pr-14 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    onClick={handleSearch}
                                    aria-label="Search"
                                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white transition hover:scale-105"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            {!user && (
                                <div className={`flex flex-col ${hasOffers ? "items-start" : "items-center"}`}>
                                    <Link
                                        to={'/register'}
                                        className="mt-8 inline-flex items-center rounded-full bg-yellow-300 px-6 py-4 font-semibold text-black transition-all duration-200 hover:bg-yellow-400 focus:bg-yellow-400 lg:mt-10"
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
                                            className="text-black transition-all duration-200 hover:underline"
                                        >
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <SpecialOffersSlider onOffersLoaded={setHasOffers} />
                </div>
            </section>
        </div>
    )
}

export default HeroSection
