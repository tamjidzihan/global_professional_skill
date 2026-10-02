import { PencilLoader } from "./ui/PencilLoader"

export default function RouteLoadingFallback() {
    return (
        <div
            className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-blue-700"
            role="status"
        >
            <PencilLoader />
            <span className="sr-only">Loading page</span>
        </div>
    )
}
