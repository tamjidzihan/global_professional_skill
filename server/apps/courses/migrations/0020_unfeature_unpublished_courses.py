from django.db import migrations


def unfeature_unpublished_courses(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    database = schema_editor.connection.alias
    courses = Course.objects.using(database)

    courses.filter(is_featured=True).exclude(status="PUBLISHED").update(
        is_featured=False,
        featured_order=None,
    )

    featured_courses = list(
        courses.filter(is_featured=True).order_by("featured_order", "pk")
    )
    for order, course in enumerate(featured_courses):
        course.featured_order = order
    if featured_courses:
        courses.bulk_update(featured_courses, ["featured_order"])


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0019_course_featured_order_course_is_featured_and_more"),
    ]

    operations = [
        migrations.RunPython(
            unfeature_unpublished_courses,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
