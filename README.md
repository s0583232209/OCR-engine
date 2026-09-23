# LeetCode OCR Engine & Technical Interviewer

A full-stack app that lets a user upload a photo of handwritten code, runs OCR locally with EasyOCR, overlays word-level bounding boxes on the image, and presents a simple technical interview evaluation layer.

This project is designed for local development and experimentation. It combines a Node/Express backend with a React frontend and a Python OCR service.

## Features

- Upload handwritten or printed code images
- Extract text with EasyOCR
- Show OCR word bounding boxes over the original image
- Build a cleaned transcription from recognized tokens
- Provide a basic interview/evaluation summary for the extracted solution
- Works locally without requiring a cloud OCR API

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- OCR engine: Python + EasyOCR
- Image processing: Pillow (via EasyOCR dependencies)

## Project Structure

```text
.
├── python/
│   ├── easyocr_service.py
│   └── requirements.txt
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── samples.ts
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── README.md
└── .env               # local file, not committed
```

## Prerequisites

- Node.js 18+
- Python 3.9+
- npm
- Git

## Local Setup

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Create a Python virtual environment

Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3) Install Python OCR dependencies

```bash
pip install -r python/requirements.txt
```

> EasyOCR downloads recognition models on first use. This may take a bit on the initial run.

### 4) Configure environment variables

Copy the example file to a local `.env` file:

Windows:

```bash
copy .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

Then edit `.env` and set the values you need. Keep real secrets local and never commit `.env`.

Example:

```env
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
APP_URL="http://localhost:3000"
EASYOCR_PYTHON="python"
```

If your Python executable is not on PATH, set `EASYOCR_PYTHON` to the full path of your virtual environment Python binary.

Examples:

```env
EASYOCR_PYTHON="C:\\path\\to\\.venv\\Scripts\\python.exe"
EASYOCR_PYTHON="/path/to/.venv/bin/python"
```

## Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## How It Works

1. The frontend sends the uploaded image to the backend API.
2. The Node server writes the image to a temp file.
3. The server executes the Python OCR script.
4. EasyOCR recognizes the text and returns per-word bounding boxes.
5. The app normalizes coordinates and overlays the recognized tokens on the image.
6. The transcription is sent back to the UI for display and evaluation.

## Important Security Note

This project should never commit real API keys or secrets.

- Keep real credentials in a local `.env` file
- Add `.env` to your local ignore rules
- Do not commit API keys to GitHub
- Rotate any secret that was ever pushed before

The repository includes a safe example file at [.env.example](.env.example), which should only contain placeholders.

## Troubleshooting

### `python: command not found` or `'python' is not recognized`

Set `EASYOCR_PYTHON` in `.env` to the path of the correct Python executable.

### `ModuleNotFoundError: No module named 'easyocr'`

Activate the correct virtual environment and install requirements again:

```bash
pip install -r python/requirements.txt
```

### OCR runs slowly the first time

EasyOCR downloads its model weights on first use. Subsequent calls are faster.

### `npm run dev` hangs or prompts to terminate the process

That is usually just the dev server still running in the terminal. Press `y` or use Ctrl+C to stop it.

## Notes

- The app is intended for educational and prototyping use.
- The evaluation layer is a lightweight heuristic summary, not a production-grade LeetCode judge.
- OCR quality depends heavily on image clarity, handwriting quality, scanning conditions, and lighting.

## License

This project does not currently declare a license. If you intend to publish it publicly, add an appropriate open-source license before distribution.
