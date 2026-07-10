from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.courses.models import (
    Category,
    Course,
    CourseStatus,
    Lesson,
    LessonType,
    QuizOption,
    QuizQuestion,
    QuizSubmission,
    Section,
)
from apps.enrollments.models import Enrollment


class QuizLessonAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.instructor = User.objects.create_user(
            email="instructor@example.com",
            password="password123",
            role="INSTRUCTOR",
            first_name="Jane",
            last_name="Instructor",
        )
        self.student = User.objects.create_user(
            email="student@example.com",
            password="password123",
            role="STUDENT",
            first_name="John",
            last_name="Student",
        )
        self.category = Category.objects.create(
            name="Technology",
            slug="technology",
            description="Tech",
        )

    def _create_course(self, **overrides):
        defaults = {
            "title": "Python Basics",
            "slug": "python-basics",
            "description": "Learn Python",
            "short_description": "Short description",
            "instructor": self.instructor,
            "category": self.category,
            "price": 0,
            "learning_outcomes": "Understand Python",
            "status": CourseStatus.PUBLISHED,
        }
        defaults.update(overrides)
        return Course.objects.create(**defaults)

    def test_unpublished_quiz_is_hidden_from_students(self):
        course = self._create_course()
        section = Section.objects.create(course=course, title="Intro", order=0)
        Lesson.objects.create(
            section=section,
            title="Pop quiz",
            lesson_type=LessonType.QUIZ,
            content="Quiz",
            order=0,
            is_published=False,
        )

        self.client.force_authenticate(self.student)
        response = self.client.get(f"/api/v1/courses/courses/{course.id}/")

        self.assertEqual(response.status_code, 200)
        lessons = response.data["data"]["sections"][0]["lessons"]
        self.assertEqual(lessons, [])

    def test_student_can_submit_quiz_and_receive_score(self):
        course = self._create_course()
        section = Section.objects.create(course=course, title="Intro", order=0)
        lesson = Lesson.objects.create(
            section=section,
            title="Quiz one",
            lesson_type=LessonType.QUIZ,
            content="Quiz",
            order=0,
            is_published=True,
        )
        question = QuizQuestion.objects.create(
            lesson=lesson, prompt="What is 2 + 2?", order=0
        )
        correct_option = QuizOption.objects.create(
            question=question, text="4", is_correct=True, order=0
        )
        wrong_option = QuizOption.objects.create(
            question=question, text="5", is_correct=False, order=1
        )
        Enrollment.objects.create(student=self.student, course=course)

        self.client.force_authenticate(self.student)
        response = self.client.post(
            f"/api/v1/courses/courses/{course.id}/sections/{section.id}/lessons/{lesson.id}/submit-quiz/",
            {
                "answers": [
                    {
                        "question_id": str(question.id),
                        "option_id": str(wrong_option.id),
                    }
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["score"], 0)
        self.assertEqual(response.data["data"]["total_questions"], 1)
        self.assertEqual(QuizSubmission.objects.count(), 1)
        self.assertEqual(
            QuizSubmission.objects.get(lesson=lesson, student=self.student).score, 0
        )
