/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCourses } from '../../../../hooks/useCourses';
import { useCategories } from '../../../../hooks/useCategories';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {
  Info,
  FileText,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import RichTextEditor from '../../../components/RichTextEditor';

// Schemas for form validation and data parsing
const courseFormInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  short_description: z.string().min(1, 'Short description is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.string().min(1, 'Price is required'),
  thumbnail: z.instanceof(FileList).optional(), // for new file selection
  preview_video: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  duration_hours: z.string().min(1, 'Duration is required'),
  requirements: z.string().min(1, 'Requirements are required'),
  learning_outcomes: z.string().min(1, 'Learning outcomes are required'),
  target_audience: z.string().min(1, 'Target audience is required'),
  who_can_join: z.string().min(1, 'Who can_join is required'),
  class_starts: z.string().nullable().optional(),
  admission_deadline: z.string().nullable().optional(),
  schedule: z.string().min(1, 'Schedule is required'),
  venue: z.string().min(1, 'Venue is required'),
  total_seats: z.string().min(1, 'Total seats is required'),
});

type CourseFormInputs = z.infer<typeof courseFormInputSchema>;

// Schema for parsed values (numbers for price, duration, total_seats)
const courseParsedSchema = courseFormInputSchema.extend({
  price: z.string().transform(Number).refine(val => !isNaN(val) && val >= 0, { message: 'Price must be a valid positive number' }),
  duration_hours: z.string().transform(Number).refine(val => !isNaN(val) && val > 0, { message: 'Duration must be a positive number' }),
  total_seats: z.string().transform(Number).refine(val => !isNaN(val) && val > 0 && Number.isInteger(val), { message: 'Total seats must be a positive whole number' }),
});

type CourseParsedData = z.infer<typeof courseParsedSchema>;

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
    defaultValues: {
      class_starts: null,
      admission_deadline: null,
      preview_video: '',
    },
  });

  // Fetch course details and categories
  useEffect(() => {
    if (id) {
      fetchCourseDetail(id);
      fetchCategories();
    }
  }, [id, fetchCourseDetail, fetchCategories]);

  // Populate form with fetched course data
  useEffect(() => {
    if (course) {
      if (user && user.id !== course.instructor.id) {
        // Redirect if not the instructor of this course
        navigate('/dashboard/instructor/my-courses');
        return;
      }

      reset({
        title: course.title,
        description: course.description,
        short_description: course.short_description,
        category: course.category.id, // Assuming category.id is used here
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

  // Watch thumbnail for preview
  const thumbnailFiles = watch('thumbnail');
  useEffect(() => {
    if (thumbnailFiles && thumbnailFiles.length > 0) {
      const file = thumbnailFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!currentThumbnail) {
      setThumbnailPreview(null);
    }
  }, [thumbnailFiles, currentThumbnail]);

  const onSubmit: SubmitHandler<CourseFormInputs> = async (data) => {
    setServerError(null);

    if (!id) {
      setServerError('Course ID is missing.');
      return;
    }

    // Parse the data to get correct numerical types
    let parsedData: CourseParsedData;
    try {
      parsedData = courseParsedSchema.parse(data);
    } catch (e: any) {
      setServerError(e.message || 'Form validation error.');
      console.error('Form parsing error:', e);
      return;
    }

    const formData = new FormData();

    // Append fields
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

    if (parsedData.preview_video) {
      formData.append('preview_video', parsedData.preview_video);
    }

    // Only append thumbnail if a new one is selected
    if (parsedData.thumbnail && parsedData.thumbnail.length > 0) {
      formData.append('thumbnail', parsedData.thumbnail[0]);
    } else if (currentThumbnail && !thumbnailPreview && !watch('thumbnail')) {
      // If there was a current thumbnail and no new one is selected,
      // and the user explicitly cleared the input (unlikely with current UI),
      // or we want to allow removing the thumbnail, send a specific value.
      // For now, if no new thumbnail, we just don't send 'thumbnail' in FormData
      // which means the backend should keep the existing one.
      // If we wanted to explicitly remove it, we'd send '' or a specific flag.
    }


    try {
      const updated = await editCourse(id, formData);
      if (updated) {
        navigate('/dashboard/instructor/my-courses');
      } else {
        setServerError(error || 'Failed to update course. Please try again.');
      }
    } catch (e: any) {
      setServerError(e.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const inputClassName = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow";
  const errorClassName = "mt-1.5 text-sm text-red-600 flex items-center gap-1";
  const labelClassName = "block text-sm font-medium text-gray-600 mb-1.5";

  if (loading && !course) {
    return <LoadingSpinner fullscreen text="Loading Course Details..." />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist or an error occurred.'}</p>
          <button
            onClick={() => navigate('/dashboard/instructor/my-courses')}
            className="inline-block bg-[#0066CC] text-white px-6 py-3 rounded-lg hover:bg-[#004c99] transition-colors"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-8">
        {/* Error Alert */}
        {serverError && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Course: {course.title}</h1>
              <p className="text-sm text-gray-500 mt-1">Update your course details below</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        {/* Thumbnail Section - Prominently Displayed */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Course Media</h2>
              <p className="text-sm text-gray-500">Add thumbnail image and preview video</p>
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h3 className="text-md font-medium text-gray-800 mb-4">Course Thumbnail</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Preview Area */}
              <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {(thumbnailPreview || currentThumbnail) ? (
                  <img
                    src={thumbnailPreview || currentThumbnail || ''}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No thumbnail</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Thumbnail
                </label>
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  {...register('thumbnail')}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#0066CC] hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg p-1"
                />
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB. Recommended size: 1280x720px
                </p>
                {errors.thumbnail && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.thumbnail.message}
                  </p>
                )}

                {/* Current thumbnail indicator */}
                {currentThumbnail && !thumbnailPreview && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Current thumbnail will be kept if no new file is selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preview Video Section */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Preview Video</h3>
            <div>
              <label htmlFor="preview_video" className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                id="preview_video"
                type="url"
                {...register('preview_video')}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent transition-shadow"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                YouTube, Vimeo, or other video hosting platform. This video will be shown as a preview to potential students.
              </p>
              {errors.preview_video && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preview_video.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-[#0066CC]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
                  <p className="text-xs text-gray-500">Core details about your course</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className={labelClassName}>
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className={inputClassName}
                    placeholder="e.g., Advanced Web Development with React"
                  />
                  {errors.title && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="short_description" className={labelClassName}>
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="short_description"
                    type="text"
                    {...register('short_description')}
                    className={inputClassName}
                    placeholder="A brief one-line summary of your course"
                  />
                  {errors.short_description && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.short_description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className={labelClassName}>
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Provide a comprehensive description of your course, including what students will learn and why they should enroll..."
                      />
                    )}
                  />
                  {errors.description && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Details Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#0066CC]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Course Details</h2>
                  <p className="text-xs text-gray-500">Classification and pricing information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className={labelClassName}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className={inputClassName}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="difficulty_level" className={labelClassName}>
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="difficulty_level"
                    {...register('difficulty_level')}
                    className={inputClassName}
                  >
                    <option value="">Select difficulty</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                  {errors.difficulty_level && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.difficulty_level.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className={labelClassName}>
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price')}
                      className={inputClassName + ' pl-8'}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration_hours" className={labelClassName}>
                    Duration (hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="duration_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    {...register('duration_hours')}
                    className={inputClassName}
                    placeholder="e.g., 20"
                  />
                  {errors.duration_hours && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.duration_hours.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Content Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-[#0066CC]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Course Content</h2>
                  <p className="text-xs text-gray-500">What students will learn and requirements</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="learning_outcomes" className={labelClassName}>
                    Learning Outcomes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="learning_outcomes"
                    rows={4}
                    {...register('learning_outcomes')}
                    className={inputClassName}
                    placeholder="• Build full-stack web applications&#10;• Master React hooks and state management&#10;• Deploy applications to production"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">List what students will learn (one per line)</p>
                  {errors.learning_outcomes && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.learning_outcomes.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="requirements" className={labelClassName}>
                    Prerequisites & Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="requirements"
                    rows={3}
                    {...register('requirements')}
                    className={inputClassName}
                    placeholder="• Basic understanding of HTML and CSS&#10;• Familiarity with JavaScript fundamentals&#10;• A computer with internet connection"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">List any prerequisites (one per line)</p>
                  {errors.requirements && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.requirements.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="target_audience" className={labelClassName}>
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="target_audience"
                      rows={3}
                      {...register('target_audience')}
                      className={inputClassName}
                      placeholder="Aspiring web developers, junior developers looking to advance their skills, career changers..."
                    />
                    {errors.target_audience && (
                      <p className={errorClassName}>
                        <AlertCircle className="w-4 h-4" />
                        {errors.target_audience.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="who_can_join" className={labelClassName}>
                      Eligibility Criteria <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="who_can_join"
                      rows={3}
                      {...register('who_can_join')}
                      className={inputClassName}
                      placeholder="Open to all students, no prior experience required. Must be 18+ years old..."
                    />
                    {errors.who_can_join && (
                      <p className={errorClassName}>
                        <AlertCircle className="w-4 h-4" />
                        {errors.who_can_join.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule and Venue Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#0066CC]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Schedule & Venue</h2>
                  <p className="text-xs text-gray-500">When and where the course takes place</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="class_starts" className={labelClassName}>
                    Class Start Date
                  </label>
                  <input
                    id="class_starts"
                    type="date"
                    {...register('class_starts')}
                    className={inputClassName}
                  />
                  {errors.class_starts && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.class_starts.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="admission_deadline" className={labelClassName}>
                    Admission Deadline
                  </label>
                  <input
                    id="admission_deadline"
                    type="date"
                    {...register('admission_deadline')}
                    className={inputClassName}
                  />
                  {errors.admission_deadline && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.admission_deadline.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="schedule" className={labelClassName}>
                    Class Schedule <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="schedule"
                    type="text"
                    {...register('schedule')}
                    placeholder="e.g., Mon & Wed, 6:00 PM - 8:00 PM"
                    className={inputClassName}
                  />
                  {errors.schedule && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.schedule.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="venue" className={labelClassName}>
                    Venue/Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="venue"
                    type="text"
                    {...register('venue')}
                    placeholder="e.g., Online via Zoom or 123 Main St, Suite 100"
                    className={inputClassName}
                  />
                  {errors.venue && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.venue.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="total_seats" className={labelClassName}>
                    Total Seats Available <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="total_seats"
                    type="number"
                    min="1"
                    {...register('total_seats')}
                    className={inputClassName}
                    placeholder="e.g., 30"
                  />
                  {errors.total_seats && (
                    <p className={errorClassName}>
                      <AlertCircle className="w-4 h-4" />
                      {errors.total_seats.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#76C043] text-white text-sm font-medium rounded-lg hover:bg-[#65a838] disabled:opacity-50 transition-colors"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading || isSubmitting}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditDetailPage;