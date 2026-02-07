/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from 'framer-motion'


const containerVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}
const itemVariants = {
    hidden: {
        opacity: 0,
        scale: 0.5,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            stiffness: 100,
            damping: 15,
        },
    },
}
const floatAnimation = {
    y: [0, -10, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear" as any,
    },
}
const floatAnimationDelayed = {
    y: [0, -15, 0],
    transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear" as any,
        delay: 1,
    },
}
const HeroSection = () => {
    return (
        <div className="bg-white">
            <section className="bg-[#FCF8F1] bg-opacity-30 py-10 sm:py-16 lg:pb-24 relative overflow-hidden">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">

                        {/* Left Content */}
                        <div>
                            <p className="text-base font-semibold tracking-wider text-blue-600 uppercase">
                                A social media for learners
                            </p>

                            <h1 className="mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-6xl xl:text-8xl">
                                Connect & learn from the experts
                            </h1>

                            <p className="mt-4 text-base text-black lg:mt-8 sm:text-xl">
                                Grow your career fast with right mentor.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mt-8">
                                <input
                                    type="text"
                                    placeholder="Search courses, skills, mentors..."
                                    className="w-full h-14 px-6 pr-14 rounded-full bg-white shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                />
                                <button className="absolute top-1/2 right-2 -translate-y-1/2 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 transition">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            {/* CTA */}
                            <Link
                                to={'/register'}
                                title=""
                                className="inline-flex items-center px-6 py-4 mt-8 font-semibold text-black transition-all duration-200 bg-yellow-300 rounded-full lg:mt-16 hover:bg-yellow-400 focus:bg-yellow-400"
                                role="button"
                            >
                                Join for free
                                <svg
                                    className="w-6 h-6 ml-8 -mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </Link>

                            <p className="mt-5 text-gray-600">
                                Already joined us?{" "}
                                <Link
                                    to={'/login'}
                                    title=""
                                    className="text-black transition-all duration-200 hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>

                        {/* Right Image */}
                        <div>
                            <div className="w-full mx-auto">
                                {/* Main Relative Container - Aspect Ratio Square-ish */}
                                <motion.div
                                    className="relative w-full aspect-square  mx-auto"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {/* 1. Man in Yellow Circle (Top-Left) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="absolute top-[3%] left-[2%] w-[30%] aspect-square rounded-full bg-[#FBBF24] overflow-hidden shadow-lg z-20"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                                            alt="Smiling man"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>

                                    {/* 9. Small Circle Outline (Top-Center) */}
                                    <motion.div
                                        variants={itemVariants}
                                        animate={floatAnimation}
                                        className="absolute top-[2%] left-[35%] z-10"
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle cx="12" cy="12" r="11" stroke="black" strokeWidth="2" />
                                        </svg>
                                    </motion.div>

                                    {/* 2. 'Active Professionals' Black Circle (Top-Center/Right) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="absolute top-[8%] left-[35%] w-[35%] aspect-square bg-black text-white flex flex-col justify-center items-center p-4 z-10 shadow-xl"
                                        style={{
                                            borderTopLeftRadius: '6rem',
                                            borderTopRightRadius: '6rem',
                                            borderBottomLeftRadius: '6rem',   // rounded-2xl
                                        }}
                                    >
                                        <div className="text-center mb-2">
                                            <span className="block text-sm md:text-lg leading-tight text-gray-200">
                                                Active
                                            </span>
                                            <span className="block text-sm md:text-lg leading-tight text-gray-200">
                                                Professionals
                                            </span>
                                        </div>
                                        <span className="text-3xl md:text-5xl font-bold tracking-tight">
                                            13,422
                                        </span>
                                    </motion.div>

                                    {/* 3. Woman in Purple Pill (Top-Right) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="absolute top-[1%] right-[1%] w-[25%] h-[42%] rounded-[100px] bg-[#C084FC] overflow-hidden shadow-lg z-20"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop&crop=face"
                                            alt="Smiling woman"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>

                                    {/* 4. Woman in Blue Rounded Square (Bottom-Left - Largest) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="absolute bottom-[18%] left-[0%] w-[40%] h-[40%] bg-[#3B5EF5] overflow-hidden shadow-xl z-10"
                                        style={{
                                            borderTopLeftRadius: '2rem',
                                            borderTopRightRadius: '2rem',
                                            borderBottomLeftRadius: '2rem',
                                            borderBottomRightRadius: '180px'
                                        }}
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face"
                                            alt="Woman looking at camera"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>

                                    {/* 5. Starburst SVG (Center) */}
                                    <motion.div
                                        variants={itemVariants}
                                        animate={floatAnimationDelayed}
                                        className="absolute top-[48%] left-[45%] w-[17%] rotate-10 aspect-square z-30"
                                    >
                                        <svg
                                            viewBox="0 0 100 100"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-full h-full text-black"
                                        >
                                            <path
                                                d="M50 0L58 35L95 25L65 50L95 75L58 65L50 100L42 65L5 75L35 50L5 25L42 35L50 0Z"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </motion.div>

                                    {/* 6. Yellow Quarter Circle (Center-Right) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="absolute top-[45%] right-[15%] w-[20%] aspect-square bg-[#FBBF24] rounded-tr-[100%] rounded-tl-none rounded-bl-none rounded-br-[20px] z-0"
                                    />

                                    {/* 7. 'Online Courses' Mint Green Circle (Bottom-Center) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="absolute bottom-[0%] left-[32%] w-[32%] aspect-square bg-[#86EFAC] flex flex-col justify-center items-center p-4 z-20 shadow-lg"
                                        style={{
                                            borderTopLeftRadius: '6rem',
                                            borderTopRightRadius: '6rem',
                                            borderBottomRightRadius: '6rem',
                                        }}
                                    >
                                        <div className="text-center mb-1">
                                            <span className="block text-sm md:text-base leading-tight text-gray-800 font-medium">
                                                Online
                                            </span>
                                            <span className="block text-sm md:text-base leading-tight text-gray-800 font-medium">
                                                Courses
                                            </span>
                                        </div>
                                        <span className="text-2xl md:text-4xl font-bold tracking-tight text-black">
                                            2,582
                                        </span>
                                    </motion.div>

                                    {/* 8. Small Coral Red Circle (Bottom-Right) */}
                                    <motion.div
                                        variants={itemVariants}
                                        animate={floatAnimation}
                                        className="absolute bottom-[10%] right-[15%] w-[18%] aspect-square rounded-full bg-[#FF5252] z-10"
                                    />

                                    {/* 10. Small Triangle Outline (Bottom) */}
                                    <motion.div
                                        variants={itemVariants}
                                        animate={floatAnimationDelayed}
                                        className="absolute bottom-[5%] left-[65%] z-30"
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="rotate-90"
                                        >
                                            <path
                                                d="M12 2L22 20H2L12 2Z"
                                                stroke="black"
                                                strokeWidth="2.5"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HeroSection
