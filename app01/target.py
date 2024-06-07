from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
from Crypto import Random
from Crypto.Cipher import PKCS1_v1_5, AES
from app01.models import Image_Users_Info
from app01.views import checkToken
from app01.TargetImageAnalysis import imageAnalysis
from app01.ImageSave import Images_To_Faces_Save, Faces_To_Images_Save
import base64
import json
import hashlib


def SHA256_Encrypt(plaintext: str) -> str:
    return hashlib.sha256(plaintext.encode('utf-8')).hexdigest()


def RSA_Encrypt(plaintext: str, public_key: str) -> str:
    cipher = PKCS1_v1_5.new(RSA.importKey(public_key))
    return base64.b64encode(cipher.encrypt(plaintext.encode())).decode()


def CreateToken(encrypted_username: str, encrypted_password: str, detail) -> list:
    rsa_key = RSA.generate(2048, randfunc=get_random_bytes)
    pub_key = rsa_key.publickey().export_key().decode()
    pri_key = rsa_key.export_key().decode()
    detail.pub_key = SHA256_Encrypt(pub_key[27:-25])
    detail.pri_key = pri_key
    detail.save()
    email = detail.email
    raw_token = encrypted_username + '@@' + encrypted_password + '@@' + email
    token = RSA_Encrypt(raw_token, pub_key)
    return [token, detail.pub_key]

def rsa_decryption(encrypted_string: str, private_key: str):
    encrypted_string = base64.b64decode(encrypted_string.encode('utf-8'))
    cipher = PKCS1_v1_5.new(RSA.importKey(private_key))
    # noinspection PyBroadException
    try:
        decrypted_string = cipher.decrypt(encrypted_string, Random.new().read).decode()
        return decrypted_string
    except:
        return None

def getAccount(imagesetID):
    detail = Image_Users_Info.objects.filter(pub_key__contains=imagesetID).first()
    return detail.account_sha256 if detail else None

class TargetConsumer(WebsocketConsumer):
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
            rsa_key = RSA.generate(2048)
            pub_key = rsa_key.publickey().export_key().decode()
            pri_key = rsa_key.export_key().decode()
            self.scope['session']['public_key'] = pub_key
            self.scope['session']['private_key'] = pri_key
            send_data = {'pub_key': pub_key}
            self.send(json.dumps(send_data))
        else:
            self.close()

    # noinspection PyBroadException
    def websocket_receive(self, message):
        private_key = self.scope['session'].get('private_key', None)
        imagesetID = self.scope['cookies'].get('imagesetID')
        if private_key is not None:
            message = message['text']
            try:
                data = json.loads(message)
                Encrypted_Target_Image = data.get("encrypted_image", None)
                Encrypted_AES_Key = data.get("encrypted_aesKey", None)
                if not Encrypted_Target_Image or not Encrypted_AES_Key:
                    self.close()
                    return
                AES_Key = self.rsa_decryption(Encrypted_AES_Key, private_key)
                if not Encrypted_AES_Key:
                    return
                Target_Image = self.aes_decryption(Encrypted_Target_Image, AES_Key)
                if not Target_Image:
                    return
                account_sha256 = getAccount(imagesetID) if getAccount(imagesetID) else None
                threshold = Image_Users_Info.objects.filter(account_sha256=account_sha256).first().threshold
                result, Face_Classification, faces_detail = imageAnalysis(Target_Image, threshold)
                self.send(json.dumps({'result': result, 'Face_Classification': Face_Classification}))
                # 后台数据构建
                if account_sha256:
                    image_id = Images_To_Faces_Save(account_sha256, Target_Image, faces_detail)
                    Faces_To_Images_Save(account_sha256, result, Face_Classification, faces_detail, image_id.get('id'),
                                         threshold)
            except json.decoder.JSONDecodeError:
                pass
        self.close()

    def websocket_disconnect(self, close_code):
        raise StopConsumer()
