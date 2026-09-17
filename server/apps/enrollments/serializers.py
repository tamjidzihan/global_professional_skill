from rest_framework import serializers
from django.conf import settings
from .models import (
    Enrollment,
    LessonProgress,
    Certificate,
    CourseCertificateConfig,
    calculate_student_certificate_eligibility,
)
from apps.courses.serializers import CourseListSerializer
from apps.accounts.serializers import UserSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    quiz_submissions = serializers.SerializerMethodField()
    certificate = serializers.SerializerMethodField()
    eligibility = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('id', 'student', 'progress_percentage', 'enrolled_at', 'last_accessed', 'completed_at')

    def get_quiz_submissions(self, obj):
        from apps.courses.models import QuizSubmission
        from apps.courses.serializers import QuizSubmissionSerializer
        submissions = QuizSubmission.objects.filter(
            student=obj.student, quiz__course=obj.course
        ).order_by("-completed_at", "-started_at")
        return QuizSubmissionSerializer(submissions, many=True).data

    def get_certificate(self, obj):
        cert = getattr(obj, 'certificate', None)
        if cert:
            return CertificateSerializer(cert, context=self.context).data
        return None

    def get_eligibility(self, obj):
        return calculate_student_certificate_eligibility(obj)


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LessonProgress
        fields = '__all__'
        read_only_fields = ('id', 'enrollment', 'started_at', 'completed_at', 'last_accessed')


class CourseCertificateConfigSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    logo_url = serializers.SerializerMethodField()
    signature_url = serializers.SerializerMethodField()
    additional_signature_url = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = CourseCertificateConfig
        fields = (
            'id',
            'course',
            'course_title',
            'is_active',
            'template_id',
            'organization_name',
            'logo_image',
            'logo_size',
            'logo_url',
            'authorizer_name',
            'authorizer_position',
            'signature_image',
            'signature_size',
            'signature_url',
            'enable_additional_authorizer',
            'additional_authorizer_name',
            'additional_authorizer_position',
            'additional_signature_image',
            'additional_signature_size',
            'additional_signature_url',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_name',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')

    def get_logo_url(self, obj):
        if obj.logo_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo_image.url)
            return obj.logo_image.url
        return None

    def get_signature_url(self, obj):
        if obj.signature_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.signature_image.url)
            return obj.signature_image.url
        return None

    def get_additional_signature_url(self, obj):
        if obj.additional_signature_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.additional_signature_image.url)
            return obj.additional_signature_image.url
        return None


class CertificateSerializer(serializers.ModelSerializer):
    student_id = serializers.UUIDField(source='enrollment.student.id', read_only=True)
    student_email = serializers.EmailField(source='enrollment.student.email', read_only=True)
    course_id = serializers.UUIDField(source='enrollment.course.id', read_only=True)
    logo_url = serializers.SerializerMethodField()
    signature_url = serializers.SerializerMethodField()
    additional_signature_url = serializers.SerializerMethodField()
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = (
            'id',
            'enrollment',
            'certificate_number',
            'status',
            'student_id',
            'student_email',
            'student_name',
            'course_id',
            'course_name',
            'organization_name',
            'template_id',
            'logo_image',
            'logo_size',
            'logo_url',
            'authorizer_name',
            'authorizer_position',
            'signature_image',
            'signature_size',
            'signature_url',
            'enable_additional_authorizer',
            'additional_authorizer_name',
            'additional_authorizer_position',
            'additional_signature_image',
            'additional_signature_size',
            'additional_signature_url',
            'issue_date',
            'issued_at',
            'verification_url',
            'revoked_at',
            'revocation_reason',
        )
        read_only_fields = ('id', 'certificate_number', 'issued_at', 'issued_by', 'updated_at', 'updated_by')

    def get_logo_url(self, obj):
        if obj.logo_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo_image.url)
            return obj.logo_image.url
        return None

    def get_signature_url(self, obj):
        if obj.signature_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.signature_image.url)
            return obj.signature_image.url
        return None

    def get_additional_signature_url(self, obj):
        if obj.additional_signature_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.additional_signature_image.url)
            return obj.additional_signature_image.url
        return None

    def get_verification_url(self, obj):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        return f"{frontend_url}/certificate-verify/{obj.certificate_number}"


class PublicCertificateVerificationSerializer(serializers.Serializer):
    """Safe public certificate verification payload (no private data)."""
    valid = serializers.BooleanField()
    certificate_number = serializers.CharField()
    student_name = serializers.CharField()
    course_name = serializers.CharField()
    organization_name = serializers.CharField()
    issue_date = serializers.DateField()
    status = serializers.CharField()
    template_id = serializers.CharField()
    authorizer_name = serializers.CharField(allow_blank=True)
    authorizer_position = serializers.CharField(allow_blank=True)
    has_signature = serializers.BooleanField()
    signature_url = serializers.CharField(allow_null=True, allow_blank=True)
    signature_size = serializers.IntegerField(default=100)
    enable_additional_authorizer = serializers.BooleanField(default=False)
    additional_authorizer_name = serializers.CharField(allow_blank=True, required=False)
    additional_authorizer_position = serializers.CharField(allow_blank=True, required=False)
    has_additional_signature = serializers.BooleanField(default=False)
    additional_signature_url = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    additional_signature_size = serializers.IntegerField(default=100, required=False)
    logo_url = serializers.CharField(allow_null=True, allow_blank=True)
    logo_size = serializers.IntegerField(default=100)
    issued_at = serializers.DateTimeField()
    verification_url = serializers.CharField()


