from rest_framework import serializers
from .models import Job, JobApplication
import os

class JobSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'

    def get_is_expired(self, obj):
        from django.utils import timezone
        if obj.closing_date:
            return obj.closing_date < timezone.now().date()
        return False

class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('user', 'applied_at', 'status')

    def validate_cv_file(self, value):
        ext = os.path.splitext(value.name)[1]
        valid_extensions = ['.pdf']
        if not ext.lower() in valid_extensions:
            raise serializers.ValidationError("Only PDF files are allowed.")
        
        # Limit file size to 5MB
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 5MB.")
            
        return value

    def validate(self, data):
        user = self.context['request'].user
        job = data.get('job')
        if JobApplication.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        return data
