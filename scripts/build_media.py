"""Build project media from the original image_gen sources. Python 3 + Pillow + NumPy + FFmpeg."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "media"
WORK = ROOT / "_media_work"
SOURCES = WORK / "sources"
RENDERS = WORK / "renders"
FFMPEG = shutil.which("ffmpeg")
FFPROBE = shutil.which("ffprobe")
SIZES = {
    "hero-specialist": (1200, 1400),
    "anatomy-top": (900, 900), "anatomy-base": (900, 900),
    "anatomy-assembled": (1200, 1000),
    "specialist-hands": (1000, 1200), "clinic-reception": (1600, 1000),
    **{f"case-{i:02d}": (800, 1000) for i in range(1, 6)},
    **{name: (1000, 1250) for name in (
        "step-01-avaliacao", "step-02-planejamento", "step-03-procedimento", "step-04-acompanhamento")},
}
BLUE = (91, 141, 239)
BG = (242, 245, 249)
LANCZOS = Image.Resampling.LANCZOS
XFADE = "xfade=transition=fade:duration=0.5:offset=4.5"


def run(args: list[str], **kwargs):
    return subprocess.run(args, check=True, capture_output=True, **kwargs)


def prepare():
    if not FFMPEG or not FFPROBE:
        raise RuntimeError("FFmpeg and ffprobe must be installed.")
    for folder in (MEDIA, MEDIA / "frames", SOURCES, RENDERS, RENDERS / "frames"):
        folder.mkdir(parents=True, exist_ok=True)
    data = json.loads((ROOT / "scripts/media-prompts.json").read_text(encoding="utf-8"))
    allowed = set(SIZES) | {"hero-ambient-source"}
    for item in data:
        name = item["name"]
        if name not in allowed:
            raise ValueError("Unexpected source name")
        dest = SOURCES / f"{name}.png"
        if not dest.exists():
            shutil.copyfile(Path(item["source"]), dest)


def encode_pair(source: Path, output: Path, crf: int = 29):
    """Each AVIF is a separate single-image invocation; never image2 sequence output."""
    with Image.open(source) as im:
        im.convert("RGB").save(output.with_suffix(".webp"), quality=83, method=6)
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
         "-frames:v", "1", "-c:v", "libaom-av1", "-still-picture", "1",
         "-crf", str(crf), "-b:v", "0", "-cpu-used", "6", "-row-mt", "1",
         "-threads", "2", "-pix_fmt", "yuv420p", str(output.with_suffix(".avif"))])


def stills():
    for name, size in SIZES.items():
        source = RENDERS / f"{name}.png"
        with Image.open(SOURCES / f"{name}.png") as im:
            ImageOps.fit(im.convert("RGB"), size, method=LANCZOS).save(source)
        encode_pair(source, MEDIA / name)
        print(f"Still ready: {name}", flush=True)


def smooth(value):
    value = max(0.0, min(1.0, value))
    return value * value * value * (value * (value * 6 - 15) + 10)


def arrow(draw, start, end, fill, width=2):
    draw.line([start, end], fill=fill, width=width)
    dx, dy = end[0] - start[0], end[1] - start[1]
    angle = math.atan2(dy, dx)
    length = 9
    draw.polygon([end, (end[0] - length * math.cos(angle - .4), end[1] - length * math.sin(angle - .4)),
                  (end[0] - length * math.cos(angle + .4), end[1] - length * math.sin(angle + .4))], fill=fill)


def dashed(draw, start, end, fill, width=1, dash=7):
    distance = math.dist(start, end)
    for step in range(0, int(distance), dash * 2):
        p = step / distance
        q = min(step + dash, distance) / distance
        draw.line([(start[0] + (end[0] - start[0]) * p, start[1] + (end[1] - start[1]) * p),
                   (start[0] + (end[0] - start[0]) * q, start[1] + (end[1] - start[1]) * q)], fill=fill, width=width)


def multiply_sprite(scene, sprite, xy):
    layer = Image.new("RGB", scene.size, "white")
    layer.paste(sprite, xy)
    return ImageChops.multiply(scene, layer)


def frame_scene(index: int, top: Image.Image, base: Image.Image):
    """Deterministic procedural animation of the generated crystal 3D renders, not a mesh simulation."""
    scale = 2
    scene = Image.new("RGB", (2048, 1152), BG)
    overlay = Image.new("RGBA", scene.size)
    d = ImageDraw.Draw(overlay)
    align = smooth((index - 1) / 73)
    residual = 0 if index <= 75 else 1.6 * math.sin((index - 75) * .18) * (1 - smooth((index - 75) / 45))
    dx = 106 * (1 - align) + residual
    dy = -20 * (1 - align)
    angle = -11 * (1 - align) + residual * .1
    pulse = math.exp(-.5 * ((index - 75) / 4.0) ** 2)
    for y in (468, 488, 512, 540, 574):
        d.line([(190 * scale, y * scale), (842 * scale, y * scale)], fill=(150, 173, 204, 32), width=scale)
    for x in range(120, 961, 105):
        d.line([(512 * scale + (x - 512) * .4 * scale, 454 * scale), (x * scale, 576 * scale)],
               fill=(150, 173, 204, 28), width=scale)
    # Fixed neutral axis; rotating force axis progressively converges to it.
    dashed(d, (450 * scale, 44 * scale), (450 * scale, 535 * scale), (91, 141, 239, 92), 2)
    dashed(d, ((450 + dx) * scale, (58 + dy * .25) * scale), (450 * scale, 505 * scale),
           (45, 81, 137, int(110 * (1 - align))), 3)
    d.ellipse((274 * scale, 295 * scale, 750 * scale, 369 * scale), outline=(91, 141, 239, 70), width=2)
    dashed(d, (245 * scale, 332 * scale), (788 * scale, 332 * scale), (91, 141, 239, 80), 2)
    scene = Image.alpha_composite(scene.convert("RGBA"), overlay).convert("RGB")
    halo = Image.new("RGBA", scene.size)
    h = ImageDraw.Draw(halo)
    h.ellipse((355 * scale, 292 * scale, 561 * scale, 367 * scale), fill=(*BLUE, int(12 + 30 * align + 65 * pulse)))
    halo = halo.filter(ImageFilter.GaussianBlur(22 * scale))
    scene = Image.alpha_composite(scene.convert("RGBA"), halo).convert("RGB")
    base_large = base.resize((840, 612), LANCZOS)
    top_large = top.resize((840, 630), LANCZOS)
    # White-matte multiplication preserves fine optical-crystal edges against the pale background.
    scene = multiply_sprite(scene, base_large, (302 * scale, 236 * scale))
    turned = top_large.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True, fillcolor="white")
    scene = multiply_sprite(scene, turned, (int((512 + dx) * scale - turned.width / 2),
                                           int((202.5 + dy) * scale - turned.height / 2)))
    if pulse > .01:
        bloom = Image.new("RGBA", scene.size)
        ImageDraw.Draw(bloom).ellipse((340 * scale, 300 * scale, 592 * scale, 366 * scale),
                                     fill=(113, 163, 255, int(120 * pulse)))
        bloom = bloom.filter(ImageFilter.GaussianBlur(16 * scale))
        scene = Image.alpha_composite(scene.convert("RGBA"), bloom).convert("RGB")
    overlay = Image.new("RGBA", scene.size)
    d = ImageDraw.Draw(overlay)
    # Lateral load becomes two balanced axial forces. No labels are burned into frames.
    force = int(90 + 55 * align)
    arrow(d, ((285 + dx * .45) * scale, 147 * scale), ((305 + dx * .12) * scale, 253 * scale), (*BLUE, force), 3)
    arrow(d, ((740 - dx * .15) * scale, 147 * scale), ((720 - dx * .04) * scale, 253 * scale), (*BLUE, force), 3)
    for cx, cy in ((450 + dx, 142 + dy * .4), (450, 435)):
        r = 4 * scale
        d.ellipse((cx * scale - r, cy * scale - r, cx * scale + r, cy * scale + r), fill=(*BLUE, 175))
        d.ellipse((cx * scale - r * 2, cy * scale - r * 2, cx * scale + r * 2, cy * scale + r * 2), outline=(*BLUE, 70), width=2)
    if pulse > .01:
        radius = 118 + max(0, index - 75) * 5
        d.ellipse(((458 - radius) * scale, (332 - radius * .25) * scale,
                   (458 + radius) * scale, (332 + radius * .25) * scale), outline=(*BLUE, int(220 * pulse)), width=6)
    scene = Image.alpha_composite(scene.convert("RGBA"), overlay).convert("RGB").resize((1024, 576), LANCZOS)
    return scene, {"frame": index, "time_seconds": (index - 1) / 24, "alignment": round(align, 6),
                   "offset_x": round(dx, 5), "offset_y": round(dy, 5), "rotation_degrees": round(angle, 5),
                   "pulse_intensity": round(pulse, 6)}


def frames():
    with Image.open(SOURCES / "anatomy-top.png") as im:
        top = im.convert("RGB").crop((90, 180, 1210, 1020)).resize((420, 315), LANCZOS)
    with Image.open(SOURCES / "anatomy-base.png") as im:
        base = im.convert("RGB").crop((90, 220, 1210, 1035)).resize((420, 306), LANCZOS)
    states = []
    for index in range(1, 121):
        image, state = frame_scene(index, top, base)
        image.save(RENDERS / "frames" / f"frame_{index:04d}.png")
        states.append(state)
        if index % 20 == 0:
            print(f"Procedural render: {index}/120", flush=True)
    (WORK / "sequence-states.json").write_text(json.dumps(states, indent=2), encoding="utf-8")
    with ThreadPoolExecutor(max_workers=4) as executor:
        tasks = {executor.submit(encode_pair, RENDERS / "frames" / f"frame_{i:04d}.png",
                                 MEDIA / "frames" / f"frame_{i:04d}", 31): i for i in range(1, 121)}
        for count, future in enumerate(as_completed(tasks), 1):
            future.result()
            if count % 20 == 0:
                print(f"Frame pairs encoded: {count}/120", flush=True)


def video():
    with Image.open(SOURCES / "hero-ambient-source.png") as im:
        plate = ImageOps.fit(im.convert("RGB"), (1320, 744), method=LANCZOS)
    source = WORK / "ambient-source.mp4"
    yy, xx = np.mgrid[0:720, 0:1280].astype(np.float32)
    glint_mask = np.exp(-(((xx - 970) / 160) ** 2 + ((yy - 325) / 170) ** 2))
    with (WORK / "ambient-encoder.log").open("wb") as log:
        process = subprocess.Popen([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo",
                                    "-pixel_format", "rgb24", "-video_size", "1280x720", "-framerate", "24",
                                    "-i", "pipe:0", "-an", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                                    "-pix_fmt", "yuv420p", str(source)], stdin=subprocess.PIPE, stdout=log, stderr=log)
        try:
            for i in range(120):
                phase = 2 * math.pi * i / 120
                left = 20 + 2 * math.sin(phase)
                upper = 12 + .5 * math.cos(phase)
                shot = plate.transform((1280, 720), Image.Transform.AFFINE, (1, 0, left, 0, 1, upper), Image.Resampling.BICUBIC)
                pixels = np.asarray(shot).astype(np.float32)
                window_light = .010 * np.cos(phase + xx / 1000) * np.exp(-xx / 1450)
                glint = glint_mask * (.012 + .009 * math.sin(phase))
                pixels = np.clip(pixels * (1 + window_light[:, :, None]) + glint[:, :, None] * np.array([115, 150, 230]), 0, 255).astype(np.uint8)
                process.stdin.write(pixels.tobytes())
        finally:
            process.stdin.close()
        if process.wait() != 0:
            raise RuntimeError("Ambient encoder failed; see log")
    # xfade closes 4.5..5.0s with 0..0.5s. Drop the duplicated first half second:
    # output 0.5..5.0s = 4.5s / 108 frames; last blended frame joins source t=0.5.
    filters = f"[0:v]split=2[a][b];[b]trim=start=0:end=0.5,setpts=PTS-STARTPTS[head];[a][head]{XFADE},trim=start=0.5:end=5,setpts=PTS-STARTPTS,format=yuv420p[v]"
    run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
         "-filter_complex_threads", "1", "-filter_complex", filters, "-map", "[v]", "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-r", "24", "-t", "4.5",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(MEDIA / "hero-ambient.mp4")])
    print("Hero ambient encoded: 1280x720 / 24fps / 4.5s / H.264 CRF24 / no audio", flush=True)


def av1_config(path):
    data = path.read_bytes()
    location = data.find(b"av1C")
    if location < 4:
        raise ValueError(f"Missing av1C: {path.name}")
    size = int.from_bytes(data[location - 4:location], "big")
    config = data[location + 4:location - 4 + size]
    if len(config) < 4 or config[0] != 0x81 or not any(config[1:]):
        raise ValueError(f"Invalid av1C: {path.name}")
    return {"box_bytes": size, "payload_hex": config.hex()}


def probe(path):
    return json.loads(run([FFPROBE, "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]).stdout)


def verify():
    expected = {f"{name}.{ext}": size for name, size in SIZES.items() for ext in ("avif", "webp")}
    expected.update({f"frames/frame_{i:04d}.{ext}": (1024, 576) for i in range(1, 121) for ext in ("avif", "webp")})
    inventory = []
    for relative, size in expected.items():
        path = MEDIA / relative
        with Image.open(path) as im:
            im.load()  # Decode all 270 images, not just their headers.
            if im.size != size:
                raise ValueError(f"Wrong dimensions: {relative}: {im.size}")
        item = {"path": relative, "width": size[0], "height": size[1], "bytes": path.stat().st_size,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        if path.suffix == ".avif":
            item["av1C"] = av1_config(path)
        inventory.append(item)
    path = MEDIA / "hero-ambient.mp4"
    details = probe(path)
    streams = details["streams"]
    video_stream = next(stream for stream in streams if stream["codec_type"] == "video")
    assert video_stream["codec_name"] == "h264"
    assert (video_stream["width"], video_stream["height"]) == (1280, 720)
    assert video_stream["r_frame_rate"] == "24/1"
    assert int(video_stream["nb_frames"]) == 108
    assert abs(float(details["format"]["duration"]) - 4.5) < .001
    assert all(s["codec_type"] != "audio" for s in streams)
    mp4 = path.read_bytes()
    assert mp4.index(b"moov") < mp4.index(b"mdat")
    decoded = run([FFMPEG, "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"]).stdout
    decoded = np.frombuffer(decoded, dtype=np.uint8).reshape((-1, 720, 1280, 3))
    assert len(decoded) == 108
    loop_mae = float(np.abs(decoded[0].astype(float) - decoded[-1].astype(float)).mean())
    if loop_mae > 2.5:
        raise ValueError(f"Loop boundary difference too large: {loop_mae}")
    inventory.append({"path": path.name, "width": 1280, "height": 720, "fps": 24, "frames": 108,
                      "duration_seconds": 4.5, "codec": "h264", "pixel_format": "yuv420p", "crf": 24,
                      "audio": False, "faststart": True, "xfade": XFADE,
                      "bytes": path.stat().st_size, "sha256": hashlib.sha256(mp4).hexdigest()})
    states = json.loads((WORK / "sequence-states.json").read_text())
    assert max(states, key=lambda state: state["pulse_intensity"])["frame"] == 75
    assert states[-1]["alignment"] == 1 and abs(states[-1]["offset_x"]) < .00001
    result = {
        "status": "encoded", "generated_at": datetime.now(timezone.utc).isoformat(),
        "art_direction": "ARQ-E: Precisao Clinica & Cuidado Humano", "palette": ["#F2F5F9", "#5B8DEF", "#0A0F1D", "#FFFFFF"],
        "generation": {"stills": "built-in image_gen; fictional people and clinic", "stock_media_used": False,
                       "ambient": "Procedural parallax, moving daylight and crystal glint applied to generated studio plate",
                       "canvas": "Procedural compositing and transforms of generated 3D crystal vertebral renders; no mesh simulation",
                       "prompts": "../scripts/media-prompts.json"},
        "image_encoding": {"avif": "libaom-av1; one process per file; -frames:v 1 -still-picture 1; yuv420p",
                           "avif_crf_stills": 29, "avif_crf_frames": 31, "webp_quality": 83, "webp_method": 6},
        "sequence": {"count": 120, "width": 1024, "height": 576, "fps": 24, "duration_seconds": 5,
                     "patterns": {"avif": "frames/frame_%04d.avif", "webp": "frames/frame_%04d.webp"},
                     "first": 1, "last": 120, "alignment_frame": 74, "pulse_frame": 75, "stable_frame": 120,
                     "background": "#F2F5F9", "states": states},
        "validation": {"all_image_decodes": "passed", "all_dimensions": "passed", "av1C_valid": 135,
                       "video_decode": "passed", "video_metadata": "passed", "moov_before_mdat": True,
                       "loop_boundary_mean_absolute_error_8bit": round(loop_mae, 6),
                       "visual_review_frames": {"required": [10, 60, 110], "status": "pending"},
                       "browser_decode": {"status": "pending"}},
        "file_count": len(inventory), "total_bytes": sum(item["bytes"] for item in inventory), "files": inventory,
    }
    (MEDIA / "MEDIA_MANIFEST.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Validated: {len(inventory)} media files; {result['total_bytes'] / 1024**2:.2f} MiB; loop MAE {loop_mae:.4f}", flush=True)


def reviews():
    font_path = Path("C:/Windows/Fonts/segoeui.ttf")
    font = ImageFont.truetype(str(font_path), 19) if font_path.exists() else ImageFont.load_default()
    sheet = Image.new("RGB", (1500, 1450), BG)
    draw = ImageDraw.Draw(sheet)
    for index, name in enumerate(SIZES):
        x, y = (index % 5) * 300, (index // 5) * 480
        with Image.open(MEDIA / f"{name}.webp") as im:
            thumb = ImageOps.contain(im, (280, 420), method=LANCZOS)
            sheet.paste(thumb, (x + (300 - thumb.width) // 2, y + 12))
        draw.text((x + 10, y + 440), name, fill=(10, 15, 29), font=font)
    sheet.save(ROOT / "MEDIA_REVIEW.jpg", quality=90)
    sheet = Image.new("RGB", (1536, 645), BG)
    draw = ImageDraw.Draw(sheet)
    for index, frame in enumerate((10, 60, 75, 110)):
        x, y = (index % 2) * 768, (index // 2) * 322
        with Image.open(MEDIA / "frames" / f"frame_{frame:04d}.avif") as im:
            sheet.paste(im.resize((640, 360), LANCZOS).resize((512, 288), LANCZOS), (x + 128, y))
        draw.text((x + 18, y + 130), f"{frame:04d}", fill=(10, 15, 29), font=font)
    sheet.save(ROOT / "FRAMES_REVIEW.jpg", quality=92)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=("all", "stills", "frames", "video", "verify", "reviews"), default="all", nargs="?")
    args = parser.parse_args()
    prepare()
    stages = (stills, frames, video, verify, reviews) if args.stage == "all" else (globals()[args.stage],)
    for stage in stages:
        stage()
