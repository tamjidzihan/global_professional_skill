 System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (Web Browser, Mobile App, Third-party integrations)        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY / NGINX                      │
│              (Load Balancer, SSL Termination)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DJANGO APPLICATION                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Accounts   │  │   Courses    │  │ Enrollments  │      │
│  │     App      │  │     App      │  │     App      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Analytics   │  │   Celery     │  │   Storage    │      │
│  │     App      │  │    Tasks     │  │   (S3/Local) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└────────┬───────────────────┬─────────────────┬──────────────┘
         │                   │                 │
         ▼                   ▼                 ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │  S3 Storage  │
│   Database   │    │ (Cache/Queue)│    │ (Media Files)│
└──────────────┘    └──────────────┘    └──────────────┘
```

## Application Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DJANGO REST FRAMEWORK                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API ENDPOINTS LAYER                    │    │
│  │  (ViewSets, APIViews, Routers)                     │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │          SERIALIZATION LAYER                       │    │
│  │  (Serializers, Validation, Transformation)         │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │          BUSINESS LOGIC LAYER                      │    │
│  │  (Models, Managers, Signals, Tasks)                │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │          PERMISSIONS LAYER                         │    │
│  │  (Role-based Access Control, Custom Permissions)   │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │          DATA ACCESS LAYER                         │    │
│  │  (Django ORM, Query Optimization)                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow - Course Creation & Approval

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  INSTRUCTOR  │         │    ADMIN     │         │   STUDENT    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. Create Course       │                        │
       ├──────────────────┐     │                        │
       │   (Status: DRAFT)│     │                        │
       └──────────────────┘     │                        │
       │                        │                        │
       │ 2. Add Sections/Lessons│                        │
       ├──────────────────┐     │                        │
       │                  │     │                        │
       └──────────────────┘     │                        │
       │                        │                        │
       │ 3. Submit for Review   │                        │
       ├───────────────────────►│                        │
       │   (Status: PENDING)    │                        │
       │                        │                        │
       │                        │ 4. Review Course       │
       │                        ├──────────────────┐     │
       │                        │   - Check content│     │
       │                        │   - Verify quality│    │
       │                        └──────────────────┘     │
       │                        │                        │
       │                        │ 5. Approve & Publish   │
       │                        ├──────────────────┐     │
       │                        │(Status: PUBLISHED)│    │
       │                        └──────────────────┘     │
       │                        │                        │
       │                        │                        │ 6. Browse Courses
       │                        │                        ├──────────────────┐
       │                        │                        │                  │
       │                        │                        └──────────────────┘
       │                        │                        │
       │                        │                        │ 7. Enroll
       │                        │                        ├──────────────────┐
       │                        │                        │                  │
       │                        │                        └──────────────────┘
       │                        │                        │
       │ 8. View Analytics      │                        │ 9. Complete Course
       ├──────────────────┐     │                        ├──────────────────┐
       │ - Enrollments    │     │                        │ - Track progress │
       │ - Ratings        │     │                        │ - Get certificate│
       └──────────────────┘     │                        └──────────────────┘
       │                        │                        │
```

## Database Schema Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      CORE ENTITIES                            │
└──────────────────────────────────────────────────────────────┘

Users                    InstructorRequests        EmailVerificationTokens
├── id (UUID)           ├── id (UUID)             ├── id (UUID)
├── email              ├── user_id (FK)          ├── user_id (FK)
├── password           ├── status                ├── token
├── role               ├── reason                ├── expires_at
├── email_verified     ├── qualifications        └── created_at
├── is_active          ├── reviewed_by (FK)
└── timestamps         └── timestamps

┌──────────────────────────────────────────────────────────────┐
│                    COURSE STRUCTURE                           │
└──────────────────────────────────────────────────────────────┘

Categories              Courses                   Sections
├── id (UUID)          ├── id (UUID)             ├── id (UUID)
├── name               ├── title, slug           ├── course_id (FK)
├── slug               ├── instructor_id (FK)    ├── title
├── description        ├── category_id (FK)      ├── description
└── is_active          ├── status                ├── order
                       ├── price, is_free        └── timestamps
                       ├── difficulty_level
                       ├── reviewed_by (FK)
                       ├── enrollment_count
                       ├── average_rating
                       └── timestamps

Lessons                 Reviews
├── id (UUID)          ├── id (UUID)
├── section_id (FK)    ├── course_id (FK)
├── title              ├── student_id (FK)
├── lesson_type        ├── rating (1-5)
├── content            ├── review_text
├── video_url          └── timestamps
├── is_preview
├── order
└── timestamps

┌──────────────────────────────────────────────────────────────┐
│                  ENROLLMENT & PROGRESS                        │
└──────────────────────────────────────────────────────────────┘

Enrollments             LessonProgress           Certificates
├── id (UUID)          ├── id (UUID)            ├── id (UUID)
├── student_id (FK)    ├── enrollment_id (FK)   ├── enrollment_id (FK)
├── course_id (FK)     ├── lesson_id (FK)       ├── certificate_number
├── progress_%         ├── completed            └── issued_at
├── enrolled_at        ├── watched_duration
├── last_accessed      ├── completed_at
└── completed_at       └── timestamps
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  JWT AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION
   Client → POST /api/v1/accounts/register/
   ├── Create User (role: STUDENT, email_verified: false)
   ├── Generate email verification token
   ├── Send verification email (Celery)
   └── Return user data

2. EMAIL VERIFICATION
   Client → POST /api/v1/accounts/verify-email/
   ├── Validate token
   ├── Mark user.email_verified = true
   └── Delete token

3. LOGIN
   Client → POST /api/v1/accounts/login/
   ├── Validate credentials
   ├── Check email_verified = true
   ├── Check is_active = true
   ├── Generate JWT tokens (access + refresh)
   ├── Update last_login
   └── Return tokens + user data

4. AUTHENTICATED REQUEST
   Client → GET /api/v1/courses/courses/
   Headers: Authorization: Bearer <access_token>
   ├── Validate JWT token
   ├── Verify token signature
   ├── Check expiration
   ├── Load user from token
   ├── Check permissions
   └── Process request

5. TOKEN REFRESH
   Client → POST /api/v1/accounts/token/refresh/
   Body: { "refresh": "<refresh_token>" }
   ├── Validate refresh token
   ├── Generate new access token
   ├── Rotate refresh token (optional)
   └── Return new tokens
```

## Request/Response Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                REQUEST PROCESSING FLOW                       │
└─────────────────────────────────────────────────────────────┘

HTTP Request
    │
    ▼
┌─────────────────────┐
│  Django Middleware  │ ← CORS, Security Headers, Session
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   URL Routing       │ ← Match URL pattern
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Authentication     │ ← JWT Validation
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Permissions       │ ← Role-based checks
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   View/ViewSet      │ ← Business logic
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Serializer        │ ← Validation, transformation
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Database Query    │ ← ORM operations
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Response          │ ← JSON formatting
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Exception Handler  │ ← Error formatting (if error)
└──────────┬──────────┘
           ▼
      HTTP Response
```

## Deployment Architecture (Production)

```
                    ┌──────────────────┐
                    │   Load Balancer  │
                    │    (AWS ELB)     │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │   Nginx (SSL)    │          │   Nginx (SSL)    │
    │   Instance 1     │          │   Instance 2     │
    └────────┬─────────┘          └────────┬─────────┘
             │                              │
             ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Gunicorn Workers │          │ Gunicorn Workers │
    │  Django App 1    │          │  Django App 2    │
    └────────┬─────────┘          └────────┬─────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │   PostgreSQL     │        │     Redis        │
    │   (RDS Master)   │        │  (ElastiCache)   │
    └────────┬─────────┘        └──────────────────┘
             │
             ▼
    ┌──────────────────┐
    │  RDS Read Replica│
    │   (Optional)     │
    └──────────────────┘

    ┌──────────────────┐        ┌──────────────────┐
    │  Celery Workers  │───────►│   Email Service  │
    │  (Background)    │        │   (SES/SMTP)     │
    └──────────────────┘        └──────────────────┘

    ┌──────────────────┐        ┌──────────────────┐
    │  S3 Bucket       │        │  CloudFront CDN  │
    │  (Media Files)   │◄───────┤  (Static Files)  │
    └──────────────────┘        └──────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Network Security                                  │
│  ├── SSL/TLS Encryption (HTTPS)                            │
│  ├── Firewall Rules                                         │
│  └── DDoS Protection                                        │
│                                                              │
│  Layer 2: Application Security                              │
│  ├── CORS Configuration                                     │
│  ├── Rate Limiting                                          │
│  ├── Input Validation                                       │
│  └── CSRF Protection                                        │
│                                                              │
│  Layer 3: Authentication & Authorization                     │
│  ├── JWT Token-based Auth                                   │
│  ├── Token Expiration (60 min)                             │
│  ├── Token Blacklisting                                     │
│  ├── Email Verification                                     │
│  └── Role-based Permissions                                 │
│                                                              │
│  Layer 4: Data Security                                     │
│  ├── Password Hashing (PBKDF2)                             │
│  ├── SQL Injection Prevention (ORM)                         │
│  ├── XSS Protection                                         │
│  └── Secure Headers                                         │
│                                                              │
│  Layer 5: Monitoring & Logging                              │
│  ├── Error Logging                                          │
│  ├── Access Logs                                            │
│  ├── Sentry Integration                                     │
│  └── Audit Trails                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Strategy

```
VERTICAL SCALING                HORIZONTAL SCALING
┌──────────────┐               ┌──────────────────────┐
│  Single       │               │  Multiple Instances  │
│  Server       │    ──────►    │  + Load Balancer     │
│  (4 CPUs)     │               │  (2-10+ instances)   │
└──────────────┘               └──────────────────────┘
      │                                  │
      │                                  ▼
      │                         ┌──────────────────┐
      │                         │  Database         │
      │                         │  Read Replicas    │
      │                         └──────────────────┘
      │                                  │
      │                                  ▼
      │                         ┌──────────────────┐
      │                         │  Redis Cluster    │
      │                         │  (Sharding)       │
      │                         └──────────────────┘
      │                                  │
      │                                  ▼
      │                         ┌──────────────────┐
      │                         │  S3 Storage       │
      │                         │  (Unlimited)      │
      │                         └──────────────────┘
      │
      └────────────────► SUPPORTS 10,000+ concurrent users
```

---

**This architecture supports:**
- ✅ High availability
- ✅ Horizontal scalability
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Monitoring & observability
- ✅ Disaster recovery

**Production-ready for enterprise use!**
