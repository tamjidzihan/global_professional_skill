from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Course, CourseStatus, Quiz, QuizQuestion, QuizSubmission


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



class FeaturedCourseManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="featured-admin@example.com",
            password="test-password",
            role="ADMIN",
        )
        self.student = User.objects.create_user(
            email="featured-student@example.com",
            password="test-password",
            role="STUDENT",
        )
        self.instructor = User.objects.create_user(
            email="featured-instructor@example.com",
            password="test-password",
            role="INSTRUCTOR",
        )
        self.course_list_url = "/api/v1/courses/courses/"
        self.featured_url = f"{self.course_list_url}featured/"

    def create_course(
        self,
        title,
        slug,
        price=0,
        is_featured=False,
        featured_order=None,
        course_status=CourseStatus.PUBLISHED,
    ):
        return Course.objects.create(
            title=title,
            slug=slug,
            description="Course description",
            short_description="Course summary",
            instructor=self.instructor,
            price=price,
            learning_outcomes="Course outcomes",
            status=course_status,
            is_featured=is_featured,
            featured_order=featured_order,
        )

    def test_admin_can_feature_multiple_courses_reorder_and_remove(self):
        first = self.create_course("First course", "first-course")
        second = self.create_course("Second course", "second-course")
        self.client.force_authenticate(user=self.admin)

        for course in (first, second):
            response = self.client.post(
                f"{self.course_list_url}{course.id}/featured-status/",
                {"is_featured": True},
                format="json",
            )
            self.assertEqual(response.status_code, 200)

        response = self.client.put(
            self.featured_url,
            {"course_ids": [str(second.id), str(first.id)]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual(second.featured_order, 0)
        self.assertEqual(first.featured_order, 1)
        self.assertEqual(
            [course["id"] for course in response.data["data"]],
            [str(second.id), str(first.id)],
        )

        response = self.client.post(
            f"{self.course_list_url}{second.id}/featured-status/",
            {"is_featured": False},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        second.refresh_from_db()
        first.refresh_from_db()
        self.assertFalse(second.is_featured)
        self.assertIsNone(second.featured_order)
        self.assertEqual(first.featured_order, 0)

    def test_only_admins_can_manage_featured_courses(self):
        course = self.create_course("Protected course", "protected-course")
        endpoint = f"{self.course_list_url}{course.id}/featured-status/"

        for user in (self.student, self.instructor):
            self.client.force_authenticate(user=user)
            response = self.client.post(
                endpoint, {"is_featured": True}, format="json"
            )
            self.assertEqual(response.status_code, 403)

        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.featured_url)
        self.assertEqual(response.status_code, 403)
        response = self.client.put(
            self.featured_url, {"course_ids": []}, format="json"
        )
        self.assertEqual(response.status_code, 403)
        course.refresh_from_db()
        self.assertFalse(course.is_featured)

    def test_only_published_courses_can_be_featured(self):
        course = self.create_course(
            "Draft course", "draft-course", course_status=CourseStatus.DRAFT
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"{self.course_list_url}{course.id}/featured-status/",
            {"is_featured": True},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        course.refresh_from_db()
        self.assertFalse(course.is_featured)
        self.assertIsNone(course.featured_order)

    def test_unpublishing_a_featured_course_removes_it_from_featured(self):
        course = self.create_course(
            "Featured course", "featured-course", is_featured=True, featured_order=0
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"{self.course_list_url}{course.id}/review/",
            {"status": CourseStatus.DRAFT},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        course.refresh_from_db()
        self.assertEqual(course.status, CourseStatus.DRAFT)
        self.assertFalse(course.is_featured)
        self.assertIsNone(course.featured_order)
        self.assertEqual(
            self.client.get(self.featured_url).data["data"],
            [],
        )

    def test_public_course_lists_put_featured_first_before_pagination(self):
        regular_later = self.create_course(
            "Regular later", "regular-later", price=20
        )
        featured_later = self.create_course(
            "Featured later", "featured-later", price=200, is_featured=True, featured_order=1
        )
        regular_earlier = self.create_course(
            "Regular earlier", "regular-earlier", price=10
        )
        featured_first = self.create_course(
            "Featured first", "featured-first", price=100, is_featured=True, featured_order=0
        )
        additional_regular = [
            self.create_course(
                f"Additional regular {index}",
                f"additional-regular-{index}",
                price=20 + index,
            )
            for index in range(1, 11)
        ]
        regular_courses = sorted(
            [regular_later, regular_earlier, *additional_regular],
            key=lambda course: course.price,
        )

        response = self.client.get(f"{self.course_list_url}?ordering=price")

        self.assertEqual(response.status_code, 200)
        first_page_ids = [
            course["id"] for course in response.data["results"]["data"]
        ]
        self.assertEqual(
            first_page_ids,
            [str(featured_first.id), str(featured_later.id)]
            + [str(course.id) for course in regular_courses[:10]],
        )

        second_page = self.client.get(
            f"{self.course_list_url}?ordering=price&page=2"
        )
        second_page_ids = [
            course["id"] for course in second_page.data["results"]["data"]
        ]
        self.assertEqual(
            second_page_ids, [str(course.id) for course in regular_courses[10:]]
        )
        self.assertEqual(
            len(set(first_page_ids + second_page_ids)),
            len(first_page_ids) + len(second_page_ids),
        )

        filtered_response = self.client.get(
            f"{self.course_list_url}?search=Featured"
        )
        filtered_ids = [
            course["id"] for course in filtered_response.data["results"]["data"]
        ]
        self.assertEqual(
            filtered_ids, [str(featured_first.id), str(featured_later.id)]
        )

    def test_featured_order_requires_every_current_featured_course_once(self):
        first = self.create_course(
            "First course", "first-featured", is_featured=True, featured_order=0
        )
        second = self.create_course(
            "Second course", "second-featured", is_featured=True, featured_order=1
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.put(
            self.featured_url,
            {"course_ids": [str(first.id), str(first.id)]},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        response = self.client.put(
            self.featured_url,
            {"course_ids": [str(first.id)]},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual(first.featured_order, 0)
        self.assertEqual(second.featured_order, 1)
