from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'

    def ready(self):
        # Auto-seed default notification templates if database tables exist
        import sys
        if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv:
            try:
                from .models import NotificationTemplate
                from .notification_service import DEFAULT_TEMPLATES
                for code, info in DEFAULT_TEMPLATES.items():
                    template_obj, created = NotificationTemplate.objects.get_or_create(
                        code=code,
                        defaults={
                            "channel": info["channel"],
                            "name": info["name"],
                            "subject": info["subject"],
                            "template_body": info["body"],
                            "is_active": True,
                        }
                    )
                    if not created and "gpibd.com" not in template_obj.template_body:
                        template_obj.template_body = info["body"]
                        template_obj.save(update_fields=["template_body"])
            except Exception:
                pass

