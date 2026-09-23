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
import base64


def _pdf_to_images(pdf_path: str) -> list[str]:
    """Render each PDF page to a PNG image and return the image paths."""
    try:
        import pypdfium2 as pdfium  # type: ignore
    except ImportError as exc:
        raise RuntimeError("pypdfium2 is not installed. Run: pip install -r python/requirements.txt") from exc

    pdf_dir = os.path.dirname(pdf_path) or "."
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    rendered_paths: list[str] = []

    pdf = pdfium.PdfDocument(pdf_path)
    try:
        for page_index in range(len(pdf)):
            page = pdf.get_page(page_index)
            bitmap = page.render(scale=2, rotation=0)
            pil_image = bitmap.to_pil()
            out_path = os.path.join(pdf_dir, f"{pdf_name}_page_{page_index + 1}.png")
            pil_image.save(out_path)
            rendered_paths.append(out_path)
    finally:
        pdf.close()

    return rendered_paths


def _run_ocr_for_image(image_path: str) -> list[dict]:
    """Run EasyOCR on a single image file and return words in the project's schema."""
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

    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    results = reader.readtext(image_path, detail=1, paragraph=False)

    words: list[dict] = []
    for bbox, text, _confidence in results:
        text = text.strip()
        if not text:
            continue

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
            x_min, x_max = round(x_min_px), round(x_max_px)
            y_min, y_max = round(y_min_px), round(y_max_px)

        words.append({
            "text": text,
            "box": [y_min, x_min, y_max, x_max],
        })

    return words


def _run_ocr_for_pdf(file_path: str) -> tuple[list[dict], list[dict]]:
    """Render PDF pages and return flattened words plus preview data per page."""
    rendered_paths = _pdf_to_images(file_path)
    try:
        all_words: list[dict] = []
        pages: list[dict] = []
        for rendered_path in rendered_paths:
            page_words = _run_ocr_for_image(rendered_path)
            with open(rendered_path, "rb") as rendered_file:
                image_base64 = base64.b64encode(rendered_file.read()).decode("ascii")

            pages.append({
                "image": f"data:image/png;base64,{image_base64}",
                "words": page_words,
            })
            all_words.extend(page_words)

        return all_words, pages
    finally:
        for rendered_path in rendered_paths:
            try:
                os.remove(rendered_path)
            except OSError:
                pass


def run_ocr(file_path: str) -> list[dict]:
    """Run OCR on either an image or a PDF and return words in the project's schema."""
    lower_path = file_path.lower()

    if lower_path.endswith(".pdf"):
        all_words, _pages = _run_ocr_for_pdf(file_path)
        return all_words

    return _run_ocr_for_image(file_path)


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
        if image_path.lower().endswith(".pdf"):
            words, pages = _run_ocr_for_pdf(image_path)
        else:
            words = run_ocr(image_path)
            pages = []
        # Write result as a single JSON line to stdout so server.ts can
        # JSON.parse(stdout) reliably.
        print(json.dumps({"words": words, "pages": pages}))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
