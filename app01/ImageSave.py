import math
import pickle
import numpy as np
from app01.models import Images_To_Faces_Info, Faces_To_Images_Info


def encode_details(faces_detail):
    face_bboxes = [face_detail.get('bbox') for face_detail in faces_detail]
    face_matrices = [face_detail.get('normed_embedding') for face_detail in faces_detail]
    return [face_bboxes, face_matrices]


def Images_To_Faces_Save(account_sha256, base64_image, faces_detail):
    # 解析faces_detail
    face_bboxes, face_matrices = encode_details(faces_detail)
    images_filter = Images_To_Faces_Info.objects.filter(account_sha256=account_sha256, image=base64_image)
    if not images_filter:
        Images_To_Faces_Info.objects.create(account_sha256=account_sha256, image=base64_image,
                                            face_bboxes=pickle.dumps(face_bboxes),
                                            face_matrices=pickle.dumps(face_matrices), landmarks=True)
    else:
        Images_To_Faces_Info.objects.filter(account_sha256=account_sha256).update(landmarks=False)
        images_filter.update(face_bboxes=pickle.dumps(face_bboxes), face_matrices=pickle.dumps(face_matrices),
                             landmarks=True)
    return Images_To_Faces_Info.objects.filter(account_sha256=account_sha256, image=base64_image).values('id').first()


def Classify_Faces_Based_On_Image(faces_detail, threshold):
    face_matrices = [face_detail.get('normed_embedding') for face_detail in faces_detail]
    Faces = []
    Similarities = []
    # 计算当前图片各个人脸相似度
    for index, face in enumerate(face_matrices):
        face_matrix = face_matrices[index + 1:]
        for index_, face_matrix in enumerate(face_matrix):
            Two_Faces_Similarities = np.dot(face, face_matrix)
            if Two_Faces_Similarities >= threshold:
                Similarities += [[[index, index_ + index + 1], Two_Faces_Similarities]]
    # 根据相似度分类
    for i in range(len(face_matrices)):
        Same_Face_Matrix_List = [Similarities[j] for j in range(len(Similarities)) if i in Similarities[j][0]]
        if Same_Face_Matrix_List:
            Same_Face_Index_List = [face[0][0] if face[0][1] == i else face[0][1] for face in Same_Face_Matrix_List]
            Current_Face_Index = [j for j in range(len(Faces)) if i in Faces[j]]
            if not Current_Face_Index:
                Faces.append([i])
                Current_Face_Index = [len(Faces) - 1]
            for same_face_index in Same_Face_Index_List:
                if same_face_index not in Faces[Current_Face_Index[0]]:
                    Faces[Current_Face_Index[0]].append(same_face_index)
        else:
            Faces.append([i])
    return Faces


def Faces_To_Images_Save(account_sha256, result, Face_Classification, faces_detail, image_id, threshold):
    account_filter = Faces_To_Images_Info.objects.filter(account_sha256=account_sha256).values_list('face_matrices',
                                                                                                    flat=True)
    id_account_filter = Faces_To_Images_Info.objects.filter(account_sha256=account_sha256).values_list('id', flat=True)
    image_index = Faces_To_Images_Info.objects.filter(account_sha256=account_sha256).values_list('image_face_index', flat=True)
    face_matrices_in_sql = [pickle.loads(matrix) for matrix in account_filter]
    image_index_in_sql = [pickle.loads(image_index) for image_index in image_index]
    for face_classification in Face_Classification:
        faces_normed_embedding = [faces_detail[face_classification[i]].get('normed_embedding')
                                  for i in range(len(face_classification))]
        for index, face_normed_embedding in enumerate(faces_normed_embedding):
            Max_Score = []
            for faces_matrices in face_matrices_in_sql:
                max_score = np.max([np.dot(faces_matrices[i], face_normed_embedding)
                                    for i in range(len(faces_matrices))])
                Max_Score.append(max_score)
            Epoch_Max_Score = round(float(np.max(Max_Score)), 2) if Max_Score else -1
            Epoch_Max_Score_Index = int(np.argmax(Max_Score)) if Max_Score else None
            if Epoch_Max_Score >= threshold:
                image_index_in_sql[Epoch_Max_Score_Index].add(image_id)
                Faces_To_Images_Info.objects.filter(id=id_account_filter[Epoch_Max_Score_Index]).update(
                    face_matrices=pickle.dumps(face_matrices_in_sql[Epoch_Max_Score_Index] + faces_normed_embedding),
                    image_face_index=pickle.dumps(image_index_in_sql[Epoch_Max_Score_Index]))
                break
            else:
                if index == len(faces_normed_embedding) - 1:
                    Faces_To_Images_Info.objects.create(account_sha256=account_sha256,
                                                        face_sample=result.get(str(face_classification[0] + 1)),
                                                        face_matrices=pickle.dumps(faces_normed_embedding),
                                                        image_face_index=pickle.dumps({image_id}))
    return
