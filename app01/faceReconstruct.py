import math

def Reference_Line_XYZ_After_Rotate(reference_x, origin_y, reference_pointer, rotate_angle, width, height):
    for i in range(len(reference_pointer) - 1):
        if reference_pointer[i][1] <= origin_y <= reference_pointer[i + 1][1]:
            return [reference_x, origin_y * height, ((((reference_pointer[i + 1][2] - reference_pointer[i][2])
                                                       / math.sin(rotate_angle / 180 * math.pi)) /
                                                      (reference_pointer[i + 1][1] - reference_pointer[i][1])) *
                                                     (origin_y - reference_pointer[i][1]) + reference_pointer[i][2]) *
                    width]
    return [reference_x, origin_y * height, ((((reference_pointer[1][2] - reference_pointer[0][2]) /
                                               math.sin(rotate_angle / 180 * math.pi)) /
                                              (reference_pointer[1][1] - reference_pointer[0][1])) *
                                             (origin_y - reference_pointer[0][1]) + reference_pointer[0][2]) * width] \
        if origin_y < reference_pointer[0][1] else [reference_x, origin_y * height,
                                                    ((((reference_pointer[-2][2] - reference_pointer[-1][2]) /
                                                       math.sin(rotate_angle / 180 * math.pi)) /
                                                      (reference_pointer[-2][1] - reference_pointer[-1][1])) *
                                                     (origin_y - reference_pointer[-1][1]) + reference_pointer[-1][2])
                                                    * width]

def Reference_Line_XYZ_Before_Rotate(origin_y, reference_pointer, width, height):
    for i in range(len(reference_pointer) - 1):
        if reference_pointer[i][1] <= origin_y <= reference_pointer[i + 1][1]:
            return [(((reference_pointer[i + 1][0] - reference_pointer[i][0]) / (reference_pointer[i + 1][1] - reference_pointer[i][1])) * (origin_y - reference_pointer[i][1]) + reference_pointer[i][0]) * width, origin_y * height, (((reference_pointer[i + 1][2] - reference_pointer[i][2]) / (reference_pointer[i + 1][1] - reference_pointer[i][1])) * (origin_y - reference_pointer[i][1]) + reference_pointer[i][2]) * width]
    return [(((reference_pointer[1][0] - reference_pointer[0][0]) / (reference_pointer[1][1] - reference_pointer[0][1]))
             * (origin_y - reference_pointer[0][1]) + reference_pointer[0][0]) * width, origin_y * height,
            (((reference_pointer[1][2] - reference_pointer[0][2]) / (reference_pointer[1][1] - reference_pointer[0][1]))
             * (origin_y - reference_pointer[0][1]) + reference_pointer[0][2]) * width] \
        if origin_y < reference_pointer[0][1] else [(((reference_pointer[-2][0] - reference_pointer[-1][0]) /
                                                      (reference_pointer[-2][1] - reference_pointer[-1][1])) *
                                                     (origin_y - reference_pointer[-1][1]) + reference_pointer[-1][0]) *
                                                    width, origin_y * height,
                                                    (((reference_pointer[-2][2] - reference_pointer[-1][2]) /
                                                      (reference_pointer[-2][1] - reference_pointer[-1][1])) *
                                                     (origin_y - reference_pointer[-1][1]) + reference_pointer[-1][2])
                                                    * width]

def Calculate_Real_Length(w, pointer, reference_pointer):
    reference_x, reference_z = reference_pointer[0], reference_pointer[2]
    if pointer[0] * w == reference_x:
        return [0, 0]
    return [math.atan((pointer[2] * w - reference_z) / abs(pointer[0] * w - reference_x)) / math.pi * 180,
            math.sqrt((pointer[0] * w - reference_x) ** 2 + (pointer[2] * w - reference_z) ** 2)]

def Rotate_Pointer(rotate_angle, reference_pointers, all_pointers):
    reference_x = 320
    reference_h = 640
    rotated_pointers = []
    for pointer in all_pointers:
        reference_pointer_after_rotate = Reference_Line_XYZ_After_Rotate(reference_x, pointer[1], reference_pointers,
                                                                         abs(rotate_angle), reference_x * 2,
                                                                         reference_h)
        reference_pointer_before_rotate = Reference_Line_XYZ_Before_Rotate(pointer[1], reference_pointers,
                                                                           reference_x * 2, reference_h)
        real_angle, real_length = Calculate_Real_Length(640, pointer, reference_pointer_before_rotate)
        if pointer[0] * reference_x * 2 <= reference_pointer_before_rotate[0]:
            rotated_pointers.append([reference_x - real_length * math.cos((real_angle + rotate_angle) / 180 * math.pi),
                                     pointer[1] * reference_h, reference_pointer_after_rotate[2] +
                                     real_length * math.sin((real_angle + rotate_angle) / 180 * math.pi)])
        else:
            rotated_pointers.append([reference_x + real_length * math.cos((real_angle - rotate_angle) / 180 * math.pi),
                                     pointer[1] * reference_h, reference_pointer_after_rotate[2] +
                                     real_length * math.sin((real_angle - rotate_angle) / 180 * math.pi)])
    return rotated_pointers


def faceReconstruction(pointers):
    pointers = [[pointer.x, pointer.y, pointer.z] for pointer in pointers]
    w, h = 640, 640
    Reference_Pointers = [pointers[10], pointers[151], pointers[9], pointers[8], pointers[168], pointers[6],
                          pointers[197], pointers[195], pointers[5], pointers[4], pointers[1], pointers[2],
                          pointers[164], pointers[0], pointers[13], pointers[14], pointers[16], pointers[17],
                          pointers[18], pointers[200], pointers[199], pointers[175], pointers[152]]
    rotateAngle = math.atan((pointers[337][2] - pointers[108][2]) * w / math.sqrt(
        (abs(pointers[108][0] - pointers[337][0]) * w) ** 2 + (
                    abs(pointers[108][1] - pointers[337][1]) * h) ** 2)) / math.pi * 180
    Rotated_Pointers = Rotate_Pointer(rotateAngle, Reference_Pointers, pointers)
    return Rotated_Pointers
