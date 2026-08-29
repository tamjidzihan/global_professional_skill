from rest_framework import serializers
from .models import Enrollment, LessonProgress, Certificate
from apps.courses.serializers import CourseListSerializer
from apps.accounts.serializers import UserSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    quiz_submissions = serializers.SerializerMethodField()
    
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



class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = '__all__'
        read_only_fields = ('id', 'enrollment', 'started_at', 'completed_at', 'last_accessed')


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ('id', 'certificate_number', 'issued_at')
