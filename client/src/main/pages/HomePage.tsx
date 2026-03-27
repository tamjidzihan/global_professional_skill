import AboutSection from "../components/AboutSection"
import CourseSection from "../components/CourseSection"
import HeroSection from "../components/HeroSection"
import PageTitle from "../components/PageTitle"
import PartnersSection from "../components/PartnersSection"

const HomePage = () => {
    return (
        <>
            <PageTitle title="Home | Global Professional Institute " />
            <HeroSection />
            <CourseSection />
            <AboutSection />
            <PartnersSection />
        </>
    )
}

export default HomePage