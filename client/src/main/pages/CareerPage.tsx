import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobs } from '../../lib/api';
import type { Job } from '../../types';
import { formatDate } from 'date-fns';
import { toast } from 'react-hot-toast';

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

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Join Our Team
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Explore exciting career opportunities and grow with us.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search jobs by title or skills..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
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

                {/* Job List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                                        <div className="flex flex-wrap gap-4 text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{getJobTypeLabel(job.job_type)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                <span>Posted on {formatDate(new Date(job.created_at), 'PPP')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {job.salary_range && (
                                            <span className="text-lg font-semibold text-green-600">{job.salary_range}</span>
                                        )}
                                        <Link
                                            to={`/careers/${job.id}`}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No jobs found</h3>
                        <p className="text-gray-600 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerPage;
