import cv2
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer
from app01.views import checkToken
from app01.TargetImageAnalysis import imageAnalysis2
from app01.views import rsa_decryption
from app01.models import Image_Users_Info, Images_To_Faces_Info, History_Details_Info
from app01.detailSimilarity import get_similarity
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
from Crypto import Random
from Crypto.Cipher import PKCS1_v1_5, AES
import base64
import json
import pickle
import numpy as np


def Get_Target_Faces_From_SQL(token, imagesetID, target_faces_index_list):
    detail = Image_Users_Info.objects.filter(pub_key__contains=imagesetID).first()
    if detail is not None:
        private_key = detail.pri_key
        decrypted_token = rsa_decryption(token, private_key)
        if decrypted_token is not None:
            account_sha256 = decrypted_token.split('@@')[0]
            selectedItem = Images_To_Faces_Info.objects.filter(account_sha256=account_sha256, landmarks=True).first()
            if selectedItem is not None:
                face_bboxes = pickle.loads(selectedItem.face_bboxes)
                face_matrices = pickle.loads(selectedItem.face_matrices)
                face_image = selectedItem.image
                face_bboxes = [face_bboxes[int(i)] for i in target_faces_index_list]
                face_matrices = [face_matrices[int(i)] for i in target_faces_index_list]
                return [face_bboxes, face_matrices, face_image, account_sha256, selectedItem.id]
    else:
        return None


def Get_Target_Faces_According_To_BBOXS(Target_Faces_BBOXS: list, base64_str: str):
    # 去掉数据 URI Scheme 的前缀
    parts = base64_str.split(';')[0]
    base64_str = base64_str.split(',', 1)[1]
    # 对base64编码进行解码，得到二进制数据
    img_data = base64.b64decode(base64_str)
    # 将二进制数据转换为NumPy数组
    np_data = np.frombuffer(img_data, dtype=np.uint8)
    # 从NumPy数组中解码图像
    img = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    # 分割字符串以获取媒体类型
    media_type = ''
    ans = []
    if len(parts) > 0 and parts.startswith('data:image/'):
        media_type += parts.replace('data:image/', '.')
    for bbox in Target_Faces_BBOXS:
        img_cut = img[int(bbox[1]) - 15: int(bbox[3]) + 15, int(bbox[0]) - 15: int(bbox[2]) + 15]
        # noinspection PyBroadException
        try:
            img_cut_base64 = cv2.imencode(media_type, img_cut)[1]
        except:
            img_cut = img[int(bbox[1]): int(bbox[3]), int(bbox[0]): int(bbox[2])]
            img_cut_base64 = cv2.imencode(media_type, img_cut)[1]
        img_cut_base64 = str(base64.b64encode(img_cut_base64))[2:-1]
        # 构建数据URI
        base64_img_cut_str = f"data:image/{media_type};base64,{img_cut_base64}"
        ans.append(base64_img_cut_str)
    return ans


def getAccount(imagesetID):
    detail = Image_Users_Info.objects.filter(pub_key__contains=imagesetID).first()
    return detail.account_sha256 if detail else None

class RecognizeConsumer(WebsocketConsumer):
    # noinspection PyBroadException
    def rsa_decryption(self, encrypted_string: str, private_key: str):
        encrypted_string = base64.b64decode(encrypted_string.encode('utf-8'))
        cipher = PKCS1_v1_5.new(RSA.importKey(private_key))
        try:
            decrypted_string = cipher.decrypt(encrypted_string, Random.new().read).decode()
            return decrypted_string
        except:
            self.close()
        return None

    # noinspection PyBroadException
    def aes_decryption(self, encrypted_string: str, aes_key: str):
        encrypted_string = base64.b64decode(encrypted_string.encode('utf-8'))
        AES_Cipher = AES.new(aes_key.encode(), AES.MODE_ECB)
        try:
            decrypted_string = AES_Cipher.decrypt(encrypted_string).decode()
            decrypted_string = decrypted_string.strip()
            return ''.join(x for x in decrypted_string if x.isprintable())
        except:
            self.close()
        return None

    def websocket_connect(self, message):
        token = self.scope['cookies'].get('token')
        imagesetID = self.scope['cookies'].get('imagesetID')
        if token is not None and imagesetID is not None and checkToken(token, imagesetID):
            # 允许创建连接
            self.accept()
            rsa_key = RSA.generate(2048, randfunc=get_random_bytes)
            pub_key = rsa_key.publickey().export_key().decode()
            pri_key = rsa_key.export_key().decode()
            self.scope['session']['public_key'] = pub_key
            self.scope['session']['private_key'] = pri_key
            send_data = {'pub_key': pub_key}
            self.send(json.dumps(send_data))
        else:
            self.close()

    def websocket_receive(self, message):
        private_key = self.scope['session'].get('private_key', None)
        token = self.scope['cookies'].get('token')
        imagesetID = self.scope['cookies'].get('imagesetID')
        if private_key is not None:
            message = message['text']
            try:
                data = json.loads(message)
                Target_Faces_Index = data.get('FacesIndex', None)
                Encrypted_PreRecognition_Images = data.get('Pre-Recognition-Images', None)
                detail_comparison = data.get('detail_comparison', None)
                Encrypted_AES_Key = data.get("encrypted_aesKey", None)
                if not Target_Faces_Index or not Encrypted_PreRecognition_Images or not Encrypted_AES_Key:
                    self.close()
                    return
                AES_Key = self.rsa_decryption(Encrypted_AES_Key, private_key)
                if not Encrypted_AES_Key:
                    return
                Target_Faces_BBOXS, Target_Faces_Matrices, Target_Face_Base64, account_sha256, image_id = (
                    Get_Target_Faces_From_SQL(token, imagesetID, Target_Faces_Index))
                threshold = Image_Users_Info.objects.filter(account_sha256=account_sha256).first().threshold
                self.send(json.dumps({'Process': 'Started'}))
                PreRecognition_Over_Threshold_Images = []
                PreRecognition_Under_Threshold_Images = []
                Selected_Target_Faces = Get_Target_Faces_According_To_BBOXS(Target_Faces_BBOXS, Target_Face_Base64)
                for index, image in enumerate(Encrypted_PreRecognition_Images):
                    Decrypted_Image = self.aes_decryption(image, AES_Key)
                    faces_detail = imageAnalysis2(Decrypted_Image)
                    for face in faces_detail:
                        score = [round(float(np.dot(face.get('normed_embedding'), Target_Faces_Matrices[i])), 2)
                                 for i in range(len(Target_Faces_Matrices))]
                        max_score = max(score)
                        if detail_comparison:
                            PreRecognition_Over_Threshold_Images.append([Decrypted_Image, face.get('base64_img'),
                                                                         max_score,
                                [get_similarity(selected_face, face.get('base64_img')) for selected_face in
                                 Selected_Target_Faces]]) \
                                if max_score >= threshold else (
                                PreRecognition_Under_Threshold_Images.append([Decrypted_Image, face.get('base64_img'),
                                                                              max_score]))
                        else:
                            PreRecognition_Over_Threshold_Images.append([Decrypted_Image, face.get('base64_img'),
                                                                         max_score]) \
                                if max_score >= threshold else (
                                PreRecognition_Under_Threshold_Images.append([Decrypted_Image, face.get('base64_img'),
                                                                              max_score]))
                    self.send(json.dumps({'Already': index + 1}))
                PreRecognition_Over_Threshold_Images.sort(key=lambda x: x[2], reverse=True)
                self.send(json.dumps({'PreRecognition_Over_Threshold': PreRecognition_Over_Threshold_Images,
                                      'PreRecognition_Under_Threshold': PreRecognition_Under_Threshold_Images}))
                # 后端历史记录数据构建
                History_Details_Info.objects.create(account_sha256=account_sha256, target_image_id=image_id,
                                                    selected_faces_index_list=pickle.dumps(Target_Faces_Index),
                                                    pre_recognition_over_threshold=pickle.dumps(
                                                        PreRecognition_Over_Threshold_Images),
                                                    pre_recognition_under_threshold=pickle.dumps(
                                                        PreRecognition_Under_Threshold_Images))
            except json.decoder.JSONDecodeError:
                pass
        self.close()

    def websocket_disconnect(self, close_code):
        raise StopConsumer()
