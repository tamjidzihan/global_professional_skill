# Generated migration for quiz expiration and answer storage

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0012_courseannouncement'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='expires_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='If set, the quiz link becomes inaccessible after this datetime.',
            ),
        ),
        migrations.AddField(
            model_name='quizsubmission',
            name='student_answers',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Submitted answers: [{"question_id": "...", "selected_option": "A/B/C/D"}, ...]',
            ),
        ),
    ]
