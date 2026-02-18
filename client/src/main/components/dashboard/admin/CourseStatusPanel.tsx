/* eslint-disable @typescript-eslint/no-explicit-any */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BookOpen } from 'lucide-react';
import { type JSX, useEffect } from 'react';
import { useAnalytics } from '../../../../hooks/useAnalytics';

const COLORS = {
    PENDING: '#F59E0B', // amber-500
    APPROVED: '#10B981', // emerald-500
    REJECTED: '#EF4444', // red-500
    PUBLISHED: '#3B82F6', // blue-500
    DRAFT: '#6B7280',  // gray-500
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-gray-800">{`${payload[0].name}`}</p>
                <p className="text-sm" style={{ color: payload[0].payload.fill }}>
                    {`Courses: ${payload[0].value}`}
                </p>
            </div>
        );
    }
    return null;
};

const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
            {payload.map((entry: any, index: number) => (
                <li key={`item-${index}`} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{entry.value}</span>
                </li>
            ))}
        </ul>
    );
};


export function CourseStatusPanel(): JSX.Element {
    const { data: analyticsData, getAdminAnalytics, loading } = useAnalytics();

    useEffect(() => {
        getAdminAnalytics();
    }, [getAdminAnalytics]);

    const courseData = [
        { name: 'Pending', value: analyticsData?.course_status_distribution?.PENDING || 0, fill: COLORS.PENDING },
        { name: 'Approved', value: analyticsData?.course_status_distribution?.APPROVED || 0, fill: COLORS.APPROVED },
        { name: 'Rejected', value: analyticsData?.course_status_distribution?.REJECTED || 0, fill: COLORS.REJECTED },
        { name: 'Published', value: analyticsData?.course_status_distribution?.PUBLISHED || 0, fill: COLORS.PUBLISHED },
        { name: 'Draft', value: analyticsData?.course_status_distribution?.DRAFT || 0, fill: COLORS.DRAFT },
    ].filter(d => d.value > 0);


    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-87.5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                Course Status Overview
            </h2>

            {loading ? (
                <div className="grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : analyticsData?.total_courses > 0 ? (
                <div className="grow flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={courseData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                innerRadius={50}
                                dataKey="value"
                                stroke="none"
                            >
                                {courseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-10 grow flex flex-col justify-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No course data available yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Total: {analyticsData?.total_courses || 0}</p>
                </div>
            )}
        </div>
    );
}
