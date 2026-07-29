from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

def send_disqualification_email(submission):
    """Send an email notification to the instructor when a student is disqualified."""
    try:
        instructor = submission.quiz.course.instructor
        student = submission.student
        quiz = submission.quiz
        
        student_name = student.get_full_name() or student.email
        quiz_name = quiz.title
        warnings_count = submission.warnings_count
        reason_display = submission.get_disqualification_reason_display()
        disqualified_at = submission.disqualified_at or timezone.now()
        
        subject = f"ALERT: Student Disqualified - {quiz_name}"
        message = (
            f"Hello {instructor.get_full_name() or instructor.email},\n\n"
            f"This is an automated alert to notify you that a student has been disqualified from a quiz attempt due to proctoring violations.\n\n"
            f"Details:\n"
            f"- Student: {student_name} ({student.email})\n"
            f"- Quiz: {quiz_name}\n"
            f"- Course: {quiz.course.title}\n"
            f"- Date/Time: {disqualified_at.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
            f"- Warnings Count: {warnings_count}/3\n"
            f"- Disqualification Reason: {reason_display}\n\n"
            f"The student's score for this attempt has been set to 0 and their status is marked as disqualified.\n\n"
            f"Best regards,\n"
            f"Global Professional Skill Team"
        )
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [instructor.email],
            fail_silently=True,
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send disqualification email: {str(e)}")
