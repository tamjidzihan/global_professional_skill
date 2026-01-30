# Testing Guide

## Quick Test Workflow

### 1. Setup Test Environment

```bash
# Activate virtual environment
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create test superuser
python manage.py createsuperuser
```

### 2. Start Development Server

```bash
python manage.py runserver
```

### 3. Test Authentication Flow

#### A. Register a Student
```bash
curl -X POST http://localhost:8000/api/v1/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "Student"
  }'
```

#### B. Verify Email
Check the console for the verification token (or email if configured).

```bash
curl -X POST http://localhost:8000/api/v1/accounts/verify-email/ \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token-here"}'
```

#### C. Login
```bash
curl -X POST http://localhost:8000/api/v1/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "TestPass123!"
  }'
```

Save the access token for subsequent requests.

### 4. Test Instructor Request Flow

#### A. Request Instructor Role
```bash
curl -X POST http://localhost:8000/api/v1/accounts/instructor-requests/ \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "I want to teach Python programming",
    "qualifications": "10 years of software development experience",
    "teaching_interests": "Python, Django, Web Development"
  }'
```

#### B. Admin Approves Request (use admin token)
```bash
curl -X POST http://localhost:8000/api/v1/accounts/instructor-requests/<request-id>/review/ \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "review_notes": "Excellent qualifications"
  }'
```

### 5. Test Course Creation (as Instructor)

#### A. Create Category (Admin only)
```bash
curl -X POST http://localhost:8000/api/v1/courses/categories/ \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "description": "Learn web development"
  }'
```

#### B. Create Course
```bash
curl -X POST http://localhost:8000/api/v1/courses/courses/ \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Django REST Framework Complete Course",
    "description": "Learn to build APIs with Django REST Framework",
    "short_description": "Complete DRF course",
    "category": "<category-id>",
    "difficulty_level": "INTERMEDIATE",
    "price": "49.99",
    "duration_hours": 15,
    "learning_outcomes": "Build production-ready APIs",
    "requirements": "Basic Python knowledge"
  }'
```

#### C. Create Section
```bash
curl -X POST http://localhost:8000/api/v1/courses/courses/<course-id>/sections/ \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "<course-id>",
    "title": "Getting Started",
    "description": "Introduction to DRF",
    "order": 1
  }'
```

#### D. Create Lesson
```bash
curl -X POST http://localhost:8000/api/v1/courses/courses/<course-id>/sections/<section-id>/lessons/ \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "section": "<section-id>",
    "title": "What is Django REST Framework",
    "lesson_type": "VIDEO",
    "content": "Introduction to DRF",
    "video_url": "https://youtube.com/example",
    "video_duration": 600,
    "is_preview": true,
    "order": 1
  }'
```

#### E. Submit for Review
```bash
curl -X POST http://localhost:8000/api/v1/courses/courses/<course-id>/submit_for_review/ \
  -H "Authorization: Bearer <instructor-token>"
```

#### F. Admin Publishes Course
```bash
curl -X POST http://localhost:8000/api/v1/courses/courses/<course-id>/review/ \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PUBLISHED",
    "review_notes": "Great course content"
  }'
```

### 6. Test Enrollment Flow

#### A. Browse Courses
```bash
curl -X GET "http://localhost:8000/api/v1/courses/courses/?status=PUBLISHED" \
  -H "Authorization: Bearer <student-token>"
```

#### B. Enroll in Course
```bash
curl -X POST http://localhost:8000/api/v1/enrollments/enrollments/ \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{"course": "<course-id>"}'
```

#### C. Mark Lesson Complete
```bash
curl -X POST http://localhost:8000/api/v1/enrollments/progress/<progress-id>/mark_complete/ \
  -H "Authorization: Bearer <student-token>"
```

### 7. Test Review System

```bash
curl -X POST http://localhost:8000/api/v1/courses/courses/<course-id>/reviews/ \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "<course-id>",
    "rating": 5,
    "review_text": "Excellent course! Highly recommended."
  }'
```

### 8. Test Analytics

#### Instructor Analytics
```bash
curl -X GET http://localhost:8000/api/v1/analytics/instructor/ \
  -H "Authorization: Bearer <instructor-token>"
```

#### Admin Analytics
```bash
curl -X GET http://localhost:8000/api/v1/analytics/admin/ \
  -H "Authorization: Bearer <admin-token>"
```

---

## Using Django Admin Panel

1. Access: http://localhost:8000/admin/
2. Login with superuser credentials
3. Test:
   - User management
   - Instructor request approval
   - Course approval
   - Role assignment
   - Content moderation

---

## API Documentation

Access interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

---

## Test Users

Create these test users for comprehensive testing:

1. **Admin**: admin@test.com (via createsuperuser)
2. **Instructor**: instructor@test.com (approve via admin)
3. **Student**: student@test.com (default role)

---

## Automated Testing

### Run Unit Tests
```bash
python manage.py test
```

### Run with Coverage
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### Test Specific App
```bash
python manage.py test accounts
python manage.py test courses
python manage.py test enrollments
```

---

## Common Test Scenarios

### Permission Testing

1. **Student tries to create course** → Should fail (403 Forbidden)
2. **Instructor tries to approve course** → Should fail (403 Forbidden)
3. **Admin can do everything** → Should succeed
4. **Unenrolled student tries to access lesson** → Should fail (403 Forbidden)
5. **Student tries to review without enrollment** → Should fail (400 Bad Request)

### Workflow Testing

1. **Complete Student Journey**:
   - Register → Verify Email → Login → Browse Courses → Enroll → Complete Lessons → Leave Review

2. **Complete Instructor Journey**:
   - Register → Request Instructor → Get Approved → Create Course → Add Sections/Lessons → Submit for Review → Course Published

3. **Complete Admin Journey**:
   - Review Instructor Requests → Approve/Reject → Review Courses → Publish → Manage Users

---

## Troubleshooting Tests

### Email Not Sending
```python
# Use console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### Database Issues
```bash
# Reset database
python manage.py flush
python manage.py migrate
```

### Token Issues
```bash
# Generate new token
python manage.py shell
>>> from rest_framework_simplejwt.tokens import RefreshToken
>>> from accounts.models import User
>>> user = User.objects.get(email='test@test.com')
>>> refresh = RefreshToken.for_user(user)
>>> print(f"Access: {refresh.access_token}")
```

---

## Performance Testing

### Load Testing with Locust

```python
# locustfile.py
from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login and get token
        response = self.client.post("/api/v1/accounts/login/", json={
            "email": "test@test.com",
            "password": "TestPass123!"
        })
        self.token = response.json()["data"]["tokens"]["access"]
    
    @task
    def get_courses(self):
        self.client.get("/api/v1/courses/courses/", 
                       headers={"Authorization": f"Bearer {self.token}"})
```

Run: `locust -f locustfile.py`

---

## Security Testing

- Test SQL injection protection
- Test XSS protection
- Test CSRF protection
- Test rate limiting
- Test password strength validation
- Test JWT token expiration
