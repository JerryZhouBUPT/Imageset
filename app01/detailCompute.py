from scipy.spatial.distance import pdist, squareform
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def calculate_angle(v):
    # 计算点之间向量关于x轴正方形的角度 0~360°
    v_x = np.array([1, 0])
    dot_product = np.dot(v, v_x)

    # 传入向量的模长
    norm_v = np.linalg.norm(v)
    # 计算与 x 轴正方向向量的夹角的余弦值
    cos_angle = dot_product / (norm_v * 1)  # 1 是 x 轴正方向向量的模长

    # 计算角度，np.arccos 的结果是弧度，需要转换为度
    angle_rad = np.arccos(cos_angle)
    angle_deg = np.degrees(angle_rad)

    # 确保输出的角度是0~360°
    if v[1] < 0:
        angle_deg = 360 - angle_deg

    return angle_deg


# 对于传入的关键点列表构建角度以及距离矩阵
def angle_distance_matrix(v):
    feature_points = np.array(v)

    # 计算每两个点之间欧式距离
    dis_matrix = pdist(feature_points, metric='euclidean')
    # 转换成对距离的方形形式，方便索引
    dis_matrix = squareform(dis_matrix)
    # 计算所有距离的平均值
    avg_distance = np.mean(dis_matrix)
    # 归一化距离矩阵：将每个元素除以平均距离
    dis_matrix = dis_matrix / avg_distance

    angle_matrix = np.zeros_like(dis_matrix)
    # 计算每两个点之间角度 aij 代表point j在point i的多少角度的方向上(以x轴正方向为0°)
    for i in range(len(feature_points)):
        for j in range(i + 1, len(feature_points)):
            vector_ij = feature_points[j] - feature_points[i]
            angle_matrix[i, j] = calculate_angle(vector_ij)
            angle_matrix[j, i] = (180 + angle_matrix[i, j]) % 360  # 对称位置填充 规定了角度0~360° 对称位置是相差180度

    return angle_matrix, dis_matrix, avg_distance


# 根据距离、角度矩阵构建直方图
def histogram(angles, distances, x, y, radius, avg_distance):
    """
        为每个关键点根据点对间的距离和角度信息，构建各自的形状上下文直方图。

        参数:
        histograms_list:存放每一个关键点的直方图
        distances: 点对间的欧氏距离矩阵，形状为 (feature_points, feature_points)
        angles: 点对间的相对角度矩阵，形状为 (feature_points, feature_points)
        x: 直方图的距离维度
        y: 直方图的角度维度
        radius: 考虑点对的搜索半径
        radius/x: 每一个距离维度的距离值
        360/y: 每一个角度维度的角度值
        返回:
        一个列表，包含每个关键点对应的形状上下文直方图的一维扁平化表示
    """
    histograms_list = []

    for i in range(len(distances)):
        # 每一个点都要创建直方图
        histogram = np.zeros((x, y))
        for j in range(len(distances)):
            if distances[i, j] <= radius:
                # 距离、角度映射到直方图中
                bin_x = int(distances[i, j] // (radius / (avg_distance * x)))
                bin_y = int(angles[i, j] // (360 / y))

                # 更新直方图的对应bin计数
                histogram[bin_x, bin_y] += 1
        # 将当前关键点的直方图添加到列表中
        histograms_list.append(histogram.flatten())

    return histograms_list


def compute_similarity_between_histogram_lists(histograms_list1, histograms_list2):
    sim = 0.0
    for i in range(len(histograms_list1)):
        similarity = cosine_similarity([histograms_list1[i]], [histograms_list2[i]])
        sim += similarity

    return sim / len(histograms_list1)


def process(v1, v2):
    ang_martix_1, dis_martix_1, avg_distance_1 = angle_distance_matrix(v1)
    ang_martix_2, dis_martix_2, avg_distance_2 = angle_distance_matrix(v2)

    gram_1 = histogram(ang_martix_1, dis_martix_1, 10, 40, 300, avg_distance_1)
    gram_2 = histogram(ang_martix_2, dis_martix_2, 10, 40, 300, avg_distance_2)

    # 使用余弦相似度计算两直方图的相似度
    similarity = compute_similarity_between_histogram_lists(gram_1, gram_2)

    return similarity
