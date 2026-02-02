from rest_framework import serializers
from .models import Enrollment, LessonProgress, Certificate
from courses.serializers import CourseListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('id', 'student', 'progress_percentage', 'enrolled_at', 'last_accessed', 'completed_at')


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
