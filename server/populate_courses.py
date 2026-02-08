import os
import sys
import requests
import random
from pathlib import Path

# --- Configuration ---
BASE_URL = "http://localhost:8000/api/v1/"
INSTRUCTOR_EMAIL = "admin@admin.com"
INSTRUCTOR_PASSWORD = "admin1234"
CATEGORY_NAME = "Networking"
COURSE_IMAGES_DIR = "./Course"  # Relative to the script's execution directory

# --- First, setup Django properly ---
def setup_django():
    """Setup Django environment before importing models"""
    # Get the project root directory (assuming script is at project root)
    project_root = Path(__file__).parent
    
    # Add project root to Python path
    sys.path.insert(0, str(project_root))
    
    # Set Django settings module
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    
    # Import and setup Django
    import django
    django.setup()

# --- Setup Django first ---
setup_django()

# --- Now import Django modules ---
from django.template.defaultfilters import slugify
from django.contrib.auth import get_user_model

# Import models from the correct app structure (apps.* not server.apps.*)
try:
    from apps.courses.models import Category
    print("✓ Successfully imported Category model")
except ImportError as e:
    print(f"✗ Error importing Category model: {e}")
    print("Trying alternative import path...")
    try:
        # Try without the server prefix
        from courses.models import Category
        print("✓ Successfully imported Category model (alternative path)")
    except ImportError as e2:
        print(f"✗ Could not import Category model: {e2}")
        print("Current Python path:")
        for p in sys.path:
            print(f"  {p}")
        sys.exit(1)

# --- Helper to get or create instructor and category ---
def get_or_create_instructor_and_category():
    """Get or create instructor user and category using Django ORM"""
    User = get_user_model()  # Get the custom user model
    
    # Create or get instructor
    try:
        instructor = User.objects.get(email=INSTRUCTOR_EMAIL)
        # Check if instructor has instructor role (adjust based on your User model)
        # If your User model has a 'role' field with choices like 'INSTRUCTOR', 'STUDENT', etc.
        if hasattr(instructor, 'role'):
            # Check the actual value of the role field
            print(f"Instructor role: {instructor.role}")
            # If needed to update role:
            # instructor.role = 'INSTRUCTOR'  # or whatever value your model uses
            # instructor.save()
        print(f"Instructor already exists: {instructor.email}")
    except User.DoesNotExist:
        # Create new instructor - adjust fields based on your User model
        instructor_data = {
            'email': INSTRUCTOR_EMAIL,
            'password': INSTRUCTOR_PASSWORD,
            'is_active': True,
        }
        
        # Add role field if your model has it
        if hasattr(User, 'role'):
            # Try to set as instructor based on your model's role choices
            if hasattr(User, 'INSTRUCTOR'):
                instructor_data['role'] = User.INSTRUCTOR
            else:
                # Check what choices are available
                print("User model role choices:", User.role.field.choices if hasattr(User.role, 'field') else "No role field found")
                instructor_data['role'] = 'INSTRUCTOR'  # or appropriate value
        
        instructor = User.objects.create_user(**instructor_data)
        instructor.set_password(INSTRUCTOR_PASSWORD)
        instructor.save()
        print(f"Created new instructor: {instructor.email}")
    
    # Create or get category
    category, created = Category.objects.get_or_create(
        name=CATEGORY_NAME, 
        defaults={'slug': slugify(CATEGORY_NAME)}
    )
    if created:
        print(f"Created new category: {category.name}")
    else:
        print(f"Category already exists: {category.name}")
    
    return str(instructor.id), str(category.id)  # Return as strings for API

# --- Main script logic ---
def populate_courses():
    # 1. Get instructor and category IDs
    instructor_id, category_id = get_or_create_instructor_and_category()
    print(f"Using instructor ID: {instructor_id}")
    print(f"Using category ID: {category_id}")

    # 2. Login and get access token
    login_url = f"{BASE_URL}accounts/login/"
    login_data = {
        "email": INSTRUCTOR_EMAIL,
        "password": INSTRUCTOR_PASSWORD
    }
    print(f"Logging in as {INSTRUCTOR_EMAIL}...")
    try:
        response = requests.post(login_url, json=login_data, timeout=10)
        response.raise_for_status()
        auth_data = response.json()
        
        # Debug: print the response structure
        print("Login response keys:", auth_data.keys() if isinstance(auth_data, dict) else "Not a dict")
        
        # Access the token based on your API response structure
        if "tokens" in auth_data and "access" in auth_data["tokens"]:
            access_token = auth_data["tokens"]["access"]
        elif "data" in auth_data and "tokens" in auth_data["data"] and "access" in auth_data["data"]["tokens"]:
            access_token = auth_data["data"]["tokens"]["access"]
        elif "access" in auth_data:
            access_token = auth_data["access"]
        else:
            print("Could not find access token in response. Full response:")
            print(json.dumps(auth_data, indent=2))
            return
        print("✓ Login successful. Access token obtained.")
    except requests.exceptions.RequestException as e:
        print(f"✗ Login failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                print(f"Response: {e.response.json()}")
            except:
                print(f"Response text: {e.response.text}")
        return
    except Exception as e:
        print(f"✗ Unexpected error during login: {e}")
        return

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    # 3. Create Demo Courses
    course_creation_url = f"{BASE_URL}courses/"
    
    # Check if images directory exists
    if not os.path.exists(COURSE_IMAGES_DIR):
        print(f"✗ Images directory not found: {COURSE_IMAGES_DIR}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Looking for: {os.path.abspath(COURSE_IMAGES_DIR)}")
        return
    
    image_files = [f for f in os.listdir(COURSE_IMAGES_DIR) 
                  if os.path.isfile(os.path.join(COURSE_IMAGES_DIR, f))
                  and f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]
    
    if not image_files:
        print(f"✗ No image files found in {COURSE_IMAGES_DIR}. Aborting course creation.")
        return

    print(f"✓ Found {len(image_files)} image files to process...")

    for i, image_filename in enumerate(image_files):
        title = f"Demo Course {i+1}: {os.path.splitext(image_filename)[0].replace('_', ' ').title()}"
        slug = slugify(title)
        description = (f"This is a comprehensive demo course covering {title}. It provides an in-depth look at "
                       "various concepts and practices, designed for learners of all levels.")
        short_description = f"An engaging introduction to {title}."
        learning_outcomes = "Understand core concepts\nApply practical skills\nAchieve mastery"
        requirements = "No prior knowledge needed"
        target_audience = "Beginners, intermediates, and advanced learners"
        who_can_join = "Anyone interested in learning"

        price = random.uniform(0, 199.99)
        if i % 3 == 0: # Make some courses free
            price = 0

        course_data = {
            "title": title,
            "slug": slug,
            "description": description,
            "short_description": short_description,
            "category": category_id,  # Use the string ID
            "difficulty_level": random.choice(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
            "price": f"{price:.2f}",
            "duration_hours": random.randint(5, 50),
            "learning_outcomes": learning_outcomes,
            "requirements": requirements,
            "target_audience": target_audience,
            "who_can_join": who_can_join,
        }

        image_path = os.path.join(COURSE_IMAGES_DIR, image_filename)
        
        try:
            with open(image_path, "rb") as img_file:
                # Prepare multipart form data
                files = {
                    'thumbnail': (image_filename, img_file, 'image/jpeg')
                }
                
                # For multipart/form-data, we need to send data as form fields
                form_data = {}
                for key, value in course_data.items():
                    form_data[key] = str(value)
                
                print(f"\nCreating course {i+1}/{len(image_files)}: '{title}'...")
                
                response = requests.post(
                    course_creation_url,
                    headers=headers,
                    files=files,
                    data=form_data,
                    timeout=30
                )
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    print(f"✓ Successfully created course: '{title}'")
                    print(f"  Course ID: {result.get('id', 'N/A')}")
                else:
                    print(f"✗ Failed to create course '{title}': Status {response.status_code}")
                    print(f"  Response: {response.text[:200]}...")
                    
        except FileNotFoundError:
            print(f"✗ Image file not found: {image_path}")
        except Exception as e:
            print(f"✗ Error creating course '{title}': {type(e).__name__}: {e}")
        
        print("-" * 50)

if __name__ == "__main__":
    import json
    populate_courses()