import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, GripVertical, LoaderCircle, Save, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import type { CoursesSummary } from '../../../../types';
import { getFeaturedCourses, updateFeaturedCourseOrder } from '../../../../lib/api';

interface FeaturedCoursesManagerProps {
    refreshKey: number;
    actionLoadingId: string | null;
    onDirtyChange: (isDirty: boolean) => void;
    onRemove: (course: CoursesSummary) => void;
}

export function FeaturedCoursesManager({
    refreshKey,
    actionLoadingId,
    onDirtyChange,
    onRemove,
}: FeaturedCoursesManagerProps) {
    const [courses, setCourses] = useState<CoursesSummary[]>([]);
    const [savedOrder, setSavedOrder] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);
    const dragStartCourses = useRef<CoursesSummary[] | null>(null);

    const loadFeaturedCourses = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await getFeaturedCourses();
            const featuredCourses = response.data.data;
            setCourses(featuredCourses);
            setSavedOrder(featuredCourses.map(course => course.id));
        } catch {
            const message = 'Failed to load featured course order.';
            setLoadError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadFeaturedCourses();
    }, [loadFeaturedCourses, refreshKey]);

    const hasUnsavedChanges = useMemo(
        () => courses.some((course, index) => course.id !== savedOrder[index]) || courses.length !== savedOrder.length,
        [courses, savedOrder],
    );

    useEffect(() => {
        onDirtyChange(hasUnsavedChanges);
    }, [hasUnsavedChanges, onDirtyChange]);

    const moveCourse = (
        sourceId: string,
        targetId: string,
        placement: 'before' | 'after' = 'before',
        announceMove = true,
    ) => {
        const sourceIndex = courses.findIndex(course => course.id === sourceId);
        if (sourceIndex < 0 || !courses.some(course => course.id === targetId) || sourceId === targetId) return;

        const nextCourses = [...courses];
        const [movedCourse] = nextCourses.splice(sourceIndex, 1);
        const targetIndex = nextCourses.findIndex(course => course.id === targetId);
        const newIndex = targetIndex + (placement === 'after' ? 1 : 0);
        if (newIndex === sourceIndex) {
            if (announceMove) {
                setAnnouncement(`${movedCourse.title} is at position ${sourceIndex + 1} of ${courses.length}.`);
            }
            return;
        }
        nextCourses.splice(newIndex, 0, movedCourse);
        setCourses(nextCourses);
        if (announceMove) {
            setAnnouncement(`${movedCourse.title} moved to position ${newIndex + 1} of ${nextCourses.length}.`);
        }
    };

    const placeDraggedCourse = (
        event: DragEvent<HTMLLIElement>,
        targetId: string,
        announceMove = false,
    ) => {
        event.preventDefault();
        const sourceId = draggedCourseId || event.dataTransfer.getData('text/plain');
        if (!sourceId) return;
        if (sourceId === targetId) {
            setDropTargetId(null);
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const placement = event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after';
        moveCourse(sourceId, targetId, placement, announceMove);
        setDropTargetId(targetId);
    };

    const handleDrop = (event: DragEvent<HTMLLIElement>, targetId: string) => {
        placeDraggedCourse(event, targetId, true);
        dragStartCourses.current = null;
        setDraggedCourseId(null);
        setDropTargetId(null);
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const response = await updateFeaturedCourseOrder(courses.map(course => course.id));
            const savedCourses = response.data.data;
            setCourses(savedCourses);
            setSavedOrder(savedCourses.map(course => course.id));
            toast.success('Featured course order saved.');
        } catch {
            toast.error('Failed to save featured course order.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="border-b border-gray-100 bg-gray-50/40 px-4 py-4 sm:px-5" aria-labelledby="featured-courses-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 id="featured-courses-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                            Featured display order
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsExpanded(expanded => !expanded)}
                            aria-controls="featured-courses-content"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? 'Hide' : 'Show'} featured display order`}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                        >
                            {isExpanded ? 'Hide' : 'Show'}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {hasUnsavedChanges && (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                            Save this order before adding or removing featured courses.
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => void handleSaveOrder()}
                    disabled={!hasUnsavedChanges || saving || loading}
                    className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-violet-200 bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto cursor-pointer"
                >
                    {saving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {saving ? 'Saving order…' : 'Save order'}
                </button>
            </div>

            <p className="sr-only" aria-live="polite">{announcement}</p>

            <div id="featured-courses-content" hidden={!isExpanded}>
                <p className="mt-1 text-xs text-gray-500">
                    Drag courses to reorder them. On touch screens or with a keyboard, use the move buttons.
                </p>
                {loading ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500" role="status">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading featured courses…
                    </div>
                ) : loadError ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-rose-700">
                        <span>{loadError}</span>
                        <button
                            type="button"
                            onClick={() => void loadFeaturedCourses()}
                            className="font-semibold underline underline-offset-2"
                        >
                            Retry
                        </button>
                    </div>
                ) : courses.length === 0 ? (
                    <p className="mt-3 rounded-lg border border-dashed border-gray-200 bg-white px-3 py-3 text-xs text-gray-500">
                        No courses are featured yet. Use a course’s action menu below to feature one.
                    </p>
                ) : (
                    <ol className="mt-3 grid gap-2" aria-label="Featured courses in display order">
                        {courses.map((course, index) => (
                            <motion.li
                                key={course.id}
                                onDragOver={event => {
                                    event.dataTransfer.dropEffect = 'move';
                                    placeDraggedCourse(event, course.id);
                                }}
                                onDrop={event => handleDrop(event, course.id)}
                                onDragEnd={() => {
                                    if (dragStartCourses.current) {
                                        setCourses(dragStartCourses.current);
                                        dragStartCourses.current = null;
                                    }
                                    setDraggedCourseId(null);
                                    setDropTargetId(null);
                                }}
                                layout="position"
                                transition={{ layout: { type: 'spring', stiffness: 420, damping: 34 } }}
                                aria-roledescription="draggable course"
                                className={`flex items-center gap-2 rounded-lg border bg-white p-2 transition-colors ${draggedCourseId === course.id
                                    ? 'border-violet-300 opacity-40 ring-2 ring-violet-100'
                                    : dropTargetId === course.id
                                        ? 'border-violet-400 ring-2 ring-violet-100'
                                        : 'border-gray-200'
                                    }`}
                            >
                                <span
                                    draggable={!saving}
                                    onDragStart={event => {
                                        dragStartCourses.current = courses;
                                        setDraggedCourseId(course.id);
                                        event.dataTransfer.effectAllowed = 'move';
                                        event.dataTransfer.setData('text/plain', course.id);
                                        const card = event.currentTarget.closest('li');
                                        if (card) {
                                            const bounds = card.getBoundingClientRect();
                                            event.dataTransfer.setDragImage(
                                                card,
                                                event.clientX - bounds.left,
                                                event.clientY - bounds.top,
                                            );
                                        }
                                    }}
                                    aria-hidden="true"
                                    className="hidden cursor-grab text-gray-400 active:cursor-grabbing sm:inline-flex"
                                    title="Drag to reorder"
                                >
                                    <GripVertical className="h-5 w-5" />
                                </span>
                                <span className="w-5 shrink-0 text-center text-xs font-bold text-gray-400">{index + 1}</span>
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                                ) : (
                                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-50 text-xs font-bold text-violet-600">
                                        {course.title.charAt(0)}
                                    </span>
                                )}
                                <div className="min-w-0 grow">
                                    <p className="truncate text-xs font-semibold text-gray-800">{course.title}</p>
                                    <p className="text-[10px] text-gray-400">{course.status}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveCourse(course.id, courses[index - 1]?.id ?? course.id)}
                                        disabled={index === 0 || saving}
                                        aria-label={`Move ${course.title} up`}
                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveCourse(course.id, courses[index + 1]?.id ?? course.id, 'after')}
                                        disabled={index === courses.length - 1 || saving}
                                        aria-label={`Move ${course.title} down`}
                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(course)}
                                        disabled={actionLoadingId === course.id || saving || hasUnsavedChanges}
                                        title={hasUnsavedChanges ? 'Save the new order before removing a course.' : 'Remove from featured courses'}
                                        aria-label={`Remove ${course.title} from featured courses`}
                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-100 text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                    >
                                        {actionLoadingId === course.id
                                            ? <LoaderCircle className="h-4 w-4 animate-spin" />
                                            : <X className="h-4 w-4" />}
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
