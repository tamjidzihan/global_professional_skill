import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import { Footer } from "../components/Footer"
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import NewsTicker from "../components/NewsTicker";

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster />
            <NewsTicker />
            <Header />
            <main className="grow">
                <Outlet />
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    )
}

export default Layout