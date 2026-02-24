import sys
from PIL import Image

def remove_white_bg(input_path, output_path, threshold=240):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is white or close to white (R,G,B > threshold)
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                newData.append((255, 255, 255, 0)) # Make it transparent
            else:
                newData.append(item)

        img.putdata(newData)
        
        # Also crop to content if needed, but for now just transparent
        # Optional: crop the image to the non-transparent content (circle)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    remove_white_bg("logo.png", "logo.png")
