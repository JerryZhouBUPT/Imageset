import base64
import cv2
import numpy as np


def generateImage(key_pointers_index, detection, base64_img, media_type):
    # 对base64编码进行解码，得到二进制数据
    img_data = base64.b64decode(base64_img)
    # 将二进制数据转换为NumPy数组
    np_data = np.frombuffer(img_data, dtype=np.uint8)
    # 从NumPy数组中解码图像
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    # 从detection中提取有效坐标
    effective_coordinate = [[detection[index].x * 640, detection[index].y * 640] for index in key_pointers_index]
    # 坐标打点
    for pointer in effective_coordinate:
        cv2.circle(img, (int(pointer[0]), int(pointer[1])), 5, (0, 233, 250), -1)
    # 对img重新进行base64编码
    img_base64 = cv2.imencode(media_type, img)[1]
    img_base64 = str(base64.b64encode(img_base64))[2:-1]
    # 构建数据URI
    base64_img_str = f"data:image/{media_type};base64,{img_base64}"
    return base64_img_str
