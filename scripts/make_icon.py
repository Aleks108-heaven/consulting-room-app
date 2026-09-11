#!/usr/bin/env python3
"""
Real app icon for Consulting Room: a flat, minimal chaise-longue (the
classic psychoanalyst's couch) on the app's warm accent gradient.
Pure Python (zlib/struct PNG writer only, no Pillow) with 4x supersampling
for clean anti-aliased edges.

Outputs:
  resources/icon.png              -- flattened master (rounded square + couch)
  resources/icon-background.png   -- gradient only, opaque square (Android adaptive bg)
  resources/icon-foreground.png   -- couch only, transparent (Android adaptive fg)
  src-tauri/icons/{32x32,128x128,128x128@2x,icon}.png + icon.ico
"""
import struct, zlib, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SS = 2                      # supersample factor
WORK = 1024 * SS            # internal render resolution

GRAD_TOP    = (0x9C, 0x5A, 0x16)   # --accent
GRAD_BOTTOM = (0x7A, 0x46, 0x10)   # --accent-strong
COUCH       = (0xFF, 0xFD, 0xF8)   # --accent-ink (cream)
CUSHION     = (0xF1, 0xE3, 0xCC)   # --accent-soft (soft tan, pillow accent)


# ---------- tiny raster canvas: RGBA bytearray, (0,0) top-left ----------
def new_canvas(size, rgba=(0, 0, 0, 0)):
    row = bytes(rgba) * size
    return bytearray(row * size)

def blend_px(canvas, size, x, y, rgba):
    if x < 0 or y < 0 or x >= size or y >= size:
        return
    r, g, b, a = rgba
    if a <= 0:
        return
    i = (y * size + x) * 4
    if a >= 255:
        canvas[i:i+4] = bytes((r, g, b, 255))
        return
    dr, dg, db, da = canvas[i], canvas[i+1], canvas[i+2], canvas[i+3]
    fa = a / 255.0
    canvas[i]   = int(r * fa + dr * (1 - fa))
    canvas[i+1] = int(g * fa + dg * (1 - fa))
    canvas[i+2] = int(b * fa + db * (1 - fa))
    canvas[i+3] = int(a + da * (1 - fa))

def fill_rounded_rect(canvas, size, x0, y0, x1, y1, r, color, top_r=None, bottom_r=None):
    """Axis-aligned rounded rect; top_r/bottom_r override corner radius for that end."""
    tr = top_r if top_r is not None else r
    br = bottom_r if bottom_r is not None else r
    xi0, yi0, xi1, yi1 = int(x0), int(y0), int(x1), int(y1)
    for y in range(max(0, yi0), min(size, yi1)):
        for x in range(max(0, xi0), min(size, xi1)):
            rad = tr if y < y0 + tr else (br if y > y1 - br else 0)
            inside = True
            if rad > 0:
                cx = x0 + rad if x < x0 + rad else (x1 - rad if x > x1 - rad else None)
                cy = y0 + rad if y < y0 + rad else (y1 - rad if y > y1 - rad else None)
                if cx is not None and cy is not None:
                    inside = (x - cx) ** 2 + (y - cy) ** 2 <= rad ** 2
            if inside:
                blend_px(canvas, size, x, y, color + (255,))

def fill_ellipse(canvas, size, cx, cy, rx, ry, color):
    xi0, yi0 = int(cx - rx) - 1, int(cy - ry) - 1
    xi1, yi1 = int(cx + rx) + 1, int(cy + ry) + 1
    for y in range(max(0, yi0), min(size, yi1)):
        for x in range(max(0, xi0), min(size, xi1)):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1:
                blend_px(canvas, size, x, y, color + (255,))

def gradient_square(size, top, bottom):
    canvas = new_canvas(size)
    for y in range(size):
        t = y / (size - 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        row = bytes((r, g, b, 255)) * size
        canvas[y*size*4:(y+1)*size*4] = row
    return canvas

def rounded_square_mask(canvas, size, radius):
    """Zero out alpha outside a centered rounded square (0,0,size,size)."""
    masked = new_canvas(size)
    fill_rounded_rect(masked, size, 0, 0, size, size, radius, (0, 0, 0))
    # copy RGB from canvas where mask has alpha, keep mask alpha
    for i in range(0, len(masked), 4):
        if masked[i+3] > 0:
            masked[i:i+3] = canvas[i:i+3]
    return masked

def composite_over(bg, fg, size):
    out = bytearray(bg)
    for i in range(0, len(fg), 4):
        a = fg[i+3]
        if a > 0:
            blend_px(out, size, (i // 4) % size, (i // 4) // size, (fg[i], fg[i+1], fg[i+2], a))
    return out


# ---------- the couch (chaise longue) ----------
def draw_couch(canvas, size, scale=1.0, cx=None, cy=None):
    """Simple side-profile psychoanalyst's couch, drawn around (cx, cy)."""
    s = size / 1024.0 * scale
    cx = size / 2 if cx is None else cx
    cy = size / 2 if cy is None else cy
    def X(v): return cx + (v - 512) * s
    def Y(v): return cy + (v - 512) * s

    # seat base
    fill_rounded_rect(canvas, size, X(192), Y(560), X(832), Y(680), 30 * s, COUCH)
    # raised backrest at the head end
    fill_rounded_rect(canvas, size, X(192), Y(340), X(340), Y(600), 44 * s, COUCH,
                       top_r=44 * s, bottom_r=16 * s)
    # low armrest at the foot end
    fill_rounded_rect(canvas, size, X(760), Y(480), X(832), Y(600), 26 * s, COUCH)
    # two visible legs
    fill_rounded_rect(canvas, size, X(258), Y(680), X(280), Y(748), 8 * s, COUCH)
    fill_rounded_rect(canvas, size, X(744), Y(680), X(766), Y(748), 8 * s, COUCH)
    # pillow accent on the backrest
    fill_ellipse(canvas, size, X(266), Y(430), 62 * s, 46 * s, CUSHION)


def write_png(path, canvas, size):
    stride = size * 4
    scanlines = bytearray()
    for y in range(size):
        scanlines.append(0)
        scanlines += canvas[y*stride:(y+1)*stride]
    compressed = zlib.compress(bytes(scanlines), 9)

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


def write_ico(path, png_bytes):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack("<BBBBHHII", 0, 0, 0, 0, 1, 32, len(png_bytes), 22)
    with open(path, "wb") as f:
        f.write(header + entry + png_bytes)


def downsample(canvas, src_size, dst_size):
    block = src_size // dst_size
    out = bytearray(dst_size * dst_size * 4)
    for oy in range(dst_size):
        for ox in range(dst_size):
            r = g = b = a = 0
            n = block * block
            for by in range(block):
                sy = oy * block + by
                row = sy * src_size * 4
                for bx in range(block):
                    i = row + (ox * block + bx) * 4
                    r += canvas[i]; g += canvas[i+1]; b += canvas[i+2]; a += canvas[i+3]
            oi = (oy * dst_size + ox) * 4
            out[oi:oi+4] = bytes((r // n, g // n, b // n, a // n))
    return out


if __name__ == "__main__":
    # --- master, supersampled ---
    bg_work = gradient_square(WORK, GRAD_TOP, GRAD_BOTTOM)
    bg_rounded_work = rounded_square_mask(bg_work, WORK, radius=int(0.22 * WORK))
    fg_work = new_canvas(WORK)
    draw_couch(fg_work, WORK, scale=1.0)
    master_work = composite_over(bg_rounded_work, fg_work, WORK)
    master_1024 = downsample(master_work, WORK, 1024)
    write_png(os.path.join(ROOT, "resources", "icon.png"), master_1024, 1024)

    # --- Android adaptive icon layers ---
    bg_square_work = bg_work  # no rounding; adaptive mask crops it on-device
    bg_1024 = downsample(bg_square_work, WORK, 1024)
    write_png(os.path.join(ROOT, "resources", "icon-background.png"), bg_1024, 1024)

    fg_only_work = new_canvas(WORK)
    draw_couch(fg_only_work, WORK, scale=0.82)  # smaller: sits in the adaptive-icon safe zone
    fg_1024 = downsample(fg_only_work, WORK, 1024)
    write_png(os.path.join(ROOT, "resources", "icon-foreground.png"), fg_1024, 1024)

    # --- Tauri / Windows icon set, downsampled from the crisp master ---
    icons = os.path.join(ROOT, "src-tauri", "icons")
    for name, sz in [("32x32.png", 32), ("128x128.png", 128), ("128x128@2x.png", 256)]:
        write_png(os.path.join(icons, name), downsample(master_work, WORK, sz), sz)
    write_png(os.path.join(icons, "icon.png"), master_1024, 1024)
    ico_src = downsample(master_work, WORK, 256)
    ico_path = os.path.join(icons, "icon.png").replace("icon.png", "_ico256.png")
    write_png(ico_path, ico_src, 256)
    with open(ico_path, "rb") as f:
        ico_bytes = f.read()
    write_ico(os.path.join(icons, "icon.ico"), ico_bytes)
    os.remove(ico_path)

    print("Wrote resources/icon*.png and src-tauri/icons/*")
