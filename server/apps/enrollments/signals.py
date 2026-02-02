from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender='enrollments.Enrollment')
def enrollment_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"New enrollment: {instance.student.email} in {instance.course.title}")
