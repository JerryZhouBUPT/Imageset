# Generated by Django 4.2.11 on 2024-04-30 09:22

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app01", "0013_remove_image_users_info_is_login"),
    ]

    operations = [
        migrations.CreateModel(
            name="Faces_To_Images_Info",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("account_sha256", models.TextField()),
                ("face_sample", models.TextField()),
                ("total_face_matrix", models.BinaryField()),
                ("face_matrices", models.BinaryField()),
                ("face_weight", models.BinaryField()),
                ("image_face_index", models.BinaryField()),
            ],
        ),
        migrations.CreateModel(
            name="Images_To_Faces_Info",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("account_sha256", models.TextField()),
                ("image", models.TextField()),
                ("face_bboxes", models.BinaryField(blank=True)),
                ("face_matrices", models.BinaryField(blank=True)),
            ],
        ),
    ]
