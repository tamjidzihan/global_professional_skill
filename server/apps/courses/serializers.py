"""
Serializers for courses app.
"""

from rest_framework import serializers
from django.utils.text import slugify
from django.utils import timezone
from .models import Category, Course, Section, Lesson, Review, CourseStatus, Quiz, QuizQuestion, QuizSubmission, CourseMaterial
# pyrefly: ignore [missing-import]
from apps.accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""

    course_count = serializers.SerializerMethodField()
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "icon",
            "is_active",
            "course_count",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def get_course_count(self, obj):
        return obj.courses.filter(status=CourseStatus.PUBLISHED).count()

    def validate(self, attrs):
        """Auto-generate slug from name if not provided."""
        if 'name' in attrs:
            attrs['slug'] = slugify(attrs['name'])
            
            # Check for slug uniqueness
            slug = attrs['slug']
            if self.instance:
                if Category.objects.filter(slug=slug).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError({"name": "Category with this name already exists."})
            else:
                if Category.objects.filter(slug=slug).exists():
                    raise serializers.ValidationError({"name": "Category with this name already exists."})
        return attrs

    def create(self, validated_data):
        """Create category with validated data (slug is already set in validate)."""
        return super().create(validated_data)


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model."""

    class Meta:
        model = Lesson
        fields = (
            "id",
            "section",
            "title",
            "lesson_type",
            "content",
            "video_url",
            "video_duration",
            "resources",
            "is_preview",
            "is_completed",
            "order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class LessonListSerializer(serializers.ModelSerializer):
    """Simplified serializer for lesson list."""

    class Meta:
        model = Lesson
        fields = ("id", "title", "lesson_type", "video_duration", "is_preview", "is_completed", "order")


class SectionSerializer(serializers.ModelSerializer):
    """Serializer for Section model with lessons."""

    lessons = LessonListSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = (
            "id",
            "course",
            "title",
            "description",
            "order",
            "lessons",
            "lesson_count",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def get_lesson_count(self, obj):
        return obj.lessons.count()


class SectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sections."""

    class Meta:
        model = Section
        fields = ("id", "course", "title", "description", "order")
        read_only_fields = ("id",)


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model."""

    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_email = serializers.EmailField(source="student.email", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "course",
            "student",
            "student_name",
            "student_email",
            "rating",
            "review_text",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "student", "created_at", "updated_at")

    def validate(self, attrs):
        """Validate review."""
        request = self.context.get("request")
        course = attrs.get("course")

        # Check if user is enrolled in the course
        from apps.enrollments.models import Enrollment

        if not Enrollment.objects.filter(student=request.user, course=course).exists():  # type: ignore
            raise serializers.ValidationError(
                "You must be enrolled in this course to leave a review."
            )

        # Check if user already reviewed
        if self.instance is None:  # Creating new review
            if Review.objects.filter(student=request.user, course=course).exists():  # type: ignore
                raise serializers.ValidationError(
                    "You have already reviewed this course. You can update your existing review."
                )

        return attrs

    def create(self, validated_data):
        """Create review with current user as student."""
        validated_data["student"] = self.context["request"].user
        return super().create(validated_data)


class CourseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for course list."""

    instructor_name = serializers.CharField(
        source="instructor.get_full_name", read_only=True
    )
    category_name = serializers.CharField(source="category.name", read_only=True)
    total_sections = serializers.SerializerMethodField()
    is_admission_open = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "short_description",
            "instructor_name",
            "category_name",
            "difficulty_level",
            "delivery_mode",
            "price",
            "is_free",
            "thumbnail",
            "who_can_join",
            "duration_hours",
            "total_classes",
            "status",
            "enrollment_count",
            "average_rating",
            "total_reviews",
            "total_sections",
            "available_seats",
            "total_seats",
            "is_admission_open",
            "is_full",
            "class_starts",
            "admission_deadline",
            "schedule",
            "venue",
            "created_at",
            "published_at",
        )

    def get_total_sections(self, obj):
        return obj.total_sections

    def get_is_admission_open(self, obj):
        return obj.is_admission_open

    def get_is_full(self, obj):
        return obj.is_full


class CourseMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)
    file_size_formatted = serializers.SerializerMethodField()

    class Meta:
        model = CourseMaterial
        fields = (
            "id",
            "course",
            "title",
            "file",
            "file_size",
            "file_size_formatted",
            "file_type",
            "uploaded_at",
            "uploaded_by",
            "uploaded_by_name",
        )
        read_only_fields = ("id", "course", "file_size", "file_type", "uploaded_at", "uploaded_by")

    def get_file_size_formatted(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"

    def validate_file(self, value):
        # Limit size to 10MB
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB.")
        
        import os
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = [
            '.pdf', 
            '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
            '.doc', '.docx', '.odt',
            '.xls', '.xlsx', '.ods',
            '.ppt', '.pptx', '.txt',
            '.zip', '.rar'
        ]
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                "Unsupported file format. Allowed formats: PDF, Word, Excel, PowerPoint, Text, Images, or Archives."
            )
        return value

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            user = request.user
            # Check if user is course instructor, admin, or enrolled student
            from apps.enrollments.models import Enrollment
            is_enrolled = Enrollment.objects.filter(student=user, course=instance.course).exists()
            is_instructor = instance.course.instructor == user
            is_admin = user.role == 'ADMIN'
            if not (is_enrolled or is_instructor or is_admin):
                rep['file'] = None
        else:
            rep['file'] = None
        return rep


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for course."""

    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    materials = CourseMaterialSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    total_sections = serializers.SerializerMethodField()
    is_admission_open = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "short_description",
            "instructor",
            "category",
            "difficulty_level",
            "delivery_mode",
            "price",
            "is_free",
            "thumbnail",
            "preview_video",
            "duration_hours",
            "total_classes",
            "requirements",
            "learning_outcomes",
            "target_audience",
            "who_can_join",
            "status",
            "sections",
            "materials",
            "enrollment_count",
            "average_rating",
            "total_reviews",
            "reviews",
            "is_enrolled",
            "total_sections",
            "available_seats",
            "total_seats",
            "class_starts",
            "admission_deadline",
            "schedule",
            "venue",
            "is_admission_open",
            "is_full",
            "created_at",
            "updated_at",
            "published_at",
        )

    def get_is_enrolled(self, obj):
        """Check if current user is enrolled."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from apps.enrollments.models import Enrollment

            return Enrollment.objects.filter(student=request.user, course=obj).exists()
        return False

    def get_total_sections(self, obj):
        return obj.total_sections

    def get_is_admission_open(self, obj):
        return obj.is_admission_open

    def get_is_full(self, obj):
        return obj.is_full


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating courses."""

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "short_description",
            "category",
            "difficulty_level",
            "delivery_mode",
            "price",
            "thumbnail",
            "preview_video",
            "duration_hours",
            "total_classes",
            "requirements",
            "learning_outcomes",
            "target_audience",
            "who_can_join",
            "class_starts",
            "admission_deadline",
            "schedule",
            "venue",
            "total_seats",
            "available_seats",
            "status",
        )
        read_only_fields = ("id",)

    def validate_title(self, value):
        """Validate and generate slug."""
        slug = slugify(value)
        if self.instance:
            if Course.objects.filter(slug=slug).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError(
                    "Course with this title already exists."
                )
        else:
            if Course.objects.filter(slug=slug).exists():
                raise serializers.ValidationError(
                    "Course with this title already exists."
                )
        return value

    def validate_total_seats(self, value):
        """Validate total seats."""
        if value < 1:
            raise serializers.ValidationError("Total seats must be at least 1.")
        return value

    def validate_available_seats(self, value):
        """Validate available seats."""
        total_seats = self.initial_data.get('total_seats') # type: ignore
        if total_seats is not None:
            try:
                total_seats = int(total_seats)
            except (ValueError, TypeError):
                total_seats = 30
        else:
            total_seats = 30

        if value > total_seats:
            raise serializers.ValidationError(
                "Available seats cannot exceed total seats."
            )
        return value

    def validate_admission_deadline(self, value):
        """Validate admission deadline."""
        if value and value < timezone.now().date():
            raise serializers.ValidationError(
                "Admission deadline cannot be in the past."
            )
        return value

    def validate_class_starts(self, value):
        """Validate class start date."""
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Class start date cannot be in the past.")
        return value

    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:
            old_status = self.instance.status

            # Instructors can only set DRAFT or PENDING
            if not self.context["request"].user.is_admin_user:
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
        validated_data["instructor"] = self.context["request"].user
        validated_data["slug"] = slugify(validated_data["title"])
        validated_data["status"] = CourseStatus.DRAFT
        
        # If available_seats not provided, set it to total_seats
        if "available_seats" not in validated_data:
            validated_data["available_seats"] = validated_data.get("total_seats", 30)
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update course and regenerate slug if title changed."""
        if "title" in validated_data and validated_data["title"] != instance.title:
            validated_data["slug"] = slugify(validated_data["title"])
        return super().update(instance, validated_data)


class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for admin course review."""

    class Meta:
        model = Course
        fields = ("status", "review_notes")

    def validate_status(self, value):
        """Validate status for admin review."""
        if value not in [
            CourseStatus.APPROVED,
            CourseStatus.PUBLISHED,
            CourseStatus.REJECTED,
        ]:
            raise serializers.ValidationError(
                "Status must be APPROVED, PUBLISHED, or REJECTED."
            )
        return value

    def update(self, instance, validated_data):
        """Update course status and review info."""
        from django.utils import timezone

        instance.status = validated_data["status"]
        instance.review_notes = validated_data.get("review_notes", "")
        instance.reviewed_by = self.context["request"].user
        instance.reviewed_at = timezone.now()

        # Set published_at if status is PUBLISHED
        if instance.status == CourseStatus.PUBLISHED and not instance.published_at:
            instance.published_at = timezone.now()

        instance.save()
        return instance


class QuizQuestionSerializer(serializers.ModelSerializer):
    """Full question serializer for instructors/admins."""
    class Meta:
        model = QuizQuestion
        fields = ("id", "quiz", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_option", "created_at")
        read_only_fields = ("id", "quiz", "created_at")


class QuizStudentQuestionSerializer(serializers.ModelSerializer):
    """Stripped question serializer for students (omits correct_option)."""
    class Meta:
        model = QuizQuestion
        fields = ("id", "question_text", "option_a", "option_b", "option_c", "option_d")
        read_only_fields = ("id",)


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for Quiz metadata."""
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ("id", "course", "title", "pin_code", "duration_minutes", "question_count", "created_at", "updated_at")
        read_only_fields = ("id", "course", "created_at", "updated_at")

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for quiz submissions/attempts."""
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_email = serializers.EmailField(source="student.email", read_only=True)
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    course_title = serializers.CharField(source="quiz.course.title", read_only=True)

    class Meta:
        model = QuizSubmission
        fields = (
            "id",
            "quiz",
            "quiz_title",
            "course_title",
            "student",
            "student_name",
            "student_email",
            "score",
            "total_questions",
            "warnings_count",
            "started_at",
            "completed_at",
        )
        read_only_fields = ("id", "started_at", "completed_at", "student", "quiz")
