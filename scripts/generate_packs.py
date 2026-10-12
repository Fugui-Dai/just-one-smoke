# scripts/generate_packs.py
# -*- coding: utf-8 -*-
"""
腾讯设计级 80% 拟真原创透明底香烟立面原画生成器
尺寸：720 × 1160 px (RGBA 纯净透明底，出厂全新平整无皱痕，外沿 0 杂色)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 720, 1160
LID_Y = 336 # 对应 168rpx 翻盖分割线
OUTPUT_DIR = "E:/WeChatProjects/just-one-smoke/images/packs"

os.makedirs(OUTPUT_DIR, exist_ok=True)
BOX = (0, 0, W - 1, H - 1) # 100% 满幅 720x1160 盒体，严丝合缝对齐 360x580rpx 3D 容器

def save_pack(im, filename):
    out_path = os.path.join(OUTPUT_DIR, filename)
    # 采用 FASTOCTREE 256 色自适应调色板高品质量化，体积暴降 68%，彻底守住微信 2MB 代码包安全红线
    q = im.quantize(colors=256, method=Image.FASTOCTREE)
    q.save(out_path, optimize=True)

def get_font(size, bold=False):
    font_paths = [
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                pass
    return ImageFont.load_default()

f_large = get_font(60, True)
f_med = get_font(42, True)
f_eng = get_font(30, True)
f_small = get_font(24, False)
f_warn_hdr = get_font(28, True)
f_warn_main = get_font(50, True)
f_warn_sub = get_font(34, True)
f_warn_extra = get_font(22, False)

def create_base(top_color, bottom_color, radius=24):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x0, y0, x1, y1 = BOX
    h = y1 - y0 + 1
    
    mask = Image.new("L", (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(BOX, radius=radius, fill=255)
    
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(grad)
    for i in range(h):
        ratio = i / max(1, h - 1)
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * ratio)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * ratio)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * ratio)
        a = 255
        g_draw.line([(x0, y0 + i), (x1, y0 + i)], fill=(r, g, b, a))
        
    grad.putalpha(mask)
    im.paste(grad, (0, 0), grad)
    return im

def add_crease_and_seal(im, seal_color=(245, 158, 11, 230), seal_text="原厂封签"):
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    
    # 3D 翻盖刻痕 (Highlight & Shadow)
    draw.line([(x0 + 2, LID_Y), (x1 - 2, LID_Y)], fill=(10, 10, 15, 180), width=3)
    draw.line([(x0 + 2, LID_Y + 3), (x1 - 2, LID_Y + 3)], fill=(255, 255, 255, 100), width=2)
    
    # 金色防撕拉线 (Tear tape)
    tape_y = LID_Y - 48
    draw.line([(x0, tape_y), (x1, tape_y)], fill=(245, 190, 70, 180), width=4)
    draw.line([(x0, tape_y + 1), (x1, tape_y + 1)], fill=(255, 255, 255, 220), width=1)
    
    # 顶部封签
    seal_w, seal_h = 176, 44
    seal_x0 = (W - seal_w) // 2
    seal_box = (seal_x0, y0 + 14, seal_x0 + seal_w, y0 + 14 + seal_h)
    draw.rounded_rectangle(seal_box, radius=6, fill=seal_color, outline=(255, 255, 255, 180), width=1)
    draw.text((W // 2, y0 + 14 + seal_h // 2), seal_text, fill=(255, 255, 255, 240), font=f_small, anchor="mm")
    
    # 确保所有分色块烟盒统一保留圆角透明遮罩
    mask = Image.new("L", (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(BOX, radius=24, fill=255)
    im.putalpha(mask)
    draw = ImageDraw.Draw(im)

    # 外框高光描边
    draw.rounded_rectangle(BOX, radius=24, outline=(255, 255, 255, 55), width=2)

# 【视觉铁律】所有烟盒底部警示区严禁添加黑色/半透明背景色块，warn_bg 默认恒为 None，底色完全通透一体
def add_warning(
    im,
    warn_title="本公司提示",
    warn_main="吸烟有害健康",
    warn_sub="请勿在禁烟场所吸烟",
    warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
    divider_color=(245, 190, 70, 230),
    warn_bg=None,
    text_color_hdr=(254, 240, 138, 235),
    text_color_main=(255, 255, 255, 255),
    text_color_sub=(226, 232, 240, 240),
    text_color_extra=(148, 163, 184, 200)
):
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    
    warn_y = 776
    # 1. 3D 黄金分割双重警示区分割线 (Y=776 分割上部品牌艺术与下部 35% 国标警语区)
    draw.line([(x0 + 16, warn_y), (x1 - 16, warn_y)], fill=(15, 15, 20, 160), width=2)
    draw.line([(x0 + 16, warn_y + 2), (x1 - 16, warn_y + 2)], fill=divider_color, width=2)
    
    # 2. 底部 35% 国家标准面积警示区微光底板 (若 warn_bg 为 None 则彻底去除黑色背景块，底色完全通透一体)
    wb_box = (x0 + 16, warn_y + 10, x1 - 16, y1 - 20)
    if warn_bg:
        draw.rounded_rectangle(wb_box, radius=18, fill=warn_bg, outline=(255, 255, 255, 45), width=1)
    
    # 3. 四级阶梯标准权威排版 (80% 拟真中国及国际名烟质感)
    # 3.1 抬头 (本公司提示 / 恋爱专属提示)
    draw.text((W // 2, 832), warn_title, fill=text_color_hdr, font=f_warn_hdr, anchor="mm")
    # 3.2 核心灵魂大字：吸烟有害健康 / 一笑倾城百媚生 (50px 粗体，震撼视觉重心)
    draw.text((W // 2, 908), warn_main, fill=text_color_main, font=f_warn_main, anchor="mm")
    # 3.3 行为倡导：请勿在禁烟场所吸烟 / 少抽香烟多宠她
    draw.text((W // 2, 982), warn_sub, fill=text_color_sub, font=f_warn_sub, anchor="mm")
    # 3.4 法规细则：劝阻青少年吸烟 / 戒烟热线
    draw.text((W // 2, 1056), warn_extra, fill=text_color_extra, font=f_warn_extra, anchor="mm")

def draw_badge_frame(draw, center_y, width, height, fill_color, border_color):
    cx = W // 2
    box = (cx - width // 2, center_y - height // 2, cx + width // 2, center_y + height // 2)
    draw.rounded_rectangle(box, radius=16, fill=fill_color, outline=border_color, width=3)
    # 内圈金线
    inner = (box[0] + 6, box[1] + 6, box[2] - 6, box[3] - 6)
    draw.rounded_rectangle(inner, radius=12, outline=border_color, width=1)
    return box

# ==================== 腾讯设计级 矢量原创品牌图腾绘制函数 (告别 Emoji 符号) ====================

def draw_tiananmen_vector(draw, cx, cy, gold_color=(254, 240, 138, 255), red_color=(185, 28, 28, 240)):
    """绘制高精细度中国古典城楼/天安门城楼矢量图腾 (告别 🏛️ 简陋 emoji)"""
    # 1. 顶层重檐庑殿顶 (金色大飞檐)
    roof1 = [
        (cx, cy - 62),
        (cx - 58, cy - 38),
        (cx - 68, cy - 42),
        (cx - 52, cy - 30),
        (cx + 52, cy - 30),
        (cx + 68, cy - 42),
        (cx + 58, cy - 38)
    ]
    draw.polygon(roof1, fill=gold_color)
    
    # 2. 楼阁柱廊中间层 (朱红廊柱与金窗)
    draw.rectangle((cx - 44, cy - 30, cx + 44, cy - 14), fill=red_color, outline=gold_color, width=1)
    for col_x in range(cx - 36, cx + 40, 12):
        draw.line([(col_x, cy - 30), (col_x, cy - 14)], fill=gold_color, width=2)
        
    # 3. 下层大飞檐
    roof2 = [
        (cx - 72, cy - 14),
        (cx - 86, cy - 18),
        (cx - 64, cy - 4),
        (cx + 64, cy - 4),
        (cx + 86, cy - 18),
        (cx + 72, cy - 14)
    ]
    draw.polygon(roof2, fill=gold_color)
    
    # 4. 须弥座高大城台 (朱红底座)
    draw.rectangle((cx - 76, cy - 4, cx + 76, cy + 24), fill=red_color, outline=gold_color, width=2)
    draw.line([(cx - 76, cy + 4), (cx + 76, cy + 4)], fill=gold_color, width=1)
    
    # 5. 五座拱形城门洞
    arch_specs = [(-50, 8, 12), (-25, 10, 15), (0, 12, 18), (25, 10, 15), (50, 8, 12)]
    for ox, aw, ah in arch_specs:
        draw.rounded_rectangle((cx + ox - aw//2, cy + 24 - ah, cx + ox + aw//2, cy + 24), radius=aw//2, fill=gold_color)

def draw_furongwang_crown(draw, cx, cy, gold_color=(254, 240, 138, 255), ruby_color=(190, 18, 60, 240)):
    """绘制芙蓉王皇家 5 峰金王冠与皇室盾徽 (告别 👑 emoji)"""
    # 皇室宝蓝盾徽底板
    shield_pts = [
        (cx - 68, cy - 50),
        (cx + 68, cy - 50),
        (cx + 68, cy + 5),
        (cx, cy + 48),
        (cx - 68, cy + 5)
    ]
    draw.polygon(shield_pts, fill=(30, 58, 138, 240), outline=gold_color, width=2)
    inner_shield = [
        (cx - 56, cy - 42),
        (cx + 56, cy - 42),
        (cx + 56, cy + 2),
        (cx, cy + 38),
        (cx - 56, cy + 2)
    ]
    draw.polygon(inner_shield, fill=(23, 37, 84, 240), outline=gold_color, width=1)
    
    # 5 峰立式金王冠
    draw.rectangle((cx - 42, cy + 6, cx + 42, cy + 14), fill=gold_color)
    draw.line([(cx - 42, cy + 10), (cx + 42, cy + 10)], fill=ruby_color, width=2)
    
    crown_pts = [
        (cx - 42, cy + 6),
        (cx - 42, cy - 14),
        (cx - 24, cy - 2),
        (cx - 18, cy - 26),
        (cx - 6, cy + 1),
        (cx, cy - 34),
        (cx + 6, cy + 1),
        (cx + 18, cy - 26),
        (cx + 24, cy - 2),
        (cx + 42, cy - 14),
        (cx + 42, cy + 6)
    ]
    draw.polygon(crown_pts, fill=gold_color)
    for px, py in [(cx - 42, cy - 16), (cx - 18, cy - 28), (cx, cy - 36), (cx + 18, cy - 28), (cx + 42, cy - 16)]:
        draw.ellipse((px - 3, py - 3, px + 3, py + 3), fill=(255, 255, 255, 255))
    draw.ellipse((cx - 4, cy + 8, cx + 4, cy + 12), fill=ruby_color)

def draw_baisha_cranes_vector(draw, cx, cy, white_color=(255, 255, 255, 255), gold_color=(245, 158, 11, 240)):
    """绘制白沙经典双鹤翔天 (告别 🕊️🕊️ emoji)"""
    draw.ellipse((cx - 50, cy - 50, cx + 50, cy + 50), fill=(245, 158, 11, 45), outline=gold_color, width=2)
    draw.line([(cx - 70, cy), (cx + 70, cy)], fill=(245, 158, 11, 80), width=1)
    
    # 仙鹤 1 (向左上翱翔)
    c1_x, c1_y = cx - 18, cy - 10
    wing1 = [
        (c1_x - 38, c1_y - 28),
        (c1_x - 8, c1_y - 12),
        (c1_x + 12, c1_y - 24),
        (c1_x + 4, c1_y - 4),
        (c1_x + 22, c1_y + 16),
        (c1_x - 4, c1_y + 4),
        (c1_x - 18, c1_y - 2)
    ]
    draw.polygon(wing1, fill=white_color)
    draw.line([(c1_x - 8, c1_y - 12), (c1_x - 18, c1_y - 30)], fill=white_color, width=3)
    draw.ellipse((c1_x - 20, c1_y - 32, c1_x - 16, c1_y - 28), fill=(220, 38, 38, 255))
    
    # 仙鹤 2 (向右下伴飞)
    c2_x, c2_y = cx + 22, cy + 18
    wing2 = [
        (c2_x - 14, c2_y - 20),
        (c2_x + 6, c2_y - 8),
        (c2_x + 32, c2_y - 16),
        (c2_x + 14, c2_y + 4),
        (c2_x + 24, c2_y + 18),
        (c2_x, c2_y + 6)
    ]
    draw.polygon(wing2, fill=white_color)
    draw.line([(c2_x + 6, c2_y - 8), (c2_x + 16, c2_y - 22)], fill=white_color, width=3)
    draw.ellipse((c2_x + 15, c2_y - 24, c2_x + 19, c2_y - 20), fill=(220, 38, 38, 255))

def draw_marlboro_frost(draw, cx, cy):
    """绘制万宝路 ICE BLAST 冰晶山形与极寒 V 棱镜 (告别 ❄️ emoji)"""
    v_top = cy - 65
    v_pts = [
        (cx - 100, v_top),
        (cx, v_top + 46),
        (cx + 100, v_top),
        (cx + 100, v_top + 26),
        (cx, v_top + 72),
        (cx - 100, v_top + 26)
    ]
    draw.polygon(v_pts, fill=(34, 211, 238, 240), outline=(255, 255, 255, 220), width=1)
    
    draw.ellipse((cx - 24, cy + 18, cx + 24, cy + 66), fill=(14, 116, 144, 200), outline=(34, 211, 238, 255), width=2)
    ic_cx, ic_cy = cx, cy + 42
    for angle_deg in [0, 60, 120, 180, 240, 300]:
        rad = math.radians(angle_deg)
        x2 = ic_cx + 18 * math.cos(rad)
        y2 = ic_cy + 18 * math.sin(rad)
        draw.line([(ic_cx, ic_cy), (x2, y2)], fill=(255, 255, 255, 240), width=2)

def draw_crane_tower_pagoda(draw, cx, cy, gold_color=(254, 240, 138, 255)):
    """绘制黄鹤楼三重檐古楼阁矢量图腾 (告别 🏯 emoji)"""
    draw.ellipse((cx - 4, cy - 62, cx + 4, cy - 54), fill=gold_color)
    draw.line([(cx, cy - 54), (cx, cy - 44)], fill=gold_color, width=3)
    
    roof3 = [(cx, cy - 46), (cx - 36, cy - 32), (cx - 46, cy - 36), (cx - 28, cy - 24), (cx + 28, cy - 24), (cx + 46, cy - 36), (cx + 36, cy - 32)]
    draw.polygon(roof3, fill=gold_color)
    draw.rectangle((cx - 22, cy - 24, cx + 22, cy - 14), fill=(23, 37, 84, 220), outline=gold_color, width=1)
    
    roof2 = [(cx, cy - 18), (cx - 52, cy - 4), (cx - 64, cy - 8), (cx - 40, cy + 4), (cx + 40, cy + 4), (cx + 64, cy - 8), (cx + 52, cy - 4)]
    draw.polygon(roof2, fill=gold_color)
    draw.rectangle((cx - 34, cy + 4, cx + 34, cy + 18), fill=(23, 37, 84, 220), outline=gold_color, width=1)
    for col_x in [cx - 24, cx - 8, cx + 8, cx + 24]:
        draw.line([(col_x, cy + 4), (col_x, cy + 18)], fill=gold_color, width=2)
        
    roof1 = [(cx, cy + 12), (cx - 68, cy + 26), (cx - 82, cy + 22), (cx - 56, cy + 34), (cx + 56, cy + 34), (cx + 82, cy + 22), (cx + 68, cy + 26)]
    draw.polygon(roof1, fill=gold_color)
    draw.rectangle((cx - 54, cy + 34, cx + 54, cy + 46), fill=gold_color)

def draw_hehua_lotus_vector(draw, cx, cy):
    """绘制荷花·钻石经典荷花花瓣图腾 (告别 🪷 emoji)"""
    leaf = [
        (cx - 60, cy + 20),
        (cx - 30, cy + 32),
        (cx, cy + 30),
        (cx + 30, cy + 32),
        (cx + 60, cy + 20),
        (cx, cy + 18)
    ]
    draw.polygon(leaf, fill=(22, 101, 52, 240), outline=(34, 197, 94, 200), width=1)
    draw.polygon([(cx, cy + 16), (cx - 48, cy), (cx - 36, cy - 30), (cx - 16, cy - 10)], fill=(244, 114, 182, 220), outline=(225, 29, 72, 220), width=1)
    draw.polygon([(cx, cy + 16), (cx + 48, cy), (cx + 36, cy - 30), (cx + 16, cy - 10)], fill=(244, 114, 182, 220), outline=(225, 29, 72, 220), width=1)
    draw.polygon([(cx, cy + 18), (cx - 28, cy - 10), (cx - 18, cy - 42), (cx, cy - 20)], fill=(251, 113, 133, 240), outline=(225, 29, 72, 220), width=1)
    draw.polygon([(cx, cy + 18), (cx + 28, cy - 10), (cx + 18, cy - 42), (cx, cy - 20)], fill=(251, 113, 133, 240), outline=(225, 29, 72, 220), width=1)
    draw.polygon([(cx, cy + 20), (cx - 12, cy - 18), (cx, cy - 54), (cx + 12, cy - 18)], fill=(255, 228, 230, 255), outline=(225, 29, 72, 240), width=2)

def draw_kuanzhai_gate_vector(draw, cx, cy):
    """绘制宽窄·五粮浓香青瓦四合院门楼 (告别 🍶 emoji)"""
    roof = [
        (cx, cy - 54),
        (cx - 72, cy - 28),
        (cx - 84, cy - 34),
        (cx - 60, cy - 16),
        (cx + 60, cy - 16),
        (cx + 84, cy - 34),
        (cx + 72, cy - 28)
    ]
    draw.polygon(roof, fill=(51, 65, 85, 255), outline=(148, 163, 184, 240), width=2)
    for rx in range(cx - 48, cx + 50, 16):
        draw.line([(rx, cy - 24), (rx + (8 if rx > cx else -8), cy - 16)], fill=(100, 116, 139, 200), width=2)
    
    draw.rectangle((cx - 52, cy - 16, cx + 52, cy + 34), fill=(30, 41, 59, 240), outline=(245, 158, 11, 220), width=2)
    draw.line([(cx, cy - 16), (cx, cy + 34)], fill=(245, 158, 11, 200), width=2)
    draw.ellipse((cx - 28, cy - 2, cx - 12, cy + 14), outline=(254, 240, 138, 255), width=2)
    draw.ellipse((cx + 12, cy - 2, cx + 28, cy + 14), outline=(254, 240, 138, 255), width=2)

def draw_hetianxia_clouds_vector(draw, cx, cy, gold_color=(254, 240, 138, 255)):
    """绘制和天下极致和境祥云如意金纹 (告别 ☁️ 和 ☁️ emoji)"""
    draw.ellipse((cx - 36, cy - 36, cx + 36, cy + 36), fill=(107, 33, 168, 180), outline=gold_color, width=2)
    draw.text((cx, cy), "和", fill=gold_color, font=f_med, anchor="mm")
    draw.arc((cx - 88, cy - 24, cx - 36, cy + 24), start=60, end=300, fill=gold_color, width=3)
    draw.arc((cx - 110, cy - 8, cx - 70, cy + 26), start=120, end=340, fill=gold_color, width=2)
    draw.arc((cx + 36, cy - 24, cx + 88, cy + 24), start=-120, end=120, fill=gold_color, width=3)
    draw.arc((cx + 70, cy - 8, cx + 110, cy + 26), start=-160, end=60, fill=gold_color, width=2)

def draw_nanyang_shuangxi_vector(draw, cx, cy, gold_color=(254, 240, 138, 255)):
    """绘制南洋双喜传统金色八宝同心花结 (告别 🏵️ emoji)"""
    draw.ellipse((cx - 42, cy - 42, cx + 42, cy + 42), fill=(136, 19, 55, 200), outline=gold_color, width=2)
    draw.ellipse((cx - 32, cy - 32, cx + 32, cy + 32), outline=gold_color, width=1)
    for angle_deg in range(0, 360, 45):
        rad = math.radians(angle_deg)
        x1 = cx + 24 * math.cos(rad)
        y1 = cy + 24 * math.sin(rad)
        x2 = cx + 48 * math.cos(rad)
        y2 = cy + 48 * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=gold_color, width=2)

def draw_sobranie_eagle_vector(draw, cx, cy, gold_color=(254, 240, 138, 255)):
    """绘制寿百年·黑俄英伦双翼皇室雄鹰冠徽 (告别 🦅 emoji)"""
    draw.polygon([(cx - 14, cy - 42), (cx - 10, cy - 32), (cx, cy - 44), (cx + 10, cy - 32), (cx + 14, cy - 42), (cx + 10, cy - 28), (cx - 10, cy - 28)], fill=gold_color)
    left_wing = [
        (cx, cy - 20),
        (cx - 24, cy - 36),
        (cx - 56, cy - 32),
        (cx - 68, cy - 16),
        (cx - 50, cy - 4),
        (cx - 20, cy - 6),
        (cx, cy)
    ]
    right_wing = [
        (cx, cy - 20),
        (cx + 24, cy - 36),
        (cx + 56, cy - 32),
        (cx + 68, cy - 16),
        (cx + 50, cy - 4),
        (cx + 20, cy - 6),
        (cx, cy)
    ]
    draw.polygon(left_wing, fill=gold_color)
    draw.polygon(right_wing, fill=gold_color)
    draw.polygon([(cx - 14, cy - 12), (cx + 14, cy - 12), (cx + 14, cy + 12), (cx, cy + 24), (cx - 14, cy + 12)], fill=(185, 28, 28, 255), outline=gold_color, width=1)
    draw.line([(cx - 22, cy + 16), (cx - 36, cy + 24)], fill=gold_color, width=2)
    draw.line([(cx + 22, cy + 16), (cx + 36, cy + 24)], fill=gold_color, width=2)

def draw_nanjing_bixie_vector(draw, cx, cy, gold_color=(254, 240, 138, 255)):
    """绘制南京古都金陵天禄辟邪神兽图腾 (告别 🦁 emoji)"""
    draw.ellipse((cx - 52, cy - 52, cx + 52, cy + 52), fill=(112, 26, 40, 180), outline=gold_color, width=2)
    body_pts = [
        (cx - 28, cy + 18),
        (cx - 18, cy + 4),
        (cx - 26, cy - 14),
        (cx - 8, cy - 12),
        (cx + 4, cy - 26),
        (cx + 18, cy - 28),
        (cx + 26, cy - 18),
        (cx + 18, cy - 8),
        (cx + 24, cy + 18),
        (cx + 12, cy + 18),
        (cx + 8, cy + 6),
        (cx - 10, cy + 8),
        (cx - 16, cy + 18)
    ]
    draw.polygon(body_pts, fill=gold_color)
    draw.arc((cx - 40, cy - 10, cx - 18, cy + 20), start=90, end=270, fill=gold_color, width=3)

def draw_yuxi_ruby_vector(draw, cx, cy, gold_color=(254, 240, 138, 255), ruby_color=(190, 18, 60, 240)):
    """绘制玉溪经典红宝石八角菱形几何徽记 (告别 🏮 emoji)"""
    draw.polygon([(cx, cy - 52), (cx + 46, cy - 14), (cx, cy + 24), (cx - 46, cy - 14)], fill=ruby_color, outline=gold_color, width=2)
    draw.polygon([(cx, cy - 40), (cx + 34, cy - 14), (cx, cy + 14), (cx - 34, cy - 14)], fill=(225, 29, 72, 240), outline=(255, 255, 255, 220), width=1)
    draw.text((cx, cy - 14), "玉", fill=gold_color, font=f_small, anchor="mm")

# ==================== 29 款名烟原创绘制逻辑 ====================

def gen_pure_zen():
    im = create_base((2, 132, 199), (16, 185, 129))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (16, 185, 129, 230), "纯净氧舱")
    
    # 居中纯净几何光环
    cx, cy = W // 2, 600
    for r in [180, 150, 120]:
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(255, 255, 255, 70), width=2)
    
    draw.text((cx, cy - 40), "ZEN", fill=(255, 255, 255, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 35), "PURE OXYGEN", fill=(224, 242, 254, 230), font=f_eng, anchor="mm")
    draw.text((cx, cy + 85), "无 烟 之 境", fill=(255, 255, 255, 210), font=f_small, anchor="mm")
    
    add_warning(
        im,
        warn_title="健康生活提示",
        warn_main="告别焦油毒害",
        warn_sub="呼吸大自然纯净清氧",
        warn_extra="100% 纯氧无烟境界 · 拥抱健康肺功能",
        divider_color=(56, 189, 248, 230)
    )
    save_pack(im, "pure_zen.png")

def gen_baisha():
    im = create_base((255, 255, 255), (226, 232, 240))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (37, 99, 235, 230), "双鹤吉祥")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 380, 360, (255, 255, 255, 220), (37, 99, 235, 200))
    draw_baisha_cranes_vector(draw, cx, cy - 25)
    draw.text((cx, cy + 50), "白 沙", fill=(30, 58, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "BAISHA · 软白", fill=(37, 99, 235, 200), font=f_eng, anchor="mm")
    
    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
        divider_color=(37, 99, 235, 230)
    )
    save_pack(im, "baisha.png")

def gen_hongtashan():
    im = create_base((255, 253, 248), (245, 240, 230))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 230), "红塔经典")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 380, 380, (255, 255, 255, 240), (220, 38, 38, 200))
    # 红日与白塔
    draw.ellipse((cx - 80, cy - 90, cx + 80, cy + 70), fill=(220, 38, 38, 220))
    draw.polygon([(cx, cy - 80), (cx - 30, cy + 50), (cx + 30, cy + 50)], fill=(255, 255, 255, 240))
    draw.text((cx, cy + 95), "紅塔山", fill=(185, 28, 28, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 145), "HONGTASHAN · 1956", fill=(120, 113, 108, 220), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "hongtashan.png")

def gen_shuangxi():
    im = create_base((190, 18, 60), (159, 18, 57))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "百年双喜")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 390, (159, 18, 57, 180), (245, 158, 11, 220))
    draw.text((cx, cy - 20), "囍", fill=(254, 240, 138, 255), font=get_font(130, True), anchor="mm")
    draw.text((cx, cy + 95), "紅 雙 喜", fill=(255, 255, 255, 240), font=f_med, anchor="mm")
    draw.text((cx, cy + 145), "DOUBLE HAPPINESS", fill=(253, 224, 71, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "shuangxi.png")

def gen_zhongnanhai():
    im = create_base((255, 255, 255), (248, 250, 252))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (37, 99, 235, 230), "低焦特选")
    
    cx, cy = W // 2, 590
    # 极简红蓝双色速度条
    draw.rectangle((40, cy - 120, W - 40, cy - 110), fill=(220, 38, 38, 220))
    draw.rectangle((40, cy - 105, W - 40, cy - 97), fill=(37, 99, 235, 220))
    
    draw.text((cx, cy), "中 南 海", fill=(30, 41, 59, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 65), "ZHONGNANHAI", fill=(100, 116, 139, 220), font=f_eng, anchor="mm")
    
    # 8mg 胶囊标
    draw.rounded_rectangle((cx - 65, cy + 105, cx + 65, cy + 145), radius=20, fill=(37, 99, 235, 20), outline=(37, 99, 235, 180), width=2)
    draw.text((cx, cy + 125), "8 mg", fill=(37, 99, 235, 240), font=f_small, anchor="mm")
    
    add_warning(im)
    save_pack(im, "zhongnanhai.png")

def gen_hong_nanjing():
    im = create_base((136, 19, 55), (112, 26, 40))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "金陵名品")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 390, 380, (112, 26, 40, 180), (245, 158, 11, 220))
    draw_nanjing_bixie_vector(draw, cx, cy - 25)
    draw.text((cx, cy + 65), "南 京", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 125), "NANJING · 特醇", fill=(255, 255, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "hong_nanjing.png")

def gen_chaotianmen():
    im = create_base((217, 119, 6), (146, 64, 14))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "金樽名门")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 390, (146, 64, 14, 180), (254, 240, 138, 220))
    draw_tiananmen_vector(draw, cx, cy - 40)
    draw.text((cx, cy + 50), "朝 天 門", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "CHAOTIANMEN · 金樽", fill=(255, 255, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "chaotianmen.png")

def gen_liqun():
    im = create_base((185, 28, 28), (148, 163, 184)) # 红灰拼色
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    
    # 经典三段隔离线
    mid_y = LID_Y + 120
    draw.rectangle((x0, y0, x1, mid_y), fill=(185, 28, 28, 255))
    draw.line([(x0, mid_y), (x1, mid_y)], fill=(245, 158, 11, 255), width=6)
    draw.line([(x0, mid_y + 6), (x1, mid_y + 6)], fill=(255, 255, 255, 200), width=2)
    draw.rectangle((x0, mid_y + 8, x1, y1), fill=(226, 232, 240, 255))
    
    add_crease_and_seal(im, (245, 158, 11, 240), "浙江名品")
    
    cx = W // 2
    draw.text((cx, mid_y - 65), "利 群", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, mid_y + 70), "LIQUN", fill=(185, 28, 28, 240), font=f_large, anchor="mm")
    draw.text((cx, mid_y + 130), "ROSE & RED · 新版", fill=(100, 116, 139, 220), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "liqun.png")

def gen_xuanhemen():
    im = create_base((15, 118, 110), (12, 74, 110))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "南京龙纹")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 390, 400, (12, 74, 110, 180), (254, 240, 138, 220))
    # 爆珠微标与南京红印
    draw.ellipse((cx - 15, cy - 100, cx + 15, cy - 70), fill=(56, 189, 248, 240), outline=(255, 255, 255, 220), width=2)
    # 红方印
    draw.rectangle((cx - 36, cy - 50, cx + 36, cy + 22), fill=(185, 28, 28, 240), outline=(254, 240, 138, 200), width=1)
    draw.text((cx, cy - 14), "南京", fill=(255, 255, 255, 255), font=f_small, anchor="mm")
    
    draw.text((cx, cy + 70), "炫 赫 門", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 135), "NANJING · 细支", fill=(224, 242, 254, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "xuanhemen.png")

def gen_ruanlan():
    im = create_base((30, 58, 138), (23, 37, 84))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "千禧名楼")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 390, (23, 37, 84, 180), (245, 158, 11, 220))
    draw_crane_tower_pagoda(draw, cx, cy - 40)
    draw.text((cx, cy + 50), "黄 鹤 楼", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "HUANGHELOU · 软蓝", fill=(224, 231, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "ruanlan.png")

def gen_yuxi_soft():
    im = create_base((255, 241, 242), (255, 228, 230))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (225, 29, 72, 240), "贡品名品")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 380, 380, (255, 255, 255, 240), (225, 29, 72, 200))
    draw_yuxi_ruby_vector(draw, cx, cy - 35)
    draw.text((cx, cy + 50), "玉 溪", fill=(190, 18, 60, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "YUXI · 经典软包", fill=(159, 18, 57, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "yuxi_soft.png")

def gen_guiyan():
    im = create_base((9, 9, 11), (24, 24, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "陈皮爆珠")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 390, 400, (24, 24, 27, 180), (245, 158, 11, 200))
    # 陈皮橙光爆珠
    draw.ellipse((cx - 25, cy - 100, cx + 25, cy - 50), fill=(245, 158, 11, 240), outline=(254, 240, 138, 255), width=3)
    draw.arc((cx - 70, cy - 130, cx + 70, cy - 20), start=30, end=150, fill=(245, 158, 11, 160), width=2)
    
    draw.text((cx, cy + 40), "貴 煙", fill=(255, 255, 255, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 105), "跨 越 · 陈皮爆珠", fill=(245, 158, 11, 230), font=f_med, anchor="mm")
    draw.text((cx, cy + 155), "GUIYAN · KUAYUE", fill=(161, 161, 170, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "guiyan.png")

def gen_furongwang():
    im = create_base((217, 119, 6), (180, 83, 9))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (30, 58, 138, 240), "硬黄名品")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 390, (30, 58, 138, 180), (254, 240, 138, 240))
    draw_furongwang_crown(draw, cx, cy - 40)
    draw.text((cx, cy + 50), "芙 蓉 王", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "FURONGWANG · 硬黄", fill=(255, 255, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "furongwang.png")

def gen_furongwang_slender():
    im = create_base((254, 240, 138), (202, 138, 4))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (30, 58, 138, 240), "细支硬壳")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 380, 400, (30, 58, 138, 180), (254, 240, 138, 240))
    draw_furongwang_crown(draw, cx, cy - 40)
    draw.text((cx, cy + 50), "芙 蓉 王", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "FURONGWANG · 细支", fill=(255, 255, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "furongwang_slender.png")

def gen_jiangnan():
    im = create_base((24, 24, 27), (244, 244, 245)) # 水墨黑白
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    
    # 水墨黛瓦
    mid_y = LID_Y + 110
    draw.rectangle((x0, y0, x1, mid_y), fill=(24, 24, 27, 255))
    draw.rectangle((x0, mid_y, x1, y1), fill=(245, 245, 247, 255))
    
    add_crease_and_seal(im, (16, 185, 129, 240), "龙井茶爆")
    
    cx = W // 2
    # 龙井绿茶爆珠
    draw.ellipse((cx - 20, mid_y - 80, cx + 20, mid_y - 40), fill=(16, 185, 129, 240), outline=(255, 255, 255, 220), width=2)
    draw.text((cx, mid_y + 40), "江 南 韻", fill=(24, 24, 27, 255), font=f_large, anchor="mm")
    draw.text((cx, mid_y + 105), "利群 · 龙井茶香爆珠", fill=(16, 185, 129, 230), font=f_med, anchor="mm")
    draw.text((cx, mid_y + 155), "JIANGNAN YUN", fill=(113, 113, 122, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "jiangnan.png")

def gen_marlboro():
    im = create_base((9, 9, 11), (24, 24, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (6, 182, 212, 240), "ICE BLAST")
    
    cx, cy = W // 2, 570
    draw_marlboro_frost(draw, cx, cy - 20)
    
    draw.text((cx, cy + 120), "Marlboro", fill=(255, 255, 255, 255), font=get_font(68, True), anchor="mm")
    draw.text((cx, cy + 175), "ICE BLAST · 深海冰蓝", fill=(34, 211, 238, 230), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "marlboro.png")

def gen_hehua():
    im = create_base((220, 252, 231), (187, 247, 208))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (234, 179, 8, 240), "钻石名品")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 390, 390, (255, 255, 255, 240), (34, 197, 94, 200))
    draw_hehua_lotus_vector(draw, cx, cy - 40)
    draw.text((cx, cy + 45), "荷 花", fill=(22, 101, 52, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 115), "HEHUA · 钻石经典", fill=(21, 128, 61, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "hehua.png")

def gen_hongfangyin():
    im = create_base((254, 243, 199), (253, 230, 138))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "乾隆贡烟")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 390, (255, 255, 255, 240), (180, 83, 9, 200))
    # 乾隆红方印
    draw.rectangle((cx - 55, cy - 90, cx + 55, cy + 20), fill=(220, 38, 38, 240), outline=(254, 240, 138, 220), width=2)
    draw.text((cx, cy - 35), "紅方印", fill=(255, 255, 255, 255), font=f_med, anchor="mm")
    draw.text((cx, cy + 70), "黄 山", fill=(120, 53, 15, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 125), "HONG FANG YIN", fill=(180, 83, 9, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "hongfangyin.png")

def gen_kuanzhai():
    im = create_base((51, 65, 85), (30, 41, 59))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "五粮国酒")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 400, (30, 41, 59, 180), (245, 158, 11, 220))
    draw_kuanzhai_gate_vector(draw, cx, cy - 40)
    
    draw.text((cx, cy + 30), "五粮浓香", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 90), "国酒爆珠 · 四川名品", fill=(245, 158, 11, 230), font=f_small, anchor="mm")
    draw.text((cx, cy + 135), "KUAN ZHAI", fill=(148, 163, 184, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "kuanzhai.png")

def gen_chunghwa():
    im = create_base((185, 28, 28), (153, 27, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "国烟经典")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 410, 400, (153, 27, 27, 180), (245, 158, 11, 220))
    # 金华表与天安门宏伟矢量图腾
    draw_tiananmen_vector(draw, cx, cy - 75)
    draw.text((cx, cy + 15), "★★★★★", fill=(254, 240, 138, 240), font=f_small, anchor="mm")
    draw.text((cx, cy + 80), "中 華", fill=(254, 240, 138, 255), font=get_font(72, True), anchor="mm")
    draw.text((cx, cy + 145), "CHUNGHWA · 软包", fill=(255, 255, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "chunghwa.png")

def gen_chunghwa_double():
    im = create_base((220, 38, 38), (153, 27, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "双中支")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 410, 400, (153, 27, 27, 180), (245, 158, 11, 220))
    draw_tiananmen_vector(draw, cx, cy - 75)
    draw.text((cx, cy + 15), "★★★★★", fill=(254, 240, 138, 240), font=f_small, anchor="mm")
    draw.text((cx, cy + 80), "中 華", fill=(254, 240, 138, 255), font=get_font(72, True), anchor="mm")
    draw.text((cx, cy + 145), "CHUNGHWA · 双中支", fill=(255, 255, 255, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "chunghwa_double.png")

def gen_hhl1916():
    im = create_base((217, 119, 6), (120, 53, 15))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (120, 53, 15, 240), "1916典藏")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 410, 410, (120, 53, 15, 180), (245, 158, 11, 220))
    draw_crane_tower_pagoda(draw, cx, cy - 60)
    draw.text((cx, cy + 15), "黃 鶴 樓", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 85), "1 9 1 6", fill=(255, 255, 255, 255), font=get_font(56, True), anchor="mm")
    draw.text((cx, cy + 145), "VINTAGE · HUANGHELOU", fill=(254, 240, 138, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "hhl1916.png")

def gen_hetianxia():
    im = create_base((59, 7, 100), (24, 4, 43))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "和天下")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 410, 410, (24, 4, 43, 180), (245, 158, 11, 220))
    draw_hetianxia_clouds_vector(draw, cx, cy - 50)
    draw.text((cx, cy + 30), "和 天 下", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 105), "白 沙 · 极 致 和 境", fill=(233, 213, 255, 220), font=f_small, anchor="mm")
    draw.text((cx, cy + 145), "HE TIAN XIA", fill=(245, 158, 11, 200), font=f_eng, anchor="mm")
    
    add_warning(im)
    save_pack(im, "hetianxia.png")

def gen_nanyang_shuangxi():
    im = create_base((136, 19, 55), (76, 5, 25))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "南洋兄弟")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 400, 400, (76, 5, 25, 180), (245, 158, 11, 220))
    draw_nanyang_shuangxi_vector(draw, cx, cy - 65)
    draw.text((cx, cy), "囍", fill=(254, 240, 138, 255), font=get_font(90, True), anchor="mm")
    draw.text((cx, cy + 85), "南洋兄弟 · 雙喜", fill=(255, 255, 255, 240), font=f_med, anchor="mm")
    draw.text((cx, cy + 140), "HONG KONG NANYANG", fill=(254, 240, 138, 200), font=f_eng, anchor="mm")
    
    add_warning(
        im,
        warn_title="香港特區政府忠告市民",
        warn_main="吸煙引致肺癌",
        warn_sub="盡早戒煙有益健康",
        warn_extra="戒煙可享受健康生活 · 戒煙熱線: 1833 183",
        divider_color=(245, 190, 70, 230)
    )
    save_pack(im, "nanyang_shuangxi.png")

def gen_mevius_blueberry():
    im = create_base((30, 27, 75), (49, 46, 129))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (168, 85, 247, 240), "OPTION 2")
    
    cx, cy = W // 2, 580
    draw_badge_frame(draw, cy, 400, 410, (49, 46, 129, 180), (168, 85, 247, 220))
    # 双爆珠晶球 (蓝莓紫 + 薄荷青)
    draw.ellipse((cx - 45, cy - 80, cx - 5, cy - 40), fill=(168, 85, 247, 240), outline=(255, 255, 255, 220), width=2)
    draw.ellipse((cx + 5, cy - 80, cx + 45, cy - 40), fill=(6, 182, 212, 240), outline=(255, 255, 255, 220), width=2)
    
    draw.text((cx, cy + 25), "MEVIUS", fill=(255, 255, 255, 255), font=get_font(64, True), anchor="mm")
    draw.text((cx, cy + 85), "OPTION · 蓝莓双爆", fill=(192, 132, 252, 240), font=f_med, anchor="mm")
    draw.text((cx, cy + 140), "PREMIUM BLUEBERRY", fill=(165, 180, 252, 200), font=f_eng, anchor="mm")
    
    add_warning(
        im,
        warn_title="香港特區政府忠告市民",
        warn_main="吸煙引致肺癌",
        warn_sub="請勿在禁煙場所吸煙",
        warn_extra="HKSAR GOVERNMENT WARNING: SMOKING CAUSES LUNG CANCER",
        divider_color=(168, 85, 247, 230)
    )
    save_pack(im, "mevius_blueberry.png")

def gen_castor_vanilla():
    im = create_base((254, 249, 195), (254, 240, 138))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (202, 138, 4, 240), "香草5号")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 390, 400, (255, 255, 255, 240), (202, 138, 4, 220))
    # 柔和香草大号金字 5
    draw.ellipse((cx - 65, cy - 80, cx + 65, cy + 50), fill=(202, 138, 4, 30), outline=(202, 138, 4, 180), width=2)
    draw.text((cx, cy - 15), "5", fill=(161, 98, 7, 255), font=get_font(100, True), anchor="mm")
    draw.text((cx, cy + 80), "CASTOR", fill=(113, 63, 18, 255), font=f_large, anchor="mm")
    draw.text((cx, cy + 135), "卡斯特 · 柔和香草奶香", fill=(161, 98, 7, 220), font=f_small, anchor="mm")
    
    add_warning(
        im,
        warn_title="香港特區政府忠告市民",
        warn_main="吸煙害己害人",
        warn_sub="盡早戒煙有益健康",
        warn_extra="戒煙可享受健康生活 · 戒煙熱線: 1833 183",
        divider_color=(202, 138, 4, 230)
    )
    save_pack(im, "castor_vanilla.png")

def gen_sobranie_black():
    im = create_base((9, 9, 11), (24, 24, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "黑俄先锋")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 410, 410, (24, 24, 27, 200), (245, 158, 11, 240))
    draw_sobranie_eagle_vector(draw, cx, cy - 50)
    draw.text((cx, cy + 20), "SOBRANIE", fill=(254, 240, 138, 255), font=get_font(60, True), anchor="mm")
    draw.text((cx, cy + 80), "寿 百 年 · 黑 俄", fill=(255, 255, 255, 240), font=f_med, anchor="mm")
    draw.text((cx, cy + 135), "BLACK RUSSIAN · LONDON", fill=(212, 212, 216, 200), font=f_eng, anchor="mm")
    
    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="尽早戒烟有益健康",
        warn_extra="SMOKING SERIOUSLY DAMAGES HEALTH",
        divider_color=(245, 158, 11, 230)
    )
    save_pack(im, "sobranie_black.png")

def gen_cohiba():
    im = create_base((9, 9, 11), (217, 119, 6))
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    
    # 顶部 3 排黑底白方块棋盘格
    checker_h = 160
    draw.rectangle((x0, LID_Y - 80, x1, LID_Y + checker_h), fill=(9, 9, 11, 255))
    dot_w = 26
    for row in range(4):
        for col in range(16):
            if (row + col) % 2 == 0:
                dx = x0 + 20 + col * 42
                dy = LID_Y - 70 + row * 46
                draw.rectangle((dx, dy, dx + dot_w, dy + dot_w), fill=(255, 255, 255, 230))
                
    # 明黄底座
    draw.rectangle((x0, LID_Y + checker_h, x1, y1), fill=(217, 119, 6, 255))
    add_crease_and_seal(im, (245, 158, 11, 240), "HABANA")
    
    cx = W // 2
    cy = LID_Y + checker_h + 160
    draw.text((cx, cy - 30), "COHIBA", fill=(0, 0, 0, 255), font=get_font(72, True), anchor="mm")
    draw.text((cx, cy + 45), "HABANA, CUBA", fill=(255, 255, 255, 230), font=f_eng, anchor="mm")
    draw.text((cx, cy + 100), "SIGLO VI · 世纪六号雪茄", fill=(0, 0, 0, 200), font=f_med, anchor="mm")
    
    add_warning(
        im,
        warn_title="REPÚBLICA DE CUBA · AVISO",
        warn_main="吸烟有害健康",
        warn_sub="尽早戒烟有益健康",
        warn_extra="CIGAR SMOKING IS HAZARDOUS TO HEALTH",
        divider_color=(245, 158, 11, 230)
    )
    save_pack(im, "cohiba.png")

def gen_hand_rolled_hanyan():
    # 老辈白纸卷旱烟：手揉白纸纹理、喇叭筒锥形卷烟与外露金黄烟丝
    im = create_base((248, 244, 236), (236, 228, 216))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (185, 28, 28, 240), "老輩手捲")
    
    cx, cy = W // 2, 590
    draw_badge_frame(draw, cy, 440, 440, (253, 251, 247, 245), (140, 83, 25, 180))
    
    # 1. 绘制核心视觉图腾：经典白纸手卷喇叭筒 (前粗后细大喇叭筒 + 顶端外溢金黄烟丝)
    # 喇叭筒中心与倾斜轴线
    # 喇叭筒大头 (粗端) 在上方偏左，小头 (咬嘴) 在下方偏右
    t_top_cx, t_top_cy = cx - 40, cy - 80
    t_bot_cx, t_bot_cy = cx + 55, cy + 45
    
    # 顶端外溢金黄原叶烟丝 (乱而不散、蓬松金黄深褐)
    tobacco_colors = [
        (217, 119, 6, 255),  # 琥珀金
        (180, 83, 9, 255),   # 焦糖褐
        (120, 53, 15, 255),  # 深栗棕
        (245, 158, 11, 240), # 亮金黄
        (92, 40, 10, 240)    # 醇黑叶
    ]
    # 在喇叭筒开头部绘制多条弯曲放射状外溢碎烟丝
    import random
    rng = random.Random(42) # 确定性随机
    for i in range(28):
        ox = t_top_cx + rng.uniform(-28, 22)
        oy = t_top_cy + rng.uniform(-10, 10)
        ex = ox + rng.uniform(-18, 12)
        ey = oy - rng.uniform(14, 38)
        color = rng.choice(tobacco_colors)
        w = rng.randint(2, 4)
        draw.line([(ox, oy), (ox + (ex - ox) * 0.5, oy + (ey - oy) * 0.6), (ex, ey)], fill=color, width=w)
    
    # 2. 喇叭筒白纸卷身 (梯形圆台锥度：顶宽 ~46px，底宽 ~22px)
    w_top = 46
    w_bot = 22
    # 倾斜方向法向量 (-dy, dx)
    dx = t_bot_cx - t_top_cx
    dy = t_bot_cy - t_top_cy
    length = math.hypot(dx, dy)
    nx = -dy / length
    ny = dx / length
    
    p1 = (t_top_cx - nx * w_top / 2, t_top_cy - ny * w_top / 2)
    p2 = (t_top_cx + nx * w_top / 2, t_top_cy + ny * w_top / 2)
    p3 = (t_bot_cx + nx * w_bot / 2, t_bot_cy + ny * w_bot / 2)
    p4 = (t_bot_cx - nx * w_bot / 2, t_bot_cy - ny * w_bot / 2)
    
    # 白纸底色
    draw.polygon([p1, p2, p3, p4], fill=(255, 254, 250, 255), outline=(214, 211, 209, 240))
    
    # 3D 纸卷侧阴影与高光线条
    mid_p1 = (t_top_cx + nx * 4, t_top_cy + ny * 4)
    mid_p2 = (t_bot_cx + nx * 2, t_bot_cy + ny * 2)
    draw.line([mid_p1, mid_p2], fill=(255, 255, 255, 200), width=4)
    
    # 手工卷纸螺旋叠边斜线 (3道斜向卷合痕迹)
    for frac in [0.25, 0.52, 0.78]:
        sx = t_top_cx + dx * frac - nx * (w_top * (1 - frac) + w_bot * frac) / 2
        sy = t_top_cy + dy * frac - ny * (w_top * (1 - frac) + w_bot * frac) / 2
        ex = t_top_cx + dx * (frac + 0.12) + nx * (w_top * (1 - frac) + w_bot * frac) / 2
        ey = t_top_cy + dy * (frac + 0.12) + ny * (w_top * (1 - frac) + w_bot * frac) / 2
        draw.line([(sx, sy), (ex, ey)], fill=(203, 195, 185, 220), width=2)
    
    # 喇叭口顶端切面 (深褐色烟丝腔)
    draw.ellipse((t_top_cx - w_top/2, t_top_cy - 8, t_top_cx + w_top/2, t_top_cy + 8), fill=(92, 40, 10, 255), outline=(180, 83, 9, 220), width=1)
    
    # 尾部手捏咬嘴纯白纸圈
    draw.ellipse((t_bot_cx - w_bot/2, t_bot_cy - 5, t_bot_cx + w_bot/2, t_bot_cy + 5), fill=(245, 245, 244, 255), outline=(168, 162, 158, 200), width=1)
    
    # 3. 复古传统书法牌匾
    draw.text((cx, cy + 85), "老 輩 旱 煙", fill=(41, 37, 36, 255), font=get_font(52, True), anchor="mm")
    draw.text((cx, cy + 138), "白 紙 手 捲 · 傳 統 喇 叭 筒", fill=(140, 83, 25, 255), font=get_font(28, True), anchor="mm")
    
    # 传统手工红印章
    stamp_w, stamp_h = 130, 36
    stamp_y = cy + 175
    draw.rectangle([(cx - stamp_w//2, stamp_y), (cx + stamp_w//2, stamp_y + stamp_h)], fill=(185, 28, 28, 230), outline=(220, 38, 38, 255), width=1)
    draw.text((cx, stamp_y + stamp_h//2), "純手工原葉", fill=(255, 255, 255, 255), font=get_font(20, True), anchor="mm")
    
    add_warning(
        im,
        warn_title="岁月长辈叮咛",
        warn_main="吸烟有害健康",
        warn_sub="草本辛烈少抽为宜",
        warn_extra="一张白纸一撮烟丝 · 往事回甘莫贪多",
        divider_color=(185, 28, 28, 230)
    )
    save_pack(im, "hand_rolled_hanyan.png")

def draw_niulai_cartoon_vector(draw, cx, cy):
    """绘制 80% 相似度 2D 动画版【牛来】萌金小牛矢量插画（与全馆烟盒统一手绘矢量风，合规不侵权）"""
    gold_light = (254, 240, 138, 255)
    amber_main = (245, 158, 11, 255)
    amber_mid = (217, 119, 6, 255)
    amber_dark = (180, 83, 9, 255)
    brown_line = (69, 26, 3, 255)

    # 0. 背部暗金光影圆盘底座 (实色高对比，避免256色量化色斑)
    draw.ellipse((cx - 88, cy - 82, cx + 88, cy + 74), fill=(38, 28, 18, 255), outline=amber_mid, width=2)
    draw.ellipse((cx - 78, cy - 72, cx + 78, cy + 64), outline=(254, 240, 138, 160), width=1)

    # 1. 背景 35mm 电影双胶卷光环 (Cinema Dual Film Reels)
    for rx_off in [-84, 84]:
        rcx, rcy = cx + rx_off, cy - 16
        draw.ellipse((rcx - 36, rcy - 36, rcx + 36, rcy + 36), fill=(20, 16, 12, 255), outline=gold_light, width=2)
        draw.ellipse((rcx - 10, rcy - 10, rcx + 10, rcy + 10), fill=amber_main)
        for deg in range(0, 360, 60):
            rad = math.radians(deg)
            hx = rcx + 22 * math.cos(rad)
            hy = rcy + 22 * math.sin(rad)
            draw.ellipse((hx - 5, hy - 5, hx + 5, hy + 5), fill=gold_light)

    # 2. 动画版小牛身体与红金电影披风肚兜 (Cartoon Red Scarf & Gold Bell)
    draw.polygon([
        (cx - 52, cy + 68),
        (cx - 36, cy + 26),
        (cx + 36, cy + 26),
        (cx + 52, cy + 68)
    ], fill=(220, 38, 38, 255), outline=gold_light, width=2)
    # 披风金边领口
    draw.line([(cx - 36, cy + 30), (cx, cy + 42), (cx + 36, cy + 30)], fill=gold_light, width=3)
    # 胸前小金铃铛
    draw.ellipse((cx - 12, cy + 36, cx + 12, cy + 60), fill=gold_light, outline=brown_line, width=2)
    draw.line([(cx - 7, cy + 50), (cx + 7, cy + 50)], fill=brown_line, width=2)
    draw.ellipse((cx - 3, cy + 49, cx + 3, cy + 55), fill=brown_line)

    # 3. 动画版萌牛双耳 (Cute Cartoon Calf Ears)
    draw.polygon([(cx - 46, cy - 16), (cx - 88, cy - 28), (cx - 76, cy - 2), (cx - 44, cy - 2)], fill=amber_main, outline=brown_line, width=2)
    draw.polygon([(cx - 50, cy - 13), (cx - 76, cy - 21), (cx - 70, cy - 6)], fill=(253, 186, 116, 255))
    draw.polygon([(cx + 46, cy - 16), (cx + 88, cy - 28), (cx + 76, cy - 2), (cx + 44, cy - 2)], fill=amber_main, outline=brown_line, width=2)
    draw.polygon([(cx + 50, cy - 13), (cx + 76, cy - 21), (cx + 70, cy - 6)], fill=(253, 186, 116, 255))

    # 4. 动画版圆润新月小金角 (80% 相似度萌系弯角)
    left_horn = [
        (cx - 26, cy - 42),
        (cx - 48, cy - 66),
        (cx - 40, cy - 92),
        (cx - 26, cy - 86),
        (cx - 28, cy - 64),
        (cx - 14, cy - 46)
    ]
    right_horn = [
        (cx + 26, cy - 42),
        (cx + 48, cy - 66),
        (cx + 40, cy - 92),
        (cx + 26, cy - 86),
        (cx + 28, cy - 64),
        (cx + 14, cy - 46)
    ]
    draw.polygon(left_horn, fill=gold_light, outline=brown_line, width=2)
    draw.polygon(right_horn, fill=gold_light, outline=brown_line, width=2)

    # 5. 动画版小金牛圆润脸庞 (Cute Golden Calf Head)
    draw.rounded_rectangle((cx - 48, cy - 48, cx + 48, cy + 36), radius=34, fill=amber_main, outline=brown_line, width=3)
    # 额头呆毛金毛簇 (Fluffy Forehead Tuft)
    draw.polygon([
        (cx - 16, cy - 44),
        (cx - 6, cy - 60),
        (cx, cy - 48),
        (cx + 8, cy - 62),
        (cx + 16, cy - 44)
    ], fill=gold_light, outline=brown_line, width=2)

    # 6. 灵动卡通大眼睛与红润脸颊 (Big Expressive Anime Eyes & Blush)
    for ex in [cx - 21, cx + 21]:
        ey = cy - 13
        draw.ellipse((ex - 12, ey - 14, ex + 12, ey + 14), fill=(255, 255, 255, 255), outline=brown_line, width=2)
        draw.ellipse((ex - 8, ey - 10, ex + 8, ey + 10), fill=(28, 25, 23, 255))
        draw.ellipse((ex - 5, ey - 7, ex + 1, ey - 1), fill=(255, 255, 255, 255))
        draw.ellipse((ex + 2, ey + 2, ex + 5, ey + 5), fill=gold_light)
    # 腮红
    draw.ellipse((cx - 40, cy - 2, cx - 28, cy + 6), fill=(239, 68, 68, 255))
    draw.ellipse((cx + 28, cy - 2, cx + 40, cy + 6), fill=(239, 68, 68, 255))
    # 精神小眉毛
    draw.arc((cx - 34, cy - 35, cx - 8, cy - 21), start=200, end=340, fill=brown_line, width=3)
    draw.arc((cx + 8, cy - 35, cx + 34, cy - 21), start=200, end=340, fill=brown_line, width=3)

    # 7. 奶黄圆润鼻吻与开心笑容 (Cream Snout & Happy Smile)
    draw.rounded_rectangle((cx - 32, cy + 2, cx + 32, cy + 38), radius=18, fill=(254, 243, 199, 255), outline=brown_line, width=2)
    draw.ellipse((cx - 14, cy + 10, cx - 7, cy + 16), fill=brown_line)
    draw.ellipse((cx + 7, cy + 10, cx + 14, cy + 16), fill=brown_line)
    draw.arc((cx - 12, cy + 16, cx + 12, cy + 32), start=15, end=165, fill=(220, 38, 38, 255), width=3)


def gen_niulai_cinema():
    """生成原创非侵权【牛来·电影香烟】立面（统一手绘矢量动画风，80%相似度卡通金牛）"""
    im = create_base((30, 24, 18), (16, 12, 10))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (217, 119, 6, 240), "牛来光影")

    cx, cy = W // 2, 556
    # 与其他烟壳完全一致的徽章大画框 (底部留出充足边距，绝不触碰下方警示线)
    draw_badge_frame(draw, cy, 430, 412, (24, 20, 16, 255), (245, 158, 11, 240))

    # 框内两侧 35mm 胶片齿孔装饰条
    for sy in range(cy - 182, cy + 165, 36):
        draw.rounded_rectangle((cx - 198, sy, cx - 180, sy + 22), radius=3, fill=(10, 8, 6, 255), outline=(245, 158, 11, 180), width=1)
        draw.rounded_rectangle((cx + 180, sy, cx + 198, sy + 22), radius=3, fill=(10, 8, 6, 255), outline=(245, 158, 11, 180), width=1)

    # 1. 绘制 80% 相似度 2D 动画版【牛来】萌金小牛
    draw_niulai_cartoon_vector(draw, cx, cy - 62)

    # 2. 品牌大字与副标（与其他名烟排版风格完全统一）
    draw.text((cx, cy + 64), "牛  来", fill=(254, 240, 138, 255), font=get_font(64, True), anchor="mm")
    draw.text((cx, cy + 120), "NIULAI · 电影香烟 · 银幕金犊", fill=(245, 158, 11, 255), font=get_font(24, True), anchor="mm")

    # 3. 底部流金印章
    stamp_w, stamp_h = 144, 34
    stamp_y = cy + 150
    draw.rounded_rectangle((cx - stamp_w // 2, stamp_y, cx + stamp_w // 2, stamp_y + stamp_h), radius=6, fill=(180, 83, 9, 255), outline=(254, 240, 138, 255), width=1)
    draw.text((cx, stamp_y + stamp_h // 2), "光影琥珀爆珠", fill=(255, 255, 255, 255), font=get_font(19, True), anchor="mm")

    add_warning(
        im,
        warn_title="光影艺术提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="一卷光影一声牛来 · 愿君早日无烟一身轻",
        divider_color=(245, 158, 11, 230),
        warn_bg=None,
        text_color_hdr=(254, 240, 138, 240),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(253, 224, 71, 230),
        text_color_extra=(217, 119, 6, 210)
    )
    save_pack(im, "niulai_cinema.png")


def draw_diga_aotuman_cartoon_vector(draw, cx, cy):
    """绘制 80% 相似度 2D 动画版【迪加·凹凸曼】光之英雄矢量插画（与全馆烟盒统一手绘卡通矢量风，合规不侵权）"""
    silver_light = (241, 245, 249, 255)
    silver_mid = (203, 213, 225, 255)
    gold_color = (251, 191, 36, 255)
    cyan_glow = (56, 189, 248, 255)
    red_suit = (220, 38, 38, 255)
    purple_suit = (109, 40, 217, 255)
    dark_line = (15, 23, 42, 255)

    # 1. 背部深邃星云圆盘与八芒星光束 (实色高对比，零量化色斑)
    draw.ellipse((cx - 88, cy - 82, cx + 88, cy + 74), fill=(30, 27, 75, 255), outline=cyan_glow, width=2)
    draw.ellipse((cx - 76, cy - 70, cx + 76, cy + 62), outline=gold_color, width=1)
    for deg in range(0, 360, 45):
        rad = math.radians(deg)
        x1 = cx + 52 * math.cos(rad)
        y1 = (cy - 4) + 52 * math.sin(rad)
        x2 = cx + 72 * math.cos(rad)
        y2 = (cy - 4) + 72 * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=gold_color if deg % 90 == 0 else cyan_glow, width=2)

    # 2. 动画版红紫复合肩甲与半身躯干 (Cartoon Red-Purple Shoulders & Torso)
    torso_pts = [
        (cx - 74, cy + 28),
        (cx - 54, cy + 68),
        (cx + 54, cy + 68),
        (cx + 74, cy + 28),
        (cx + 46, cy + 12),
        (cx - 46, cy + 12)
    ]
    draw.polygon(torso_pts, fill=red_suit, outline=dark_line, width=2)
    # 紫色复合装甲条纹
    draw.polygon([(cx - 48, cy + 44), (cx, cy + 68), (cx + 48, cy + 44), (cx + 36, cy + 68), (cx - 36, cy + 68)], fill=purple_suit)

    # 3. 经典黄金 V 型卡通胸甲护翼 (Golden V Chest Protector)
    v_chest = [
        (cx - 68, cy + 20),
        (cx, cy + 56),
        (cx + 68, cy + 20),
        (cx + 56, cy + 36),
        (cx, cy + 68),
        (cx - 56, cy + 36)
    ]
    draw.polygon(v_chest, fill=gold_color, outline=(254, 240, 138, 255), width=2)

    # 4. 胸口冰蓝发光彩色能量灯 (Cyan Color Timer)
    draw.ellipse((cx - 14, cy + 32, cx + 14, cy + 60), fill=cyan_glow, outline=(255, 255, 255, 255), width=3)
    draw.ellipse((cx - 6, cy + 38, cx + 2, cy + 46), fill=(255, 255, 255, 255))

    # 5. 2D 动画版凹凸曼银白头盔 (Cartoon Silver Helmet with Fin)
    draw.rounded_rectangle((cx - 54, cy - 32, cx - 38, cy - 6), radius=5, fill=silver_mid, outline=dark_line, width=2)
    draw.rounded_rectangle((cx + 38, cy - 32, cx + 54, cy - 6), radius=5, fill=silver_mid, outline=dark_line, width=2)

    head_pts = [
        (cx, cy - 84),
        (cx - 38, cy - 64),
        (cx - 46, cy - 24),
        (cx - 32, cy + 12),
        (cx, cy + 24),
        (cx + 32, cy + 12),
        (cx + 46, cy - 24),
        (cx + 38, cy - 64)
    ]
    draw.polygon(head_pts, fill=silver_light, outline=dark_line, width=3)
    # 右半脸 2D 赛璐璐立体阴影
    right_shade = [
        (cx, cy - 81),
        (cx, cy + 21),
        (cx + 30, cy + 11),
        (cx + 43, cy - 24),
        (cx + 36, cy - 62)
    ]
    draw.polygon(right_shade, fill=(226, 232, 240, 255))
    draw.polygon(head_pts, outline=dark_line, width=3)

    # 头顶中脊与冰蓝额头水晶 (Central Crest & Forehead Crystal)
    draw.polygon([(cx, cy - 92), (cx - 8, cy - 52), (cx, cy - 42), (cx + 8, cy - 52)], fill=silver_mid, outline=dark_line, width=2)
    draw.polygon([(cx, cy - 68), (cx - 6, cy - 54), (cx, cy - 44), (cx + 6, cy - 54)], fill=cyan_glow, outline=(255, 255, 255, 255), width=1)

    # 6. 动画版大号发光鹅黄椭圆复眼 (Cute Big Glowing Yellow Cartoon Eyes)
    left_eye = [(cx - 36, cy - 30), (cx - 10, cy - 22), (cx - 12, cy - 6), (cx - 34, cy - 12)]
    right_eye = [(cx + 36, cy - 30), (cx + 10, cy - 22), (cx + 12, cy - 6), (cx + 34, cy - 12)]
    draw.polygon(left_eye, fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=2)
    draw.polygon(right_eye, fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=2)
    draw.ellipse((cx - 28, cy - 24, cx - 20, cy - 16), fill=(255, 255, 255, 255))
    draw.ellipse((cx + 18, cy - 24, cx + 26, cy - 16), fill=(255, 255, 255, 255))

    # 简约卡通微笑下颌线
    draw.line([(cx - 10, cy + 8), (cx + 10, cy + 8)], fill=(100, 116, 139, 255), width=2)


def gen_ultraman_tiga():
    """生成原创非侵权谐音版【迪加·凹凸曼】立面（统一手绘矢量动画风，80%相似度卡通光之英雄）"""
    im = create_base((46, 16, 101), (15, 23, 42))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (2, 132, 199, 240), "化身为光")

    cx, cy = W // 2, 556
    # 与其他烟壳完全一致的徽章大画框 (底部留出充足边距，绝不触碰下方警示线)
    draw_badge_frame(draw, cy, 430, 412, (23, 15, 58, 255), (56, 189, 248, 240))

    # 1. 绘制 80% 相似度 2D 动画版【迪加·凹凸曼】
    draw_diga_aotuman_cartoon_vector(draw, cx, cy - 62)

    # 2. 谐音品牌大字：“迪加·凹凸曼”
    draw.text((cx, cy + 64), "迪加·凹凸曼", fill=(254, 240, 138, 255), font=get_font(56, True), anchor="mm")
    draw.text((cx, cy + 120), "DIGA AOTUMAN · 动画光之巨人", fill=(56, 189, 248, 255), font=get_font(23, True), anchor="mm")

    # 3. 底部能量印章
    stamp_w, stamp_h = 144, 34
    stamp_y = cy + 150
    draw.rounded_rectangle((cx - stamp_w // 2, stamp_y, cx + stamp_w // 2, stamp_y + stamp_h), radius=6, fill=(2, 132, 199, 255), outline=(254, 240, 138, 255), width=1)
    draw.text((cx, stamp_y + stamp_h // 2), "奇迹光粒子珠", fill=(255, 255, 255, 255), font=get_font(19, True), anchor="mm")

    add_warning(
        im,
        warn_title="光之星云提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="相信光的人终将战胜烟瘾 · 拥抱纯净新生",
        divider_color=(56, 189, 248, 230),
        warn_bg=None,
        text_color_hdr=(254, 240, 138, 240),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(186, 230, 253, 240),
        text_color_extra=(125, 211, 252, 200)
    )
    save_pack(im, "ultraman_tiga.png")


def draw_sparkle_star(draw, cx, cy, r=10, color=(254, 240, 138, 255)):
    """绘制四角星芒矢量装饰（替代字库缺失的特殊符号，杜绝 □ 方框）"""
    pts = [
        (cx, cy - r),
        (cx + r * 0.28, cy - r * 0.28),
        (cx + r, cy),
        (cx + r * 0.28, cy + r * 0.28),
        (cx, cy + r),
        (cx - r * 0.28, cy + r * 0.28),
        (cx - r, cy),
        (cx - r * 0.28, cy - r * 0.28)
    ]
    draw.polygon(pts, fill=color)


def draw_bilateral_warnings(draw, left_text="吸烟有害健康", right_text="戒烟有益健康", color=(254, 240, 138, 235)):
    """在烟盒两侧边缘绘制高定立式对称健康警示语（左右呼应，6字对称，不占用上下核心区域）"""
    font_vert = get_font(21, True)
    cy_start = 442
    spacing = 40

    # 左侧立式警示语 (x = 88)
    draw_sparkle_star(draw, 88, cy_start - 24, r=6, color=color)
    for i, ch in enumerate(left_text):
        draw.text((88, cy_start + i * spacing), ch, fill=color, font=font_vert, anchor="mm")
    draw_sparkle_star(draw, 88, cy_start + (len(left_text) - 1) * spacing + 24, r=6, color=color)

    # 右侧立式警示语 (x = 632)
    draw_sparkle_star(draw, 632, cy_start - 24, r=6, color=color)
    for i, ch in enumerate(right_text):
        draw.text((632, cy_start + i * spacing), ch, fill=color, font=font_vert, anchor="mm")
    draw_sparkle_star(draw, 632, cy_start + (len(right_text) - 1) * spacing + 24, r=6, color=color)


def gen_gf_happy_smile():
    """生成女友专属恶搞宠爱款 1：【倾城一笑·开心果】（截取图1生动面部表情特写 + 皇家玫瑰金浮雕宝相框）"""
    from PIL import ImageEnhance
    im = create_base((136, 19, 55), (76, 5, 25))  # 皇家丝绒绯红渐变底
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (225, 29, 72, 245), "欢喜冤家")

    # 两侧高定立式对称健康警示语（吸烟有害健康 · 戒烟有益健康，不改动上下核心文案）
    draw_bilateral_warnings(draw, color=(254, 240, 138, 235))

    cx, cy = W // 2, 554
    # 与全馆名烟一致的鎏金大徽章框 (高度420，上下留白充裕)
    draw_badge_frame(draw, cy, 436, 420, (88, 12, 36, 255), (254, 240, 138, 245))

    # 翻盖区浪漫星芒与恶搞宠溺副标（使用纯矢量四角星，0方框乱码）
    draw_sparkle_star(draw, cx - 196, 155, r=11, color=(254, 240, 138, 245))
    draw_sparkle_star(draw, cx + 196, 155, r=11, color=(254, 240, 138, 245))
    draw.text((cx, 155), "专 属 开 心 果 · 荣 耀 典 藏", fill=(254, 240, 138, 245), font=get_font(26, True), anchor="mm")
    draw.text((cx, 206), "SWEETHEART · 一笑解千愁", fill=(253, 164, 175, 230), font=get_font(20, True), anchor="mm")

    # 1. 截取图1「纯面部表情」特写 (gf_face.jpg: 459x1024)
    asset_path = os.path.join(os.path.dirname(__file__), "assets", "gf_face.jpg")
    face_cy = 468
    rx, ry = 98, 102  # 椭圆面部特写画幅，与下方大字保持36px呼吸间距
    if os.path.exists(asset_path):
        src = Image.open(asset_path).convert("RGBA")
        sw, sh = src.size
        # 精准居中锁定五官搞笑张嘴表情（紧贴脸庞轮廓，去除两侧多余黑发与背景）
        crop_box = (int(sw * 0.335), int(sh * 0.285), int(sw * 0.795), int(sh * 0.575))
        cropped = src.crop(crop_box)
        cropped = ImageEnhance.Brightness(cropped).enhance(1.12)
        cropped = ImageEnhance.Contrast(cropped).enhance(1.06)
        resized = cropped.resize((rx * 2, ry * 2), Image.Resampling.LANCZOS)

        # 椭圆宝相肖像遮罩
        mask = Image.new("L", (rx * 2, ry * 2), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.ellipse((0, 0, rx * 2 - 1, ry * 2 - 1), fill=255)

        # 外圈皇家金光环与两侧星芒
        for deg in range(0, 360, 30):
            rad = math.radians(deg)
            x1 = cx + (rx + 6) * math.cos(rad)
            y1 = face_cy + (ry + 6) * math.sin(rad)
            x2 = cx + (rx + 15) * math.cos(rad)
            y2 = face_cy + (ry + 15) * math.sin(rad)
            draw.line([(x1, y1), (x2, y2)], fill=(254, 240, 138, 220), width=2)
        draw_sparkle_star(draw, cx - rx - 32, face_cy, r=12, color=(254, 240, 138, 245))
        draw_sparkle_star(draw, cx + rx + 32, face_cy, r=12, color=(254, 240, 138, 245))

        im.paste(resized, (cx - rx, face_cy - ry), mask)
        draw = ImageDraw.Draw(im)
        # 皇家玫瑰金双层精致椭圆画框
        draw.ellipse((cx - rx - 3, face_cy - ry - 3, cx + rx + 3, face_cy + ry + 3), outline=(254, 240, 138, 255), width=4)
        draw.ellipse((cx - rx - 8, face_cy - ry - 8, cx + rx + 8, face_cy + ry + 8), outline=(245, 158, 11, 220), width=2)

        # 头顶俏皮小金皇冠
        crown_y = face_cy - ry - 5
        crown_pts = [
            (cx - 26, crown_y),
            (cx - 32, crown_y - 20),
            (cx - 13, crown_y - 9),
            (cx, crown_y - 25),
            (cx + 13, crown_y - 9),
            (cx + 32, crown_y - 20),
            (cx + 26, crown_y)
        ]
        draw.polygon(crown_pts, fill=(254, 240, 138, 255), outline=(180, 83, 9, 255), width=2)

    # 2. 品牌主打名与副标（与上方头像框留足间距，层次分明）
    draw.text((cx, 624), "倾 城 一 笑", fill=(254, 240, 138, 255), font=get_font(54, True), anchor="mm")
    draw.text((cx, 676), "SWEETHEART · 专属开心果", fill=(253, 164, 175, 255), font=get_font(22, True), anchor="mm")

    # 3. 底部蜜桃甜心爆珠印章
    stamp_w, stamp_h = 148, 34
    stamp_y = 706
    draw.rounded_rectangle((cx - stamp_w // 2, stamp_y, cx + stamp_w // 2, stamp_y + stamp_h), radius=6, fill=(225, 29, 72, 255), outline=(254, 240, 138, 255), width=1)
    draw.text((cx, stamp_y + stamp_h // 2), "蜜桃甜心爆珠", fill=(255, 255, 255, 255), font=get_font(19, True), anchor="mm")

    add_warning(
        im,
        warn_title="恋爱专属提示",
        warn_main="一笑倾城百媚生",
        warn_sub="少抽香烟多宠她",
        warn_extra="看一眼开心果表情包 · 烦恼烟瘾统统消散",
        divider_color=(254, 240, 138, 240),
        warn_bg=None,
        text_color_hdr=(254, 240, 138, 240),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(253, 164, 175, 240),
        text_color_extra=(244, 114, 182, 200)
    )
    out_path = os.path.join(OUTPUT_DIR, "gf_happy_smile.png")
    im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(out_path, optimize=True)


def gen_gf_moonlight_muse():
    """生成女友专属浪漫款 2：【心动女神·白月光】（珠光月白玫瑰金礼盒 + 图2甜美全身照无缝融合）"""
    from PIL import ImageEnhance
    # 采用珠光月白配香槟淡粉高定底色，让图2的纯白棚拍全身照 100% 自然融入画框！
    im = create_base((255, 250, 252), (252, 231, 243))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (219, 39, 119, 245), "一生挚爱")

    # 两侧高定立式对称健康警示语（吸烟有害健康 · 戒烟有益健康，不改动上下核心文案）
    draw_bilateral_warnings(draw, color=(157, 23, 77, 245))

    cx, cy = W // 2, 554
    # 纯白珠光内衬大徽章框 + 玫瑰金双线描边
    draw_badge_frame(draw, cy, 436, 420, (255, 255, 255, 255), (219, 39, 119, 220))

    # 翻盖区高定铭文（纯矢量星芒，杜绝 □ 方框）
    draw_sparkle_star(draw, cx - 196, 155, r=11, color=(219, 39, 119, 235))
    draw_sparkle_star(draw, cx + 196, 155, r=11, color=(219, 39, 119, 235))
    draw.text((cx, 155), "心 动 女 神 · 岁 月 白 月 光", fill=(157, 23, 77, 255), font=get_font(26, True), anchor="mm")
    draw.text((cx, 206), "MOONLIGHT MUSE · 520 LIMITED", fill=(219, 39, 119, 220), font=get_font(20, True), anchor="mm")

    # 1. 镶嵌图2「全身照」立绘 (gf_full.jpg: 1024x576)
    asset_path = os.path.join(os.path.dirname(__file__), "assets", "gf_full.jpg")
    pw, ph = 248, 212  # 竖幅全身画框宽高 (等比裁切全身照，0变形，与下方文字留足间距)
    px0, py0 = cx - pw // 2, 466 - ph // 2
    px1, py1 = px0 + pw, py0 + ph
    if os.path.exists(asset_path):
        src = Image.open(asset_path).convert("RGBA")
        sw, sh = src.size
        # 按目标画框宽高比从原图中央等比裁切全身区域 (从头顶猪猪发夹到牛仔短裤全身完整呈现)
        target_aspect = pw / float(ph)
        crop_h = int(sh * 0.97)
        crop_w = int(crop_h * target_aspect)
        cx_src = int(sw * 0.515)
        cx0 = max(0, cx_src - crop_w // 2)
        cy0 = int(sh * 0.015)
        cropped = src.crop((cx0, cy0, cx0 + crop_w, cy0 + crop_h))
        cropped = ImageEnhance.Contrast(cropped).enhance(1.04)
        resized = cropped.resize((pw, ph), Image.Resampling.LANCZOS)

        # 圆角画框蒙版
        mask = Image.new("L", (pw, ph), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.rounded_rectangle((0, 0, pw - 1, ph - 1), radius=16, fill=255)
        im.paste(resized, (px0, py0), mask)

        draw = ImageDraw.Draw(im)
        # 香槟金与玫瑰粉双层高定内画框 + 两侧星芒
        draw.rounded_rectangle((px0 - 2, py0 - 2, px1 + 2, py1 + 2), radius=18, outline=(245, 158, 11, 240), width=3)
        draw.rounded_rectangle((px0 - 7, py0 - 7, px1 + 7, py1 + 7), radius=22, outline=(244, 114, 182, 190), width=1)
        draw_sparkle_star(draw, px0 - 24, 466, r=11, color=(245, 158, 11, 240))
        draw_sparkle_star(draw, px1 + 24, 466, r=11, color=(245, 158, 11, 240))

    # 2. 品牌主打名与副标（深玫红皇家烫金字体，在珠光白底上极度优雅醒目）
    draw.text((cx, 624), "心 动 女 神", fill=(157, 23, 77, 255), font=get_font(54, True), anchor="mm")
    draw.text((cx, 676), "MOONLIGHT · 独家白月光", fill=(219, 39, 119, 240), font=get_font(22, True), anchor="mm")

    # 3. 底部初恋玫瑰爆珠印章
    stamp_w, stamp_h = 148, 34
    stamp_y = 706
    draw.rounded_rectangle((cx - stamp_w // 2, stamp_y, cx + stamp_w // 2, stamp_y + stamp_h), radius=6, fill=(219, 39, 119, 255), outline=(245, 158, 11, 255), width=1)
    draw.text((cx, stamp_y + stamp_h // 2), "初恋玫瑰爆珠", fill=(255, 255, 255, 255), font=get_font(19, True), anchor="mm")

    # 底部警示区去除深色方块底色，使珠光月白渐变底色自然贯通到底部，文字采用高反差勃艮第红与深灰
    add_warning(
        im,
        warn_title="浪漫挚爱提示",
        warn_main="仙女颜值超标",
        warn_sub="戒烟省钱宠女神",
        warn_extra="抽烟只抽心动女神 · 一生只宠一个人",
        divider_color=(219, 39, 119, 235),
        warn_bg=None,
        text_color_hdr=(157, 23, 77, 245),
        text_color_main=(190, 18, 60, 255),
        text_color_sub=(157, 23, 77, 235),
        text_color_extra=(100, 116, 139, 220)
    )
    out_path = os.path.join(OUTPUT_DIR, "gf_moonlight_muse.png")
    im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(out_path, optimize=True)

def run_all():
    print("Generating all 33 pack images...")
    gen_pure_zen()
    gen_baisha()
    gen_hongtashan()
    gen_shuangxi()
    gen_zhongnanhai()
    gen_hong_nanjing()
    gen_chaotianmen()
    gen_liqun()
    gen_xuanhemen()
    gen_ruanlan()
    gen_yuxi_soft()
    gen_guiyan()
    gen_furongwang()
    gen_furongwang_slender()
    gen_jiangnan()
    gen_marlboro()
    gen_hehua()
    gen_hongfangyin()
    gen_kuanzhai()
    gen_chunghwa()
    gen_chunghwa_double()
    gen_hhl1916()
    gen_hetianxia()
    gen_nanyang_shuangxi()
    gen_mevius_blueberry()
    gen_castor_vanilla()
    gen_sobranie_black()
    gen_cohiba()
    gen_hand_rolled_hanyan()
    gen_niulai_cinema()
    gen_ultraman_tiga()
    gen_gf_happy_smile()
    gen_gf_moonlight_muse()
    print("Completed 33 images generation!")

if __name__ == '__main__':
    run_all()


