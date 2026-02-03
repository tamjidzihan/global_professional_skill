from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Sum
from apps.accounts.permissions import IsInstructor, IsAdmin
from apps.courses.models import Course
from apps.enrollments.models import Enrollment


class InstructorAnalyticsView(APIView):
    permission_classes = [IsInstructor]

    def get(self, request):
        courses = Course.objects.filter(instructor=request.user)

        stats = {
            "total_courses": courses.count(),
            "published_courses": courses.filter(status="PUBLISHED").count(),
            "total_enrollments": Enrollment.objects.filter(
                course__instructor=request.user
            ).count(),
            "average_rating": courses.aggregate(avg=Avg("average_rating"))["avg"] or 0,
            "total_reviews": courses.aggregate(sum=Sum("total_reviews"))["sum"] or 0,
        }

        return Response({"success": True, "data": stats})


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.accounts.models import User, InstructorRequest

        stats = {
            "total_users": User.objects.count(),
            "total_students": User.objects.filter(role="STUDENT").count(),
            "total_instructors": User.objects.filter(role="INSTRUCTOR").count(),
            "total_courses": Course.objects.count(),
            "published_courses": Course.objects.filter(status="PUBLISHED").count(),
            "pending_courses": Course.objects.filter(status="PENDING").count(),
            "total_enrollments": Enrollment.objects.count(),
            "pending_instructor_requests": InstructorRequest.objects.filter(
                status="PENDING"
            ).count(),
        }

        return Response({"success": True, "data": stats})
