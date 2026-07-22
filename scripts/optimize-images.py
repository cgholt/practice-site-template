#!/usr/bin/env python3
"""
Pre-commit image optimizer for public/images/.

When run as a pre-commit hook (default):
  - Finds staged JPG/JPEG/PNG files in public/images/
  - Converts each to WebP (max 1600px longest side, quality 82)
  - Updates references in content/ files (.json, .md)
  - Stages the new .webp and updated content files
  - Unstages the original image (keeps it on disk)

Manual mode:
  python3 scripts/optimize-images.py --all
  Converts ALL JPG/JPEG/PNG in public/images/ (not just staged).
"""

import subprocess
import sys
import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)

REPO_ROOT = Path(subprocess.check_output(
    ["git", "rev-parse", "--show-toplevel"], text=True
).strip())
IMAGES_DIR = REPO_ROOT / "public" / "images"
CONTENT_DIR = REPO_ROOT / "content"
MAX_DIMENSION = 1600
WEBP_QUALITY = 82
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def convert_to_webp(src: Path) -> Path:
    """Resize and convert an image to WebP. Returns the output path."""
    dest = src.with_suffix(".webp")
    with Image.open(src) as img:
        # Strip EXIF orientation issues
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)

        # Resize if needed
        w, h = img.size
        if max(w, h) > MAX_DIMENSION:
            if w > h:
                new_w = MAX_DIMENSION
                new_h = int(h * MAX_DIMENSION / w)
            else:
                new_h = MAX_DIMENSION
                new_w = int(w * MAX_DIMENSION / h)
            img = img.resize((new_w, new_h), Image.LANCZOS)

        # Convert RGBA to RGB for WebP compatibility (optional, WebP supports alpha)
        if img.mode == "RGBA":
            pass  # WebP handles alpha fine
        elif img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

        img.save(dest, "WEBP", quality=WEBP_QUALITY)
    return dest


def update_content_references(old_name: str, new_name: str) -> list[Path]:
    """Replace image filename references in content/ files. Returns modified paths."""
    modified = []
    for ext in ("*.json", "*.md"):
        for content_file in CONTENT_DIR.rglob(ext):
            text = content_file.read_text()
            if old_name in text:
                content_file.write_text(text.replace(old_name, new_name))
                modified.append(content_file)
    return modified


def get_staged_images() -> list[Path]:
    """Get staged files in public/images/ that are JPG/JPEG/PNG."""
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    staged = []
    for line in result.stdout.strip().splitlines():
        if not line:
            continue
        p = REPO_ROOT / line
        if p.suffix.lower() in IMAGE_EXTENSIONS and IMAGES_DIR in p.parents or p.parent == IMAGES_DIR:
            staged.append(p)
    return staged


def get_all_images() -> list[Path]:
    """Get all JPG/JPEG/PNG files in public/images/."""
    images = []
    for ext in IMAGE_EXTENSIONS:
        images.extend(IMAGES_DIR.glob(f"*{ext}"))
        images.extend(IMAGES_DIR.glob(f"*{ext.upper()}"))
    return images


def process_image(img_path: Path, is_staged: bool) -> bool:
    """Convert a single image. Returns True if successful."""
    webp_path = img_path.with_suffix(".webp")
    if webp_path.exists():
        print(f"  Skipping {img_path.name} — .webp already exists")
        return False

    print(f"  Converting {img_path.name} → {webp_path.name}")
    try:
        convert_to_webp(img_path)
    except Exception as e:
        print(f"  Error converting {img_path.name}: {e}")
        return False

    # Update content references
    old_name = img_path.name
    new_name = webp_path.name
    modified_files = update_content_references(old_name, new_name)
    for f in modified_files:
        rel = f.relative_to(REPO_ROOT)
        print(f"  Updated reference in {rel}")

    if is_staged:
        # Stage the new webp file
        subprocess.run(["git", "add", str(webp_path)], cwd=REPO_ROOT)
        # Stage updated content files
        for f in modified_files:
            subprocess.run(["git", "add", str(f)], cwd=REPO_ROOT)
        # Unstage the original (keep on disk)
        subprocess.run(["git", "rm", "--cached", str(img_path)], cwd=REPO_ROOT,
                        capture_output=True)

    return True


def main():
    all_mode = "--all" in sys.argv

    if all_mode:
        print("Optimizing all images in public/images/...")
        images = get_all_images()
    else:
        images = get_staged_images()

    if not images:
        if all_mode:
            print("No JPG/JPEG/PNG files found in public/images/.")
        sys.exit(0)

    converted = 0
    for img in images:
        if process_image(img, is_staged=not all_mode):
            converted += 1

    if converted > 0:
        print(f"\nConverted {converted} image(s) to WebP.")
        if not all_mode:
            print("Original files kept on disk but unstaged from commit.")
            print("The .webp versions and updated content references have been staged.")
    sys.exit(0)


if __name__ == "__main__":
    main()
