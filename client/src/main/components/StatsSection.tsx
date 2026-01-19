import { Building, GraduationCap, Monitor, Users } from "lucide-react"

const StatsSection = () => {
    return (
        <section className="py-8 sm:py-12 bg-gray-50 border-y border-gray-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 border-[#76C043] flex items-center">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#0066CC] mr-3 sm:mr-4 shrink-0" />
                        <div>
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                                60,000+
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                Graduated Students
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 border-[#76C043] flex items-center">
                        <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-[#0066CC] mr-3 sm:mr-4 shrink-0" />
                        <div>
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                                1,715+
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                Completed Batches
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 border-[#76C043] flex items-center">
                        <Building className="w-8 h-8 sm:w-10 sm:h-10 text-[#0066CC] mr-3 sm:mr-4 shrink-0" />
                        <div>
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                                29+
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                Collaboration Partners
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 border-[#76C043] flex items-center">
                        <Monitor className="w-8 h-8 sm:w-10 sm:h-10 text-[#0066CC] mr-3 sm:mr-4 shrink-0" />
                        <div>
                            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                                17+
                            </h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                Training Labs
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default StatsSection