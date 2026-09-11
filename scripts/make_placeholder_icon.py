#!/usr/bin/env python3
"""Generate a placeholder app icon (solid color + inset monogram square) with
no external dependencies (pure zlib/struct PNG writer), plus a minimal ICO
wrapping a 256x256 PNG. Replace these later with a real design via:
    npx @tauri-apps/cli icon path/to/real-logo.png
"""
import struct, zlib, os

BG = (0x9C, 0x5A, 0x16)      # --accent
FG = (0xFF, 0xFD, 0xF8)      # --accent-ink
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def make_rgba(size):
    """Solid background with a centered lighter square (simple monogram block)."""
    px = bytearray(size * size * 4)
    inset = size // 3
    for y in range(size):
        for x in range(size):
            i = (y * size + x) * 4
            if inset <= x < size - inset and inset <= y < size - inset:
                r, g, b = FG
            else:
                r, g, b = BG
            px[i:i+4] = bytes((r, g, b, 255))
    return px


def write_png(path, size):
    raw = make_rgba(size)
    stride = size * 4
    scanlines = bytearray()
    for y in range(size):
        scanlines.append(0)  # filter type 0
        scanlines += raw[y*stride:(y+1)*stride]
    compressed = zlib.compress(bytes(scanlines), 9)

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)
    return png


def write_ico(path, png_bytes, size):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    # ICONDIR + 1 ICONDIRENTRY, image stored as raw PNG (supported since Vista)
    header = struct.pack("<HHH", 0, 1, 1)
    w = 0 if size >= 256 else size
    h = 0 if size >= 256 else size
    entry = struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(png_bytes), 22)
    with open(path, "wb") as f:
        f.write(header + entry + png_bytes)


if __name__ == "__main__":
    icons = os.path.join(ROOT, "src-tauri", "icons")
    write_png(os.path.join(icons, "32x32.png"), 32)
    write_png(os.path.join(icons, "128x128.png"), 128)
    write_png(os.path.join(icons, "128x128@2x.png"), 256)
    master = write_png(os.path.join(icons, "icon.png"), 1024)
    ico_src = write_png(os.path.join(icons, "_ico256.png"), 256)
    write_ico(os.path.join(icons, "icon.ico"), ico_src, 256)
    os.remove(os.path.join(icons, "_ico256.png"))
    write_png(os.path.join(ROOT, "resources", "icon-1024.png"), 1024)
    print("Wrote placeholder icons to", icons)
