# Generated by Django 4.2.11 on 2024-04-05 04:59

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Image_Register_Users_Info",
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
                ("account", models.TextField()),
                ("email", models.TextField()),
                ("verify_number", models.IntegerField()),
                ("expire_time", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="Image_Users_Info",
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
                ("account_md5", models.TextField()),
                ("password_md5", models.TextField()),
                ("email", models.TextField()),
                ("SignUp_timestamp", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
