import { useState, useEffect } from 'react';
import {
    Briefcase,
    MapPin,
    Clock,
    Search,
    Filter,
    Sparkles,
    Rocket,
    CheckCircle,
    TrendingUp,
    Users,
    Award,
    Heart,
    Star,
    Zap,
    BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobs } from '../../lib/api';
import type { Job } from '../../types';
import { formatDate } from 'date-fns';
import { toast } from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';

const CareerPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await getJobs({
                    search: searchTerm,
                    job_type: selectedType,
                });
                setJobs(response.data.results);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
                toast.error('Failed to load job postings.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchJobs, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedType]);

    const getJobTypeLabel = (type: string) => {
        switch (type) {
            case 'FULL_TIME': return 'Full-time';
            case 'PART_TIME': return 'Part-time';
            case 'CONTRACT': return 'Contract';
            case 'INTERNSHIP': return 'Internship';
            default: return type;
        }
    };

    const benefits = [
        {
            title: "Competitive Salary",
            description: "Attractive compensation packages with performance bonuses",
            icon: TrendingUp,
            color: "blue"
        },
        {
            title: "Health & Wellness",
            description: "Comprehensive health insurance and wellness programs",
            icon: Heart,
            color: "green"
        },
        {
            title: "Professional Growth",
            description: "Continuous learning opportunities and career development",
            icon: Award,
            color: "purple"
        },
        {
            title: "Work-Life Balance",
            description: "Flexible working hours and remote work options",
            icon: Clock,
            color: "orange"
        },
    ];

    const values = [
        { text: "Innovation-Driven Culture", icon: Sparkles },
        { text: "Collaborative Environment", icon: Users },
        { text: "Continuous Learning", icon: BookOpen },
        { text: "Diversity & Inclusion", icon: Heart },
        { text: "Growth Mindset", icon: Rocket },
        { text: "Excellence in Execution", icon: Star },
    ];

    return (
        <div className="bg-[#FCF8F1]">
            <SEO
                title="Careers at GPI"
                description="Join our team at Global Professional Institute. Explore exciting career opportunities and grow with us in a dynamic, innovative environment."
                keywords="careers, jobs, GPI careers, professional training jobs, join our team"
            />
            <Breadcrumb name="Careers" />

            {/* Hero Section */}
            <section className="relative py-9 sm:pt-16 sm:pb-10 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold mb-6 shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            Join Our Growing Team
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
                            Build Your Career
                            <span className="block mt-2 bg-linear-to-r from-[#0066CC] via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                With GPI
                            </span>
                        </h1>
                        <div className="h-1 w-24 bg-linear-to-r from-[#0066CC] to-[#76C043] mx-auto rounded-full mb-8"></div>
                        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                            Join a team of passionate professionals dedicated to transforming education
                            and empowering the next generation of industry leaders. At GPI, we believe
                            in fostering innovation, creativity, and continuous growth.
                        </p>
                    </div>
                </div>
            </section>

            {/* Current Openings Section */}
            <section className="py-16 bg-linear-to-b from-[#F5EFE6] to-[#FCF8F1]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-full text-sm font-semibold mb-4">
                                <Briefcase className="w-4 h-4" />
                                Current Opportunities
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                Open <span className="text-[#0066CC]">Positions</span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Find your perfect role and join our mission to transform education
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border-2 border-gray-200">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search jobs by title or skills..."
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <Filter className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <select
                                        className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-40 font-medium cursor-pointer"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        <option value="FULL_TIME">Full-time</option>
                                        <option value="PART_TIME">Part-time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="INTERNSHIP">Internship</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Job Listings */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : jobs.length > 0 ? (
                            <div className="grid gap-6">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-400 hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-gray-600">
                                                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                        <Briefcase className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium">{getJobTypeLabel(job.job_type)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                        <MapPin className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium">{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm font-medium">
                                                            Posted {formatDate(new Date(job.created_at), 'PPP')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {job.salary_range && (
                                                    <span className="text-lg font-extrabold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                                                        {job.salary_range}
                                                    </span>
                                                )}
                                                <Link
                                                    to={`/careers/${job.id}`}
                                                    className="group/btn px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-center inline-flex items-center gap-2"
                                                >
                                                    View Details
                                                    <Zap className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
                                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">No jobs found</h3>
                                <p className="text-gray-600 mt-2">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Why Join Us - Benefits Section */}
            <section className="py-16 bg-linear-to-b from-white to-[#F5EFE6]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-sm font-semibold mb-4">
                                <Heart className="w-4 h-4" />
                                Why Join GPI
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                Benefits That <span className="text-[#0066CC]">Empower You</span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We care about our team's well-being and professional growth
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon
                                const colorClasses = {
                                    blue: { bg: 'bg-blue-500', hover: 'hover:border-blue-400', glow: 'group-hover:bg-blue-400/20' },
                                    green: { bg: 'bg-green-500', hover: 'hover:border-green-400', glow: 'group-hover:bg-green-400/20' },
                                    purple: { bg: 'bg-purple-500', hover: 'hover:border-purple-400', glow: 'group-hover:bg-purple-400/20' },
                                    orange: { bg: 'bg-orange-500', hover: 'hover:border-orange-400', glow: 'group-hover:bg-orange-400/20' },
                                }
                                const colors = colorClasses[benefit.color as keyof typeof colorClasses]

                                return (
                                    <div key={index} className="relative group">
                                        <div className={`absolute inset-0 ${colors.glow} blur-2xl rounded-3xl transition-all duration-300 opacity-0 group-hover:opacity-100`}></div>
                                        <div className={`relative bg-white rounded-2xl p-6 border-2 border-gray-200 ${colors.hover} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                                            <div className={`${colors.bg} p-4 rounded-2xl inline-flex mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="font-black text-lg text-gray-900 mb-3">{benefit.title}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-sm font-semibold mb-4">
                                <Star className="w-4 h-4" />
                                Our Culture
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                What We <span className="text-[#0066CC]">Stand For</span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Our core values shape everything we do at GPI
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {values.map((value, index) => {
                                const Icon = value.icon
                                return (
                                    <div
                                        key={index}
                                        className="bg-linear-to-br from-blue-50 to-white rounded-2xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group hover:shadow-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-800">{value.text}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>



            {/* Call to Action */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="relative overflow-hidden bg-linear-to-r from-[#0066CC] via-blue-600 to-purple-600 rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
                                    <Rocket className="w-4 h-4" />
                                    Don't See Your Dream Role?
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                                    Stay Connected with Us
                                </h2>
                                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                                    We're always looking for talented individuals to join our team.
                                    Send us your resume and we'll reach out when opportunities match your profile.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        to="/contact"
                                        className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-2xl inline-flex items-center justify-center"
                                    >
                                        Contact HR Team
                                        <Heart className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all inline-flex items-center justify-center"
                                    >
                                        Join Talent Pool
                                        <CheckCircle className="w-5 h-5 ml-2" />
                                    </Link>
                                </div>

                                {/* Trust Indicators */}
                                <div className="mt-10 pt-8 border-t border-white/20">
                                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Great Place to Work Certified</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Competitive Benefits Package</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Career Growth Opportunities</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CareerPage;