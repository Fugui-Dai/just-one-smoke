# scripts/generate_buddha_icon.py
import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_buddha_icon():
    os.makedirs('images/icons', exist_ok=True)
    out_path = 'images/icons/buddha.png'
    
    # 256x256 high-resolution canvas for super-sampling down to 128x128
    size = 256
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    cx, cy = size // 2, size // 2 + 12
    
    # 1. Multi-tier Radiant Buddha Aureole & Sunbeam Rays (五色万丈佛光与大日宝轮)
    glow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    # Outer Emei Summit Golden Halo
    glow_draw.ellipse([cx - 96, cy - 108, cx + 96, cy + 84], fill=(245, 158, 11, 140))
    glow_draw.ellipse([cx - 68, cy - 82, cx + 68, cy + 54], fill=(251, 191, 36, 180))
    glow_draw.ellipse([cx - 40, cy - 54, cx + 40, cy + 26], fill=(254, 240, 138, 220))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(16))
    
    # 2. Vector Artwork Layer
    art_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(art_layer)
    
    # 2.1 16 Radiant Golden Sun Rays behind Lotus (十六道万丈佛光)
    ray_r_in = 42
    ray_r_out = 92
    num_rays = 16
    for i in range(num_rays):
        angle = (i * 2 * math.pi) / num_rays - math.pi / 2
        is_major = (i % 2 == 0)
        r_out = ray_r_out if is_major else ray_r_out * 0.85
        w_half = 5.5 if is_major else 3.2
        
        # Ray triangle
        tip_x = cx + math.cos(angle) * r_out
        tip_y = (cy - 16) + math.sin(angle) * r_out
        
        perp_angle = angle + math.pi / 2
        base_x1 = cx + math.cos(angle) * ray_r_in + math.cos(perp_angle) * w_half
        base_y1 = (cy - 16) + math.sin(angle) * ray_r_in + math.sin(perp_angle) * w_half
        base_x2 = cx + math.cos(angle) * ray_r_in - math.cos(perp_angle) * w_half
        base_y2 = (cy - 16) + math.sin(angle) * ray_r_in - math.sin(perp_angle) * w_half
        
        col = (254, 240, 138, 220) if is_major else (251, 191, 36, 180)
        draw.polygon([(tip_x, tip_y), (base_x1, base_y1), (base_x2, base_y2)], fill=col)
        
    # 2.2 Golden Dharma Wheel Rings (大日金轮外环与二十四宝珠)
    wheel_center_y = cy - 16
    draw.ellipse([cx - 48, wheel_center_y - 48, cx + 48, wheel_center_y + 48], outline=(254, 240, 138, 230), width=3)
    draw.ellipse([cx - 42, wheel_center_y - 42, cx + 42, wheel_center_y + 42], outline=(251, 191, 36, 200), width=2)
    
    # 2.3 Eight-Spoke Wheel Spokes (八正道金刚法轮辐条)
    for s in range(8):
        sa = (s * math.pi) / 4
        sx1 = cx + math.cos(sa) * 14
        sy1 = wheel_center_y + math.sin(sa) * 14
        sx2 = cx + math.cos(sa) * 44
        sy2 = wheel_center_y + math.sin(sa) * 44
        draw.line([(sx1, sy1), (sx2, sy2)], fill=(254, 240, 138, 240), width=2)
        
    # 2.4 Three-Tier Blooming Sacred Golden Lotus (盛放三层千叶宝相金莲)
    # Layer A: Outer broad petals (Rose-gold & amber)
    def draw_petal(bx, by, length, width, angle, fill_col, rim_col):
        # Generate petal contour points
        rad = math.radians(angle)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)
        
        pts = [
            (0, 0),
            (-width * 0.85, -length * 0.35),
            (-width * 0.95, -length * 0.72),
            (0, -length),
            (width * 0.95, -length * 0.72),
            (width * 0.85, -length * 0.35),
        ]
        # Rotate and translate
        trans_pts = []
        for px, py in pts:
            rx = bx + px * cos_a - py * sin_a
            ry = by + px * sin_a + py * cos_a
            trans_pts.append((rx, ry))
        draw.polygon(trans_pts, fill=fill_col, outline=rim_col)
        
    lotus_root_y = cy + 18
    
    # Outer Tier: 7 broad fan petals
    angles_outer = [-65, -45, -25, 0, 25, 45, 65]
    for ang in angles_outer:
        is_center = (ang == 0)
        plen = 58 if is_center else 52 - abs(ang) * 0.15
        pw = 15 if is_center else 13
        draw_petal(cx, lotus_root_y, plen, pw, ang, (244, 63, 94, 240), (254, 240, 138, 255))
        
    # Middle Tier: 5 rich imperial gold petals
    angles_mid = [-40, -20, 0, 20, 40]
    for ang in angles_mid:
        is_center = (ang == 0)
        plen = 48 if is_center else 44 - abs(ang) * 0.15
        pw = 14 if is_center else 12
        draw_petal(cx, lotus_root_y - 2, plen, pw, ang, (245, 158, 11, 255), (255, 251, 235, 255))
        
    # Inner Tier: 3 upright sacred white-gold petals
    angles_in = [-20, 0, 20]
    for ang in angles_in:
        is_center = (ang == 0)
        plen = 38 if is_center else 34
        pw = 12 if is_center else 10
        draw_petal(cx, lotus_root_y - 4, plen, pw, ang, (254, 240, 138, 255), (255, 255, 255, 255))
        
    # Center Bodhi Pearl (金莲蓬与佛心舍利珠)
    draw.ellipse([cx - 9, lotus_root_y - 18, cx + 9, lotus_root_y], fill=(255, 255, 255, 255), outline=(251, 191, 36, 255), width=2)
    draw.ellipse([cx - 4, lotus_root_y - 13, cx + 4, lotus_root_y - 5], fill=(254, 240, 138, 255))
    
    # Lotus Base Leaves (碧玉金莲宝座底托)
    base_left = [(cx - 42, lotus_root_y + 12), (cx - 24, lotus_root_y + 4), (cx, lotus_root_y + 6), (cx - 18, lotus_root_y + 16)]
    base_right = [(cx + 42, lotus_root_y + 12), (cx + 24, lotus_root_y + 4), (cx, lotus_root_y + 6), (cx + 18, lotus_root_y + 16)]
    draw.polygon(base_left, fill=(16, 185, 129, 230), outline=(254, 240, 138, 250))
    draw.polygon(base_right, fill=(16, 185, 129, 230), outline=(254, 240, 138, 250))
    
    # 3. Composite layers
    final_img = Image.alpha_composite(glow_img, art_layer)
    
    # Super-sample down to 128x128 for crisp retina rendering
    final_img = final_img.resize((128, 128), Image.Resampling.LANCZOS)
    final_img.save(out_path, 'PNG')
    print(f"Successfully generated Buddha's Light icon at: {out_path}")

if __name__ == '__main__':
    create_buddha_icon()
