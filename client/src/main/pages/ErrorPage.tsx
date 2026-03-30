import { Link } from "react-router-dom"
import SEO from "../components/SEO"

interface ErrorPageProps {
    message?: string
}
const ErrorPage = ({ message }: ErrorPageProps) => {
    return (
        <div className="grid h-screen place-content-center bg-white px-4 ">

            <SEO 
                title="Page Not Found" 
                description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Return to Global Professional Institute home page."
            />

            <div className="text-center">
                <h1 className="text-9xl font-black text-gray-200 ">404</h1>

                <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl ">
                    Uh-oh!
                </p>
                <p >{message}</p>
                <p className="mt-4 text-gray-500 ">We can't find that page.</p>

                <Link to={'/'}

                    className="mt-6 inline-block rounded-sm bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-3 focus:outline-hidden"
                >
                    Go Back Home
                </Link>


            </div>
        </div>
    )
}

export default ErrorPage