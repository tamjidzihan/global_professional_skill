
# Learning Platform API

This is the backend API for the Learning Platform, a multi-vendor online learning platform. It is built with Django and Django Rest Framework.

## Project Overview

The project is divided into three main apps:

-   **`accounts`**: Handles user authentication, authorization, and management. It includes a custom user model with roles (Student, Instructor, Admin), JWT-based authentication, and a process for students to request to become instructors.
-   **`courses`**: Manages the creation, approval, and delivery of courses. It includes models for courses, sections, lessons, and reviews. It has a comprehensive approval workflow for courses submitted by instructors.
-   **`enrollments`**: Handles student enrollments in courses and tracks their progress. It includes models for enrollments, lesson progress, and certificates.

## Getting Started

### Prerequisites

-   Python 3.10+
-   Pip
-   Virtualenv (recommended)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/learning-platform.git
    cd learning-platform/server
    ```

2.  **Create and activate a virtual environment:**

    ```bash
    python -m venv env
    source env/bin/activate  # On Windows, use `env\Scripts\activate`
    ```

3.  **Install the dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up the database:**

    ```bash
    python manage.py migrate
    ```

5.  **Create a superuser:**

    ```bash
    python manage.py createsuperuser
    ```

6.  **Run the development server:**

    ```bash
    python manage.py runserver
    ```

The API will be available at `http://127.0.0.1:8000/`.

## API Documentation

The API documentation is available in two formats:

-   **Swagger UI:** `http://127.0.0.1:8000/api/docs/`
-   **ReDoc:** `http://127.0.0.1:8000/api/redoc/`
