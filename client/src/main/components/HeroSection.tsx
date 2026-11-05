import { useState } from "react"
import { Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const HeroSection = () => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
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
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mx-auto max-w-4xl text-center">

                        {/* Left Content */}
                        <div>
                            <h1 className="mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-6xl xl:text-7xl leading-tight">
                                Connect & learn from the experts
                            </h1>

                            <p className="mt-4 text-base text-black lg:mt-6 sm:text-xl">
                                Grow your career fast with right mentor.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mt-8 mx-auto">
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
                                <div className="flex flex-col items-center">
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
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HeroSection
