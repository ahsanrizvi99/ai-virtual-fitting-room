import cv2
import numpy as np
import os
from sklearn.cluster import KMeans
from collections import Counter
import pandas as pd

# Expanded color list
def closest_color(rgb):
    colors = {
        "black": (0, 0, 0),
        "white": (255, 255, 255),
        "red": (255, 0, 0),
        "green": (0, 128, 0),
        "blue": (0, 0, 255),
        "yellow": (255, 255, 0),
        "cyan": (0, 255, 255),
        "magenta": (255, 0, 255),
        "gray": (128, 128, 128),
        "pink": (255, 192, 203),
        "purple": (128, 0, 128),
        "brown": (139, 69, 19),
        "orange": (255, 165, 0),
        "navy": (0, 0, 128),
        "beige": (245, 245, 220),
        "maroon": (128, 0, 0),
        "olive": (128, 128, 0),
        "teal": (0, 128, 128),
        "lime": (0, 255, 0),
        "indigo": (75, 0, 130),
        "gold": (255, 215, 0),
        "silver": (192, 192, 192),
        "coral": (255, 127, 80),
        "salmon": (250, 128, 114),
        "lavender": (230, 230, 250),
        "turquoise": (64, 224, 208),
        "peach": (255, 218, 185),
        "violet": (238, 130, 238),
        "chocolate": (210, 105, 30),
        "mint": (189, 252, 201),
    }
    min_distance = float('inf')
    closest = None
    for name, value in colors.items():
        distance = np.linalg.norm(np.array(rgb) - np.array(value))
        if distance < min_distance:
            min_distance = distance
            closest = name
    return closest

# Center crop + skip nearly-white pixels
def get_dominant_color_center_crop(image, k=3, crop_fraction=0.5, white_threshold=240):
    h, w, _ = image.shape
    ch, cw = int(h * crop_fraction), int(w * crop_fraction)
    start_y = (h - ch) // 2
    start_x = (w - cw) // 2
    cropped = image[start_y:start_y + ch, start_x:start_x + cw]
    
    cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
    cropped_rgb = cropped_rgb.reshape((-1, 3))

    # Filter out pixels that are too white (background)
    mask = np.all(cropped_rgb < white_threshold, axis=1)
    filtered_pixels = cropped_rgb[mask]

    # If all pixels are white, fallback
    if len(filtered_pixels) == 0:
        filtered_pixels = cropped_rgb

    kmeans = KMeans(n_clusters=min(k, len(filtered_pixels)), random_state=42)
    kmeans.fit(filtered_pixels)
    counts = Counter(kmeans.labels_)
    center_colors = kmeans.cluster_centers_
    dominant_color = center_colors[counts.most_common(1)[0][0]]
    return dominant_color

# === CONFIGURATION ===
image_dir = r'D:\VirtualFIT\web\frontend\public\clothes'
output_csv = r'D:\VirtualFIT\web\frontend\public\clothes\metadata.csv'

# === MAIN PROCESS ===
data = []

for filename in os.listdir(image_dir):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        filepath = os.path.join(image_dir, filename)
        img = cv2.imread(filepath)
        if img is None:
            print(f"Warning: Unable to read {filename}. Skipping.")
            continue
        dominant_rgb = get_dominant_color_center_crop(img, crop_fraction=0.5, white_threshold=240)
        color_name = closest_color(dominant_rgb)

        # Default type and style — you can adjust later
        clothing_type = 't-shirt'
        clothing_style = 'casual'

        data.append({
            "filename": filename,
            "color": color_name,
            "type": clothing_type,
            "style": clothing_style
        })

# Save all data into metadata.csv
df = pd.DataFrame(data)
df.to_csv(output_csv, index=False)

print(f"✅ Metadata saved successfully to: {output_csv}")
