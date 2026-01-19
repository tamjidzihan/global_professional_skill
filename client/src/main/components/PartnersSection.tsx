
const PartnersSection = () => {
    return (
        <section className="py-12 sm:py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 sm:mb-10">
                    <h2 className="text-xs sm:text-sm font-bold text-[#76C043] uppercase tracking-wider mb-2">
                        Honorable Collaborators
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0066CC]">
                        Our Partners
                    </h3>
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-12 w-24 sm:h-16 sm:w-32 bg-gray-100 rounded flex items-center justify-center border border-gray-200"
                        >
                            <span className="text-gray-400 font-bold text-xs sm:text-sm">
                                Partner {i}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PartnersSection