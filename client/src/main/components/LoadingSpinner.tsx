interface LoadingSpinnerProps {
    size?: number
    fullscreen?: boolean
    text?: string
}

const LoadingSpinner = ({
    size = 48,
    fullscreen = false,
    text = 'Loading...',
}: LoadingSpinnerProps) => {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-4 ${fullscreen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : ''
                }`}
        >
            <div
                style={{ width: size, height: size }}
                className="relative animate-spin rounded-full border-4 border-gray-200 border-t-[#0066CC]"
            />

            {text && (
                <span className="text-sm font-medium text-gray-600 animate-pulse">
                    {text}
                </span>
            )}
        </div>
    )
}

export default LoadingSpinner
