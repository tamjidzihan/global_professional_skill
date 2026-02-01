"""
Signals for accounts app.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender='accounts.User')
def user_post_save(sender, instance, created, **kwargs):
    """Handle user post-save events."""
    if created:
        logger.info(f"New user created: {instance.email} with role {instance.role}")
