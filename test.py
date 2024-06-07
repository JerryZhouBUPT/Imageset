# from Crypto.PublicKey import RSA
# import hashlib
# import base64
# from Crypto.Cipher import PKCS1_v1_5, AES
#
# def SHA256_Encrypt(plaintext: str) -> str:
#     return hashlib.sha256(plaintext.encode('utf-8')).hexdigest()
#
# def RSA_Encrypt(plaintext: str) -> str:
#     rsa_key = RSA.generate(2048)
#     pub_key = SHA256_Encrypt(rsa_key.publickey().export_key().decode()[27:-25])
#     return pub_key
#
#
# print(RSA_Encrypt('Hello World!'))

# from app01.models import Image_Register_Users_Info
#
# print(Image_Register_Users_Info.objects.get(id=1))

import cv2
import numpy as np

# 读取原始图像
original_image_path = './image/3_4.jpg'  # 替换为你的图片路径
image = cv2.imread(original_image_path)

# 检查图像是否成功加载
if image is not None:
    # 获取原始图像的尺寸
    original_height, original_width, channels = image.shape

    # 设置目标宽度
    target_width = 640

    # 计算新的尺寸，保持宽高比
    aspect_ratio = original_height / original_width
    new_height = int(target_width * aspect_ratio)

    # 创建一个新的白色画布，尺寸为新的宽度和计算出的新高度
    white_image = np.full((new_height, target_width, channels), 255, dtype=np.uint8)

    # 缩放图像到新尺寸
    resized_image = cv2.resize(image, (target_width, new_height))

    # 将缩放后的图像粘贴到白色画布上，保持原始宽高比
    # 由于我们只关心宽度填充，所以原始图像的缩放高度可能小于白色画布的高度
    # 因此，我们使用cv2.copyTo()函数将原始图像复制到白色画布的上部
    cv2.copyTo(resized_image, white_image, mask=None)

    # 显示图像
    cv2.imshow('Resized Image', white_image)
