# LeetCode OCR Engine & Technical Interviewer

This project is a local web app that takes a photo of handwritten or printed code, runs OCR on it, and turns the result into a readable transcription with visual word boxes over the image. It is designed to simulate an interview workflow where a student submission is extracted, inspected, and graded in a lightweight way.

The core idea is simple: a user uploads an image of code, the backend sends it to a Python EasyOCR engine, and the frontend displays both the original image and the recognized text with bounding boxes. The app then summarizes the detected code in a mock technical-interview format.

## What the app does

When a user opens the app:

1. They upload or choose a code image.
2. The frontend sends that image to the backend API.
3. The Node server converts the image data into a temporary file.
4. The Python script calls EasyOCR to detect text in the image.
5. The OCR engine returns recognized words and their bounding boxes.
6. The backend normalizes those coordinates into a 0–1000 grid.
7. The frontend renders the image with boxes around each recognized word.
8. The extracted words are joined into a readable code transcription.
9. A simplified evaluation panel is generated based on the extracted text.

In practical terms, the app is not a full LeetCode judge. It is an OCR + review prototype that helps visualize how handwritten code could be converted into text and then evaluated for readability, structure, and general interview feedback.

## Example behavior

The app includes sample code problems such as:

- Reverse Linked List
- Valid Parentheses

For each sample, the app shows:

- the handwritten code image
- the OCR-detected word boxes
- the cleaned transcription
- an evaluation summary with readability and interview-style comments

## Main features

- Upload code photos from the browser
- Process the image locally with EasyOCR
- Display OCR word-level overlays on the image
- Combine OCR tokens into continuous code text
- Show an interview-style evaluation summary
- Include preloaded demonstration samples for quick testing
- Run locally without external cloud OCR services

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- OCR: Python + EasyOCR
- Coordinate handling: normalized 0–1000 box layout

## Project structure

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

## How the OCR pipeline works

The actual flow is:

```text
Upload image
  -> Express receives base64 image
  -> write temp file in OS temp directory
  -> run python/easyocr_service.py with that image path
  -> EasyOCR returns words + bounding boxes
  -> server parses JSON and sends result to frontend
  -> UI draws boxes and builds transcription
```

This means the app is specifically built around OCR of handwritten code snippets and previewing how the recognized text is being interpreted.

## Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm
- Git

### 1) Install Node dependencies

```bash
npm install
```

### 2) Create and activate a Python environment

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

### 3) Install Python dependencies

```bash
pip install -r python/requirements.txt
```

### 4) Create a local `.env` file

```bash
copy .env.example .env
```

or:

```bash
cp .env.example .env
```

Then edit `.env` with your local values. Keep real secrets in this file and do not commit it.

Example:

```env
GEMINI_API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
APP_URL="http://localhost:3000"
EASYOCR_PYTHON="python"
```

If your Python binary is not on PATH, set `EASYOCR_PYTHON` to the full path to your environment's Python executable.

## Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## What to expect in the UI

After uploading an image, you should see:

- the uploaded code photo
- word-level rectangles drawn around recognized text
- the extracted transcription in a readable format
- a summary panel with feedback about the solution

The UI is intentionally built to help users inspect OCR quality and understand how the system interprets handwriting or printed code.

## Security note

This project should not commit real API keys or credentials.

- real values go in `.env`
- `.env.example` should remain a placeholder template
- never push secrets to GitHub
- if a secret was previously committed, rotate it immediately

## Troubleshooting

### The app cannot find Python

Set `EASYOCR_PYTHON` in `.env` to the full correct path to Python.

### EasyOCR is missing

```bash
pip install -r python/requirements.txt
```

### OCR is slow on the first run

EasyOCR downloads model weights the first time it runs. This is expected and usually only happens once.

### The dev command keeps prompting to terminate

That is just the server process still running. Press `y` or Ctrl+C to stop it.

## Limitations

- The OCR quality depends on image clarity and handwriting quality.
- The evaluation is a lightweight heuristic and not a real LeetCode automated judge.
- This is best used as a local prototype or educational demo, not a production grading system.

## License

This project does not currently include a license file. If you plan to publish it publicly, add an open-source license before distributing the repository.
