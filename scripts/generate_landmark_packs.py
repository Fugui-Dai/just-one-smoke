# scripts/generate_landmark_packs.py
# -*- coding: utf-8 -*-
"""
生成世界奇迹名筑系列烟盒原画（含国家标准『吸烟有害健康』权威警示区）：
1. 埃菲尔铁塔 (eiffel_tower.png)
2. 比萨斜塔 (pisa_leaning.png)
3. 吉萨金字塔 (pyramid_giza.png)
4. 东方明珠 (oriental_pearl.png)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

from generate_packs import (
    W, H, CX, LID_Y,
    BADGE_CY, BADGE_W, BADGE_H,
    ICON_CX, ICON_CY, ICON_R,
    TITLE_Y, SUBTITLE_Y, TAG_Y, STAMP_W, STAMP_H,
    OUTPUT_DIR, BOX,
    create_base, add_crease_and_seal, add_warning, draw_badge_frame,
    draw_icon_medallion, draw_stamp_pill, get_font,
    f_large, f_med, f_eng, f_small, f_tag
)

def save_landmark_pack(im, filename):
    out_path = os.path.join(OUTPUT_DIR, filename)
    scaled = im.resize((540, 870), Image.Resampling.LANCZOS)
    q = scaled.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
    q.save(out_path, optimize=True, compress_level=9)
    print(f"Generated {filename} successfully -> {out_path}")

def gen_eiffel_tower():
    """生成：【埃菲尔铁塔 · 浪漫钢构卷】（带吸烟有害健康权威警示）"""
    im = create_base((28, 41, 65), (15, 23, 42))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, seal_color=(29, 78, 216, 245), seal_text="法式钢构")

    cx = ICON_CX
    cy = ICON_CY
    r = ICON_R

    # 徽章大外框
    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, fill_color=(15, 23, 42, 240), border_color=(245, 158, 11, 230))

    # 顶部法式星芒与法文铭文
    draw.text((cx, 155), "T O U R   E I F F E L", fill=(254, 240, 138, 255), font=get_font(26, True), anchor="mm")
    draw.text((cx, 204), "PARIS 1889 · 324M STEEL WONDER", fill=(203, 213, 225, 230), font=get_font(20, True), anchor="mm")

    # 圆徽底座
    draw_icon_medallion(draw, fill_color=(10, 15, 30, 255), border_color=(245, 158, 11, 245), inner_border=(59, 130, 246, 200))

    # 埃菲尔铁塔金色矢量钢构
    gold = (254, 240, 138, 255)
    amber = (245, 158, 11, 240)
    # 避雷针与信标球
    draw.ellipse((cx - 4, cy - 58, cx + 4, cy - 50), fill=(255, 255, 255, 255), outline=gold)
    draw.line([(cx, cy - 50), (cx, cy - 38)], fill=gold, width=3)
    # 3层顶层观景台穹顶
    draw.rounded_rectangle((cx - 10, cy - 38, cx + 10, cy - 32), radius=3, fill=gold)
    # 2至3层修长主塔身
    draw.polygon([(cx - 7, cy - 32), (cx + 7, cy - 32), (cx + 14, cy - 4), (cx - 14, cy - 4)], fill=None, outline=gold, width=2)
    # X 交叉桁架
    draw.line([(cx - 7, cy - 32), (cx + 14, cy - 4)], fill=amber, width=1)
    draw.line([(cx + 7, cy - 32), (cx - 14, cy - 4)], fill=amber, width=1)
    # 2层主观景平台
    draw.rounded_rectangle((cx - 24, cy - 4, cx + 24, cy + 3), radius=2, fill=gold)
    # 1至2层外扩主塔身
    draw.polygon([(cx - 16, cy + 3), (cx + 16, cy + 3), (cx + 36, cy + 35), (cx - 36, cy + 35)], fill=None, outline=gold, width=2)
    draw.line([(cx - 16, cy + 3), (cx + 36, cy + 35)], fill=amber, width=1)
    draw.line([(cx + 16, cy + 3), (cx - 36, cy + 35)], fill=amber, width=1)
    # 1层主平台梁
    draw.rounded_rectangle((cx - 38, cy + 33, cx + 38, cy + 40), radius=3, fill=gold)
    # 底部双曲镂空大拱门
    draw.arc((cx - 28, cy + 24, cx + 28, cy + 58), start=180, end=0, fill=gold, width=3)
    # 左右外展支柱腿
    draw.polygon([(cx - 36, cy + 40), (cx - 24, cy + 40), (cx - 38, cy + 56), (cx - 48, cy + 56)], fill=gold)
    draw.polygon([(cx + 24, cy + 40), (cx + 36, cy + 40), (cx + 48, cy + 56), (cx + 38, cy + 56)], fill=gold)

    # 品牌主标题
    draw.text((cx, TITLE_Y), "埃 菲 尔 铁 塔", fill=(254, 240, 138, 255), font=f_large, anchor="mm")
    draw.text((cx, SUBTITLE_Y), "PARIS 1889 · 法式通天奇观", fill=(226, 232, 240, 240), font=get_font(23, True), anchor="mm")

    # 专属印章
    draw_stamp_pill(draw, "0焦油纯钢构浪漫", fill_color=(29, 78, 216, 255), border_color=(254, 240, 138, 255))

    # 标准权威警示区（严格标注吸烟有害健康）
    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(226, 232, 240, 255),
        text_color_extra=(203, 213, 225, 240)
    )
    save_landmark_pack(im, "eiffel_tower.png")

def gen_pisa_leaning():
    """生成：【比萨斜塔 · 物理斜支卷】（带吸烟有害健康权威警示）"""
    im = create_base((248, 250, 252), (203, 213, 225))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, seal_color=(5, 150, 105, 245), seal_text="八百年不倒")

    cx = ICON_CX
    cy = ICON_CY

    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, fill_color=(255, 255, 255, 245), border_color=(5, 150, 105, 220))

    draw.text((cx, 155), "T O R R E   D I   P I S A", fill=(5, 150, 105, 255), font=get_font(26, True), anchor="mm")
    draw.text((cx, 204), "PISA 1173 · 3.99° LEANING MARBLE", fill=(71, 85, 105, 230), font=get_font(20, True), anchor="mm")

    draw_icon_medallion(draw, fill_color=(241, 245, 249, 255), border_color=(5, 150, 105, 245), inner_border=(203, 213, 225, 200))

    # 倾斜绘制比萨斜塔罗马式圆柱柱廊
    t_im = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(t_im)
    tcx, tcy = 70, 70
    # 顶部钟楼
    t_draw.rounded_rectangle((tcx - 16, tcy - 52, tcx + 16, tcy - 36), radius=4, fill=(226, 232, 240, 255), outline=(5, 150, 105, 255), width=2)
    # 6层大理石回廊
    for tier in range(6):
        ty = tcy - 34 + tier * 13
        t_draw.rectangle((tcx - 26, ty, tcx + 26, ty + 12), fill=(255, 255, 255, 255), outline=(100, 116, 139, 240), width=1)
        for col in range(5):
            cx_c = tcx - 20 + col * 10
            t_draw.line([(cx_c, ty), (cx_c, ty + 12)], fill=(5, 150, 105, 255), width=2)
    # 底座盲拱
    t_draw.rectangle((tcx - 28, tcy + 44, tcx + 28, tcy + 58), fill=(226, 232, 240, 255), outline=(5, 150, 105, 255), width=2)

    # 逆时针微倾 3.99°
    rotated_tower = t_im.rotate(-3.99, resample=Image.Resampling.BICUBIC)
    im.paste(rotated_tower, (cx - 70, cy - 70), rotated_tower)

    draw = ImageDraw.Draw(im)
    draw.text((cx, TITLE_Y), "比 萨 斜 塔", fill=(15, 23, 42, 255), font=f_large, anchor="mm")
    draw.text((cx, SUBTITLE_Y), "PISA 1173 · 意式斜而不倒", fill=(71, 85, 105, 240), font=get_font(23, True), anchor="mm")

    draw_stamp_pill(draw, "斜而不倒人生挺拔", fill_color=(5, 150, 105, 255), border_color=(254, 240, 138, 255))

    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
        text_color_hdr=(5, 150, 105, 255),
        text_color_main=(15, 23, 42, 255),
        text_color_sub=(51, 65, 85, 255),
        text_color_extra=(100, 116, 139, 240)
    )
    save_landmark_pack(im, "pisa_leaning.png")

def gen_pyramid_giza():
    """生成：【吉萨金字塔 · 法老曜金卷】（带吸烟有害健康权威警示）"""
    im = create_base((39, 39, 42), (15, 15, 18))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, seal_color=(217, 119, 6, 245), seal_text="四千年奇迹")

    cx = ICON_CX
    cy = ICON_CY

    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, fill_color=(24, 24, 27, 240), border_color=(245, 158, 11, 230))

    draw.text((cx, 155), "G R E A T   P Y R A M I D", fill=(251, 191, 36, 255), font=get_font(26, True), anchor="mm")
    draw.text((cx, 204), "GIZA BC2560 · ETERNAL PHARAOH", fill=(214, 211, 209, 230), font=get_font(20, True), anchor="mm")

    draw_icon_medallion(draw, fill_color=(12, 12, 14, 255), border_color=(245, 158, 11, 245), inner_border=(217, 119, 6, 200))

    # 吉萨大金字塔与荷鲁斯之眼矢量
    gold = (251, 191, 36, 255)
    amber = (217, 119, 6, 255)
    # 金字塔主体三角形
    draw.polygon([(cx, cy - 46), (cx - 52, cy + 42), (cx + 52, cy + 42)], fill=(24, 24, 27, 255), outline=gold, width=2)
    # 阳面与阴面明暗分割中线
    draw.line([(cx, cy - 46), (cx + 8, cy + 42)], fill=amber, width=2)
    # 顶部黄金锥顶 (Pyramidion)
    draw.polygon([(cx, cy - 46), (cx - 16, cy - 20), (cx + 16, cy - 20)], fill=gold)
    # 阶梯横纹
    for step in range(1, 5):
        sy = cy - 20 + step * 14
        half_w = 16 + step * 8
        draw.line([(cx - half_w, sy), (cx + half_w, sy)], fill=(120, 53, 15, 200), width=1)
    # 荷鲁斯全知之眼
    draw.ellipse((cx - 14, cy + 4, cx + 14, cy + 24), outline=gold, width=2)
    draw.ellipse((cx - 5, cy + 10, cx + 5, cy + 18), fill=gold)

    draw.text((cx, TITLE_Y), "吉 萨 金 字 塔", fill=(251, 191, 36, 255), font=f_large, anchor="mm")
    draw.text((cx, SUBTITLE_Y), "GIZA BC2560 · 尼罗河法老秘藏", fill=(214, 211, 209, 240), font=get_font(23, True), anchor="mm")

    draw_stamp_pill(draw, "拥抱纯净自律", fill_color=(217, 119, 6, 255), border_color=(254, 240, 138, 255))

    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="尽早戒烟有益健康",
        warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(251, 191, 36, 255),
        text_color_extra=(214, 211, 209, 240)
    )
    save_landmark_pack(im, "pyramid_giza.png")

def gen_oriental_pearl():
    """生成：【东方明珠 · 幻彩双爆卷】（带吸烟有害健康权威警示）"""
    im = create_base((131, 24, 67), (30, 3, 14))
    draw = ImageDraw.Draw(im)
    add_crease_and_seal(im, seal_color=(219, 39, 119, 245), seal_text="魔都明珠")

    cx = ICON_CX
    cy = ICON_CY

    draw_badge_frame(draw, BADGE_CY, BADGE_W, BADGE_H, fill_color=(24, 10, 18, 240), border_color=(244, 114, 182, 230))

    draw.text((cx, 155), "O R I E N T A L   P E A R L", fill=(244, 114, 182, 255), font=get_font(26, True), anchor="mm")
    draw.text((cx, 204), "SHANGHAI 1994 · 468M DUAL BEAD", fill=(251, 207, 232, 230), font=get_font(20, True), anchor="mm")

    draw_icon_medallion(draw, fill_color=(20, 5, 12, 255), border_color=(244, 114, 182, 245), inner_border=(219, 39, 119, 200))

    pink = (244, 114, 182, 255)
    rose = (225, 29, 72, 255)
    gold = (254, 240, 138, 255)

    # 东方明珠广播电视塔矢量
    # 顶部发射天线
    draw.line([(cx, cy - 58), (cx, cy - 38)], fill=gold, width=3)
    draw.ellipse((cx - 3, cy - 60, cx + 3, cy - 54), fill=(255, 255, 255, 255))
    # 太空舱小球
    draw.ellipse((cx - 6, cy - 38, cx + 6, cy - 26), fill=pink, outline=gold, width=1)
    # 上立柱
    draw.line([(cx - 3, cy - 26), (cx - 3, cy - 14)], fill=gold, width=2)
    draw.line([(cx + 3, cy - 26), (cx + 3, cy - 14)], fill=gold, width=2)
    # 上球体 (45m 带旋转餐厅光环)
    draw.ellipse((cx - 16, cy - 14, cx + 16, cy + 14), fill=rose, outline=gold, width=2)
    draw.arc((cx - 18, cy - 6, cx + 18, cy + 6), start=0, end=360, fill=(255, 255, 255, 255), width=2)
    # 下部三根巨柱与电梯轴
    draw.line([(cx - 8, cy + 14), (cx - 8, cy + 30)], fill=gold, width=2)
    draw.line([(cx, cy + 14), (cx, cy + 30)], fill=pink, width=2)
    draw.line([(cx + 8, cy + 14), (cx + 8, cy + 30)], fill=gold, width=2)
    # 下球体 (50m 巨球)
    draw.ellipse((cx - 22, cy + 30, cx + 22, cy + 56), fill=rose, outline=gold, width=2)
    # 三斜撑支架
    draw.line([(cx - 14, cy + 48), (cx - 36, cy + 62)], fill=pink, width=3)
    draw.line([(cx + 14, cy + 48), (cx + 36, cy + 62)], fill=pink, width=3)

    draw.text((cx, TITLE_Y), "东 方 明 珠", fill=(244, 114, 182, 255), font=f_large, anchor="mm")
    draw.text((cx, SUBTITLE_Y), "SHANGHAI 1994 · 魔都天际双爆", fill=(251, 207, 232, 240), font=get_font(23, True), anchor="mm")

    draw_stamp_pill(draw, "十里洋场霓虹双爆", fill_color=(190, 18, 60, 255), border_color=(244, 114, 182, 255))

    add_warning(
        im,
        warn_title="本公司提示",
        warn_main="吸烟有害健康",
        warn_sub="请勿在禁烟场所吸烟",
        warn_extra="劝阻青少年吸烟 · 禁止中小学生吸烟",
        text_color_hdr=(254, 240, 138, 255),
        text_color_main=(255, 255, 255, 255),
        text_color_sub=(244, 114, 182, 255),
        text_color_extra=(251, 207, 232, 240)
    )
    save_landmark_pack(im, "oriental_pearl.png")

def main():
    print("Generating landmark pack images with standard '吸烟有害健康' warnings...")
    gen_eiffel_tower()
    gen_pisa_leaning()
    gen_pyramid_giza()
    gen_oriental_pearl()
    print("All 4 landmark images updated successfully!")

if __name__ == "__main__":
    main()
