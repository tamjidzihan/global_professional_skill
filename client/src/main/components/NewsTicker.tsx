import { useState, useEffect } from "react"
import { Megaphone } from "lucide-react"
import type { ApiResponse } from "../../types"
import { getNewsTickerItems } from "../../lib/api"

type NewsTickerDataItem = {
    text: string
    color?: string
    link?: string | null
}

const NewsTicker = () => {
    const [isPaused, setIsPaused] = useState(false)
    const [newsItems, setNewsItems] = useState<NewsTickerDataItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        getNewsTickerItems<ApiResponse<NewsTickerDataItem[]>>()
            .then((response) => {
                if (!isMounted) return
                if (response.data.success) {
                    const items = response.data.data.map((item) => ({
                        text: item.text,
                        link: item.link ?? null,
                        color: item.color || "bg-[#3B5EF5]",
                    }))
                    if (items.length > 0) {
                        setNewsItems(items)
                    }
                }
            })
            .catch(() => {
                // silently use fallback items
            })
            .finally(() => {
                if (isMounted) setIsLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

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
                    {isLoading ? (
                        <div className="inline-flex items-center gap-4 animate-pulse">
                            <span className="w-3 h-3 rounded-full bg-gray-300" />
                            <span className="h-4 w-48 rounded-full bg-gray-300" />
                            <span className="h-4 w-40 rounded-full bg-gray-300" />
                        </div>
                    ) : newsItems.length > 0 ? (
                        <div
                            className="inline-flex items-center gap-8 animate-marquee"
                            style={{ animationPlayState: isPaused ? "paused" : "running" }}
                        >
                            {(
                                newsItems.length > 1 ? [...newsItems, ...newsItems] : newsItems
                            ).map((item, i) => {
                                const content = (
                                    <span className="inline-flex items-center gap-2 px-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
                                        <span className="text-sm font-medium hover:text-gray-800 transition-colors duration-300 text-gray-600">
                                            {item.text}
                                        </span>
                                    </span>
                                )

                                return item.link ? (
                                    <a
                                        key={`${item.text}-${i}`}
                                        href={item.link}
                                        target={item.link.startsWith('/') ? undefined : '_blank'}
                                        rel={item.link.startsWith('/') ? undefined : 'noreferrer'}
                                        className="inline-flex"
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <span key={`${item.text}-${i}`}>{content}</span>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No updates available.</div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default NewsTicker