from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('careers', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "DROP TABLE IF EXISTS careers_jobapplication;",
                "DROP TABLE IF EXISTS careers_job;",
                """
                CREATE TABLE `careers_job` (
                    `id` char(32) COLLATE utf8mb4_general_ci NOT NULL PRIMARY KEY,
                    `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                    `description` longtext COLLATE utf8mb4_general_ci NOT NULL,
                    `requirements` longtext COLLATE utf8mb4_general_ci NOT NULL,
                    `location` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                    `job_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
                    `salary_range` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
                    `closing_date` date DEFAULT NULL,
                    `is_active` tinyint(1) NOT NULL,
                    `created_at` datetime(6) NOT NULL,
                    `updated_at` datetime(6) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
                """,
                """
                CREATE TABLE `careers_jobapplication` (
                    `id` char(32) COLLATE utf8mb4_general_ci NOT NULL PRIMARY KEY,
                    `cv_file` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
                    `cover_letter` longtext COLLATE utf8mb4_general_ci NOT NULL,
                    `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
                    `applied_at` datetime(6) NOT NULL,
                    `job_id` char(32) COLLATE utf8mb4_general_ci NOT NULL,
                    `user_id` char(32) COLLATE utf8mb4_general_ci NOT NULL,
                    UNIQUE KEY `careers_jobapplication_user_id_job_id_0602eb32_uniq` (`user_id`, `job_id`),
                    CONSTRAINT `careers_jobapplication_job_id_83da3eda_fk_careers_job_id` FOREIGN KEY (`job_id`) REFERENCES `careers_job` (`id`),
                    CONSTRAINT `careers_jobapplication_user_id_93cf8a34_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
                """
            ],
            reverse_sql=[
                "DROP TABLE IF EXISTS careers_jobapplication;",
                "DROP TABLE IF EXISTS careers_job;",
            ]
        ),
    ]
