import { Search } from "lucide-react"
import { Link } from "react-router-dom"

const HeroSection = () => {
    return (
        <div className="bg-white">
            <section className="bg-[#FCF8F1] bg-opacity-30 py-10 sm:py-16 lg:py-24 relative overflow-hidden">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">

                        {/* Left Content */}
                        <div>
                            <p className="text-base font-semibold tracking-wider text-blue-600 uppercase">
                                A social media for learners
                            </p>

                            <h1 className="mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-6xl xl:text-8xl">
                                Connect & learn from the experts
                            </h1>

                            <p className="mt-4 text-base text-black lg:mt-8 sm:text-xl">
                                Grow your career fast with right mentor.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mt-8">
                                <input
                                    type="text"
                                    placeholder="Search courses, skills, mentors..."
                                    className="w-full h-14 px-6 pr-14 rounded-full bg-white shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                />
                                <button className="absolute top-1/2 right-2 -translate-y-1/2 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 transition">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            {/* CTA */}
                            <Link
                                to={'/register'}
                                title=""
                                className="inline-flex items-center px-6 py-4 mt-8 font-semibold text-black transition-all duration-200 bg-yellow-300 rounded-full lg:mt-16 hover:bg-yellow-400 focus:bg-yellow-400"
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

                        {/* Right Image */}
                        <div>
                            <img
                                className="w-full"
                                src="https://cdn.rareblocks.xyz/collection/celebration/images/hero/1/hero-img.png"
                                alt="Hero"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HeroSection
