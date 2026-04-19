from django.db import models
from django.conf import settings
import uuid

class JobType(models.TextChoices):
    FULL_TIME = 'FULL_TIME', 'Full-time'
    PART_TIME = 'PART_TIME', 'Part-time'
    CONTRACT = 'CONTRACT', 'Contract'
    INTERNSHIP = 'INTERNSHIP', 'Internship'

class JobApplicationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    REVIEWED = 'REVIEWED', 'Reviewed'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    REJECTED = 'REJECTED', 'Rejected'

class Job(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=255, default='Remote')
    job_type = models.CharField(
        max_length=20, 
        choices=JobType.choices, 
        default=JobType.FULL_TIME
    )
    salary_range = models.CharField(max_length=100, blank=True)
    closing_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class JobApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='job_applications'
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='applications'
    )
    cv_file = models.FileField(upload_to='careers/resumes/')
    cover_letter = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=JobApplicationStatus.choices, 
        default=JobApplicationStatus.PENDING
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ['user', 'job']

    def __str__(self):
        return f"{self.user.email} - {self.job.title}"
