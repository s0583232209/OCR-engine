import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const execFileAsync = promisify(execFile);

interface EasyOcrWord {
  text: string;
  box: [number, number, number, number];
}

// Timeout for the EasyOCR Python process (ms). First run is slower due to
// model download; subsequent runs use the cached model (~5-10 s on CPU).
const OCR_TIMEOUT_MS = 120_000;

async function runEasyOcr(image: string): Promise<EasyOcrWord[]> {
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  if (!base64Data) throw new Error('Invalid image data: missing base64 payload');

  const extension = image.match(/^data:image\/(\w+);base64,/)?.[1] || 'png';
  const imagePath = path.join(os.tmpdir(), `leetcode-ocr-${Date.now()}.${extension}`);
  const pythonScript = path.resolve(__dirname, 'python', 'easyocr_service.py');
  const pythonCommand = process.env.EASYOCR_PYTHON || 'python';

  try {
    await fs.promises.writeFile(imagePath, Buffer.from(base64Data, 'base64'));

    const { stdout, stderr } = await execFileAsync(
      pythonCommand,
      [pythonScript, imagePath],
      { maxBuffer: 10 * 1024 * 1024, timeout: OCR_TIMEOUT_MS }
    );

    if (stderr) {
      console.warn('[EasyOCR] stderr:', stderr.trim());
    }

    let parsed: any;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      throw new Error(`EasyOCR returned non-JSON output: ${stdout.slice(0, 200)}`);
    }

    if (parsed.error) {
      throw new Error(`EasyOCR script error: ${parsed.error}`);
    }

    if (!Array.isArray(parsed.words)) {
      throw new Error('EasyOCR response missing "words" array');
    }

    return parsed.words as EasyOcrWord[];
  } finally {
    await fs.promises.rm(imagePath, { force: true });
  }
}

function buildEvaluation(transcription: string) {
  const hasText = transcription.trim().length > 0;
  return {
    problemName: 'Handwritten code submission',
    problemUrl: 'https://leetcode.com/problemset/',
    correctnessScore: 0,
    complexityScore: 0,
    readabilityScore: hasText ? 20 : 0,
    totalGrade: hasText ? 20 : 0,
    correctnessFeedback: 'OCR completed locally with EasyOCR. Problem correctness requires a code-aware evaluator.',
    complexityFeedback: 'Complexity could not be inferred reliably from OCR alone.',
    readabilityFeedback: hasText ? 'Text was detected and transcribed from the uploaded image.' : 'No readable code was detected.',
    timeComplexity: 'Not evaluated',
    spaceComplexity: 'Not evaluated',
    optimizedCode: transcription,
    optimizedTimeComplexity: 'Not evaluated',
    optimizedSpaceComplexity: 'Not evaluated',
    language: 'Unknown',
  };
}

async function startServer() {
  const app = express();
  
  // Set larger limit for image base64 uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // API Endpoint for analysis
  app.post('/api/analyze', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const words = await runEasyOcr(image);
      const transcription = words.map((word) => word.text).join(' ');
      res.json({ words, transcription, evaluation: buildEvaluation(transcription) });

    } catch (error: any) {
      console.error("EasyOCR Error in /api/analyze:", error);
      res.status(500).json({ 
        error: error?.message || 'Failed to analyze the code submission',
      });
    }
  });

  // Setup static file serving or Vite in dev mode
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve production static assets from 'dist'
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

// In Next-like or full-stack, export startServer
import { createServer as createViteServer } from 'vite';
startServer();
