import AboutSection from "../components/AboutSection"
import CourseSection from "../components/CourseSection"
import HeroSection from "../components/HeroSection"
import PartnersSection from "../components/PartnersSection"
import SEO from "../components/SEO"

const HomePage = () => {
    return (
        <>
            <SEO 
                title="Home" 
                description="Global Professional Institute (GPI) provides world-class professional training, courses and certifications. Join us to advance your career with industry experts."
                keywords="professional training, online courses, certification, GPI, Global Professional Institute, career advancement"
            />
            <HeroSection />
            <CourseSection />
            <AboutSection />
            <PartnersSection />
        </>
    )
}

export default HomePage