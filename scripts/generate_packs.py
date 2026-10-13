# scripts/generate_packs.py
# -*- coding: utf-8 -*-
"""
腾讯设计级 80% 拟真原创透明底香烟立面原画生成器
尺寸：720 × 1160 px (RGBA 纯净透明底，出厂全新平整无皱痕，外沿 0 杂色)
全系列 33 款烟盒严格统一图标与徽章坐标尺寸规范：
- 徽章外框：中心 (360, 556)，尺寸 420 × 396 px (Y: 358 ~ 754)
- 中心图标圆徽：中心 (360, 468)，尺寸 140 × 140 px (半径 R = 70 px, Y: 398 ~ 538)
- 品牌主标题：中心 (360, 600)
- 品牌副标题：中心 (360, 656)
   - 底部印章/铭牌：中心 (360, 708)，印章框尺寸 196 × 34 px
- 下部警示区：移除横穿分割线，四级高反差文字 (Y = 824, 900, 974, 1048)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 720, 1160
CX = W // 2       # 360
LID_Y = 336       # 对应 168rpx 翻盖分割线

# ==================== 全馆统一黄金坐标与尺寸常量 ====================
BADGE_CY = 556
BADGE_W = 420
BADGE_H = 396     # 纵向范围 Y: 358 ~ 754

ICON_CX = 360
ICON_CY = 468
ICON_R = 70       # 统一图标尺寸 140 × 140 px (纵向范围 Y: 398 ~ 538)

TITLE_Y = 600
SUBTITLE_Y = 656
TAG_Y = 708
STAMP_W, STAMP_H = 196, 34

WARN_Y_HDR = 824
WARN_Y_MAIN = 900
WARN_Y_SUB = 974
WARN_Y_EXTRA = 1048

OUTPUT_DIR = "E:/WeChatProjects/just-one-smoke/images/packs"

os.makedirs(OUTPUT_DIR, exist_ok=True)
BOX = (0, 0, W - 1, H - 1) # 100% 满幅 720x1160 盒体，严丝合缝对齐 360x580rpx 3D 容器

def save_pack(im, filename):
    out_path = os.path.join(OUTPUT_DIR, filename)
    scaled = im.resize((540, 870), Image.Resampling.LANCZOS)
    q = scaled.quantize(colors=256, method=Image.FASTOCTREE)
    q.save(out_path, optimize=True, compress_level=9)

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

f_large = get_font(56, True)
f_med = get_font(38, True)
f_eng = get_font(25, True)
f_small = get_font(22, True)
f_tag = get_font(19, True)
f_warn_hdr = get_font(28, True)
f_warn_main = get_font(50, True)
f_warn_sub = get_font(34, True)
f_warn_extra = get_font(22, True) # 加粗底行字，确保缩放后依然锐利清晰

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
        g_draw.line([(x0, y0 + i), (x1, y0 + i)], fill=(r, g, b, 255))
        
    grad.putalpha(mask)
    im.paste(grad, (0, 0), grad)
    return im

def add_crease_and_seal(im, seal_color=(245, 158, 11, 240), seal_text="原厂封签"):
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
    draw.rounded_rectangle(seal_box, radius=6, fill=seal_color, outline=(255, 255, 255, 200), width=1)
    draw.text((W // 2, y0 + 14 + seal_h // 2), seal_text, fill=(255, 255, 255, 255), font=f_small, anchor="mm")
    
    # 确保所有分色块烟盒统一保留圆角透明遮罩
    mask = Image.new("L", (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(BOX, radius=24, fill=255)
    im.putalpha(mask)
    draw = ImageDraw.Draw(im)

    # 外框高光描边
    draw.rounded_rectangle(BOX, radius=24, outline=(255, 255, 255, 65), width=2)

# 【视觉铁律】彻底移除下部横穿分割线与底部背景色块，四级文字高反差清晰呈现
def add_warning(
    im,
    warn_title="本公司提示",
    warn_main="吸烟有害健康",
    warn_sub="请勿在禁烟场所吸烟",
    warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
    divider_color=None,
    warn_bg=None,
    text_color_hdr=(254, 240, 138, 255),
    text_color_main=(255, 255, 255, 255),
    text_color_sub=(241, 245, 249, 255),
    text_color_extra=(254, 243, 199, 245)
):
    draw = ImageDraw.Draw(im)
    # 严格不绘制任何横穿分割线与背景色块，直接以高对比度四级阶梯权威排版呈现
    draw.text((CX, WARN_Y_HDR), warn_title, fill=text_color_hdr, font=f_warn_hdr, anchor="mm")
    draw.text((CX, WARN_Y_MAIN), warn_main, fill=text_color_main, font=f_warn_main, anchor="mm")
    draw.text((CX, WARN_Y_SUB), warn_sub, fill=text_color_sub, font=f_warn_sub, anchor="mm")
    draw.text((CX, WARN_Y_EXTRA), warn_extra, fill=text_color_extra, font=f_warn_extra, anchor="mm")

def draw_badge_frame(draw, center_y=BADGE_CY, width=BADGE_W, height=BADGE_H, fill_color=(24, 24, 27, 220), border_color=(245, 158, 11, 230)):
    """全系列烟盒统一中心与尺寸的徽章大外框：(360, 556)，420 × 396 px"""
    cx = CX
    cy = BADGE_CY
    w = BADGE_W
    h = BADGE_H
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw.rounded_rectangle(box, radius=18, fill=fill_color, outline=border_color, width=3)
    inner = (box[0] + 6, box[1] + 6, box[2] - 6, box[3] - 6)
    draw.rounded_rectangle(inner, radius=13, outline=border_color, width=1)
    return box

def draw_icon_medallion(draw, fill_color, border_color, inner_border=None):
    """全系列烟盒统一中心 (360, 468) 与尺寸 140 × 140 px (R=70) 的品牌图标圆徽底座"""
    cx, cy, r = ICON_CX, ICON_CY, ICON_R
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill_color, outline=border_color, width=3)
    ir = r - 7
    draw.ellipse((cx - ir, cy - ir, cx + ir, cy + ir), outline=inner_border if inner_border else border_color, width=1)

def draw_stamp_pill(draw, text, fill_color, border_color=(254, 240, 138, 255), text_color=(255, 255, 255, 255)):
    """在统一 TAG_Y = 708 处绘制 148 × 34 px 精品印章胶囊"""
    x0 = CX - STAMP_W // 2
    y0 = TAG_Y - STAMP_H // 2
    draw.rounded_rectangle((x0, y0, x0 + STAMP_W, y0 + STAMP_H), radius=6, fill=fill_color, outline=border_color, width=1)
    draw.text((CX, TAG_Y), text, fill=text_color, font=f_tag, anchor="mm")

# ==================== 腾讯设计级 矢量原创品牌图腾绘制函数 (严格居中收敛于 140×140 R=70 圆徽内) ====================

def draw_tiananmen_vector(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255), red_color=(185, 28, 28, 255), bg_fill=(127, 29, 29, 255)):
    """绘制高精细度中国古典城楼/天安门城楼矢量图腾 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, bg_fill, gold_color)
    # 1. 顶层重檐庑殿顶
    roof1 = [
        (cx, cy - 42),
        (cx - 38, cy - 24),
        (cx - 46, cy - 27),
        (cx - 34, cy - 18),
        (cx + 34, cy - 18),
        (cx + 46, cy - 27),
        (cx + 38, cy - 24)
    ]
    draw.polygon(roof1, fill=gold_color)
    # 2. 楼阁柱廊中间层
    draw.rectangle((cx - 30, cy - 18, cx + 30, cy - 6), fill=red_color, outline=gold_color, width=1)
    for col_x in range(cx - 24, cx + 26, 8):
        draw.line([(col_x, cy - 18), (col_x, cy - 6)], fill=gold_color, width=2)
    # 3. 下层大飞檐
    roof2 = [
        (cx - 46, cy - 6),
        (cx - 54, cy - 9),
        (cx - 42, cy + 2),
        (cx + 42, cy + 2),
        (cx + 54, cy - 9),
        (cx + 46, cy - 6)
    ]
    draw.polygon(roof2, fill=gold_color)
    # 4. 须弥座高大城台
    draw.rectangle((cx - 48, cy + 2, cx + 48, cy + 26), fill=red_color, outline=gold_color, width=2)
    draw.line([(cx - 48, cy + 8), (cx + 48, cy + 8)], fill=gold_color, width=1)
    # 5. 五座拱形城门洞
    arch_specs = [(-32, 6, 10), (-16, 7, 12), (0, 9, 15), (16, 7, 12), (32, 6, 10)]
    for ox, aw, ah in arch_specs:
        draw.rounded_rectangle((cx + ox - aw // 2, cy + 26 - ah, cx + ox + aw // 2, cy + 26), radius=aw // 2, fill=gold_color)

def draw_furongwang_crown(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255), ruby_color=(225, 29, 72, 255)):
    """绘制芙蓉王皇家 5 峰金王冠与皇室圆盾徽 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (23, 37, 84, 255), gold_color)
    # 内部皇室盾纹
    shield_pts = [
        (cx - 44, cy - 34),
        (cx + 44, cy - 34),
        (cx + 44, cy + 6),
        (cx, cy + 44),
        (cx - 44, cy + 6)
    ]
    draw.polygon(shield_pts, fill=(30, 58, 138, 255), outline=gold_color, width=2)
    # 5 峰立式金王冠
    draw.rectangle((cx - 34, cy + 10, cx + 34, cy + 18), fill=gold_color)
    draw.line([(cx - 34, cy + 14), (cx + 34, cy + 14)], fill=ruby_color, width=2)
    crown_pts = [
        (cx - 34, cy + 10),
        (cx - 34, cy - 10),
        (cx - 20, cy + 2),
        (cx - 14, cy - 20),
        (cx - 5, cy + 4),
        (cx, cy - 28),
        (cx + 5, cy + 4),
        (cx + 14, cy - 20),
        (cx + 20, cy + 2),
        (cx + 34, cy - 10),
        (cx + 34, cy + 10)
    ]
    draw.polygon(crown_pts, fill=gold_color)
    for px, py in [(cx - 34, cy - 12), (cx - 14, cy - 22), (cx, cy - 30), (cx + 14, cy - 22), (cx + 34, cy - 12)]:
        draw.ellipse((px - 3, py - 3, px + 3, py + 3), fill=(255, 255, 255, 255))
    draw.ellipse((cx - 4, cy + 11, cx + 4, cy + 17), fill=ruby_color)

def draw_baisha_cranes_vector(draw, cx=ICON_CX, cy=ICON_CY, white_color=(255, 255, 255, 255), gold_color=(245, 158, 11, 255)):
    """绘制白沙经典双鹤翔天 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (30, 58, 138, 255), gold_color, (255, 255, 255, 180))
    # 朝阳金轮
    draw.ellipse((cx - 42, cy - 42, cx + 42, cy + 42), fill=(245, 158, 11, 240))
    # 仙鹤 1 (向左上翱翔)
    c1_x, c1_y = cx - 14, cy - 10
    wing1 = [
        (c1_x - 32, c1_y - 24),
        (c1_x - 6, c1_y - 10),
        (c1_x + 12, c1_y - 22),
        (c1_x + 4, c1_y - 3),
        (c1_x + 20, c1_y + 14),
        (c1_x - 4, c1_y + 4),
        (c1_x - 16, c1_y - 2)
    ]
    draw.polygon(wing1, fill=white_color)
    draw.line([(c1_x - 6, c1_y - 10), (c1_x - 16, c1_y - 26)], fill=white_color, width=3)
    draw.ellipse((c1_x - 18, c1_y - 28, c1_x - 14, c1_y - 24), fill=(220, 38, 38, 255))
    # 仙鹤 2 (向右下伴飞)
    c2_x, c2_y = cx + 18, cy + 16
    wing2 = [
        (c2_x - 12, c2_y - 18),
        (c2_x + 6, c2_y - 7),
        (c2_x + 28, c2_y - 14),
        (c2_x + 12, c2_y + 4),
        (c2_x + 22, c2_y + 16),
        (c2_x, c2_y + 6)
    ]
    draw.polygon(wing2, fill=white_color)
    draw.line([(c2_x + 6, c2_y - 7), (c2_x + 14, c2_y - 20)], fill=white_color, width=3)
    draw.ellipse((c2_x + 13, c2_y - 22, c2_x + 17, c2_y - 18), fill=(220, 38, 38, 255))

def draw_marlboro_frost(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制万宝路 ICE BLAST 冰晶山形与极寒 V 棱镜 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (8, 47, 73, 255), (34, 211, 238, 255), (186, 230, 253, 200))
    v_top = cy - 38
    v_pts = [
        (cx - 46, v_top),
        (cx, v_top + 24),
        (cx + 46, v_top),
        (cx + 46, v_top + 16),
        (cx, v_top + 40),
        (cx - 46, v_top + 16)
    ]
    draw.polygon(v_pts, fill=(34, 211, 238, 255), outline=(255, 255, 255, 240), width=1)
    ic_cx, ic_cy = cx, cy + 24
    draw.ellipse((ic_cx - 20, ic_cy - 20, ic_cx + 20, ic_cy + 20), fill=(14, 116, 144, 255), outline=(103, 232, 249, 255), width=2)
    for angle_deg in [0, 60, 120, 180, 240, 300]:
        rad = math.radians(angle_deg)
        x2 = ic_cx + 14 * math.cos(rad)
        y2 = ic_cy + 14 * math.sin(rad)
        draw.line([(ic_cx, ic_cy), (x2, y2)], fill=(255, 255, 255, 255), width=2)

def draw_crane_tower_pagoda(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255), bg_fill=(23, 37, 84, 255)):
    """绘制黄鹤楼三重檐古楼阁矢量图腾 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, bg_fill, gold_color)
    draw.ellipse((cx - 3, cy - 48, cx + 3, cy - 42), fill=gold_color)
    draw.line([(cx, cy - 42), (cx, cy - 34)], fill=gold_color, width=3)
    
    roof3 = [(cx, cy - 36), (cx - 26, cy - 24), (cx - 34, cy - 27), (cx - 20, cy - 18), (cx + 20, cy - 18), (cx + 34, cy - 27), (cx + 26, cy - 24)]
    draw.polygon(roof3, fill=gold_color)
    draw.rectangle((cx - 16, cy - 18, cx + 16, cy - 10), fill=bg_fill, outline=gold_color, width=1)
    
    roof2 = [(cx, cy - 14), (cx - 38, cy - 2), (cx - 46, cy - 5), (cx - 30, cy + 4), (cx + 30, cy + 4), (cx + 46, cy - 5), (cx + 38, cy - 2)]
    draw.polygon(roof2, fill=gold_color)
    draw.rectangle((cx - 26, cy + 4, cx + 26, cy + 15), fill=bg_fill, outline=gold_color, width=1)
    for col_x in [cx - 16, cx - 5, cx + 5, cx + 16]:
        draw.line([(col_x, cy + 4), (col_x, cy + 15)], fill=gold_color, width=2)
        
    roof1 = [(cx, cy + 11), (cx - 48, cy + 22), (cx - 56, cy + 19), (cx - 40, cy + 28), (cx + 40, cy + 28), (cx + 56, cy + 19), (cx + 48, cy + 22)]
    draw.polygon(roof1, fill=gold_color)
    draw.rectangle((cx - 38, cy + 28, cx + 38, cy + 38), fill=gold_color)

def draw_hehua_lotus_vector(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制荷花·钻石经典荷花花瓣图腾 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (240, 253, 244, 255), (22, 163, 74, 255), (234, 179, 8, 220))
    leaf = [
        (cx - 46, cy + 20),
        (cx - 24, cy + 30),
        (cx, cy + 28),
        (cx + 24, cy + 30),
        (cx + 46, cy + 20),
        (cx, cy + 16)
    ]
    draw.polygon(leaf, fill=(22, 101, 52, 255), outline=(34, 197, 94, 240), width=1)
    draw.polygon([(cx, cy + 16), (cx - 40, cy + 2), (cx - 30, cy - 22), (cx - 12, cy - 6)], fill=(244, 114, 182, 240), outline=(225, 29, 72, 240), width=1)
    draw.polygon([(cx, cy + 16), (cx + 40, cy + 2), (cx + 30, cy - 22), (cx + 12, cy - 6)], fill=(244, 114, 182, 240), outline=(225, 29, 72, 240), width=1)
    draw.polygon([(cx, cy + 18), (cx - 24, cy - 6), (cx - 15, cy - 32), (cx, cy - 14)], fill=(251, 113, 133, 255), outline=(225, 29, 72, 240), width=1)
    draw.polygon([(cx, cy + 18), (cx + 24, cy - 6), (cx + 15, cy - 32), (cx, cy - 14)], fill=(251, 113, 133, 255), outline=(225, 29, 72, 240), width=1)
    draw.polygon([(cx, cy + 18), (cx - 10, cy - 12), (cx, cy - 42), (cx + 10, cy - 12)], fill=(255, 228, 230, 255), outline=(225, 29, 72, 255), width=2)

def draw_kuanzhai_gate_vector(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制宽窄·五粮浓香青瓦四合院门楼 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (15, 23, 42, 255), (245, 158, 11, 255), (148, 163, 184, 200))
    roof = [
        (cx, cy - 40),
        (cx - 48, cy - 20),
        (cx - 56, cy - 24),
        (cx - 40, cy - 10),
        (cx + 40, cy - 10),
        (cx + 56, cy - 24),
        (cx + 48, cy - 20)
    ]
    draw.polygon(roof, fill=(51, 65, 85, 255), outline=(203, 213, 225, 255), width=2)
    draw.rectangle((cx - 36, cy - 10, cx + 36, cy + 32), fill=(30, 41, 59, 255), outline=(245, 158, 11, 240), width=2)
    draw.line([(cx, cy - 10), (cx, cy + 32)], fill=(245, 158, 11, 220), width=2)
    draw.ellipse((cx - 22, cy + 2, cx - 8, cy + 16), outline=(254, 240, 138, 255), width=2)
    draw.ellipse((cx + 8, cy + 2, cx + 22, cy + 16), outline=(254, 240, 138, 255), width=2)

def draw_hetianxia_clouds_vector(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255)):
    """绘制和天下极致和境祥云如意金纹 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (46, 16, 101, 255), gold_color)
    draw.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), fill=(88, 28, 135, 255), outline=gold_color, width=2)
    draw.text((cx, cy), "和", fill=gold_color, font=f_med, anchor="mm")
    draw.arc((cx - 56, cy - 18, cx - 26, cy + 18), start=60, end=300, fill=gold_color, width=3)
    draw.arc((cx + 26, cy - 18, cx + 56, cy + 18), start=-120, end=120, fill=gold_color, width=3)

def draw_nanyang_shuangxi_vector(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255)):
    """绘制南洋双喜传统金色八宝同心圆徽与居中囍字 (统一 140×140 圆徽，无重叠)"""
    draw_icon_medallion(draw, (112, 26, 40, 255), gold_color)
    for angle_deg in range(0, 360, 45):
        rad = math.radians(angle_deg)
        x1 = cx + 42 * math.cos(rad)
        y1 = cy + 42 * math.sin(rad)
        x2 = cx + 58 * math.cos(rad)
        y2 = cy + 58 * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=gold_color, width=2)
    draw.ellipse((cx - 44, cy - 44, cx + 44, cy + 44), fill=(136, 19, 55, 255), outline=gold_color, width=2)
    draw.text((cx, cy), "囍", fill=gold_color, font=get_font(54, True), anchor="mm")

def draw_sobranie_eagle_vector(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255)):
    """绘制寿百年·黑俄英伦双翼皇室雄鹰冠徽 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (15, 15, 20, 255), gold_color)
    draw.polygon([(cx - 12, cy - 34), (cx - 8, cy - 24), (cx, cy - 36), (cx + 8, cy - 24), (cx + 12, cy - 34), (cx + 8, cy - 20), (cx - 8, cy - 20)], fill=gold_color)
    left_wing = [
        (cx, cy - 14),
        (cx - 20, cy - 28),
        (cx - 46, cy - 24),
        (cx - 54, cy - 10),
        (cx - 40, cy),
        (cx - 16, cy - 2),
        (cx, cy + 4)
    ]
    right_wing = [
        (cx, cy - 14),
        (cx + 20, cy - 28),
        (cx + 46, cy - 24),
        (cx + 54, cy - 10),
        (cx + 40, cy),
        (cx + 16, cy - 2),
        (cx, cy + 4)
    ]
    draw.polygon(left_wing, fill=gold_color)
    draw.polygon(right_wing, fill=gold_color)
    draw.polygon([(cx - 12, cy - 8), (cx + 12, cy - 8), (cx + 12, cy + 14), (cx, cy + 26), (cx - 12, cy + 14)], fill=(185, 28, 28, 255), outline=gold_color, width=1)
    draw.line([(cx - 18, cy + 18), (cx - 30, cy + 26)], fill=gold_color, width=2)
    draw.line([(cx + 18, cy + 18), (cx + 30, cy + 26)], fill=gold_color, width=2)

def draw_nanjing_bixie_vector(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255)):
    """绘制南京古都金陵天禄辟邪神兽图腾 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (88, 12, 36, 255), gold_color)
    body_pts = [
        (cx - 30, cy + 20),
        (cx - 20, cy + 4),
        (cx - 28, cy - 14),
        (cx - 8, cy - 12),
        (cx + 4, cy - 28),
        (cx + 20, cy - 30),
        (cx + 28, cy - 18),
        (cx + 20, cy - 8),
        (cx + 26, cy + 20),
        (cx + 14, cy + 20),
        (cx + 8, cy + 6),
        (cx - 10, cy + 8),
        (cx - 16, cy + 20)
    ]
    draw.polygon(body_pts, fill=gold_color)
    draw.arc((cx - 42, cy - 10, cx - 18, cy + 22), start=90, end=270, fill=gold_color, width=3)

def draw_yuxi_ruby_vector(draw, cx=ICON_CX, cy=ICON_CY, gold_color=(254, 240, 138, 255), ruby_color=(190, 18, 60, 255)):
    """绘制玉溪经典红宝石菱形几何徽记 (统一 140×140 圆徽)"""
    draw_icon_medallion(draw, (255, 241, 242, 255), ruby_color, gold_color)
    draw.polygon([(cx, cy - 46), (cx + 46, cy), (cx, cy + 46), (cx - 46, cy)], fill=ruby_color, outline=gold_color, width=2)
    draw.polygon([(cx, cy - 34), (cx + 34, cy), (cx, cy + 34), (cx - 34, cy)], fill=(225, 29, 72, 255), outline=(255, 255, 255, 230), width=1)
    draw.text((cx, cy), "玉", fill=gold_color, font=f_med, anchor="mm")

# ==================== 33 款名烟原创绘制逻辑 (全馆统一坐标与图标尺寸) ====================

def gen_pure_zen():
    im = create_base((2, 132, 199), (5, 150, 105))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (16, 185, 129, 240), "纯净氧舱")
    
    draw_badge_frame(draw, fill_color=(3, 105, 161, 210), border_color=(103, 232, 249, 240))
    # 统一 140×140 纯净氧舱几何光环圆徽 (360, 468, R=70)
    draw_icon_medallion(draw, (2, 132, 199, 255), (103, 232, 249, 255), (255, 255, 255, 220))
    for r in [52, 36, 20]:
        draw.ellipse((ICON_CX - r, ICON_CY - r, ICON_CX + r, ICON_CY + r), outline=(224, 242, 254, 230), width=2)
    draw.ellipse((ICON_CX - 8, ICON_CY - 8, ICON_CX + 8, ICON_CY + 8), fill=(255, 255, 255, 255))
    
    draw.text((CX, TITLE_Y), "ZEN · 纯氧", fill=(255, 255, 255, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "PURE OXYGEN · 无烟之境", fill=(224, 242, 254, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "100% 零焦油氧舱", (5, 150, 105, 255), (167, 243, 208, 255))
    
    add_warning(
        im,
        warn_title="健康生活提示",
        warn_main="告别焦油毒害",
        warn_sub="呼吸大自然纯净清氧",
        warn_extra="100% 纯氧无烟境界 · 拥抱健康肺功能",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(224, 242, 254, 255),
        text_color_extra=(254, 249, 195, 255)
    )
    save_pack(im, "pure_zen.png")

def gen_baisha():
    im = create_base((255, 255, 255), (226, 232, 240))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (37, 99, 235, 240), "双鹤吉祥")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 245), border_color=(37, 99, 235, 230))
    draw_baisha_cranes_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "白 沙", fill=(30, 58, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "BAISHA · 软白经典", fill=(37, 99, 235, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "鹤舞白沙 · 飞翔", (37, 99, 235, 255), (245, 158, 11, 255))
    
    add_warning(
        im,
        text_color_hdr=(30, 64, 175, 255),
        text_color_main=(15, 23, 42, 255),
        text_color_sub=(30, 58, 138, 255),
        text_color_extra=(51, 65, 85, 255)
    )
    save_pack(im, "baisha.png")

def gen_hongtashan():
    im = create_base((255, 253, 248), (245, 240, 230))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "红塔经典")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(220, 38, 38, 230))
    # 统一 140×140 红日白塔圆徽
    draw_icon_medallion(draw, (220, 38, 38, 255), (245, 158, 11, 255), (254, 240, 138, 230))
    draw.polygon([(ICON_CX, ICON_CY - 48), (ICON_CX - 22, ICON_CY + 38), (ICON_CX + 22, ICON_CY + 38)], fill=(255, 255, 255, 255))
    for ty in [ICON_CY - 22, ICON_CY - 4, ICON_CY + 14]:
        tw = 10 + (ty - (ICON_CY - 30)) // 2
        draw.line([(ICON_CX - tw, ty), (ICON_CX + tw, ty)], fill=(220, 38, 38, 220), width=2)
    draw.rectangle((ICON_CX - 28, ICON_CY + 36, ICON_CX + 28, ICON_CY + 44), fill=(254, 240, 138, 255))
    
    draw.text((CX, TITLE_Y), "紅 塔 山", fill=(185, 28, 28, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HONGTASHAN · 1956", fill=(120, 53, 15, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "山高人为峰 · 传奇", (185, 28, 28, 255), (245, 158, 11, 255))
    
    add_warning(
        im,
        text_color_hdr=(180, 83, 9, 255),
        text_color_main=(185, 28, 28, 255),
        text_color_sub=(68, 64, 60, 255),
        text_color_extra=(87, 83, 78, 255)
    )
    save_pack(im, "hongtashan.png")

def gen_shuangxi():
    im = create_base((190, 18, 60), (159, 18, 57))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "百年双喜")
    
    draw_badge_frame(draw, fill_color=(136, 19, 55, 235), border_color=(245, 158, 11, 240))
    draw_icon_medallion(draw, (159, 18, 57, 255), (254, 240, 138, 255), (245, 158, 11, 220))
    draw.text((ICON_CX, ICON_CY), "囍", fill=(254, 240, 138, 255), font=get_font(74, True), anchor="mm")
    
    draw.text((CX, TITLE_Y), "紅 雙 喜", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "DOUBLE HAPPINESS", fill=(255, 255, 255, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "喜庆百年 · 经典软红", (185, 28, 28, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "shuangxi.png")

def gen_zhongnanhai():
    im = create_base((255, 255, 255), (241, 245, 249))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (37, 99, 235, 240), "低焦特选")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(37, 99, 235, 220))
    # 统一 140×140 中南海红蓝速度圆徽
    draw_icon_medallion(draw, (248, 250, 252, 255), (37, 99, 235, 255), (220, 38, 38, 220))
    draw.rectangle((ICON_CX - 46, ICON_CY - 28, ICON_CX + 46, ICON_CY - 18), fill=(220, 38, 38, 255))
    draw.rectangle((ICON_CX - 46, ICON_CY - 13, ICON_CX + 46, ICON_CY - 5), fill=(37, 99, 235, 255))
    draw.text((ICON_CX, ICON_CY + 20), "8mg", fill=(30, 58, 138, 255), font=get_font(36, True), anchor="mm")
    
    draw.text((CX, TITLE_Y), "中 南 海", fill=(15, 23, 42, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "ZHONGNANHAI · 8mg", fill=(37, 99, 235, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "混合型低焦经典", (37, 99, 235, 255), (147, 197, 253, 255))
    
    add_warning(
        im,
        text_color_hdr=(185, 28, 28, 255),
        text_color_main=(15, 23, 42, 255),
        text_color_sub=(30, 58, 138, 255),
        text_color_extra=(51, 65, 85, 255)
    )
    save_pack(im, "zhongnanhai.png")

def gen_hong_nanjing():
    im = create_base((136, 19, 55), (112, 26, 40))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "金陵名品")
    
    draw_badge_frame(draw, fill_color=(112, 26, 40, 235), border_color=(245, 158, 11, 240))
    draw_nanjing_bixie_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "南 京", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "NANJING · 特醇红南京", fill=(255, 255, 255, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "金陵天禄辟邪印", (153, 27, 27, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "hong_nanjing.png")

def gen_chaotianmen():
    im = create_base((217, 119, 6), (146, 64, 14))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "金樽名门")
    
    draw_badge_frame(draw, fill_color=(120, 53, 15, 235), border_color=(254, 240, 138, 240))
    draw_tiananmen_vector(draw, ICON_CX, ICON_CY, bg_fill=(92, 40, 10, 255))
    draw.text((CX, TITLE_Y), "朝 天 門", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "CHAOTIANMEN · 金樽", fill=(255, 255, 255, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "两江汇流 · 山城名门", (185, 28, 28, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(254, 243, 199, 255),
        text_color_extra=(253, 230, 138, 255)
    )
    save_pack(im, "chaotianmen.png")

def gen_liqun():
    im = create_base((241, 245, 249), (226, 232, 240))
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    # 翻盖区经典利群红，与 LID_Y 严丝合缝对齐，杜绝盒身中间横穿分割线
    draw.rectangle((x0, y0, x1, LID_Y), fill=(185, 28, 28, 255))
    add_crease_and_seal(im, (245, 158, 11, 240), "浙江名品")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(185, 28, 28, 230))
    # 统一 140×140 利群红金圆徽
    draw_icon_medallion(draw, (185, 28, 28, 255), (245, 158, 11, 255), (254, 240, 138, 240))
    draw.line([(ICON_CX - 48, ICON_CY + 24), (ICON_CX + 48, ICON_CY + 24)], fill=(254, 240, 138, 255), width=3)
    draw.text((ICON_CX, ICON_CY - 6), "利群", fill=(254, 240, 138, 255), font=get_font(44, True), anchor="mm")
    
    draw.text((CX, TITLE_Y), "利 群", fill=(185, 28, 28, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "LIQUN · ROSE & RED", fill=(51, 65, 85, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "让心灵去旅行", (185, 28, 28, 255), (245, 158, 11, 255))
    
    add_warning(
        im,
        text_color_hdr=(185, 28, 28, 255),
        text_color_main=(15, 23, 42, 255),
        text_color_sub=(153, 27, 27, 255),
        text_color_extra=(51, 65, 85, 255)
    )
    save_pack(im, "liqun.png")

def gen_xuanhemen():
    im = create_base((15, 118, 110), (12, 74, 110))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "南京龙纹")
    
    draw_badge_frame(draw, fill_color=(12, 74, 110, 235), border_color=(254, 240, 138, 240))
    # 统一 140×140 炫赫门红方印与冰蓝甜嘴圆徽
    draw_icon_medallion(draw, (15, 118, 110, 255), (254, 240, 138, 255))
    draw.ellipse((ICON_CX - 14, ICON_CY - 48, ICON_CX + 14, ICON_CY - 20), fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=2)
    draw.rectangle((ICON_CX - 32, ICON_CY - 12, ICON_CX + 32, ICON_CY + 42), fill=(185, 28, 28, 255), outline=(254, 240, 138, 255), width=2)
    draw.text((ICON_CX, ICON_CY + 15), "南京", fill=(255, 255, 255, 255), font=f_small, anchor="mm")
    
    draw.text((CX, TITLE_Y), "炫 赫 門", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "NANJING · 细支甜嘴", fill=(224, 242, 254, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "抽烟只抽炫赫门", (185, 28, 28, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "xuanhemen.png")

def gen_ruanlan():
    im = create_base((30, 58, 138), (23, 37, 84))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "千禧名楼")
    
    draw_badge_frame(draw, fill_color=(23, 37, 84, 235), border_color=(245, 158, 11, 240))
    draw_crane_tower_pagoda(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "黄 鹤 楼", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HUANGHELOU · 软蓝", fill=(224, 231, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "天下江山第一楼", (30, 64, 175, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "ruanlan.png")

def gen_yuxi_soft():
    im = create_base((255, 241, 242), (255, 228, 230))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (225, 29, 72, 240), "贡品名品")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(225, 29, 72, 230))
    draw_yuxi_ruby_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "玉 溪", fill=(190, 18, 60, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "YUXI · 经典软包", fill=(159, 18, 57, 240), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "上善若水 · 德行天下", (190, 18, 60, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(159, 18, 57, 255),
        text_color_main=(136, 19, 55, 255),
        text_color_sub=(159, 18, 57, 255),
        text_color_extra=(87, 83, 78, 255)
    )
    save_pack(im, "yuxi_soft.png")

def gen_guiyan():
    im = create_base((9, 9, 11), (24, 24, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "陈皮爆珠")
    
    draw_badge_frame(draw, fill_color=(18, 18, 22, 240), border_color=(245, 158, 11, 230))
    # 统一 140×140 陈皮橙光爆珠圆徽
    draw_icon_medallion(draw, (9, 9, 11, 255), (245, 158, 11, 255), (254, 240, 138, 200))
    draw.arc((ICON_CX - 48, ICON_CY - 48, ICON_CX + 48, ICON_CY + 48), start=25, end=155, fill=(245, 158, 11, 240), width=3)
    draw.arc((ICON_CX - 48, ICON_CY - 48, ICON_CX + 48, ICON_CY + 48), start=205, end=335, fill=(245, 158, 11, 200), width=2)
    draw.ellipse((ICON_CX - 28, ICON_CY - 28, ICON_CX + 28, ICON_CY + 28), fill=(245, 158, 11, 255), outline=(254, 240, 138, 255), width=3)
    draw.ellipse((ICON_CX - 12, ICON_CY - 14, ICON_CX - 2, ICON_CY - 4), fill=(255, 255, 255, 255))
    
    draw.text((CX, TITLE_Y), "貴 煙", fill=(255, 255, 255, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "GUIYAN · 跨越陈皮爆珠", fill=(245, 158, 11, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "三十年陈皮香珠", (217, 119, 6, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "guiyan.png")

def gen_furongwang():
    im = create_base((217, 119, 6), (180, 83, 9))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (30, 58, 138, 240), "硬黄名品")
    
    draw_badge_frame(draw, fill_color=(30, 58, 138, 235), border_color=(254, 240, 138, 245))
    draw_furongwang_crown(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "芙 蓉 王", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "FURONGWANG · 硬黄", fill=(255, 255, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "传递价值 · 成就你我", (30, 64, 175, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(254, 243, 199, 255),
        text_color_extra=(253, 230, 138, 255)
    )
    save_pack(im, "furongwang.png")

def gen_furongwang_slender():
    im = create_base((254, 240, 138), (202, 138, 4))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (30, 58, 138, 240), "细支硬壳")
    
    draw_badge_frame(draw, fill_color=(30, 58, 138, 240), border_color=(254, 240, 138, 255))
    draw_furongwang_crown(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "芙 蓉 王", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "FURONGWANG · 硬细支", fill=(255, 255, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "皇室金冠 · 本草爆珠", (23, 37, 84, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(153, 27, 27, 255),
        text_color_main=(23, 37, 84, 255),
        text_color_sub=(30, 58, 138, 255),
        text_color_extra=(69, 26, 3, 255)
    )
    save_pack(im, "furongwang_slender.png")

def gen_jiangnan():
    im = create_base((248, 250, 252), (241, 245, 249))
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX
    # 翻盖区水墨黛瓦黑，与 LID_Y 严丝合缝对齐，移除盒身中间横线
    draw.rectangle((x0, y0, x1, LID_Y), fill=(24, 24, 27, 255))
    add_crease_and_seal(im, (16, 185, 129, 240), "龙井茶爆")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(16, 185, 129, 230))
    # 统一 140×140 江南韵水墨茶香圆徽
    draw_icon_medallion(draw, (24, 24, 27, 255), (16, 185, 129, 255), (167, 243, 208, 220))
    draw.ellipse((ICON_CX - 42, ICON_CY - 42, ICON_CX + 42, ICON_CY + 42), outline=(16, 185, 129, 180), width=1)
    draw.ellipse((ICON_CX - 26, ICON_CY - 26, ICON_CX + 26, ICON_CY + 26), fill=(16, 185, 129, 255), outline=(255, 255, 255, 255), width=3)
    draw.ellipse((ICON_CX - 10, ICON_CY - 12, ICON_CX - 2, ICON_CY - 4), fill=(255, 255, 255, 255))
    
    draw.text((CX, TITLE_Y), "江 南 韻", fill=(24, 24, 27, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "JIANGNAN · 龙井桂花爆珠", fill=(5, 150, 105, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "水墨江南 · 龙井茶香", (5, 150, 105, 255), (167, 243, 208, 255))
    
    add_warning(
        im,
        text_color_hdr=(4, 120, 87, 255),
        text_color_main=(24, 24, 27, 255),
        text_color_sub=(6, 95, 70, 255),
        text_color_extra=(63, 63, 70, 255)
    )
    save_pack(im, "jiangnan.png")

def gen_marlboro():
    im = create_base((9, 9, 11), (24, 24, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (6, 182, 212, 240), "ICE BLAST")
    
    draw_badge_frame(draw, fill_color=(15, 23, 42, 235), border_color=(34, 211, 238, 240))
    draw_marlboro_frost(draw, ICON_CX, ICON_CY)
    
    draw.text((CX, TITLE_Y), "Marlboro", fill=(255, 255, 255, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "ICE BLAST · 深海冰蓝", fill=(34, 211, 238, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "极寒冰晶爆珠", (2, 132, 199, 255), (103, 232, 249, 255))
    
    add_warning(im)
    save_pack(im, "marlboro.png")

def gen_hehua():
    im = create_base((220, 252, 231), (187, 247, 208))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (234, 179, 8, 240), "钻石名品")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(22, 163, 74, 230))
    draw_hehua_lotus_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "荷 花", fill=(22, 101, 52, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HEHUA · 钻石经典", fill=(21, 128, 61, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "出淤泥而不染", (22, 101, 52, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(180, 83, 9, 255),
        text_color_main=(20, 83, 45, 255),
        text_color_sub=(22, 101, 52, 255),
        text_color_extra=(21, 94, 117, 255)
    )
    save_pack(im, "hehua.png")

def gen_hongfangyin():
    im = create_base((254, 243, 199), (253, 230, 138))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (220, 38, 38, 240), "乾隆贡烟")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(180, 83, 9, 230))
    # 统一 140×140 乾隆红方印圆徽（修正文字字号确保完全收纳在红印章内）
    draw_icon_medallion(draw, (254, 243, 199, 255), (180, 83, 9, 255), (220, 38, 38, 220))
    draw.rectangle((ICON_CX - 42, ICON_CY - 42, ICON_CX + 42, ICON_CY + 42), fill=(220, 38, 38, 255), outline=(254, 240, 138, 255), width=2)
    draw.text((ICON_CX, ICON_CY), "紅方印", fill=(255, 255, 255, 255), font=get_font(24, True), anchor="mm")
    
    draw.text((CX, TITLE_Y), "黄 山", fill=(120, 53, 15, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HONG FANG YIN · 红方印", fill=(180, 83, 9, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "徽州贡烟 · 焦甜香", (185, 28, 28, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(185, 28, 28, 255),
        text_color_main=(69, 26, 3, 255),
        text_color_sub=(120, 53, 15, 255),
        text_color_extra=(92, 40, 10, 255)
    )
    save_pack(im, "hongfangyin.png")

def gen_kuanzhai():
    im = create_base((51, 65, 85), (30, 41, 59))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "五粮国酒")
    
    draw_badge_frame(draw, fill_color=(30, 41, 59, 235), border_color=(245, 158, 11, 240))
    draw_kuanzhai_gate_vector(draw, ICON_CX, ICON_CY)
    
    draw.text((CX, TITLE_Y), "五粮浓香", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "KUAN ZHAI · 国酒爆珠", fill=(245, 158, 11, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "五粮液浓香陈酿珠", (180, 83, 9, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "kuanzhai.png")

def gen_chunghwa():
    im = create_base((185, 28, 28), (153, 27, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "国烟经典")
    
    draw_badge_frame(draw, fill_color=(153, 27, 27, 235), border_color=(245, 158, 11, 245))
    draw_tiananmen_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "中 華", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "CHUNGHWA · 经典软包", fill=(255, 255, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "★ ★ ★ ★ ★", (185, 28, 28, 255), (254, 240, 138, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "chunghwa.png")

def gen_chunghwa_double():
    im = create_base((220, 38, 38), (153, 27, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "双中支")
    
    draw_badge_frame(draw, fill_color=(153, 27, 27, 235), border_color=(245, 158, 11, 245))
    draw_tiananmen_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "中 華", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "CHUNGHWA · 双中支", fill=(255, 255, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "★ 双腔锡箔尊享 ★", (185, 28, 28, 255), (254, 240, 138, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "chunghwa_double.png")

def gen_hhl1916():
    im = create_base((217, 119, 6), (120, 53, 15))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (120, 53, 15, 240), "1916典藏")
    
    draw_badge_frame(draw, fill_color=(120, 53, 15, 235), border_color=(245, 158, 11, 245))
    draw_crane_tower_pagoda(draw, ICON_CX, ICON_CY, bg_fill=(92, 40, 10, 255))
    draw.text((CX, TITLE_Y), "黃 鶴 樓", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HUANGHELOU · 1916", fill=(255, 255, 255, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "南洋传奇典藏名烟", (146, 64, 14, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(254, 243, 199, 255),
        text_color_extra=(253, 230, 138, 255)
    )
    save_pack(im, "hhl1916.png")

def gen_hetianxia():
    im = create_base((59, 7, 100), (24, 4, 43))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "和天下")
    
    draw_badge_frame(draw, fill_color=(36, 6, 66, 235), border_color=(245, 158, 11, 245))
    draw_hetianxia_clouds_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "和 天 下", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HE TIAN XIA · 极致和境", fill=(233, 213, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "礼之用 · 和为贵", (88, 28, 135, 255), (254, 240, 138, 255))
    
    add_warning(im)
    save_pack(im, "hetianxia.png")

def gen_nanyang_shuangxi():
    im = create_base((136, 19, 55), (76, 5, 25))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "南洋兄弟")
    
    draw_badge_frame(draw, fill_color=(88, 12, 36, 235), border_color=(245, 158, 11, 245))
    draw_nanyang_shuangxi_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "南洋雙喜", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "HONG KONG NANYANG", fill=(255, 255, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "香港百年经典名品", (159, 18, 57, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        warn_title="香港特區政府忠告市民",
        warn_main="吸煙引致肺癌",
        warn_sub="盡早戒煙有益健康",
        warn_extra="戒煙可享受健康生活 · 戒煙熱線: 1833 183"
    )
    save_pack(im, "nanyang_shuangxi.png")

def gen_mevius_blueberry():
    im = create_base((30, 27, 75), (49, 46, 129))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (168, 85, 247, 240), "OPTION 2")
    
    draw_badge_frame(draw, fill_color=(38, 35, 98, 235), border_color=(192, 132, 252, 245))
    # 统一 140×140 蓝莓+薄荷双爆珠圆徽
    draw_icon_medallion(draw, (30, 27, 75, 255), (192, 132, 252, 255), (56, 189, 248, 220))
    draw.ellipse((ICON_CX - 46, ICON_CY - 22, ICON_CX - 2, ICON_CY + 22), fill=(168, 85, 247, 255), outline=(255, 255, 255, 240), width=2)
    draw.ellipse((ICON_CX + 2, ICON_CY - 22, ICON_CX + 46, ICON_CY + 22), fill=(6, 182, 212, 255), outline=(255, 255, 255, 240), width=2)
    draw.ellipse((ICON_CX - 32, ICON_CY - 12, ICON_CX - 22, ICON_CY - 2), fill=(255, 255, 255, 255))
    draw.ellipse((ICON_CX + 16, ICON_CY - 12, ICON_CX + 26, ICON_CY - 2), fill=(255, 255, 255, 255))
    
    draw.text((CX, TITLE_Y), "MEVIUS", fill=(255, 255, 255, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "OPTION · 蓝莓冰薄双爆", fill=(216, 180, 254, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "PREMIUM BLUEBERRY", (109, 40, 217, 255), (192, 132, 252, 255))
    
    add_warning(
        im,
        warn_title="香港特區政府忠告市民",
        warn_main="吸煙引致肺癌",
        warn_sub="請勿在禁煙場所吸煙",
        warn_extra="HKSAR GOVT WARNING: SMOKING CAUSES LUNG CANCER",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(224, 231, 255, 255),
        text_color_extra=(216, 180, 254, 255)
    )
    save_pack(im, "mevius_blueberry.png")

def gen_castor_vanilla():
    im = create_base((254, 249, 195), (254, 240, 138))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (202, 138, 4, 240), "香草5号")
    
    draw_badge_frame(draw, fill_color=(255, 255, 255, 250), border_color=(202, 138, 4, 235))
    # 统一 140×140 卡斯特 5 号圆徽
    draw_icon_medallion(draw, (217, 119, 6, 255), (146, 64, 14, 255), (254, 240, 138, 240))
    draw.text((ICON_CX, ICON_CY), "5", fill=(255, 255, 255, 255), font=get_font(78, True), anchor="mm")
    
    draw.text((CX, TITLE_Y), "CASTOR", fill=(113, 63, 18, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "卡斯特 · 柔和香草奶香", fill=(161, 98, 7, 255), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "马达加斯加香草豆", (180, 83, 9, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        warn_title="香港特區政府忠告市民",
        warn_main="吸煙害己害人",
        warn_sub="盡早戒煙有益健康",
        warn_extra="戒煙可享受健康生活 · 戒煙熱線: 1833 183",
        text_color_hdr=(146, 64, 14, 255),
        text_color_main=(69, 26, 3, 255),
        text_color_sub=(113, 63, 18, 255),
        text_color_extra=(92, 40, 10, 255)
    )
    save_pack(im, "castor_vanilla.png")

def gen_sobranie_black():
    im = create_base((9, 9, 11), (24, 24, 27))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (245, 158, 11, 240), "黑俄先锋")
    
    draw_badge_frame(draw, fill_color=(18, 18, 22, 240), border_color=(245, 158, 11, 245))
    draw_sobranie_eagle_vector(draw, ICON_CX, ICON_CY)
    draw.text((CX, TITLE_Y), "SOBRANIE", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((CX, SUBTITLE_Y), "寿百年 · 伦敦黑俄", fill=(255, 255, 255, 245), font=f_eng, anchor="mm")
    draw_stamp_pill(draw, "BLACK RUSSIAN", (180, 83, 9, 255), (254, 240, 138, 255))
    
    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="尽早戒烟有益健康",
        warn_extra="SMOKING SERIOUSLY DAMAGES HEALTH"
    )
    save_pack(im, "sobranie_black.png")

def draw_cohiba_taino_vector(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制高希霸经典黑金棋盘与泰诺酋长剪影徽章 (统一 140x140 圆框)"""
    draw_icon_medallion(draw, fill_color=(15, 15, 18, 255), border_color=(245, 158, 11, 255), inner_border=(254, 240, 138, 180))
    # 顶部迷你棋盘格装饰弧带
    for col in range(-3, 4):
        dx = cx + col * 14 - 5
        dy = cy - 48
        draw.rectangle((dx, dy, dx + 10, dy + 10), fill=(255, 255, 255, 240))
    # 经典金色泰诺人侧面剪影 + 羽冠
    head_pts = [
        (cx - 8, cy - 22),
        (cx + 16, cy - 20),
        (cx + 22, cy - 8),
        (cx + 28, cy - 2),
        (cx + 20, cy + 4),
        (cx + 22, cy + 14),
        (cx + 12, cy + 22),
        (cx + 8, cy + 36),
        (cx - 14, cy + 36),
        (cx - 12, cy + 16),
        (cx - 20, cy + 2)
    ]
    draw.polygon(head_pts, fill=(245, 158, 11, 255), outline=(254, 240, 138, 255), width=2)
    # 酋长后脑勺三根黄金羽冠
    draw.polygon([(cx - 10, cy - 18), (cx - 38, cy - 30), (cx - 32, cy - 14)], fill=(254, 240, 138, 255))
    draw.polygon([(cx - 14, cy - 8), (cx - 44, cy - 12), (cx - 36, cy + 2)], fill=(245, 158, 11, 255))
    draw.polygon([(cx - 14, cy + 4), (cx - 40, cy + 8), (cx - 30, cy + 18)], fill=(254, 240, 138, 255))


def gen_cohiba():
    # 顶部黑底棋盘格置于翻盖区 (0..LID_Y)，下半部琥珀明黄，无横穿腰线
    im = create_base((15, 15, 18), (217, 119, 6))
    draw = ImageDraw.Draw(im)
    x0, y0, x1, y1 = BOX

    # 翻盖区经典黑底白方块棋盘格 (严格限制在 LID_Y 之上，绝不向下越界)
    dot_w = 24
    for row in range(3):
        for col in range(14):
            dx = x0 + 28 + col * 46
            dy = y0 + 115 + row * 56
            if dy + dot_w < LID_Y - 14:
                draw.rectangle((dx, dy, dx + dot_w, dy + dot_w), fill=(255, 255, 255, 235))

    add_crease_and_seal(im, (245, 158, 11, 245), "HABANA")

    cx = ICON_CX
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, (254, 243, 199, 250), (15, 15, 18, 240))
    draw_cohiba_taino_vector(draw, ICON_CX, ICON_CY)

    draw.text((cx, TITLE_Y), "COHIBA", fill=(15, 15, 18, 255), font=get_font(62, True), anchor="mm")
    draw.text((cx, SUBTITLE_Y), "HABANA, CUBA · 高希霸雪茄", fill=(146, 64, 14, 255), font=get_font(23, True), anchor="mm")
    draw_stamp_pill(draw, "SIGLO VI · 世纪六号", (15, 15, 18, 255), (245, 158, 11, 255), (254, 240, 138, 255))

    add_warning(
        im,
        warn_title="REPÚBLICA DE CUBA · AVISO",
        warn_main="吸烟有害健康",
        warn_sub="尽早戒烟有益健康",
        warn_extra="CIGAR SMOKING IS HAZARDOUS TO HEALTH",
        text_color_hdr=(255, 251, 235, 255),
        text_color_main=(15, 15, 18, 255),
        text_color_sub=(255, 255, 255, 255),
        text_color_extra=(254, 243, 199, 255)
    )
    save_pack(im, "cohiba.png")


def draw_hanyan_horn_vector(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制老辈白纸手卷旱烟喇叭筒矢量图标 (统一居中于 140x140 圆章)"""
    draw_icon_medallion(draw, fill_color=(245, 238, 226, 255), border_color=(140, 83, 25, 235), inner_border=(185, 28, 28, 160))

    # 喇叭筒中心与倾斜轴线（严格收纳在 R=70 圆章内）
    t_top_cx, t_top_cy = cx - 22, cy - 26
    t_bot_cx, t_bot_cy = cx + 32, cy + 34

    # 顶端外溢金黄原叶烟丝
    tobacco_colors = [
        (217, 119, 6, 255),
        (180, 83, 9, 255),
        (120, 53, 15, 255),
        (245, 158, 11, 245),
        (92, 40, 10, 245)
    ]
    import random
    rng = random.Random(42)
    for _ in range(22):
        ox = t_top_cx + rng.uniform(-18, 16)
        oy = t_top_cy + rng.uniform(-6, 6)
        ex = ox + rng.uniform(-12, 10)
        ey = oy - rng.uniform(10, 24)
        color = rng.choice(tobacco_colors)
        w = rng.randint(2, 3)
        draw.line([(ox, oy), (ox + (ex - ox) * 0.5, oy + (ey - oy) * 0.6), (ex, ey)], fill=color, width=w)

    w_top = 34
    w_bot = 16
    dx = t_bot_cx - t_top_cx
    dy = t_bot_cy - t_top_cy
    length = math.hypot(dx, dy)
    nx = -dy / length
    ny = dx / length

    p1 = (t_top_cx - nx * w_top / 2, t_top_cy - ny * w_top / 2)
    p2 = (t_top_cx + nx * w_top / 2, t_top_cy + ny * w_top / 2)
    p3 = (t_bot_cx + nx * w_bot / 2, t_bot_cy + ny * w_bot / 2)
    p4 = (t_bot_cx - nx * w_bot / 2, t_bot_cy - ny * w_bot / 2)

    draw.polygon([p1, p2, p3, p4], fill=(255, 254, 250, 255), outline=(140, 83, 25, 220))

    # 手工卷纸螺旋斜纹
    for frac in [0.25, 0.52, 0.78]:
        sx = t_top_cx + dx * frac - nx * (w_top * (1 - frac) + w_bot * frac) / 2
        sy = t_top_cy + dy * frac - ny * (w_top * (1 - frac) + w_bot * frac) / 2
        ex = t_top_cx + dx * (frac + 0.12) + nx * (w_top * (1 - frac) + w_bot * frac) / 2
        ey = t_top_cy + dy * (frac + 0.12) + ny * (w_top * (1 - frac) + w_bot * frac) / 2
        draw.line([(sx, sy), (ex, ey)], fill=(180, 165, 148, 220), width=2)

    draw.ellipse((t_top_cx - w_top / 2, t_top_cy - 6, t_top_cx + w_top / 2, t_top_cy + 6), fill=(92, 40, 10, 255), outline=(180, 83, 9, 220), width=1)
    draw.ellipse((t_bot_cx - w_bot / 2, t_bot_cy - 4, t_bot_cx + w_bot / 2, t_bot_cy + 4), fill=(245, 245, 244, 255), outline=(140, 83, 25, 200), width=1)


def gen_hand_rolled_hanyan():
    # 老辈白纸卷旱烟：统一徽章框与统一圆章尺寸，彻底消除横线压字与浅底白字问题
    im = create_base((248, 244, 236), (236, 228, 216))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (185, 28, 28, 240), "老輩手捲")

    cx = ICON_CX
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, (253, 251, 247, 250), (140, 83, 25, 210))
    draw_hanyan_horn_vector(draw, ICON_CX, ICON_CY)

    draw.text((cx, TITLE_Y), "老 輩 旱 煙", fill=(41, 37, 36, 255), font=get_font(54, True), anchor="mm")
    draw.text((cx, SUBTITLE_Y), "白 紙 手 捲 · 傳 統 喇 叭 筒", fill=(140, 83, 25, 255), font=get_font(25, True), anchor="mm")
    draw_stamp_pill(draw, "純手工原葉", (185, 28, 28, 245), (220, 38, 38, 255), (255, 255, 255, 255))

    add_warning(
        im,
        warn_title="岁月长辈叮咛",
        warn_main="吸烟有害健康",
        warn_sub="草本辛烈少抽为宜",
        warn_extra="一张白纸一撮烟丝 · 往事回甘莫贪多",
        text_color_hdr=(124, 45, 18, 255),
        text_color_main=(185, 28, 28, 255),
        text_color_sub=(68, 64, 60, 255),
        text_color_extra=(120, 53, 15, 255)
    )
    save_pack(im, "hand_rolled_hanyan.png")


def draw_niulai_cartoon_vector(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制 2D 动画版【牛来】萌金小牛矢量插画（严格收纳于统一 R=70 圆章内）"""
    gold_light = (254, 240, 138, 255)
    amber_main = (245, 158, 11, 255)
    amber_mid = (217, 119, 6, 255)
    brown_line = (69, 26, 3, 255)

    # 统一 R=70 圆盘底座
    draw_icon_medallion(draw, fill_color=(38, 28, 18, 255), border_color=amber_mid, inner_border=(254, 240, 138, 160))

    # 1. 背景招财铜钱祥瑞双环
    for rx_off in [-48, 48]:
        rcx, rcy = cx + rx_off, cy - 10
        draw.ellipse((rcx - 16, rcy - 16, rcx + 16, rcy + 16), fill=(26, 20, 14, 255), outline=gold_light, width=2)
        draw.rectangle((rcx - 5, rcy - 5, rcx + 5, rcy + 5), fill=amber_main, outline=gold_light, width=1)

    # 2. 动画版小牛身体与红金祥瑞披风肚兜
    draw.polygon([
        (cx - 38, cy + 54),
        (cx - 28, cy + 20),
        (cx + 28, cy + 20),
        (cx + 38, cy + 54)
    ], fill=(220, 38, 38, 255), outline=gold_light, width=2)
    draw.line([(cx - 28, cy + 24), (cx, cy + 34), (cx + 28, cy + 24)], fill=gold_light, width=2)
    draw.ellipse((cx - 10, cy + 28, cx + 10, cy + 48), fill=gold_light, outline=brown_line, width=2)
    draw.line([(cx - 6, cy + 40), (cx + 6, cy + 40)], fill=brown_line, width=2)

    # 3. 萌牛双耳
    draw.polygon([(cx - 34, cy - 12), (cx - 62, cy - 22), (cx - 54, cy - 2), (cx - 32, cy - 2)], fill=amber_main, outline=brown_line, width=2)
    draw.polygon([(cx + 34, cy - 12), (cx + 62, cy - 22), (cx + 54, cy - 2), (cx + 32, cy - 2)], fill=amber_main, outline=brown_line, width=2)

    # 4. 圆润新月小金角
    left_horn = [(cx - 20, cy - 32), (cx - 36, cy - 48), (cx - 30, cy - 64), (cx - 18, cy - 60), (cx - 20, cy - 44), (cx - 10, cy - 34)]
    right_horn = [(cx + 20, cy - 32), (cx + 36, cy - 48), (cx + 30, cy - 64), (cx + 18, cy - 60), (cx + 20, cy - 44), (cx + 10, cy - 34)]
    draw.polygon(left_horn, fill=gold_light, outline=brown_line, width=2)
    draw.polygon(right_horn, fill=gold_light, outline=brown_line, width=2)

    # 5. 小金牛圆润脸庞
    draw.rounded_rectangle((cx - 36, cy - 36, cx + 36, cy + 28), radius=26, fill=amber_main, outline=brown_line, width=3)
    draw.polygon([(cx - 12, cy - 34), (cx - 4, cy - 46), (cx, cy - 36), (cx + 6, cy - 48), (cx + 12, cy - 34)], fill=gold_light, outline=brown_line, width=2)

    # 6. 灵动卡通大眼睛与腮红
    for ex in [cx - 16, cx + 16]:
        ey = cy - 10
        draw.ellipse((ex - 9, ey - 11, ex + 9, ey + 11), fill=(255, 255, 255, 255), outline=brown_line, width=2)
        draw.ellipse((ex - 6, ey - 8, ex + 6, ey + 8), fill=(28, 25, 23, 255))
        draw.ellipse((ex - 4, ey - 5, ex + 1, ey - 1), fill=(255, 255, 255, 255))
    draw.ellipse((cx - 30, cy - 2, cx - 20, cy + 5), fill=(239, 68, 68, 255))
    draw.ellipse((cx + 20, cy - 2, cx + 30, cy + 5), fill=(239, 68, 68, 255))

    # 7. 奶黄圆润鼻吻与开心笑容
    draw.rounded_rectangle((cx - 24, cy + 2, cx + 24, cy + 28), radius=14, fill=(254, 243, 199, 255), outline=brown_line, width=2)
    draw.ellipse((cx - 10, cy + 8, cx - 5, cy + 13), fill=brown_line)
    draw.ellipse((cx + 5, cy + 8, cx + 10, cy + 13), fill=brown_line)
    draw.arc((cx - 9, cy + 12, cx + 9, cy + 24), start=15, end=165, fill=(220, 38, 38, 255), width=2)


def gen_niulai_cinema():
    """生成原创非侵权【牛来·鸿运金牛】立面"""
    im = create_base((30, 24, 18), (16, 12, 10))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (217, 119, 6, 240), "牛气冲天")

    cx = ICON_CX
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, (24, 20, 16, 255), (245, 158, 11, 240))
    draw_niulai_cartoon_vector(draw, ICON_CX, ICON_CY)

    draw.text((cx, TITLE_Y), "牛  来", fill=(254, 240, 138, 255), font=get_font(62, True), anchor="mm")
    draw.text((cx, SUBTITLE_Y), "NIULAI · 鸿运金牛 · 牛气冲天", fill=(245, 158, 11, 255), font=get_font(23, True), anchor="mm")
    draw_stamp_pill(draw, "金樽琥珀爆珠", (180, 83, 9, 255), (254, 240, 138, 255), (255, 255, 255, 255))

    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="牛来鸿运步步高 · 愿君早日无烟一身轻",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(253, 224, 71, 255),
        text_color_extra=(254, 215, 170, 255)
    )
    save_pack(im, "niulai_cinema.png")


def draw_diga_aotuman_cartoon_vector(draw, cx=ICON_CX, cy=ICON_CY):
    """绘制 2D 动画版【迪加·凹凸曼】光之英雄矢量插画（严格收纳于统一 R=70 圆章内）"""
    silver_light = (241, 245, 249, 255)
    silver_mid = (203, 213, 225, 255)
    gold_color = (251, 191, 36, 255)
    cyan_glow = (56, 189, 248, 255)
    red_suit = (220, 38, 38, 255)
    purple_suit = (109, 40, 217, 255)
    dark_line = (15, 23, 42, 255)

    # 1. 统一 R=70 深邃星云圆盘
    draw_icon_medallion(draw, fill_color=(30, 27, 75, 255), border_color=cyan_glow, inner_border=gold_color)
    for deg in range(0, 360, 45):
        rad = math.radians(deg)
        x1 = cx + 42 * math.cos(rad)
        y1 = cy + 42 * math.sin(rad)
        x2 = cx + 58 * math.cos(rad)
        y2 = cy + 58 * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=gold_color if deg % 90 == 0 else cyan_glow, width=2)

    # 2. 红紫复合肩甲与半身躯干
    torso_pts = [
        (cx - 52, cy + 24),
        (cx - 38, cy + 54),
        (cx + 38, cy + 54),
        (cx + 52, cy + 24),
        (cx + 34, cy + 12),
        (cx - 34, cy + 12)
    ]
    draw.polygon(torso_pts, fill=red_suit, outline=dark_line, width=2)
    draw.polygon([(cx - 34, cy + 36), (cx, cy + 54), (cx + 34, cy + 36), (cx + 26, cy + 54), (cx - 26, cy + 54)], fill=purple_suit)

    # 3. 黄金 V 型卡通胸甲护翼
    v_chest = [
        (cx - 48, cy + 18),
        (cx, cy + 44),
        (cx + 48, cy + 18),
        (cx + 40, cy + 30),
        (cx, cy + 54),
        (cx - 40, cy + 30)
    ]
    draw.polygon(v_chest, fill=gold_color, outline=(254, 240, 138, 255), width=2)

    # 4. 胸口冰蓝发光彩色能量灯
    draw.ellipse((cx - 10, cy + 26, cx + 10, cy + 46), fill=cyan_glow, outline=(255, 255, 255, 255), width=2)

    # 5. 银白头盔
    draw.rounded_rectangle((cx - 40, cy - 24, cx - 28, cy - 4), radius=4, fill=silver_mid, outline=dark_line, width=2)
    draw.rounded_rectangle((cx + 28, cy - 24, cx + 40, cy - 4), radius=4, fill=silver_mid, outline=dark_line, width=2)

    head_pts = [
        (cx, cy - 58),
        (cx - 28, cy - 44),
        (cx - 34, cy - 16),
        (cx - 24, cy + 10),
        (cx, cy + 20),
        (cx + 24, cy + 10),
        (cx + 34, cy - 16),
        (cx + 28, cy - 44)
    ]
    draw.polygon(head_pts, fill=silver_light, outline=dark_line, width=3)

    # 头顶中脊与冰蓝额头水晶
    draw.polygon([(cx, cy - 64), (cx - 6, cy - 36), (cx, cy - 28), (cx + 6, cy - 36)], fill=silver_mid, outline=dark_line, width=2)
    draw.polygon([(cx, cy - 48), (cx - 5, cy - 38), (cx, cy - 30), (cx + 5, cy - 38)], fill=cyan_glow, outline=(255, 255, 255, 255), width=1)

    # 6. 大号发光鹅黄椭圆复眼
    left_eye = [(cx - 26, cy - 22), (cx - 8, cy - 16), (cx - 9, cy - 4), (cx - 25, cy - 8)]
    right_eye = [(cx + 26, cy - 22), (cx + 8, cy - 16), (cx + 9, cy - 4), (cx + 25, cy - 8)]
    draw.polygon(left_eye, fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=2)
    draw.polygon(right_eye, fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=2)
    draw.line([(cx - 8, cy + 6), (cx + 8, cy + 6)], fill=(100, 116, 139, 255), width=2)


def gen_ultraman_tiga():
    """生成原创非侵权谐音版【迪加·凹凸曼】立面"""
    im = create_base((46, 16, 101), (15, 23, 42))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (2, 132, 199, 240), "化身为光")

    cx = ICON_CX
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, (23, 15, 58, 255), (56, 189, 248, 240))
    draw_diga_aotuman_cartoon_vector(draw, ICON_CX, ICON_CY)

    draw.text((cx, TITLE_Y), "迪加·凹凸曼", fill=(254, 240, 138, 255), font=get_font(54, True), anchor="mm")
    draw.text((cx, SUBTITLE_Y), "DIGA AOTUMAN · 动画光之巨人", fill=(56, 189, 248, 255), font=get_font(23, True), anchor="mm")
    draw_stamp_pill(draw, "奇迹光粒子珠", (2, 132, 199, 255), (254, 240, 138, 255), (255, 255, 255, 255))

    add_warning(
        im,
        warn_title="光之星云提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="相信光的人终将战胜烟瘾 · 拥抱纯净新生",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(186, 230, 253, 255),
        text_color_extra=(125, 211, 252, 255)
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
    """在烟盒两侧边缘绘制高定立式对称健康警示语"""
    font_vert = get_font(21, True)
    cy_start = 442
    spacing = 40

    draw_sparkle_star(draw, 88, cy_start - 24, r=6, color=color)
    for i, ch in enumerate(left_text):
        draw.text((88, cy_start + i * spacing), ch, fill=color, font=font_vert, anchor="mm")
    draw_sparkle_star(draw, 88, cy_start + (len(left_text) - 1) * spacing + 24, r=6, color=color)

    draw_sparkle_star(draw, 632, cy_start - 24, r=6, color=color)
    for i, ch in enumerate(right_text):
        draw.text((632, cy_start + i * spacing), ch, fill=color, font=font_vert, anchor="mm")
    draw_sparkle_star(draw, 632, cy_start + (len(right_text) - 1) * spacing + 24, r=6, color=color)


def gen_gf_happy_smile():
    """生成女友专属恶搞宠爱款 1：【倾城一笑·开心果】（统一 (360, 468) R=70 圆章尺寸）"""
    from PIL import ImageEnhance
    im = create_base((136, 19, 55), (76, 5, 25))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (225, 29, 72, 245), "欢喜冤家")
    draw_bilateral_warnings(draw, color=(254, 240, 138, 235))

    cx = ICON_CX
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, (88, 12, 36, 255), (254, 240, 138, 245))

    draw_sparkle_star(draw, cx - 196, 155, r=11, color=(254, 240, 138, 245))
    draw_sparkle_star(draw, cx + 196, 155, r=11, color=(254, 240, 138, 245))
    draw.text((cx, 155), "专 属 开 心 果 · 荣 耀 典 藏", fill=(254, 240, 138, 245), font=get_font(26, True), anchor="mm")
    draw.text((cx, 206), "SWEETHEART · 一笑解千愁", fill=(253, 164, 175, 230), font=get_font(20, True), anchor="mm")

    asset_path = os.path.join(os.path.dirname(__file__), "assets", "gf_face.jpg")
    face_cy = ICON_CY
    r = ICON_R  # 统一 R=70 (140x140 px)
    draw_icon_medallion(draw, fill_color=(110, 16, 46, 255), border_color=(254, 240, 138, 255), inner_border=(245, 158, 11, 220))
    if os.path.exists(asset_path):
        src = Image.open(asset_path).convert("RGBA")
        sw, sh = src.size
        crop_box = (int(sw * 0.335), int(sh * 0.285), int(sw * 0.795), int(sh * 0.575))
        cropped = src.crop(crop_box)
        cropped = ImageEnhance.Brightness(cropped).enhance(1.12)
        cropped = ImageEnhance.Contrast(cropped).enhance(1.06)
        resized = cropped.resize((r * 2, r * 2), Image.Resampling.LANCZOS)

        mask = Image.new("L", (r * 2, r * 2), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.ellipse((0, 0, r * 2 - 1, r * 2 - 1), fill=255)

        im.paste(resized, (cx - r, face_cy - r), mask)
        draw = ImageDraw.Draw(im)
        draw.ellipse((cx - r, face_cy - r, cx + r, face_cy + r), outline=(254, 240, 138, 255), width=3)
        draw.ellipse((cx - r + 6, face_cy - r + 6, cx + r - 6, face_cy + r - 6), outline=(245, 158, 11, 200), width=1)
        draw_sparkle_star(draw, cx - r - 24, face_cy, r=10, color=(254, 240, 138, 245))
        draw_sparkle_star(draw, cx + r + 24, face_cy, r=10, color=(254, 240, 138, 245))

    draw.text((cx, TITLE_Y), "倾 城 一 笑", fill=(254, 240, 138, 255), font=get_font(54, True), anchor="mm")
    draw.text((cx, SUBTITLE_Y), "SWEETHEART · 专属开心果", fill=(253, 164, 175, 255), font=get_font(22, True), anchor="mm")
    draw_stamp_pill(draw, "蜜桃甜心爆珠", (225, 29, 72, 255), (254, 240, 138, 255), (255, 255, 255, 255))

    add_warning(
        im,
        warn_title="恋爱专属提示",
        warn_main="一笑倾城百媚生",
        warn_sub="少抽香烟多宠她",
        warn_extra="看一眼开心果表情包 · 烦恼烟瘾统统消散",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(253, 164, 175, 255),
        text_color_extra=(254, 205, 211, 255)
    )
    out_path = os.path.join(OUTPUT_DIR, "gf_happy_smile.png")
    im.resize((540, 870), Image.Resampling.LANCZOS).quantize(colors=256, method=Image.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(out_path, optimize=True, compress_level=9)


def gen_gf_moonlight_muse():
    """生成女友专属浪漫款 2：【心动女神·白月光】（统一 (360, 468) R=70 圆章尺寸）"""
    from PIL import ImageEnhance
    im = create_base((255, 250, 252), (252, 231, 243))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, (219, 39, 119, 245), "一生挚爱")
    draw_bilateral_warnings(draw, color=(157, 23, 77, 245))

    cx = ICON_CX
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, (255, 255, 255, 255), (219, 39, 119, 220))

    draw_sparkle_star(draw, cx - 196, 155, r=11, color=(219, 39, 119, 235))
    draw_sparkle_star(draw, cx + 196, 155, r=11, color=(219, 39, 119, 235))
    draw.text((cx, 155), "心 动 女 神 · 岁 月 白 月 光", fill=(157, 23, 77, 255), font=get_font(26, True), anchor="mm")
    draw.text((cx, 206), "MOONLIGHT MUSE · 520 LIMITED", fill=(219, 39, 119, 220), font=get_font(20, True), anchor="mm")

    asset_path = os.path.join(os.path.dirname(__file__), "assets", "gf_full.jpg")
    face_cy = ICON_CY
    r = ICON_R  # 统一 R=70 (140x140 px)
    draw_icon_medallion(draw, fill_color=(255, 245, 248, 255), border_color=(245, 158, 11, 245), inner_border=(244, 114, 182, 200))
    if os.path.exists(asset_path):
        src = Image.open(asset_path).convert("RGBA")
        sw, sh = src.size
        crop_side = int(sh * 0.96)
        cx_src = int(sw * 0.515)
        cx0 = max(0, cx_src - crop_side // 2)
        cy0 = int(sh * 0.02)
        cropped = src.crop((cx0, cy0, cx0 + crop_side, cy0 + crop_side))
        cropped = ImageEnhance.Contrast(cropped).enhance(1.04)
        resized = cropped.resize((r * 2, r * 2), Image.Resampling.LANCZOS)

        mask = Image.new("L", (r * 2, r * 2), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.ellipse((0, 0, r * 2 - 1, r * 2 - 1), fill=255)
        im.paste(resized, (cx - r, face_cy - r), mask)

        draw = ImageDraw.Draw(im)
        draw.ellipse((cx - r, face_cy - r, cx + r, face_cy + r), outline=(245, 158, 11, 245), width=3)
        draw.ellipse((cx - r + 6, face_cy - r + 6, cx + r - 6, face_cy + r - 6), outline=(244, 114, 182, 190), width=1)
        draw_sparkle_star(draw, cx - r - 24, face_cy, r=10, color=(245, 158, 11, 240))
        draw_sparkle_star(draw, cx + r + 24, face_cy, r=10, color=(245, 158, 11, 240))

    draw.text((cx, TITLE_Y), "心 动 女 神", fill=(157, 23, 77, 255), font=get_font(54, True), anchor="mm")
    draw.text((cx, SUBTITLE_Y), "MOONLIGHT · 独家白月光", fill=(219, 39, 119, 240), font=get_font(22, True), anchor="mm")
    draw_stamp_pill(draw, "初恋玫瑰爆珠", (219, 39, 119, 255), (245, 158, 11, 255), (255, 255, 255, 255))

    add_warning(
        im,
        warn_title="浪漫挚爱提示",
        warn_main="仙女颜值超标",
        warn_sub="戒烟省钱宠女神",
        warn_extra="抽烟只抽心动女神 · 一生只宠一个人",
        text_color_hdr=(157, 23, 77, 255),
        text_color_main=(190, 18, 60, 255),
        text_color_sub=(131, 24, 67, 255),
        text_color_extra=(157, 23, 77, 255)
    )
    out_path = os.path.join(OUTPUT_DIR, "gf_moonlight_muse.png")
    im.resize((540, 870), Image.Resampling.LANCZOS).quantize(colors=256, method=Image.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(out_path, optimize=True, compress_level=9)

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


