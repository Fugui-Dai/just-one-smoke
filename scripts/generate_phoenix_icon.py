# scripts/generate_phoenix_icon.py
import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_phoenix_icon():
    os.makedirs('images/icons', exist_ok=True)
    out_path = 'images/icons/phoenix.png'
    
    # 256x256 high-resolution canvas for super-sampling down to 128x128
    size = 256
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size // 2, size // 2 + 10
    
    # 1. Radiant Fire Glow Behind Phoenix
    glow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([cx - 85, cy - 95, cx + 85, cy + 75], fill=(234, 88, 12, 140))
    glow_draw.ellipse([cx - 55, cy - 70, cx + 55, cy + 50], fill=(245, 158, 11, 180))
    glow_draw.ellipse([cx - 30, cy - 45, cx + 30, cy + 30], fill=(254, 240, 138, 220))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(18))
    
    # 2. Main Phoenix Geometry (Wings, Head, Body, Tail Plumes)
    phoenix_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(phoenix_layer)
    
    # 2.1 Spread Wings (Primary Flight Feathers)
    # Left Wing (Fiery curved blades)
    left_wing = [
        (cx - 8, cy - 10),
        (cx - 35, cy - 40),
        (cx - 75, cy - 75),
        (cx - 105, cy - 65),
        (cx - 118, cy - 40),
        (cx - 108, cy - 10),
        (cx - 85, cy + 18),
        (cx - 60, cy + 32),
        (cx - 32, cy + 22),
        (cx - 8, cy + 12)
    ]
    pdraw.polygon(left_wing, fill=(234, 88, 12, 245))
    
    # Inner Left Wing (Gold)
    left_wing_inner = [
        (cx - 8, cy - 10),
        (cx - 30, cy - 35),
        (cx - 60, cy - 55),
        (cx - 85, cy - 45),
        (cx - 90, cy - 25),
        (cx - 70, cy + 5),
        (cx - 45, cy + 18),
        (cx - 8, cy + 10)
    ]
    pdraw.polygon(left_wing_inner, fill=(245, 158, 11, 255))
    
    # Highlight Left Wing (Bright gold/white)
    left_wing_core = [
        (cx - 8, cy - 8),
        (cx - 25, cy - 28),
        (cx - 48, cy - 38),
        (cx - 65, cy - 28),
        (cx - 45, cy - 2),
        (cx - 8, cy + 5)
    ]
    pdraw.polygon(left_wing_core, fill=(254, 240, 138, 255))
    
    # Symmetrical Right Wing
    def mirror_pts(pts):
        return [(cx + (cx - x), y) for x, y in pts]
        
    pdraw.polygon(mirror_pts(left_wing), fill=(234, 88, 12, 245))
    pdraw.polygon(mirror_pts(left_wing_inner), fill=(245, 158, 11, 255))
    pdraw.polygon(mirror_pts(left_wing_core), fill=(254, 240, 138, 255))
    
    # 2.2 Cascading Phoenix Tail Feathers
    # Center Tail
    center_tail = [
        (cx - 8, cy + 15),
        (cx - 12, cy + 45),
        (cx - 8, cy + 80),
        (cx, cy + 112),
        (cx + 8, cy + 80),
        (cx + 12, cy + 45),
        (cx + 8, cy + 15)
    ]
    pdraw.polygon(center_tail, fill=(245, 158, 11, 250))
    pdraw.ellipse([cx - 9, cy + 96, cx + 9, cy + 114], fill=(239, 68, 68, 255))
    pdraw.ellipse([cx - 4, cy + 101, cx + 4, cy + 109], fill=(254, 240, 138, 255))
    
    # Left Tail Plume
    left_tail = [
        (cx - 8, cy + 18),
        (cx - 24, cy + 48),
        (cx - 36, cy + 78),
        (cx - 32, cy + 102),
        (cx - 20, cy + 82),
        (cx - 12, cy + 52),
        (cx - 4, cy + 22)
    ]
    pdraw.polygon(left_tail, fill=(234, 88, 12, 240))
    pdraw.ellipse([cx - 38, cy + 90, cx - 22, cy + 106], fill=(245, 158, 11, 255))
    pdraw.ellipse([cx - 33, cy + 95, cx - 27, cy + 101], fill=(254, 240, 138, 255))
    
    # Right Tail Plume
    pdraw.polygon(mirror_pts(left_tail), fill=(234, 88, 12, 240))
    pdraw.ellipse([cx + 22, cy + 90, cx + 38, cy + 106], fill=(245, 158, 11, 255))
    pdraw.ellipse([cx + 27, cy + 95, cx + 33, cy + 101], fill=(254, 240, 138, 255))

    # 2.3 Body (Torso and Breast Feather)
    body = [
        (cx, cy - 28),
        (cx - 14, cy - 8),
        (cx - 12, cy + 20),
        (cx, cy + 34),
        (cx + 12, cy + 20),
        (cx + 14, cy - 8)
    ]
    pdraw.polygon(body, fill=(245, 158, 11, 255))
    # Heart crest
    pdraw.ellipse([cx - 7, cy - 10, cx + 7, cy + 14], fill=(254, 240, 138, 255))
    
    # 2.4 Head and Crest Plumes
    pdraw.ellipse([cx - 9, cy - 42, cx + 9, cy - 24], fill=(254, 240, 138, 255))
    # Golden Beak
    pdraw.polygon([(cx, cy - 46), (cx - 4, cy - 38), (cx + 4, cy - 38)], fill=(255, 255, 255, 255))
    
    # Phoenix Crest Crown (Three flame plumes)
    pdraw.polygon([(cx, cy - 42), (cx - 6, cy - 62), (cx - 12, cy - 74), (cx - 2, cy - 58), (cx, cy - 42)], fill=(239, 68, 68, 255))
    pdraw.polygon([(cx, cy - 42), (cx - 3, cy - 68), (cx, cy - 82), (cx + 3, cy - 68), (cx, cy - 42)], fill=(254, 240, 138, 255))
    pdraw.polygon([(cx, cy - 42), (cx + 6, cy - 62), (cx + 12, cy - 74), (cx + 2, cy - 58), (cx, cy - 42)], fill=(239, 68, 68, 255))
    
    # Eyes
    pdraw.ellipse([cx - 4, cy - 34, cx - 2, cy - 32], fill=(120, 53, 15, 255))
    pdraw.ellipse([cx + 2, cy - 34, cx + 4, cy - 32], fill=(120, 53, 15, 255))

    # Composite layers
    img = Image.alpha_composite(img, glow_img)
    img = Image.alpha_composite(img, phoenix_layer)
    
    # Downsample with Lanczos to 128x128 for razor-sharp anti-aliased look
    img_128 = img.resize((128, 128), Image.Resampling.LANCZOS)
    img_128.save(out_path, 'PNG', optimize=True)
    
    file_size = os.path.getsize(out_path)
    print(f"Generated {out_path} ({file_size} bytes, {img_128.size})")

if __name__ == '__main__':
    create_phoenix_icon()
