import pickle
from app01.models import Faces_To_Images_Info, Images_To_Faces_Info


def detectedFaces(account_sha256):
    all_faces = Faces_To_Images_Info.objects.filter(account_sha256=account_sha256)
    all_images = Images_To_Faces_Info.objects.filter(account_sha256=account_sha256)
    final_data = [[data.face_sample, [all_images.filter(id=index).first().image for index in
                                      pickle.loads(data.image_face_index)]] for data in all_faces]
    return final_data
