"""
Serializers for courses app.
"""
from rest_framework import serializers
from django.utils.text import slugify
from django.db import transaction
from .models import Category, Course, Section, Lesson, Review, CourseStatus
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon', 'is_active', 'course_count', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def get_course_count(self, obj):
        return obj.courses.filter(status=CourseStatus.PUBLISHED).count()
    
    def validate_name(self, value):
        """Auto-generate slug from name."""
        slug = slugify(value)
        if self.instance:
            # Exclude current instance when updating
            if Category.objects.filter(slug=slug).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Category with this name already exists.")
        else:
            if Category.objects.filter(slug=slug).exists():
                raise serializers.ValidationError("Category with this name already exists.")
        return value
    
    def create(self, validated_data):
        """Create category with auto-generated slug."""
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model."""
    
    class Meta:
        model = Lesson
        fields = (
            'id', 'section', 'title', 'lesson_type', 'content',
            'video_url', 'video_duration', 'resources', 'is_preview',
            'order', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class LessonListSerializer(serializers.ModelSerializer):
    """Simplified serializer for lesson list."""
    
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'lesson_type', 'video_duration', 'is_preview', 'order')


class SectionSerializer(serializers.ModelSerializer):
    """Serializer for Section model with lessons."""
    lessons = LessonListSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = ('id', 'course', 'title', 'description', 'order', 'lessons', 'lesson_count', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def get_lesson_count(self, obj):
        return obj.lessons.count()


class SectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sections."""
    
    class Meta:
        model = Section
        fields = ('id', 'course', 'title', 'description', 'order')
        read_only_fields = ('id',)


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model."""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)
    
    class Meta:
        model = Review
        fields = (
            'id', 'course', 'student', 'student_name', 'student_email',
            'rating', 'review_text', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'student', 'created_at', 'updated_at')
    
    def validate(self, attrs):
        """Validate review."""
        request = self.context.get('request')
        course = attrs.get('course')
        
        # Check if user is enrolled in the course
        from enrollments.models import Enrollment
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            raise serializers.ValidationError(
                "You must be enrolled in this course to leave a review."
            )
        
        # Check if user already reviewed
        if self.instance is None:  # Creating new review
            if Review.objects.filter(student=request.user, course=course).exists():
                raise serializers.ValidationError(
                    "You have already reviewed this course. You can update your existing review."
                )
        
        return attrs
    
    def create(self, validated_data):
        """Create review with current user as student."""
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class CourseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for course list."""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'short_description', 'instructor_name',
            'category_name', 'difficulty_level', 'price', 'is_free',
            'thumbnail', 'duration_hours', 'status', 'enrollment_count',
            'average_rating', 'total_reviews', 'created_at', 'published_at'
        )


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for course."""
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description', 'short_description',
            'instructor', 'category', 'difficulty_level', 'price', 'is_free',
            'thumbnail', 'preview_video', 'duration_hours', 'requirements',
            'learning_outcomes', 'target_audience', 'status', 'sections',
            'enrollment_count', 'average_rating', 'total_reviews', 'reviews',
            'is_enrolled', 'created_at', 'updated_at', 'published_at'
        )
    
    def get_is_enrolled(self, obj):
        """Check if current user is enrolled."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from enrollments.models import Enrollment
            return Enrollment.objects.filter(student=request.user, course=obj).exists()
        return False


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating courses."""
    
    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'short_description', 'category',
            'difficulty_level', 'price', 'thumbnail', 'preview_video',
            'duration_hours', 'requirements', 'learning_outcomes',
            'target_audience', 'status'
        )
        read_only_fields = ('id',)
    
    def validate_title(self, value):
        """Validate and generate slug."""
        slug = slugify(value)
        if self.instance:
            if Course.objects.filter(slug=slug).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Course with this title already exists.")
        else:
            if Course.objects.filter(slug=slug).exists():
                raise serializers.ValidationError("Course with this title already exists.")
        return value
    
    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:
            old_status = self.instance.status
            
            # Instructors can only set DRAFT or PENDING
            if not self.context['request'].user.is_admin_user:
                if value not in [CourseStatus.DRAFT, CourseStatus.PENDING]:
                    raise serializers.ValidationError(
                        "You can only set course status to DRAFT or PENDING."
                    )
                
                # Cannot change from PENDING back to DRAFT
                if old_status == CourseStatus.PENDING and value == CourseStatus.DRAFT:
                    raise serializers.ValidationError(
                        "Cannot change status from PENDING back to DRAFT."
                    )
        else:
            # New courses must be DRAFT
            if value != CourseStatus.DRAFT:
                value = CourseStatus.DRAFT
        
        return value
    
    def create(self, validated_data):
        """Create course with instructor and slug."""
        validated_data['instructor'] = self.context['request'].user
        validated_data['slug'] = slugify(validated_data['title'])
        validated_data['status'] = CourseStatus.DRAFT
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update course and regenerate slug if title changed."""
        if 'title' in validated_data and validated_data['title'] != instance.title:
            validated_data['slug'] = slugify(validated_data['title'])
        return super().update(instance, validated_data)


class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for admin course review."""
    
    class Meta:
        model = Course
        fields = ('status', 'review_notes')
    
    def validate_status(self, value):
        """Validate status for admin review."""
        if value not in [CourseStatus.APPROVED, CourseStatus.PUBLISHED, CourseStatus.REJECTED]:
            raise serializers.ValidationError(
                "Status must be APPROVED, PUBLISHED, or REJECTED."
            )
        return value
    
    def update(self, instance, validated_data):
        """Update course status and review info."""
        from django.utils import timezone
        
        instance.status = validated_data['status']
        instance.review_notes = validated_data.get('review_notes', '')
        instance.reviewed_by = self.context['request'].user
        instance.reviewed_at = timezone.now()
        
        # Set published_at if status is PUBLISHED
        if instance.status == CourseStatus.PUBLISHED and not instance.published_at:
            instance.published_at = timezone.now()
        
        instance.save()
        return instance
