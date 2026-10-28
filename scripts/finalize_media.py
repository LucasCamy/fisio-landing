"""Finalize only already reviewed media; package optimized assets without source PNGs."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "media"
manifest_path = MEDIA / "MEDIA_MANIFEST.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
browser = json.loads((ROOT / "_media_work/browser-validation.json").read_text(encoding="utf-8"))
visual = json.loads((ROOT / "_media_work/visual-review.json").read_text(encoding="utf-8"))
assert manifest["file_count"] == 271
assert browser["status"] == "passed" and browser["images_decoded"] == browser["canvas_draws"] == 270
assert not browser["failures"] and browser["video"]["playback_progress"]
assert visual["status"] == "passed" and {10, 60, 110}.issubset({item["frame"] for item in visual["frames"]})
for entry in manifest["files"]:
    file = (MEDIA / entry["path"]).resolve()
    if not file.is_relative_to(MEDIA.resolve()):
        raise ValueError("Unexpected manifest path")
    assert hashlib.sha256(file.read_bytes()).hexdigest() == entry["sha256"], entry["path"]
manifest["validation"]["visual_review_frames"] = {"required": [10, 60, 110], "status": "passed", "pulse_reviewed": 75}
manifest["validation"]["browser_decode"] = browser
manifest["status"] = "ready"
manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
qa = {"status": "passed", "browser": browser, "visual": visual, "encoding": manifest["validation"],
      "total_media_bytes": manifest["total_bytes"], "total_media_files": manifest["file_count"]}
(ROOT / "MEDIA_QA.json").write_text(json.dumps(qa, indent=2, ensure_ascii=False), encoding="utf-8")
package = ROOT / "fisio-media.zip"
paths = [MEDIA / item["path"] for item in manifest["files"]]
paths += [manifest_path, ROOT / "MEDIA_README.md", ROOT / "MEDIA_QA.json", ROOT / "MEDIA_REVIEW.jpg",
          ROOT / "FRAMES_REVIEW.jpg", ROOT / "scripts/media-prompts.json"]
with zipfile.ZipFile(package, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for path in paths:
        archive.write(path, path.relative_to(ROOT).as_posix())
with zipfile.ZipFile(package) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist()) == len(paths)
print(json.dumps({"status": "ready", "media_files": manifest["file_count"], "media_MiB": round(manifest["total_bytes"] / 1024**2, 3),
                  "zip_MiB": round(package.stat().st_size / 1024**2, 3), "zip_entries": len(paths),
                  "zip_sha256": hashlib.sha256(package.read_bytes()).hexdigest()}, indent=2))
