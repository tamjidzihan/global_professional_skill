# MCQ Quiz System Implementation Plan

This plan details the addition of a Quiz feature to the learning platform. Instructors can create MCQ-based quizzes for their courses, secure them with PIN codes and timers, and view student marks and warnings. Students can access quizzes via direct links, enter the PIN, take the quiz with anti-cheat measures, and see their results on their dashboard.

## Proposed Changes

---

### Backend Components (`server/`)

#### [NEW] [models.py](file:///d:/code_study/Freelance/github/global_professional/server/apps/courses/models.py) (Add Quiz Models)
Add the following models to support quizzes:
* `Quiz`: Contains `title`, `pin_code`, `duration_minutes` (timing constraint), and `course` (ForeignKey).
* `QuizQuestion`: Contains `quiz` (ForeignKey), `question_text`, options (`option_a`, `option_b`, `option_c`, `option_d`), and `correct_option` (A, B, C, or D).
* `QuizSubmission`: Contains `quiz` (ForeignKey), `student` (ForeignKey to User), `started_at`, `completed_at`, `score`, `total_questions`, and `warnings_count`.

#### [NEW] [serializers.py](file:///d:/code_study/Freelance/github/global_professional/server/apps/courses/serializers.py) (Add Serializers)
Define:
* `QuizQuestionSerializer`: Full serialized representation for instructors (including `correct_option`).
* `QuizStudentQuestionSerializer`: Stripped representation for students taking the quiz (excludes `correct_option`).
* `QuizSerializer`: Simple serializer for quiz metadata.
* `QuizSubmissionSerializer`: Serializer for student attempts, scores, and warnings.

#### [NEW] [views.py](file:///d:/code_study/Freelance/github/global_professional/server/apps/courses/views.py) (Add ViewSets & API Methods)
Implement:
* `QuizViewSet`:
  * Standard CRUD operations for instructors/admins.
  * Custom detail actions:
    * `POST /courses/courses/{course_id}/quizzes/{quiz_id}/start/`: Verifies the PIN. Checks if the student is enrolled. Creates a `QuizSubmission` with `started_at = timezone.now()` (if not already started) or verifies that the exam duration hasn't expired. Returns the questions (using `QuizStudentQuestionSerializer`) and the remaining time.
    * `POST /courses/courses/{course_id}/quizzes/{quiz_id}/submit/`: Takes selected answers (e.g., `[{"question_id": "...", "selected_option": "A"}]`) and the `warnings_count`. Compares answers with database records to compute the score. Marks `completed_at = timezone.now()`, updates the submission record, and returns the computed score.
* `QuizQuestionViewSet`:
  * Standard CRUD operations nested under Quizzes. Restricted to Instructors of the course and Admins.

#### [MODIFY] [urls.py](file:///d:/code_study/Freelance/github/global_professional/server/apps/courses/urls.py) (Nested Routing Setup)
Update routers to include nested quiz URLs:
```python
courses_router.register(r'quizzes', QuizViewSet, basename='course-quiz')

quizzes_router = routers.NestedDefaultRouter(courses_router, r'quizzes', lookup='quiz')
quizzes_router.register(r'questions', QuizQuestionViewSet, basename='quiz-question')
```

#### [MODIFY] [serializers.py](file:///d:/code_study/Freelance/github/global_professional/server/apps/enrollments/serializers.py) (Expose Quiz Marks)
Update `EnrollmentSerializer` to dynamically fetch and include quiz submissions for the enrolled course.
```python
quiz_submissions = serializers.SerializerMethodField()

def get_quiz_submissions(self, obj):
    submissions = QuizSubmission.objects.filter(student=obj.student, quiz__course=obj.course)
    return QuizSubmissionSerializer(submissions, many=True).data
```

---

### Frontend Components (`client/`)

#### [MODIFY] [api.ts](file:///d:/code_study/Freelance/github/global_professional/client/src/lib/api.ts) (Add Quiz Endpoints)
Add API functions for quizzes:
* `getQuizzes(courseId)`
* `createQuiz(courseId, data)`
* `updateQuiz(courseId, quizId, data)`
* `deleteQuiz(courseId, quizId)`
* `startQuiz(courseId, quizId, { pin_code })`
* `submitQuiz(courseId, quizId, { answers, warnings_count })`
* `getQuizQuestions(courseId, quizId)`
* `createQuizQuestion(courseId, quizId, data)`
* `updateQuizQuestion(courseId, quizId, questionId, data)`
* `deleteQuizQuestion(courseId, quizId, questionId)`

#### [NEW] [QuizListPage.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/main/pages/dashboard/instructor/QuizListPage.tsx) (Instructor Quiz List)
A separate page where instructors can:
* See all quizzes created for the course.
* Create a new quiz with `title`, `pin_code`, and `duration_minutes`.
* Generate and copy the student sharing link (`/quiz/:quizId/take`).
* Click to manage MCQ questions for any quiz.

#### [NEW] [QuizQuestionsPage.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/main/pages/dashboard/instructor/QuizQuestionsPage.tsx) (Instructor MCQ management)
A dedicated page for managing questions of a specific quiz:
* Create, read, update, and delete quiz questions.
* Form fields: Question text, Option A, Option B, Option C, Option D, and Correct Option dropdown.

#### [NEW] [TakeQuizPage.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/main/pages/TakeQuizPage.tsx) (Student Quiz Interface)
Interactive page for students:
1. **Passcode Gate**: Requires PIN input to start.
2. **Timer**: Displays a countdown based on remaining duration.
3. **Single Question Layout**: Renders one question at a time with "Next" and "Previous" options.
4. **Anti-Cheat Measures**:
   * CSS `select-none` and prevent context menu/copy events to disable copying.
   * `blur` and `visibilitychange` window event listeners. If the user leaves the tab/window, show a warning toast/modal and increment `warnings_count`.
5. **Auto-Submit**: Triggers submission immediately when the timer hits zero.

#### [MODIFY] [router.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/router.tsx) (Add Frontend Routes)
Configure new routes:
* Instructor: `/dashboard/instructor/my-courses/:courseId/quizzes` -> `QuizListPage`
* Instructor: `/dashboard/instructor/my-courses/:courseId/quizzes/:quizId/questions` -> `QuizQuestionsPage`
* Student: `/quiz/:quizId/take` -> `TakeQuizPage`

#### [MODIFY] [CurriculumPage.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/main/pages/dashboard/instructor/CurriculumPage.tsx) (Link to Quiz Manager)
Add a button/link at the top of the course curriculum page: "Manage Course Quizzes".

#### [MODIFY] [StudentDashboard.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/main/pages/dashboard/StudentDashboard.tsx) (Display Quiz Results to Student)
Include a widget displaying "Recent Quiz Results" with scores and total questions.

#### [MODIFY] [EnrolledStudentsPage.tsx](file:///d:/code_study/Freelance/github/global_professional/client/src/main/pages/dashboard/EnrolledStudentsPage.tsx) (Display Quiz Results to Instructor)
Add a "Quiz Scores" column/list in the student list table, showing quiz results and cheat warning tallies (e.g. `Score: 8/10 (3 warnings)`).

---

## Verification Plan

### Automated Tests
- Run Django migrations to verify database integrity:
  `python manage.py makemigrations` and `python manage.py migrate`.
- Run frontend typechecks and linting to ensure no compile errors:
  `npm run build` or `npx tsc -b`.

### Manual Verification
1. **Instructor Journey**:
   - Navigate to Course Curriculum page and click "Manage Course Quizzes".
   - Create a quiz with a custom title, PIN (e.g., `1234`), and duration (e.g., `5` minutes).
   - Add 3 multiple choice questions to the quiz.
   - Copy the generated quiz sharing link.
2. **Student Journey**:
   - Open a browser session, login as a student, and paste the shared link.
   - Try to view the quiz without entering the PIN (ensure it is blocked).
   - Enter the PIN `1234` to unlock the quiz.
   - Ensure only one question is shown at a time.
   - Attempt to copy a question or switch tabs (ensure warnings pop up).
   - Complete the quiz and check the score in the Student Dashboard.
3. **Grade Check**:
   - As an Instructor, navigate to the "Enrolled Students" page for the course and verify the student's score and warning count are displayed properly.
