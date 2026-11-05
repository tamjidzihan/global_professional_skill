from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Course, Quiz, QuizQuestion, QuizSubmission


User = get_user_model()


class QuizBreakdownVisibilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.instructor = User.objects.create_user(
            email="quiz-instructor@example.com",
            password="test-password",
            role="INSTRUCTOR",
        )
        self.admin = User.objects.create_user(
            email="quiz-admin@example.com",
            password="test-password",
            role="ADMIN",
        )
        self.student = User.objects.create_user(
            email="quiz-student@example.com",
            password="test-password",
            role="STUDENT",
        )
        self.course = Course.objects.create(
            title="Quiz visibility course",
            slug="quiz-visibility-course",
            description="Course description",
            short_description="Course summary",
            instructor=self.instructor,
            price=0,
            learning_outcomes="Course outcomes",
        )
        self.quiz = Quiz.objects.create(
            course=self.course,
            title="Visibility quiz",
            pin_code="1234",
            duration_minutes=15,
        )
        self.question = QuizQuestion.objects.create(
            quiz=self.quiz,
            question_text="Question text",
            option_a="Correct",
            option_b="Incorrect",
            option_c="",
            option_d="",
            correct_option="A",
        )
        self.submission = QuizSubmission.objects.create(
            quiz=self.quiz,
            student=self.student,
            score=1,
            total_questions=1,
            completed_at=timezone.now(),
            student_answers=[
                {"question_id": str(self.question.id), "selected_option": "A"}
            ],
            shuffled_question_ids=[str(self.question.id)],
        )

    def test_instructor_can_toggle_breakdown_and_student_receives_score_only(self):
        self.client.force_authenticate(user=self.instructor)
        toggle_url = reverse(
            "course-quiz-detail",
            kwargs={"course_pk": self.course.id, "pk": self.quiz.id},
        )
        response = self.client.patch(
            toggle_url, {"show_question_breakdown": False}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.quiz.refresh_from_db()
        self.assertFalse(self.quiz.show_question_breakdown)

        self.client.force_authenticate(user=self.student)
        result_url = reverse(
            "my-quiz-submission-detail", kwargs={"pk": self.submission.id}
        )
        response = self.client.get(result_url)

        self.assertEqual(response.status_code, 200)
        result = response.data["data"]
        self.assertEqual(result["score"], 1)
        self.assertFalse(result["can_view_question_breakdown"])
        self.assertIsNone(result["questions"])
        self.assertEqual(result["student_answers"], [])
        self.assertEqual(result["shuffled_question_ids"], [])

    def test_instructor_and_admin_can_still_review_hidden_breakdown(self):
        self.quiz.show_question_breakdown = False
        self.quiz.save(update_fields=["show_question_breakdown"])
        result_url = reverse(
            "my-quiz-submission-detail", kwargs={"pk": self.submission.id}
        )

        for user in (self.instructor, self.admin):
            self.client.force_authenticate(user=user)
            response = self.client.get(result_url)
            self.assertEqual(response.status_code, 200)
            result = response.data["data"]
            self.assertTrue(result["can_view_question_breakdown"])
            self.assertEqual(len(result["questions"]), 1)
            self.assertEqual(len(result["student_answers"]), 1)

    def test_students_cannot_change_breakdown_setting(self):
        self.client.force_authenticate(user=self.student)
        toggle_url = reverse(
            "course-quiz-detail",
            kwargs={"course_pk": self.course.id, "pk": self.quiz.id},
        )
        response = self.client.patch(
            toggle_url, {"show_question_breakdown": False}, format="json"
        )

        self.assertNotEqual(response.status_code, 200)
        self.quiz.refresh_from_db()
        self.assertTrue(self.quiz.show_question_breakdown)

    def test_admin_can_toggle_breakdown(self):
        self.client.force_authenticate(user=self.admin)
        toggle_url = reverse(
            "course-quiz-detail",
            kwargs={"course_pk": self.course.id, "pk": self.quiz.id},
        )

        response = self.client.patch(
            toggle_url, {"show_question_breakdown": False}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.quiz.refresh_from_db()
        self.assertFalse(self.quiz.show_question_breakdown)

    def test_hidden_breakdown_also_hides_student_answer_sheet(self):
        self.quiz.show_question_breakdown = False
        self.quiz.save(update_fields=["show_question_breakdown"])
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("submission-answer-sheet", kwargs={"pk": self.submission.id})
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["score"], 1)
        self.assertFalse(response.data["data"]["can_view_question_breakdown"])
        self.assertEqual(response.data["data"]["answer_sheet"], [])

    def test_breakdown_is_enabled_by_default(self):
        self.assertTrue(self.quiz.show_question_breakdown)
