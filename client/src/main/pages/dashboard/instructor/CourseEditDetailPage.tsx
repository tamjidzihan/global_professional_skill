/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCourses } from '../../../../hooks/useCourses';
import { useCategories } from '../../../../hooks/useCategories';
import { useNavigate, useParams } from 'react-router-dom';
import { LoaderButton } from '../../../components/ui/LoaderButton';
import {
  Info,
  FileText,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  Save,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import RichTextEditor from '../../../components/RichTextEditor';
import SEO from '../../../components/SEO';
import { Link } from 'react-router-dom';

// ── Schemas ───────────────────────────────────────────────────────────────────
const courseFormInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  short_description: z.string().min(1, 'Short description is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.string().min(1, 'Price is required'),
  thumbnail: z.instanceof(FileList).optional(),
  preview_video: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  duration_hours: z.string().min(1, 'Duration is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  learning_outcomes: z.string().min(1, 'Learning outcomes are required'),
  target_audience: z.string().min(1, 'Target audience is required'),
  who_can_join: z.string().min(1, 'Who can join is required'),
  class_starts: z.string().nullable().optional(),
  admission_deadline: z.string().nullable().optional(),
  schedule: z.string().min(1, 'Schedule is required'),
  venue: z.string().min(1, 'Venue is required'),
  total_seats: z.string().min(1, 'Total seats is required'),
});

type CourseFormInputs = z.infer<typeof courseFormInputSchema>;

const courseParsedSchema = courseFormInputSchema.extend({
  price: z.string().transform(Number).refine(val => !isNaN(val) && val >= 0, { message: 'Price must be a valid positive number' }),
  duration_hours: z.string().transform(Number).refine(val => !isNaN(val) && val > 0, { message: 'Duration must be a positive number' }),
  total_seats: z.string().transform(Number).refine(val => !isNaN(val) && val > 0 && Number.isInteger(val), { message: 'Total seats must be a positive whole number' }),
});

type CourseParsedData = z.infer<typeof courseParsedSchema>;

// ── Shared style tokens ───────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm placeholder-gray-400 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';
const errorCls = 'mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium';

// ── Field Error ───────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={errorCls}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: typeof Info;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-5 py-5 space-y-5">{children}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const CourseEditDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, loading, error, fetchCourseDetail, editCourse } = useCourses();
  const { categories, fetchCategories } = useCategories();
  const [serverError, setServerError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CourseFormInputs>({
    resolver: zodResolver(courseFormInputSchema),
    defaultValues: { class_starts: null, admission_deadline: null, preview_video: '' },
  });

  useEffect(() => {
    if (id) { fetchCourseDetail(id); fetchCategories(); }
  }, [id, fetchCourseDetail, fetchCategories]);

  useEffect(() => {
    if (course) {
      if (user && user.id !== course.instructor.id) {
        navigate('/dashboard/instructor/my-courses');
        return;
      }
      reset({
        title: course.title,
        description: course.description,
        short_description: course.short_description,
        category: course?.category?.id,
        difficulty_level: course.difficulty_level,
        price: course.price.toString(),
        preview_video: course.preview_video || '',
        duration_hours: course.duration_hours.toString(),
        requirements: course.requirements,
        learning_outcomes: course.learning_outcomes,
        target_audience: course.target_audience,
        who_can_join: course.who_can_join,
        class_starts: course.class_starts ? new Date(course.class_starts).toISOString().split('T')[0] : null,
        admission_deadline: course.admission_deadline ? new Date(course.admission_deadline).toISOString().split('T')[0] : null,
        schedule: course.schedule,
        venue: course.venue,
        total_seats: course.total_seats.toString(),
      });
      setCurrentThumbnail(course.thumbnail || null);
    }
  }, [course, reset, user, navigate]);

  const thumbnailFiles = watch('thumbnail');
  useEffect(() => {
    if (thumbnailFiles && thumbnailFiles.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(thumbnailFiles[0]);
    }
  }, [thumbnailFiles]);

  const onSubmit: SubmitHandler<CourseFormInputs> = async (data) => {
    setServerError(null);
    if (!id) { setServerError('Course ID is missing.'); return; }

    let parsedData: CourseParsedData;
    try {
      parsedData = courseParsedSchema.parse(data);
    } catch (e: any) {
      setServerError(e.message || 'Form validation error.');
      return;
    }

    const formData = new FormData();
    formData.append('title', parsedData.title);
    formData.append('description', parsedData.description);
    formData.append('short_description', parsedData.short_description);
    formData.append('category', parsedData.category);
    formData.append('difficulty_level', parsedData.difficulty_level);
    formData.append('price', parsedData.price.toString());
    formData.append('duration_hours', parsedData.duration_hours.toString());
    formData.append('learning_outcomes', parsedData.learning_outcomes);
    formData.append('requirements', parsedData.requirements);
    formData.append('target_audience', parsedData.target_audience);
    formData.append('who_can_join', parsedData.who_can_join);
    if (parsedData.class_starts) formData.append('class_starts', parsedData.class_starts);
    if (parsedData.admission_deadline) formData.append('admission_deadline', parsedData.admission_deadline);
    formData.append('schedule', parsedData.schedule);
    formData.append('venue', parsedData.venue);
    formData.append('total_seats', parsedData.total_seats.toString());
    if (parsedData.preview_video) formData.append('preview_video', parsedData.preview_video);
    if (parsedData.thumbnail && parsedData.thumbnail.length > 0)
      formData.append('thumbnail', parsedData.thumbnail[0]);

    try {
      const updated = await editCourse(id, formData);
      if (updated) navigate('/dashboard/instructor/my-courses');
      else setServerError(error);
    } catch (e: any) {
      setServerError(e.message || 'An unexpected error occurred.');
    }
  };

  // ── Loading skeleton ──
  if (loading && !course) {
    return (
      <div className="py-6 px-4 md:px-6 space-y-4">
        <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-50 rounded-lg" />
              <div className="h-10 bg-gray-50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ──
  if (!course) {
    return (
      <div className="py-6 px-4 md:px-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Failed to load course</p>
          <Link
            to="/dashboard/instructor/my-courses"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
          >
            ← Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <SEO title={`Edit Course | ${course.title}`} noindex={true} />

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dashboard/instructor/my-courses"
              className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
            >
              My Courses
            </Link>
            <span className="text-gray-300 text-xs">/</span>
            <span className="text-xs text-gray-500 truncate">{course.title}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Edit Course</h1>
          <p className="text-sm text-gray-400 mt-0.5">Update your course details below.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>

      {/* ── Server error ── */}
      {serverError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* ── Media card (outside form — no submit side effects) ── */}
      <SectionCard
        icon={ImageIcon}
        iconBg="bg-violet-50"
        iconColor="text-violet-500"
        title="Course Media"
        subtitle="Thumbnail image and preview video"
      >
        {/* Thumbnail */}
        <div className="pb-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Course Thumbnail</p>
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="w-full md:w-72 h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {(thumbnailPreview || currentThumbnail) ? (
                <img
                  src={thumbnailPreview || currentThumbnail || ''}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-7 h-7 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">No thumbnail</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="thumbnail" className={labelCls}>Upload New Thumbnail</label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                {...register('thumbnail')}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 file:cursor-pointer border border-gray-200 rounded-lg p-1 bg-gray-50"
              />
              <p className="text-xs text-gray-400">PNG, JPG up to 10MB · Recommended: 1280×720px</p>
              {currentThumbnail && !thumbnailPreview && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                  Current thumbnail kept if no new file selected
                </p>
              )}
              <FieldError message={errors.thumbnail?.message} />
            </div>
          </div>
        </div>

        {/* Preview video */}
        <div>
          <label htmlFor="preview_video" className={labelCls}>Preview Video URL</label>
          <input
            id="preview_video"
            type="url"
            {...register('preview_video')}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-gray-400">YouTube or Vimeo link shown as a preview to potential students.</p>
          <FieldError message={errors.preview_video?.message} />
        </div>
      </SectionCard>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Basic Information */}
        <SectionCard
          icon={Info}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          title="Basic Information"
          subtitle="Core details about your course"
        >
          <div>
            <label htmlFor="title" className={labelCls}>Course Title <span className="text-rose-500">*</span></label>
            <input id="title" type="text" {...register('title')} className={inputCls} placeholder="e.g., Advanced Web Development with React" />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <label htmlFor="short_description" className={labelCls}>Short Description <span className="text-rose-500">*</span></label>
            <input id="short_description" type="text" {...register('short_description')} className={inputCls} placeholder="A brief one-line summary of your course" />
            <FieldError message={errors.short_description?.message} />
          </div>

          <div>
            <label htmlFor="description" className={labelCls}>Full Description <span className="text-rose-500">*</span></label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  height={5}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Provide a comprehensive description of your course..."
                />
              )}
            />
            <FieldError message={errors.description?.message} />
          </div>
        </SectionCard>

        {/* Course Details */}
        <SectionCard
          icon={FileText}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          title="Course Details"
          subtitle="Classification and pricing information"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className={labelCls}>Category <span className="text-rose-500">*</span></label>
              <select id="category" {...register('category')} className={inputCls}>
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <FieldError message={errors.category?.message} />
            </div>

            <div>
              <label htmlFor="difficulty_level" className={labelCls}>Difficulty Level <span className="text-rose-500">*</span></label>
              <select id="difficulty_level" {...register('difficulty_level')} className={inputCls}>
                <option value="">Select difficulty</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <FieldError message={errors.difficulty_level?.message} />
            </div>

            <div>
              <label htmlFor="price" className={labelCls}>Price <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
                <input id="price" type="number" step="0.01" min="0" {...register('price')} className={inputCls + ' pl-7'} placeholder="0.00" />
              </div>
              <FieldError message={errors.price?.message} />
            </div>

            <div>
              <label htmlFor="duration_hours" className={labelCls}>Duration (hours) <span className="text-rose-500">*</span></label>
              <input id="duration_hours" type="number" min="1"  {...register('duration_hours')} className={inputCls} placeholder="e.g., 20" />
              <FieldError message={errors.duration_hours?.message} />
              {error == 'Duration must be a positive number' && (
                <FieldError message={error} />
              )}

            </div>
          </div>
        </SectionCard>

        {/* Course Content */}
        <SectionCard
          icon={BookOpen}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          title="Course Content"
          subtitle="What students will learn and requirements"
        >
          <div>
            <label htmlFor="learning_outcomes" className={labelCls}>Learning Outcomes <span className="text-rose-500">*</span></label>
            <Controller
              name="learning_outcomes"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value || ''} onChange={field.onChange} placeholder="List what students will learn..." />
              )}
            />
            <FieldError message={errors.learning_outcomes?.message} />
          </div>

          <div>
            <label htmlFor="requirements" className={labelCls}>Prerequisites & Requirements <span className="text-rose-500">*</span></label>
            <Controller
              name="requirements"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value || ''} onChange={field.onChange} placeholder="List any prerequisites..." />
              )}
            />
            <FieldError message={errors.requirements?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="target_audience" className={labelCls}>Target Audience <span className="text-rose-500">*</span></label>
              <textarea id="target_audience" rows={3} {...register('target_audience')} className={inputCls} placeholder="Aspiring web developers, junior developers..." />
              <FieldError message={errors.target_audience?.message} />
            </div>
            <div>
              <label htmlFor="who_can_join" className={labelCls}>Eligibility Criteria <span className="text-rose-500">*</span></label>
              <textarea id="who_can_join" rows={3} {...register('who_can_join')} className={inputCls} placeholder="Open to all students, must be 18+..." />
              <FieldError message={errors.who_can_join?.message} />
            </div>
          </div>
        </SectionCard>

        {/* Schedule & Venue */}
        <SectionCard
          icon={Calendar}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-500"
          title="Schedule & Venue"
          subtitle="When and where the course takes place"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="class_starts" className={labelCls}>Class Start Date</label>
              <input id="class_starts" type="date" {...register('class_starts')} className={inputCls} />
              <FieldError message={errors.class_starts?.message} />
            </div>
            <div>
              <label htmlFor="admission_deadline" className={labelCls}>Admission Deadline</label>
              <input id="admission_deadline" type="date" {...register('admission_deadline')} className={inputCls} />
              <FieldError message={errors.admission_deadline?.message} />
            </div>
            <div>
              <label htmlFor="schedule" className={labelCls}>Class Schedule <span className="text-rose-500">*</span></label>
              <input id="schedule" type="text" {...register('schedule')} className={inputCls} placeholder="e.g., Mon & Wed, 6:00 PM – 8:00 PM" />
              <FieldError message={errors.schedule?.message} />
            </div>
            <div>
              <label htmlFor="venue" className={labelCls}>Venue / Location <span className="text-rose-500">*</span></label>
              <input id="venue" type="text" {...register('venue')} className={inputCls} placeholder="e.g., Online via Zoom or 123 Main St" />
              <FieldError message={errors.venue?.message} />
            </div>
            <div>
              <label htmlFor="total_seats" className={labelCls}>Total Seats <span className="text-rose-500">*</span></label>
              <input id="total_seats" type="number" min="1" {...register('total_seats')} className={inputCls} placeholder="e.g., 30" />
              <FieldError message={errors.total_seats?.message} />
            </div>
          </div>
        </SectionCard>

        {/* ── Form actions ── */}
        <div className="flex items-center gap-2 pb-6">
          <LoaderButton
            type="submit"
            variant="success"
            size="md"
            elevation="lg"
            loading={loading || isSubmitting}
            loadingText="Saving…"
            icon={<Save className="w-4 h-4" />}
            disabled={loading || isSubmitting}
          >
            Save Changes
          </LoaderButton>
          <LoaderButton
            type="button"
            variant="secondary"
            size="md"
            elevation="md"
            onClick={() => navigate(-1)}
            icon={<X className="w-4 h-4" />}
            disabled={loading || isSubmitting}
          >
            Cancel
          </LoaderButton>
        </div>
      </form>
    </div>
  );
};

export default CourseEditDetailPage;