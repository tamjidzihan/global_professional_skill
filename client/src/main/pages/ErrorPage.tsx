interface ErrorPageProps {
    message?: string
}
const ErrorPage = ({ message }: ErrorPageProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                {message && <p className="text-gray-700">{message}</p>}
            </div>
        </div>
    )
}

export default ErrorPage