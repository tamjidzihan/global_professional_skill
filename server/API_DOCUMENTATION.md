# API Documentation

## Base URL
```
Development: http://localhost:8000/api/v1
Production: https://yourdomain.com/api/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 1. Authentication Endpoints

### Register User
**POST** `/accounts/register/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Response:** `201 Created`
```json
{
    "success": true,
    "message": "Registration successful. Please check your email to verify your account.",
    "data": {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "role": "STUDENT",
            "email_verified": false
        }
    }
}
```

### Verify Email
**POST** `/accounts/verify-email/`

**Request Body:**
```json
{
    "token": "verification-token-from-email"
}
```

### Login
**POST** `/accounts/login/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "user": { ... },
        "tokens": {
            "access": "access_token",
            "refresh": "refresh_token"
        }
    }
}
```

### Refresh Token
**POST** `/accounts/token/refresh/`

**Request Body:**
```json
{
    "refresh": "refresh_token"
}
```

---

## 2. User Profile

### Get Profile
**GET** `/accounts/profile/`

**Headers:** `Authorization: Bearer <token>`

### Update Profile
**PATCH** `/accounts/profile/`

**Request Body:**
```json
{
    "first_name": "Jane",
    "bio": "Updated bio",
    "phone_number": "+1234567890"
}
```

---

## 3. Instructor Requests

### Request Instructor Role
**POST** `/accounts/instructor-requests/`

**Request Body:**
```json
{
    "reason": "I want to share my knowledge",
    "qualifications": "10 years of experience in...",
    "teaching_interests": "Web Development, Python"
}
```

### List Instructor Requests (Admin)
**GET** `/accounts/instructor-requests/`

### Review Instructor Request (Admin)
**POST** `/accounts/instructor-requests/{id}/review/`

**Request Body:**
```json
{
    "status": "APPROVED",
    "review_notes": "Approved based on qualifications"
}
```

---

## 4. Course Management

### List Courses
**GET** `/courses/courses/`

**Query Parameters:**
- `category`: Filter by category ID
- `difficulty_level`: BEGINNER, INTERMEDIATE, ADVANCED
- `is_free`: true/false
- `search`: Search in title and description
- `ordering`: created_at, -enrollment_count, -average_rating

**Example:** `/courses/courses/?is_free=true&ordering=-enrollment_count`

### Create Course (Instructor)
**POST** `/courses/courses/`

**Request Body:**
```json
{
    "title": "Python for Beginners",
    "description": "Learn Python from scratch",
    "short_description": "Complete Python course",
    "category": "category-uuid",
    "difficulty_level": "BEGINNER",
    "price": "49.99",
    "duration_hours": 20,
    "learning_outcomes": "Master Python basics",
    "requirements": "No prior experience needed"
}
```

### Get Course Details
**GET** `/courses/courses/{id}/`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "title": "Python for Beginners",
        "instructor": { ... },
        "sections": [ ... ],
        "reviews": [ ... ],
        "enrollment_count": 150,
        "average_rating": 4.5,
        "is_enrolled": false
    }
}
```

### Submit Course for Review (Instructor)
**POST** `/courses/courses/{id}/submit_for_review/`

### Review Course (Admin)
**POST** `/courses/courses/{id}/review/`

**Request Body:**
```json
{
    "status": "PUBLISHED",
    "review_notes": "Approved and published"
}
```

---

## 5. Sections & Lessons

### Create Section
**POST** `/courses/courses/{course_id}/sections/`

**Request Body:**
```json
{
    "course": "course-uuid",
    "title": "Introduction",
    "description": "Getting started",
    "order": 1
}
```

### Create Lesson
**POST** `/courses/courses/{course_id}/sections/{section_id}/lessons/`

**Request Body:**
```json
{
    "section": "section-uuid",
    "title": "Python Basics",
    "lesson_type": "VIDEO",
    "content": "Lesson content here",
    "video_url": "https://youtube.com/...",
    "video_duration": 600,
    "is_preview": false,
    "order": 1
}
```

---

## 6. Enrollments

### Enroll in Course
**POST** `/enrollments/enrollments/`

**Request Body:**
```json
{
    "course": "course-uuid"
}
```

### List My Enrollments
**GET** `/enrollments/enrollments/`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "course": { ... },
            "progress_percentage": 45.5,
            "enrolled_at": "2024-01-15T10:00:00Z",
            "completed_at": null
        }
    ]
}
```

### Mark Lesson Complete
**POST** `/enrollments/progress/{progress_id}/mark_complete/`

---

## 7. Reviews

### Create Review
**POST** `/courses/courses/{course_id}/reviews/`

**Request Body:**
```json
{
    "course": "course-uuid",
    "rating": 5,
    "review_text": "Excellent course!"
}
```

**Requirements:**
- Must be enrolled in the course
- One review per user per course

---

## 8. Analytics

### Instructor Analytics
**GET** `/analytics/instructor/`

**Response:**
```json
{
    "success": true,
    "data": {
        "total_courses": 5,
        "published_courses": 3,
        "total_enrollments": 450,
        "average_rating": 4.6,
        "total_reviews": 89
    }
}
```

### Admin Analytics
**GET** `/analytics/admin/`

**Response:**
```json
{
    "success": true,
    "data": {
        "total_users": 1500,
        "total_students": 1400,
        "total_instructors": 95,
        "total_courses": 120,
        "published_courses": 100,
        "pending_courses": 15,
        "total_enrollments": 5000,
        "pending_instructor_requests": 8
    }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
    "success": false,
    "error": {
        "message": "Validation error occurred.",
        "details": {
            "email": ["This field is required."]
        }
    }
}
```

### Unauthorized (401)
```json
{
    "success": false,
    "error": {
        "message": "Authentication credentials were not provided."
    }
}
```

### Forbidden (403)
```json
{
    "success": false,
    "error": {
        "message": "You do not have permission to perform this action."
    }
}
```

### Not Found (404)
```json
{
    "success": false,
    "error": {
        "message": "Resource not found."
    }
}
```

---

## Pagination

Paginated endpoints return:

```json
{
    "success": true,
    "count": 100,
    "next": "http://api.example.com/courses/?page=2",
    "previous": null,
    "data": [ ... ]
}
```

Query parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

---

## Rate Limiting

- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/v1/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "password_confirm": "TestPass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Get Courses (with token)
```bash
curl -X GET http://localhost:8000/api/v1/courses/courses/ \
  -H "Authorization: Bearer <access_token>"
```

---

## Postman Collection

Import the included `postman_collection.json` for a complete API collection with pre-configured requests.
