
from PIL import Image
from collections import Counter

def get_dominant_colors(image_path, num_colors=3):
    try:
        image = Image.open(image_path)
        image = image.convert('RGB')
        image = image.resize((150, 150))  # Resize for faster processing
        pixels = list(image.getdata())
        counts = Counter(pixels)
        dominant = counts.most_common(num_colors)
        return dominant
    except Exception as e:
        print(f"Error: {e}")
        return []

colors = get_dominant_colors('img/logo.jpg')
if colors:
    print("Dominant Colors:")
    for color, count in colors:
        print(f"RGB: {color}, Hex: #{color[0]:02x}{color[1]:02x}{color[2]:02x}")
else:
    print("Could not analyze colors.")
