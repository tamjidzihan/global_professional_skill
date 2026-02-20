"""
Signals for accounts app.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import logging
import os

logger = logging.getLogger(__name__)


@receiver(post_save, sender="accounts.User")
def user_post_save(sender, instance, created, **kwargs):
    """Handle user post-save events."""
    if created:
        logger.info(f"New user created: {instance.email} with role {instance.role}")


@receiver(post_delete, sender="accounts.User")
def delete_user_profile_picture(sender, instance, **kwargs):
    """
    Delete user profile_picture file from storage when the user is deleted.
    """
    if instance.profile_picture:
        if os.path.isfile(instance.profile_picture.path):
            os.remove(instance.profile_picture.path)
