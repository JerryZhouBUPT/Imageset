import numpy as np
import cv2
import math

def align_face(image_array, left_eye_center, right_eye_center):
    """ align faces according to eyes position
    :param right_eye_center:
    :param left_eye_center:
    :param image_array: numpy array of a single image
    :return:
    rotated_img:  numpy array of aligned image
    """
    # compute the angle between the eye centroids
    dy = right_eye_center[1] - left_eye_center[1]
    dx = right_eye_center[0] - left_eye_center[0]
    # compute angle between the line of 2 centeroids and the horizontal line
    angle = math.atan2(dy, dx) * 180. / math.pi
    # calculate the center of 2 eyes
    eye_center = (int((left_eye_center[0] + right_eye_center[0]) // 2),
                  int((left_eye_center[1] + right_eye_center[1]) // 2))
    # at the eye_center, rotate the image by the angle
    rotate_matrix = cv2.getRotationMatrix2D(eye_center, angle, scale=1)
    rotated_img = cv2.warpAffine(image_array, rotate_matrix, (image_array.shape[1], image_array.shape[0]))
    return rotated_img
