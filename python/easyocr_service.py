#!/usr/bin/env python3
"""
easyocr_service.py
------------------
Reads an image file, runs EasyOCR on it, and prints a JSON object to stdout.

Output schema:
  {
    "words": [
      {
        "text": "<recognised word or phrase>",
        "box": [ymin, xmin, ymax, xmax]   // integers, 0-1000 coordinate space
      },
      ...
    ]
  }

Usage:
  python easyocr_service.py <image_path>

Exit codes:
  0  success — valid JSON written to stdout
  1  error   — error message written to stderr
"""

import sys
import json
import os


def run_ocr(image_path: str) -> list[dict]:
    """Run EasyOCR on *image_path* and return words in the project's schema."""
    try:
        import easyocr  # type: ignore
    except ImportError:
        raise RuntimeError(
            "EasyOCR is not installed. Run: pip install easyocr"
        )

    try:
        from PIL import Image  # type: ignore
        img = Image.open(image_path)
        img_width, img_height = img.size
    except Exception:
        # If Pillow can't open it, fall back to a safe default so OCR can
        # still attempt to read the file.
        img_width, img_height = None, None

    # Initialise reader — English only, no GPU required (gpu=False).
    # Subsequent calls within the same process reuse the loaded model.
    reader = easyocr.Reader(["en"], gpu=False, verbose=False)

    # detail=1 returns bounding boxes; paragraph=False gives word-level results.
    results = reader.readtext(image_path, detail=1, paragraph=False)

    words: list[dict] = []
    for bbox, text, _confidence in results:
        text = text.strip()
        if not text:
            continue

        # bbox from EasyOCR is [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] (pixels).
        # Convert to the project's normalised 0-1000 grid: [ymin, xmin, ymax, xmax].
        xs = [pt[0] for pt in bbox]
        ys = [pt[1] for pt in bbox]
        x_min_px, x_max_px = min(xs), max(xs)
        y_min_px, y_max_px = min(ys), max(ys)

        if img_width and img_height:
            x_min = round(x_min_px / img_width * 1000)
            x_max = round(x_max_px / img_width * 1000)
            y_min = round(y_min_px / img_height * 1000)
            y_max = round(y_max_px / img_height * 1000)
        else:
            # No image dimensions available — emit raw pixel coordinates.
            x_min, x_max = round(x_min_px), round(x_max_px)
            y_min, y_max = round(y_min_px), round(y_max_px)

        words.append({
            "text": text,
            "box": [y_min, x_min, y_max, x_max],
        })

    return words


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}), file=sys.stderr)
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.isfile(image_path):
        print(
            json.dumps({"error": f"File not found: {image_path}"}),
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        words = run_ocr(image_path)
        # Write result as a single JSON line to stdout so server.ts can
        # JSON.parse(stdout) reliably.
        print(json.dumps({"words": words}))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
