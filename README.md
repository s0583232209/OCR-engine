<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# LeetCode OCR Engine & Technical Interviewer

Uploads a photo of handwritten code, runs OCR locally via **EasyOCR** (Python), and displays word-level bounding boxes alongside a transcription and evaluation panel.

## Prerequisites

- **Node.js** 18+
- **Python** 3.9+ with `pip`

---

## Setup

### 1. Install Node dependencies

```bash
npm install
```

### 2. Set up the Python OCR environment

Create and activate a virtual environment (recommended):

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

Install EasyOCR and its dependencies:

```bash
pip install -r python/requirements.txt
```

> **First run note:** EasyOCR downloads its recognition models (~100 MB) on the first call and caches them in `~/.EasyOCR/`. Subsequent runs are fast.

> **GPU acceleration:** `requirements.txt` installs the CPU-only PyTorch build. If you have a CUDA GPU, replace the `torch`/`torchvision` lines with the matching CUDA wheels from [pytorch.org](https://pytorch.org/get-started/locally/) and set `gpu=True` in `python/easyocr_service.py`.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env   # macOS / Linux
copy .env.example .env # Windows
```

If your Python binary is not simply `python` (e.g. you're using a venv or `python3`), set `EASYOCR_PYTHON` in `.env`:

```
EASYOCR_PYTHON="C:\path\to\.venv\Scripts\python.exe"  # Windows venv
EASYOCR_PYTHON="/path/to/.venv/bin/python"             # macOS / Linux venv
```

### 4. Run the app

```bash
npm run dev
```

The server starts at **http://localhost:3000** (or `$PORT` if set).

---

## How it works

| Step | What happens |
|------|-------------|
| Upload | User drops or selects an image in the browser |
| Transfer | Frontend sends the image as a base64 data URL to `POST /api/analyze` |
| OCR | `server.ts` writes a temp file and calls `python/easyocr_service.py` via `child_process.execFile` |
| Parse | The Python script runs EasyOCR, normalises bounding boxes to a 0–1000 grid, and returns `{"words": [...]}` as JSON on stdout |
| Display | The frontend overlays word bounding boxes on the image and shows the transcription |

---

## Project structure

```
├── python/
│   ├── easyocr_service.py   # EasyOCR runner — called by server.ts
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── App.tsx              # React frontend
│   ├── samples.ts           # Preloaded demo samples
│   └── ...
├── server.ts                # Express server + OCR bridge
├── .env.example             # Environment variable reference
└── package.json
```

---

## Troubleshooting

**`python: command not found` / `'python' is not recognized`**
Set `EASYOCR_PYTHON` in your `.env` file to the full path of your Python binary.

**`ModuleNotFoundError: No module named 'easyocr'`**
Make sure you activated the correct virtual environment before running `npm run dev`, or set `EASYOCR_PYTHON` to point to the venv's Python executable.

**OCR times out on first run**
EasyOCR downloads model weights on the first invocation. The server allows up to 120 seconds — this is usually enough, but on a slow connection you may need to pre-warm by running the script directly once:

```bash
python python/easyocr_service.py path/to/any/image.png
```
