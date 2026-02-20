"""
Signals for courses app.
"""

import logging
import os

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

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


@receiver(post_delete, sender="courses.Course")
def delete_course_thumbnail(sender, instance, **kwargs):
    """
    Delete the thumbnail file from storage when the Course is deleted.
    """
    if instance.thumbnail:
        if os.path.isfile(instance.thumbnail.path):
            os.remove(instance.thumbnail.path)
