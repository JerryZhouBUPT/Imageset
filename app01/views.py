import json
import pickle
import string
import random
import base64
import hashlib
from datetime import timedelta
import cv2
import numpy as np
from Crypto.PublicKey import RSA
from Crypto import Random
from Crypto.Cipher import PKCS1_v1_5
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.utils import timezone
from app01.models import Image_Users_Info, Image_Register_Users_Info, History_Details_Info, Images_To_Faces_Info
from app01.detectedFaces import detectedFaces


# Create your views here.
def generate_random_string(length=64):
    # 定义字符集，包括大小写字母和数字
    characters = string.ascii_letters + string.digits
    # 随机选择字符集中的字符，组成指定长度的字符串
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


def SHA256_Encrypt(plaintext: str) -> str:
    return hashlib.sha256(plaintext.encode('utf-8')).hexdigest()


def Parsing_Token(token: str) -> bool:
    return True


def checkToken(token: str, imagesetID: str) -> bool:
    detail = Image_Users_Info.objects.filter(pub_key__contains=imagesetID).first()
    if detail is not None:
        private_key = detail.pri_key
        decrypted_token = rsa_decryption(token, private_key)
        if decrypted_token is not None:
            decrypted_token = decrypted_token.split('@@')
            if (len(decrypted_token) == 3 and decrypted_token[0] == detail.account_sha256
                    and decrypted_token[1] == detail.password_sha256 and decrypted_token[2] == detail.email
                    and detail.sign_in_expire_time >= timezone.now()):
                return True
    return False


def home(request):
    token = request.COOKIES.get('token', None)
    imagesetID = request.COOKIES.get('imagesetID', None)
    sessionToken = request.session.get('token', None)
    if token is None or imagesetID is None:
        return render(request, 'home/home.html')
    else:
        if sessionToken == token or checkToken(token, imagesetID):
            request.session['token'] = token
            return render(request, 'main/main.html')
        response = render(request, 'home/home.html')
        expireTime = timezone.now() - timezone.timedelta(days=1)
        response.set_cookie('token', '', expires=expireTime)
        response.set_cookie('imagesetID', '', expires=expireTime)
        return response


def checkAccount(request):
    if request.method == 'POST':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        account = request.POST.get('account')
        if token is None and imagesetID is None and sessionToken is None and account is not None:
            result = {'result': True}
            if (len(Image_Users_Info.objects.filter(account_sha256=SHA256_Encrypt(account))) == 1 or
                    len(Image_Register_Users_Info.objects.filter(account=account)) == 1):
                result['result'] = False
            return HttpResponse(json.dumps(result))
    return redirect('/')


def getAccount(imagesetID):
    detail = Image_Users_Info.objects.filter(pub_key__contains=imagesetID).first()
    return detail.account_sha256 if detail else None


# noinspection PyBroadException
def rsa_decryption(encrypted_string: str, private_key: str):
    encrypted_string = base64.b64decode(encrypted_string.encode('utf-8'))
    cipher = PKCS1_v1_5.new(RSA.importKey(private_key))
    try:
        decrypted_string = cipher.decrypt(encrypted_string, Random.new().read).decode()
        return decrypted_string
    except:
        return None


def changePersonalInfo(request):
    if request.method == 'POST':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        encrypted_account = request.POST.get('encrypted_account')
        public_key = request.POST.get('public_key')
        if (token is None and imagesetID is None and sessionToken is None and encrypted_account is not None
                and public_key is not None):
            detail = Image_Register_Users_Info.objects.filter(pub_key=public_key)
            if len(detail) > 0 and detail[0].account == rsa_decryption(encrypted_account, detail[0].pri_key):
                detail.delete()
                return HttpResponse(json.dumps({'result': True}))
            else:
                return HttpResponse(json.dumps({'result': False}))
    return redirect('/')


def verifyEmail(request):
    if request.method == 'POST':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        encrypted_code = request.POST.get('encrypted_code')
        encrypted_password = request.POST.get('encrypted_password')
        public_key = request.POST.get('public_key')
        if (token is None and imagesetID is None and sessionToken is None and encrypted_code is not None
                and public_key is not None):
            detail = Image_Register_Users_Info.objects.filter(pub_key=public_key)
            if len(detail) > 0 and detail[0].verify_number == int(rsa_decryption(encrypted_code, detail[0].pri_key)):
                Image_Users_Info.objects.create(account_sha256=SHA256_Encrypt(detail[0].account),
                                                password_sha256=SHA256_Encrypt(rsa_decryption(encrypted_password,
                                                                                              detail[0].pri_key)),
                                                email=detail[0].email)
                detail.delete()
                return HttpResponse(json.dumps({'result': True}))
            else:
                return HttpResponse(json.dumps({'result': False}))
    return redirect('/')


def getDetectedFaces(request):
    if request.method == 'GET':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        if sessionToken == token or checkToken(token, imagesetID):
            return HttpResponse(json.dumps({'All_Faces': detectedFaces(getAccount(imagesetID))}))
    response = render(request, 'home/home.html')
    expireTime = timezone.now() - timezone.timedelta(days=1)
    response.set_cookie('token', '', expires=expireTime)
    response.set_cookie('imagesetID', '', expires=expireTime)
    return response


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


def getHistoryFromSQL(account_sha256):
    all_history = History_Details_Info.objects.filter(account_sha256=account_sha256,
                                                      submit_time__lte=timezone.now()).order_by('-submit_time')
    history_list = []
    for history in all_history:
        target_history = Images_To_Faces_Info.objects.get(id=history.target_image_id)
        face_bboxes = pickle.loads(target_history.face_bboxes)
        history_list.append([target_history.image,
                             Get_Target_Faces_According_To_BBOXS([face_bboxes[int(index)] for index in
                                                                  pickle.loads(history.selected_faces_index_list)],
                                                                 target_history.image),
                             pickle.loads(history.pre_recognition_over_threshold),
                             pickle.loads(history.pre_recognition_under_threshold),
                             (history.submit_time + timedelta(hours=8)).strftime('%Y.%m.%d %H:%M:%S')])
    return history_list


def getHistory(request):
    if request.method == 'GET':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        if sessionToken == token or checkToken(token, imagesetID):
            return HttpResponse(json.dumps({'All_History': getHistoryFromSQL(getAccount(imagesetID))}))
    response = render(request, 'home/home.html')
    expireTime = timezone.now() - timezone.timedelta(days=1)
    response.set_cookie('token', '', expires=expireTime)
    response.set_cookie('imagesetID', '', expires=expireTime)
    return response


def changeThreshold(request):
    if request.method == 'POST':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        if sessionToken == token or checkToken(token, imagesetID):
            # noinspection PyBroadException
            try:
                Image_Users_Info.objects.filter(account_sha256=getAccount(imagesetID)).update(
                    threshold=float(request.POST['threshold']))
                return HttpResponse(json.dumps({'result': True}))
            except:
                return HttpResponse(json.dumps({'result': False}))
    elif request.method == 'GET':
        token = request.COOKIES.get('token', None)
        imagesetID = request.COOKIES.get('imagesetID', None)
        sessionToken = request.session.get('token', None)
        if sessionToken == token or checkToken(token, imagesetID):
            # noinspection PyBroadException
            try:
                return HttpResponse(json.dumps({'threshold': Image_Users_Info.objects.filter(
                    account_sha256=getAccount(imagesetID)).first().threshold}))
            except:
                return HttpResponse(json.dumps({'threshold': None}))
    response = render(request, 'home/home.html')
    expireTime = timezone.now() - timezone.timedelta(days=1)
    response.set_cookie('token', '', expires=expireTime)
    response.set_cookie('imagesetID', '', expires=expireTime)
    return response
