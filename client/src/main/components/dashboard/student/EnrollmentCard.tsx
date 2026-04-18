/* eslint-disable @typescript-eslint/no-explicit-any */
import { Award, BookOpen, Clock, Layers, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { getProgressStatus } from "../../../../lib/utils";

// ── Enrollment Card ───────────────────────────────────────────────────────────
function EnrollmentCard({ enrollment }: { enrollment: any }) {
    const pct = Number(enrollment.progress_percentage || 0);
    const isCompleted = pct === 100;
    const isStarted = pct > 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden group">

            {/* Thumbnail */}
            <div className="h-40 bg-gray-50 relative overflow-hidden shrink-0">
                {enrollment.course.thumbnail ? (
                    <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-50">
                        <BookOpen className="w-10 h-10 text-violet-200" />
                    </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3">
                    <StatusBadge status={getProgressStatus(pct)} />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col gap-3">

                {/* Category */}
                <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-500">
                    {enrollment.course.category_name}
                </span>

                {/* Title */}
                <Link
                    to={`/dashboard/student/my-courses/${enrollment.course.id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors -mt-1">
                        {enrollment.course.title}
                    </h3>
                </Link>

                {/* Duration & Classes */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    {enrollment.course.duration_hours && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {enrollment.course.duration_hours}h
                        </div>
                    )}
                    {enrollment.course.total_classes && (
                        <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            {enrollment.course.total_classes} classes
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="mt-auto pt-2">
                    <ProgressBar percentage={pct} />
                </div>

                {/* CTA */}
                <Link
                    to={`/dashboard/student/my-courses/${enrollment.course.id}`}
                    className={`mt-1 inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold rounded-lg transition-colors ${isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                >
                    {isCompleted ? (
                        <><Award className="w-3.5 h-3.5" /> View Certificate</>
                    ) : (
                        <><PlayCircle className="w-3.5 h-3.5" /> {isStarted ? 'Continue Learning' : 'Start Learning'}</>
                    )}
                </Link>
            </div>
        </div>
    );
}


export default EnrollmentCard;
