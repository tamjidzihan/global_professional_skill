# Multi-Vendor Learning Platform - Django Backend

A **production-ready** Django REST API backend for a multi-vendor learning platform with comprehensive role-based access control, course management workflows, and scalable architecture.

## 🚀 Features

### Authentication & User Management
- ✅ Custom User model with email-based authentication
- ✅ JWT access & refresh tokens
- ✅ Email verification required before login
- ✅ Password reset functionality
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ Secure password hashing

### Role-Based Permissions

#### Student
- View and enroll in approved courses
- Access enrolled course content
- Track learning progress
- Leave course reviews

#### Instructor
- Request instructor role (requires admin approval)
- Create and manage courses
- Submit courses for admin approval
- View enrollment analytics
- Cannot access unapproved content

#### Admin
- Approve/reject instructor requests
- Approve/reject/publish courses
- Assign and manage user roles
- Full CRUD access to all resources
- View platform analytics

### Course Management
- **Course Status Flow**: Draft → Pending → Approved → Published
- Only admin-approved courses are publicly accessible
- Course categories, pricing, descriptions, thumbnails
- Modular lesson structure (video, text, resources, quizzes)
- Enrollment tracking and progress monitoring
- Course reviews and ratings

### Technical Features
- Production-grade Django settings
- PostgreSQL database with optimized queries
- DRF serializers, viewsets, and routers
- Atomic transactions for data consistency
- Input validation and serializer-level security
- Centralized exception handling
- Pagination, filtering, and search

- Comprehensive logging
- API documentation (Swagger/ReDoc)

## 📋 Requirements

- Python 3.9+
- PostgreSQL 12+

- Virtual environment

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd learning_platform
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/learning_platform
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 5. Database Setup

```bash
# Create PostgreSQL database
createdb learning_platform

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```



## 📚 API Documentation

Once the server is running, access API documentation at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Admin Panel**: http://localhost:8000/admin/

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/accounts/register/` - User registration
- `POST /api/v1/accounts/verify-email/` - Email verification
- `POST /api/v1/accounts/login/` - User login
- `POST /api/v1/accounts/token/refresh/` - Refresh JWT token
- `POST /api/v1/accounts/password/change/` - Change password
- `POST /api/v1/accounts/password/reset/` - Request password reset
- `POST /api/v1/accounts/password/reset/confirm/` - Confirm password reset

### User Profile
- `GET /api/v1/accounts/profile/` - Get user profile
- `PATCH /api/v1/accounts/profile/` - Update user profile

### Instructor Requests
- `GET /api/v1/accounts/instructor-requests/` - List instructor requests
- `POST /api/v1/accounts/instructor-requests/` - Create instructor request
- `POST /api/v1/accounts/instructor-requests/{id}/review/` - Review request (Admin)

### User Management (Admin Only)
- `GET /api/v1/accounts/users/` - List all users
- `PATCH /api/v1/accounts/users/{id}/update_role/` - Update user role
- `POST /api/v1/accounts/users/{id}/deactivate/` - Deactivate user
- `POST /api/v1/accounts/users/{id}/activate/` - Activate user

### Categories
- `GET /api/v1/courses/categories/` - List categories
- `POST /api/v1/courses/categories/` - Create category (Admin)
- `GET /api/v1/courses/categories/{id}/` - Get category details

### Courses
- `GET /api/v1/courses/courses/` - List courses
- `POST /api/v1/courses/courses/` - Create course (Instructor)
- `GET /api/v1/courses/courses/{id}/` - Get course details
- `PATCH /api/v1/courses/courses/{id}/` - Update course
- `POST /api/v1/courses/courses/{id}/submit_for_review/` - Submit for review
- `POST /api/v1/courses/courses/{id}/review/` - Review course (Admin)

### Sections & Lessons
- `GET /api/v1/courses/courses/{course_id}/sections/` - List sections
- `POST /api/v1/courses/courses/{course_id}/sections/` - Create section
- `GET /api/v1/courses/courses/{course_id}/sections/{section_id}/lessons/` - List lessons
- `POST /api/v1/courses/courses/{course_id}/sections/{section_id}/lessons/` - Create lesson

### Reviews
- `GET /api/v1/courses/courses/{course_id}/reviews/` - List reviews
- `POST /api/v1/courses/courses/{course_id}/reviews/` - Create review

### Enrollments
- `GET /api/v1/enrollments/enrollments/` - List my enrollments
- `POST /api/v1/enrollments/enrollments/` - Enroll in course
- `POST /api/v1/enrollments/progress/{id}/mark_complete/` - Mark lesson complete

### Analytics
- `GET /api/v1/analytics/instructor/` - Instructor analytics
- `GET /api/v1/analytics/admin/` - Admin analytics

## 🗂️ Project Structure

```
learning_platform/
├── accounts/              # User management & authentication
│   ├── models.py         # User, InstructorRequest, EmailVerificationToken
│   ├── serializers.py    # User serializers
│   ├── views.py          # Authentication views
│   ├── permissions.py    # Custom permissions

│   └── admin.py          # Admin configuration
├── courses/              # Course management
│   ├── models.py         # Course, Section, Lesson, Review, Category
│   ├── serializers.py    # Course serializers
│   ├── views.py          # Course views
│   ├── permissions.py    # Course permissions
│   └── admin.py          # Course admin
├── enrollments/          # Enrollment & progress tracking
│   ├── models.py         # Enrollment, LessonProgress, Certificate
│   ├── serializers.py    # Enrollment serializers
│   ├── views.py          # Enrollment views
│   └── admin.py          # Enrollment admin
├── analytics/            # Analytics & reporting
│   ├── views.py          # Analytics endpoints
│   └── urls.py           # Analytics routes
├── config/               # Project configuration
│   ├── settings.py       # Django settings
│   ├── urls.py           # Main URL configuration
│   ├── wsgi.py           # WSGI configuration

│   └── exceptions.py     # Custom exception handler
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables template
├── manage.py             # Django management script
└── README.md             # This file
```

## 🔒 Security Features

- Secure password hashing with Django's PBKDF2
- JWT token-based authentication
- Email verification required
- HTTPS enforcement in production
- CORS configuration
- Rate limiting
- SQL injection prevention through ORM
- XSS protection
- CSRF protection
- Secure HTTP headers

## 🚀 Deployment

### Using Docker (Recommended)

```bash
# Build and run with docker-compose
docker-compose up -d
```

### Manual Deployment

1. Set production environment variables
2. Collect static files: `python manage.py collectstatic`
3. Run migrations: `python manage.py migrate`
4. Use Gunicorn: `gunicorn config.wsgi:application`
5. Setup Nginx as reverse proxy
6. Configure SSL certificates


### Environment Variables for Production

```env
DEBUG=False
SECRET_KEY=strong-random-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@db:5432/learning_platform

USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
SENTRY_DSN=your-sentry-dsn
```

## 📊 Database Schema

### Key Models

- **User**: Custom user with email authentication
- **InstructorRequest**: Instructor role requests
- **Course**: Course content and status
- **Section**: Course modules
- **Lesson**: Individual lessons
- **Enrollment**: Student enrollments
- **LessonProgress**: Progress tracking
- **Review**: Course reviews
- **Category**: Course categories

## 🧪 Testing

```bash
# Run tests
python manage.py test

# With coverage
pytest --cov=.
```

## 📝 API Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "message": "Error description",
        "details": { ... }
    }
}
```

## 🔧 Development Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver







# Django shell
python manage.py shell
```

## 📈 Performance Optimizations

- Database query optimization with `select_related` and `prefetch_related`
- Database indexing on frequently queried fields
- Pagination for large datasets
- Atomic transactions for data consistency


- Connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Contact: admin@learningplatform.com

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Live video streaming for classes
- [ ] Quiz and assignment grading system
- [ ] Discussion forums
- [ ] Advanced analytics dashboard
- [ ] Mobile app API optimization
- [ ] Multi-language support
- [ ] Social authentication (Google, Facebook)

## ⚡ Quick Start Example

```python
# 1. Register a user
POST /api/v1/accounts/register/
{
    "email": "student@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
}

# 2. Verify email (check inbox for token)
POST /api/v1/accounts/verify-email/
{
    "token": "verification-token-from-email"
}

# 3. Login
POST /api/v1/accounts/login/
{
    "email": "student@example.com",
    "password": "SecurePass123"
}

# 4. Browse courses (use access token in Authorization header)
GET /api/v1/courses/courses/
Authorization: Bearer <access_token>

# 5. Enroll in a course
POST /api/v1/enrollments/enrollments/
{
    "course": "course-uuid"
}
```

---

**Built with ❤️ using Django & Django REST Framework**
