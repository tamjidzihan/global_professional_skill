import { useState } from "react"
import { Megaphone } from "lucide-react"

const NEWS_ITEMS = [
    { text: "New batch for Full Stack Development starts August 15", color: "bg-[#3B5EF5]" },
    { text: "GPI ranked #1 IT Training Institute in Bangladesh", color: "bg-[#FBBF24]" },
    { text: "100% Job Placement Support for all certified students", color: "bg-[#86EFAC]" },
    { text: "World Bank Supported Training Programs now open", color: "bg-[#C084FC]" },
    { text: "Early bird discount: 20% off on all courses this month", color: "bg-[#FF5252]" },
]

const NewsTicker = () => {
    const [isPaused, setIsPaused] = useState(false)

    return (
        <div className="w-full bg-[#FCF8F1] border-b border-gray-200">
            <div className="container mx-auto px-4 flex items-center gap-3 py-1">
                {/* Badge */}
                <div className="hidden sm:flex items-center gap-2 bg-linear-to-r from-[#0066CC] to-purple-600 text-white rounded-full px-4 py-1.5 shrink-0 shadow-sm">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold tracking-wide">UPDATES</span>
                </div>

                {/* Ticker track */}
                <div
                    className="flex-1 overflow-hidden whitespace-nowrap"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div
                        className="inline-flex items-center gap-8 animate-marquee"
                        style={{ animationPlayState: isPaused ? "paused" : "running" }}
                    >
                        {[...NEWS_ITEMS, ...NEWS_ITEMS].map((item, i) => (
                            <span key={i} className="inline-flex items-center gap-2 px-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
                                <span className="text-sm font-medium hover:text-gray-800 transition-colors duration-300 text-gray-600">
                                    {item.text}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default NewsTicker