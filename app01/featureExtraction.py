import base64
import numpy as np
import cv2
from app01.faceAlignment import align_face
from app01.faceReconstruct import faceReconstruction
from app01.generateImages import generateImage
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# STEP 2: Create an FaceLandmarker object.
base_options = python.BaseOptions(model_asset_path='face_landmarker.task')
options = vision.FaceLandmarkerOptions(base_options=base_options,
                                       output_face_blendshapes=True,
                                       output_facial_transformation_matrixes=True,
                                       num_faces=1)
detector = vision.FaceLandmarker.create_from_options(options)

# 定义眉毛关键点编号
EYEBROW_LANDMARKS = [70, 63, 105, 66, 107]

# 定义眉毛画图关键点编号
EYEBROW_LANDMARKS_FOR_DRAW = [70, 63, 105, 66, 107, 336, 296, 334, 293, 300]

# 定义鼻子关键点编号
NOSE_LANDMARKS = [6, 196, 174, 217, 209, 49, 48, 115, 220, 44, 1, 274, 440, 344, 278, 279, 429, 437, 399, 419]

# 定义鼻子画图关键点编号
NOSE_LANDMARKS_FOR_DRAW = [6, 217, 209, 49, 48, 115, 220, 44, 1, 274, 440, 344, 278, 279, 429, 437, 197, 195, 5, 4]

# 特定的眼睛关键点编号列表
EYE_LANDMARKS = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]

# 特定的眼睛画图关键点编号列表
EYE_LANDMARKS_FOR_DRAW = [33, 160, 159, 158, 157, 133, 154, 153, 145, 144, 163, 362, 384, 385, 386, 387,
                          388, 263, 390, 373, 374, 380, 381]

# 特定的嘴唇关键点序号列表
LIP_LANDMARKS = [0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 281, 409, 270, 269, 267]

# 特定的嘴唇画图关键点序号列表
LIP_LANDMARKS_FOR_DRAW = [0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 409, 270, 269, 267, 81,
                          13, 311, 178, 14, 402]


def extract_features(base64_str: str):
    """
    从图片中提取眉毛、眼睛、鼻子关键点坐标。

    参数:
    image_path (str): 图片文件路径。

    返回:
    list of tuples: 眉毛特征关键点坐标列表。
    """
    # 去掉数据 URI Scheme 的前缀
    parts = base64_str.split(';')[0]
    # 分割字符串以获取媒体类型
    media_type = ''
    if len(parts) > 0 and parts.startswith('data:image/'):
        media_type += parts.replace('data:image/', '.')
        if media_type == '':
            return None
    base64_str = base64_str.split(',', 1)[1]
    # 对base64编码进行解码，得到二进制数据
    img_data = base64.b64decode(base64_str)
    # 将二进制数据转换为NumPy数组
    np_data = np.frombuffer(img_data, dtype=np.uint8)
    # 从NumPy数组中解码图像
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    shape = img.shape
    image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img)
    # noinspection PyBroadException
    try:
        detection = detector.detect(image).face_landmarks[0]
        left_eye_center, right_eye_center = ([detection[468].x * shape[1], detection[468].y * shape[0]],
                                             [detection[473].x * shape[1], detection[473].y * shape[0]])
        # 人脸对齐
        rotated_img = align_face(img, left_eye_center, right_eye_center)
        # 人脸三维侧脸转正
        rotated_img = cv2.resize(rotated_img, (640, 640))
        rotated_imgObject = mp.Image(image_format=mp.ImageFormat.SRGB, data=rotated_img)
        # noinspection PyBroadException
        try:
            detection = detector.detect(rotated_imgObject).face_landmarks[0]
            rotated_pointers = faceReconstruction(detection)
            # 对rotated_img进行base64编码
            rotated_img_base64 = cv2.imencode(media_type, rotated_img)[1]
            rotated_img_base64 = str(base64.b64encode(rotated_img_base64))[2:-1]

            # 提取眉毛
            eyebrow_landmark_coords = []
            for landmark_id in EYEBROW_LANDMARKS:
                landmark = rotated_pointers[landmark_id]
                x, y = int(landmark[0]), int(landmark[1])
                eyebrow_landmark_coords.append((x, y))
            # 打点图片生成
            img_eyebrow_base64 = generateImage(EYEBROW_LANDMARKS_FOR_DRAW, detection, rotated_img_base64, media_type)

            # 提取鼻子
            nose_landmark_coords = []
            for landmark_id in NOSE_LANDMARKS:
                landmark = rotated_pointers[landmark_id]
                x, y = int(landmark[0]), int(landmark[1])
                nose_landmark_coords.append((x, y))
            # 打点图片生成
            img_nose_base64 = generateImage(NOSE_LANDMARKS_FOR_DRAW, detection, rotated_img_base64, media_type)

            # 提取眼睛
            eye_landmark_coords = []
            for landmark_id in EYE_LANDMARKS:
                landmark = rotated_pointers[landmark_id]
                x, y = int(landmark[0]), int(landmark[1])
                eye_landmark_coords.append((x, y))
            # 打点图片生成
            img_eye_base64 = generateImage(EYE_LANDMARKS_FOR_DRAW, detection, rotated_img_base64, media_type)

            # 提取嘴唇
            lip_landmark_coords = []
            for landmark_id in LIP_LANDMARKS:
                landmark = rotated_pointers[landmark_id]
                x, y = int(landmark[0]), int(landmark[1])
                lip_landmark_coords.append((x, y))
            # 打点图片生成
            img_lip_base64 = generateImage(LIP_LANDMARKS_FOR_DRAW, detection, rotated_img_base64, media_type)
            return (eyebrow_landmark_coords, nose_landmark_coords, eye_landmark_coords, lip_landmark_coords,
                    img_eyebrow_base64, img_nose_base64, img_eye_base64, img_lip_base64)
        except:
            return None
    except:
        return None
