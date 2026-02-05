import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import { Footer } from "../components/Footer"

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}

export default Layout