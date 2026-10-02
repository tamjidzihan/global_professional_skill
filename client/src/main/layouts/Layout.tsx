import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import { Footer } from "../components/Footer"
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import NewsTicker from "../components/NewsTicker";
import RouteLoadingFallback from "../components/RouteLoadingFallback"

const Layout = () => {
    return (
        <div className="flex min-h-dvh flex-col bg-gray-50">
            <Toaster />
            <NewsTicker />
            <Header />
            <main className="flex-1">
                <Suspense fallback={<RouteLoadingFallback />}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    )
}

export default Layout