"""
Signals for courses app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender="courses.Course")
def course_post_save(sender, instance, created, **kwargs):
    """Handle course post-save events."""
    if created:
        logger.info(
            f"New course created: {instance.title} by {instance.instructor.email}"
        )

    if instance.status == "PUBLISHED" and not created:
        logger.info(f"Course published: {instance.title}")
