import os
from PIL import Image

def process_frame(src_path, dest_path):
    # Ensure output directory exists
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)

    img = Image.open(src_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # item is (r, g, b, a)
        # Check if the pixel is close to white (near pure white background)
        if item[0] > 248 and item[1] > 248 and item[2] > 248:
            # Make transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(dest_path, "PNG")
    print(f"Successfully converted {os.path.basename(src_path)} to transparent {os.path.basename(dest_path)}!")

# Process Gold Frame
process_frame(
    "/Users/angelus/.gemini/antigravity/brain/b44319d5-81c1-4d69-b8cd-f20d4325d969/media__1779156257063.jpg",
    "/Users/angelus/Desktop/Trivial Crowl App/Trivial App/public/assets/store/frames/gold.png"
)

# Process Fire Frame
process_frame(
    "/Users/angelus/.gemini/antigravity/brain/b44319d5-81c1-4d69-b8cd-f20d4325d969/media__1779156559545.jpg",
    "/Users/angelus/Desktop/Trivial Crowl App/Trivial App/public/assets/store/frames/fire.png"
)

# Process Crown Frame
process_frame(
    "/Users/angelus/.gemini/antigravity/brain/b44319d5-81c1-4d69-b8cd-f20d4325d969/media__1779156595970.jpg",
    "/Users/angelus/Desktop/Trivial Crowl App/Trivial App/public/assets/store/frames/crown.png"
)
