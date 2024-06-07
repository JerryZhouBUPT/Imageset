from django.db import models

# Create your models here.
class Image_Users_Info(models.Model):
    account_sha256 = models.TextField(blank=False)
    password_sha256 = models.TextField(blank=False)
    email = models.TextField(blank=False)
    SignUp_timestamp = models.DateTimeField(auto_now_add=True)
    pub_key = models.TextField(blank=True)
    pri_key = models.TextField(blank=True)
    sign_in_expire_time = models.DateTimeField(null=True, blank=True)
    threshold = models.FloatField(default=0.45, blank=False)


class Image_Register_Users_Info(models.Model):
    account = models.TextField(blank=True)
    email = models.TextField(blank=True)
    verify_number = models.IntegerField(blank=True)
    expire_time = models.TextField(blank=False)
    pub_key = models.TextField(blank=True, default=None)
    pri_key = models.TextField(blank=True, default=None)


class Images_To_Faces_Info(models.Model):
    account_sha256 = models.TextField(blank=False)
    image = models.TextField(blank=False)  # base64存储图片
    face_bboxes = models.BinaryField(blank=True)
    face_matrices = models.BinaryField(blank=True)
    landmarks = models.BooleanField(blank=False, default=False)


class Faces_To_Images_Info(models.Model):
    account_sha256 = models.TextField(blank=False)
    face_sample = models.TextField(blank=False)  # base64存储图片
    face_matrices = models.BinaryField(blank=False)
    image_face_index = models.BinaryField(blank=False)


class History_Details_Info(models.Model):
    account_sha256 = models.TextField(blank=False)
    target_image_id = models.IntegerField(blank=False)
    selected_faces_index_list = models.BinaryField(blank=False)
    pre_recognition_over_threshold = models.BinaryField(blank=False)
    pre_recognition_under_threshold = models.BinaryField(blank=False)
    submit_time = models.DateTimeField(auto_now_add=True)
