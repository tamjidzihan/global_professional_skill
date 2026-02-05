import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import { Footer } from "../components/Footer"
import { Toaster } from "react-hot-toast";

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster />
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}

export default Layout