import hashlib
import string
import random
import smtplib
# 负责构造文本
from email.mime.text import MIMEText
# 负责将多个对象集合起来
from email.mime.multipart import MIMEMultipart
from channels.generic.websocket import WebsocketConsumer
from channels.exceptions import StopConsumer
from Crypto.PublicKey import RSA
from Crypto import Random
from Crypto.Cipher import PKCS1_v1_5, AES
from django.db import connection
from app01.models import Image_Users_Info, Image_Register_Users_Info
import base64
import json


def SHA256_Encrypt(plaintext: str) -> str:
    return hashlib.sha256(plaintext.encode('utf-8')).hexdigest()


def generate_verification_code(length=6):
    # 定义只包含数字的字符集
    characters = string.digits
    # 使用random.choices()方法从字符集中随机选择指定长度的字符，并将其连接成一个字符串作为验证码
    code = ''.join(random.choices(characters, k=length))
    return code


def Check_Account_Exists(account: str) -> bool:
    if (len(Image_Users_Info.objects.filter(account_sha256=SHA256_Encrypt(account))) == 1 or
            len(Image_Register_Users_Info.objects.filter(account=account)) == 1):
        return False
    return True


def Send_Email_Verify_Number(account: str, target_email: str, verification_code: str) -> bool:
    # 邮件配置
    mail_host = "smtp.163.com"  # 请替换为您的SMTP服务器地址
    mail_sender = "jerrychatbot2024@163.com"  # 请替换为您的发件人邮箱
    mail_license = "WKKRLFBKLILOSZAN"  # 请替换为您的邮箱授权码
    # 构建邮件内容
    mail = MIMEMultipart()
    mail["From"] = "JerryChat Team<jerrychatbot2024@163.com>"
    mail["To"] = target_email
    mail["Subject"] = "[JerryChat] Notice For Your Email Verification"
    body = f'''
        <html>
        <body>
        <h1 style="font-size: 1.5em; text-indent: 3rem">JerryChat Account</h1>
        <div style="font-family: 'Comic Sans MS', serif; font-size: 1em">
            <h3 style="margin: 0;text-indent: 2.5em;font-weight: normal">Dear our valued user: {account}!</h3><br>
            <p style="margin: 0;text-indent: 3em;">You are submitting a registration for
                <a style="text-decoration: underline; color: #2672ec">{target_email}</a>,
                please enter the code below to complete the email verification.</p>
            <p style="color: #2672ec;text-indent: 3em;"> (If you did not submit the application, please ignore it)</p>
            <h3 style="margin: 0; text-indent: 3rem">Verification Code:</h3>
            <h2 style="margin-top: .8rem; text-indent: 3rem; color: #2672ec">{verification_code}</h2>
            <p style="text-indent: 3rem;"><a style="color: red; font-weight: bold">Important Notice: </a>This email verification code is valid for
            registration within 5 minutes. Do not leak!</p>
            <p style="text-indent: 3rem;">Thanks!</p>
            <p style="text-indent: 3rem;">JerryChat Team</p>
            <p style="text-indent: 3rem; font-weight: bold">IgniteLab Company, Building 12, No.888 Tianlin Road, Minhang District, Shanghai,
                China</p>
        </div>
        </body>
        </html>
    '''
    message_text = MIMEText(body, "html", "utf-8")
    mail.attach(message_text)
    try:
        # 发送邮件
        with smtplib.SMTP() as stp:
            stp.connect(mail_host, 25)
            stp.login(mail_sender, mail_license)
            stp.sendmail(mail_sender, target_email, mail.as_string())
        return True
    except smtplib.SMTPException as e:
        # 发送失败，返回一个错误信息
        return False


class RegisterConsumer(WebsocketConsumer):
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
        # 允许创建连接
        if token is None or imagesetID is None:
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

    def websocket_receive(self, message):
        # 浏览器基于websocket向后端发送数据，自动触发接收消息
        token = self.scope['cookies'].get('token')
        imagesetID = self.scope['cookies'].get('imagesetID')
        private_key = self.scope['session'].get('private_key', None)
        if token is None and imagesetID is None and private_key is not None:
            message = message['text']
            try:
                data = json.loads(message)
                Encrypted_AES_Key = data.get("encrypted_aesKey")
                Encrypted_Account = data.get("encrypted_account")
                Encrypted_Password = data.get("encrypted_password")
                Encrypted_Email = data.get("encrypted_email")
                if not Encrypted_AES_Key or not Encrypted_Account or not Encrypted_Password or not Encrypted_Email:
                    self.close()
                    return
                AES_Key = self.rsa_decryption(Encrypted_AES_Key, private_key)
                if not Encrypted_AES_Key:
                    return
                Account = self.aes_decryption(Encrypted_Account, AES_Key)
                Password = self.aes_decryption(Encrypted_Password, AES_Key)
                Email = self.aes_decryption(Encrypted_Email, AES_Key)
                if not Account or not Password or not Email:
                    return
                if not Check_Account_Exists(Account):
                    self.send(json.dumps({'result': 'Already Registered'}))
                    self.close()
                    return
                verify_number = generate_verification_code()
                Send_Email_Status = Send_Email_Verify_Number(Account, Email, verify_number)
                if Send_Email_Status:
                    cursor = connection.cursor()
                    cursor.execute("SELECT REPLACE(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)), '.', '')")
                    expire_time = str(int(cursor.fetchall()[0][0]) + 300000)
                    Image_Register_Users_Info.objects.create(
                        account=Account, email=Email, verify_number=verify_number, expire_time=expire_time,
                        pub_key=self.scope['session']['public_key'], pri_key=self.scope['session']['private_key'])
                    self.send(json.dumps({'result': 'Waiting For Registration'}))
                else:
                    self.send(json.dumps({'result': 'Email Failure'}))
            except json.decoder.JSONDecodeError:
                pass
        self.close()

    def websocket_disconnect(self, message):
        # 客户端与服务器主动断开连接
        raise StopConsumer()
