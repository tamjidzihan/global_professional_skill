import { Award, Handshake } from "lucide-react"

const PartnersSection = () => {
    // Partner logos data - duplicate for seamless infinite scroll
    const partners = [
        { id: 1, name: "World Bank" },
        { id: 2, name: "BASIS" },
        { id: 3, name: "NTVQF" },
        { id: 4, name: "ISO 9001" },
        { id: 5, name: "BITM" },
        { id: 6, name: "Google" },
        { id: 7, name: "Microsoft" },
        { id: 8, name: "Amazon" },
    ]

    // Double the partners array for seamless loop
    const duplicatedPartners = [...partners, ...partners]

    return (
        <section className="py-16 sm:py-20 bg-linear-to-b from-white to-[#FCF8F1] overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-full text-sm font-semibold mb-4">
                        <Handshake className="w-4 h-4" />
                        Trusted Partnerships
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        Our <span className="text-[#0066CC]">Esteemed Partners</span>
                    </h2>
                    <p className="text-gray-600">
                        Collaborating with leading organizations to deliver world-class education
                    </p>
                </div>

                {/* Infinite Scroll Container */}
                <div className="relative">
                    {/* Gradient Overlays for Fade Effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white via-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#FCF8F1] via-[#FCF8F1] to-transparent z-10 pointer-events-none"></div>

                    {/* Scrolling Track */}
                    <div className="relative overflow-hidden py-4">
                        <div className="flex animate-scroll hover:pause-animation">
                            {duplicatedPartners.map((partner, index) => (
                                <div
                                    key={`${partner.id}-${index}`}
                                    className="shrink-0 mx-4 sm:mx-6"
                                >
                                    <div className="group relative">
                                        {/* Card */}
                                        <div className="w-40 sm:w-48 h-24 sm:h-28 bg-white rounded-2xl border-2 border-gray-200 flex items-center justify-center transition-all duration-300 hover:border-[#0066CC] hover:shadow-xl hover:-translate-y-1">
                                            {/* Partner Logo/Name */}
                                            <div className="text-center px-4">
                                                <Award className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-400 group-hover:text-[#0066CC] transition-colors" />
                                                <span className="text-sm sm:text-base font-bold text-gray-700 group-hover:text-[#0066CC] transition-colors">
                                                    {partner.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-10 blur-xl rounded-2xl transition-opacity duration-300 -z-10"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Stats/Trust Indicator */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <div className="text-2xl font-bold text-gray-900">15+</div>
                            <div className="text-sm text-gray-600">Global Partners</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Handshake className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                            <div className="text-2xl font-bold text-gray-900">100%</div>
                            <div className="text-sm text-gray-600">Accredited Programs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-scroll {
                    animation: scroll 30s linear infinite;
                    width: max-content;
                }

                .pause-animation:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    )
}

export default PartnersSection