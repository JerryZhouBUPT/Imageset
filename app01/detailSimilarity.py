from app01.detailCompute import process
from app01.featureExtraction import extract_features


def get_similarity(base64_img1, base64_img2):
    eyebrow1, nose1, eye1, lip1, img1_eyebrow_base64, img1_nose_base64, img1_eye_base64, img1_lip_base64 = (
        extract_features(base64_img1))
    eyebrow2, nose2, eye2, lip2, img2_eyebrow_base64, img2_nose_base64, img2_eye_base64, img2_lip_base64 = (
        extract_features(base64_img2))
    return [round(float(process(eyebrow1, eyebrow2)), 2), round(float(process(nose1, nose2)), 2),
            round(float(process(eye1, eye2)), 2), round(float(process(lip1, lip2)), 2),
            img1_eyebrow_base64, img1_nose_base64, img1_eye_base64, img1_lip_base64, img2_eyebrow_base64,
            img2_nose_base64, img2_eye_base64, img2_lip_base64]
    # return {'eyebrow_similarity': round(float(process(eyebrow1, eyebrow2)), 2),
    #         'nose_similarity': round(float(process(nose1, nose2)), 2),
    #         'eye_similarity': round(float(process(eye1, eye2)), 2),
    #         'lip_similarity': round(float(process(lip1, lip2)), 2),
    #         'img1_eyebrow_base64': img1_eyebrow_base64, 'img1_nose_base64': img1_nose_base64,
    #         'img1_eye_base64': img1_eye_base64, 'img1_lip_base64': img1_lip_base64,
    #         'img2_eyebrow_base64': img2_eyebrow_base64, 'img2_nose_base64': img2_nose_base64,
    #         'img2_eye_base64': img2_eye_base64, 'img2_lip_base64': img2_lip_base64}
