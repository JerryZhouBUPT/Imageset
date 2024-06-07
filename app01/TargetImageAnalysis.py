from insightface.app import FaceAnalysis
from app01.ImageSave import Classify_Faces_Based_On_Image
import numpy as np
import cv2
import base64

# 初始化模型参数
app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=-1, det_size=(640, 640))

def imageAnalysis(base64_str: str, threshold: float):
    # 去掉数据 URI Scheme 的前缀
    parts = base64_str.split(';')[0]
    base64_str = base64_str.split(',', 1)[1]
    # 对base64编码进行解码，得到二进制数据
    img_data = base64.b64decode(base64_str)
    # 将二进制数据转换为NumPy数组
    np_data = np.frombuffer(img_data, dtype=np.uint8)
    # 从NumPy数组中解码图像
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    # 获取原始图像的尺寸
    original_height, original_width, channels = img.shape
    if original_width < 640 and original_height < 640:
        # 创建一个新的白色画布，尺寸为新的宽度和计算出的新高度
        white_image = np.full((640, 640, channels), 255, dtype=np.uint8)
        white_image[: original_height, : original_width] = img
        img = white_image
    elif original_width < 640 <= original_height:
        white_image = np.full((original_height, 640, channels), 255, dtype=np.uint8)
        white_image[: original_height, : original_width] = img
        img = white_image
    elif original_height < 640 <= original_width:
        white_image = np.full((640, original_width, channels), 255, dtype=np.uint8)
        white_image[: original_height, : original_width] = img
        img = white_image
    # 分割字符串以获取媒体类型
    media_type = ''
    if len(parts) > 0 and parts.startswith('data:image/'):
        media_type += parts.replace('data:image/', '.')
        if media_type == '':
            return None
    train_faces = app.get(img)
    result = {}
    faces_detail = []
    for index, face in enumerate(train_faces):
        face_box = list(face['bbox'])
        img_cut = img[int(face_box[1]) - 15: int(face_box[3]) + 15, int(face_box[0]) - 15: int(face_box[2]) + 15]
        # noinspection PyBroadException
        try:
            img_cut_base64 = cv2.imencode(media_type, img_cut)[1]
        except:
            img_cut = img[int(face_box[1]): int(face_box[3]), int(face_box[0]): int(face_box[2])]
            img_cut_base64 = cv2.imencode(media_type, img_cut)[1]
        img_cut_base64 = str(base64.b64encode(img_cut_base64))[2:-1]
        # 构建数据URI
        base64_img_cut_str = f"data:image/{media_type};base64,{img_cut_base64}"
        result.update({str(index + 1): base64_img_cut_str})
        # 构建后台存储数据
        face_detail = {'bbox': face_box, 'normed_embedding': face.normed_embedding}
        faces_detail.append(face_detail)
    if result:
        Face_Classification = Classify_Faces_Based_On_Image(faces_detail, threshold)
    else:
        Face_Classification = []
    return [result, Face_Classification, faces_detail]


def imageAnalysis2(base64_str: str):
    # 去掉数据 URI Scheme 的前缀
    parts = base64_str.split(';')[0]
    base64_str = base64_str.split(',', 1)[1]
    # 对base64编码进行解码，得到二进制数据
    img_data = base64.b64decode(base64_str)
    # 将二进制数据转换为NumPy数组
    np_data = np.frombuffer(img_data, dtype=np.uint8)
    # 从NumPy数组中解码图像
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    # 获取原始图像的尺寸
    original_height, original_width, channels = img.shape
    if original_width < 640 and original_height < 640:
        # 创建一个新的白色画布，尺寸为新的宽度和计算出的新高度
        white_image = np.full((640, 640, channels), 255, dtype=np.uint8)
        white_image[: original_height, : original_width] = img
        img = white_image
    elif original_width < 640 <= original_height:
        white_image = np.full((original_height, 640, channels), 255, dtype=np.uint8)
        white_image[: original_height, : original_width] = img
        img = white_image
    elif original_height < 640 <= original_width:
        white_image = np.full((640, original_width, channels), 255, dtype=np.uint8)
        white_image[: original_height, : original_width] = img
        img = white_image
    # 分割字符串以获取媒体类型
    media_type = ''
    if len(parts) > 0 and parts.startswith('data:image/'):
        media_type += parts.replace('data:image/', '.')
        if media_type == '':
            return None
    train_faces = app.get(img)
    faces_detail = []
    for index, face in enumerate(train_faces):
        face_box = list(face['bbox'])
        img_cut = img[int(face_box[1]) - 15: int(face_box[3]) + 15, int(face_box[0]) - 15: int(face_box[2]) + 15]
        # noinspection PyBroadException
        try:
            img_cut_base64 = cv2.imencode(media_type, img_cut)[1]
        except:
            img_cut = img[int(face_box[1]): int(face_box[3]), int(face_box[0]): int(face_box[2])]
            img_cut_base64 = cv2.imencode(media_type, img_cut)[1]
        img_cut_base64 = str(base64.b64encode(img_cut_base64))[2:-1]
        # 构建数据URI
        base64_img_cut_str = f"data:image/{media_type};base64,{img_cut_base64}"
        # 构建后台存储数据
        face_detail = {'bbox': face_box, 'normed_embedding': face.normed_embedding, 'base64_img': base64_img_cut_str}
        faces_detail.append(face_detail)
    return faces_detail
