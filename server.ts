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

interface EasyOcrPage {
  image: string;
  words: EasyOcrWord[];
}

// Timeout for the EasyOCR Python process (ms). First run is slower due to
// model download; subsequent runs use the cached model (~5-10 s on CPU).
const OCR_TIMEOUT_MS = 120_000;

async function runEasyOcr(image: string): Promise<{ words: EasyOcrWord[]; pages: EasyOcrPage[] }> {
  const mimeMatch = image.match(/^data:([^;]+);base64,/);
  if (!mimeMatch) {
    throw new Error('Invalid upload format: expected a data URL with base64 content.');
  }

  const mimeType = mimeMatch[1] || 'image/png';
  const base64Data = image.replace(/^data:.*;base64,/, '');
  if (!base64Data) throw new Error('Invalid image data: missing base64 payload');

  const extension = mimeType.split('/').pop() || 'png';
  const imagePath = path.join(os.tmpdir(), `leetcode-ocr-${Date.now()}.${extension}`);
  const pythonScript = path.resolve(__dirname, 'python', 'easyocr_service.py');
  const pythonCommand = process.env.EASYOCR_PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
  const pythonArgs = process.env.EASYOCR_PYTHON
    ? [pythonScript, imagePath]
    : process.platform === 'win32'
      ? ['-3', pythonScript, imagePath]
      : [pythonScript, imagePath];

  try {
    await fs.promises.writeFile(imagePath, Buffer.from(base64Data, 'base64'));

    const { stdout, stderr } = await execFileAsync(
      pythonCommand,
      pythonArgs,
      { maxBuffer: 100 * 1024 * 1024, timeout: OCR_TIMEOUT_MS }
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

    return {
      words: parsed.words as EasyOcrWord[],
      pages: Array.isArray(parsed.pages) ? parsed.pages as EasyOcrPage[] : [],
    };
  } finally {
    await fs.promises.rm(imagePath, { force: true });
  }
}

interface ProblemDefinition {
  number: number;
  title: string;
  slug: string;
  patterns: RegExp[];
  complexity: string;
}

const LEETCODE_PROBLEMS: ProblemDefinition[] = [
  { number: 1, title: 'Two Sum', slug: 'two-sum', patterns: [/two.?sum/i, /def\s+twoSum/i], complexity: 'O(n) time, O(n) space' },
  { number: 3, title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', patterns: [/longest.?substring/i, /set\(/i], complexity: 'O(n) time, O(k) space' },
  { number: 20, title: 'Valid Parentheses', slug: 'valid-parentheses', patterns: [/isValid/i, /stack/i, /parenthes/i], complexity: 'O(n) time, O(n) space' },
  { number: 21, title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', patterns: [/mergeTwoLists/i, /list1.*list2/i], complexity: 'O(n + m) time, O(1) space' },
  { number: 53, title: 'Maximum Subarray', slug: 'maximum-subarray', patterns: [/maxSubArray/i, /kadane/i], complexity: 'O(n) time, O(1) space' },
  { number: 70, title: 'Climbing Stairs', slug: 'climbing-stairs', patterns: [/climbStairs/i, /climbing.?stairs/i], complexity: 'O(n) time, O(1) space' },
  { number: 94, title: 'Binary Tree Inorder Traversal', slug: 'binary-tree-inorder-traversal', patterns: [/inorderTraversal/i, /inorder/i], complexity: 'O(n) time, O(n) space' },
  { number: 121, title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', patterns: [/maxProfit/i, /buy.*sell/i], complexity: 'O(n) time, O(1) space' },
  { number: 125, title: 'Valid Palindrome', slug: 'valid-palindrome', patterns: [/isPalindrome/i, /palindrome/i], complexity: 'O(n) time, O(1) space' },
  { number: 206, title: 'Reverse Linked List', slug: 'reverse-linked-list', patterns: [/reverse.?list/i, /curr.*next/i, /next_node/i], complexity: 'O(n) time, O(1) space' },
  { number: 217, title: 'Contains Duplicate', slug: 'contains-duplicate', patterns: [/containsDuplicate/i, /duplicate/i], complexity: 'O(n) time, O(n) space' },
  { number: 226, title: 'Invert Binary Tree', slug: 'invert-binary-tree', patterns: [/invertTree/i, /invert.*tree/i], complexity: 'O(n) time, O(n) space' },
  { number: 704, title: 'Binary Search', slug: 'binary-search', patterns: [/binarySearch/i, /binary.?search/i, /left.*right.*mid/i], complexity: 'O(log n) time, O(1) space' },
];

function findProblem(transcription: string, hint?: string): ProblemDefinition | null {
  const searchText = `${hint || ''} ${transcription}`.toLowerCase();
  const numberedMatch = searchText.match(/leetcode\.com\/problems\/([a-z0-9-]+)|\b(?:problem\s*)?(\d{1,4})\b/);
  if (numberedMatch) {
    const slug = numberedMatch[1];
    const number = numberedMatch[2] ? Number(numberedMatch[2]) : undefined;
    const exact = LEETCODE_PROBLEMS.find((problem) =>
      (slug && problem.slug === slug) || (number !== undefined && problem.number === number)
    );
    if (exact) return exact;
  }

  return LEETCODE_PROBLEMS.find((problem) => problem.patterns.some((pattern) => pattern.test(searchText))) || null;
}

function buildEvaluation(transcription: string, problemHint?: string) {
  const hasText = transcription.trim().length > 0;
  const problem = findProblem(transcription, problemHint);
  const hasSolutionStructure = /class\s+Solution|def\s+\w+|function\s+\w+|public\s+\w+\s+\w+/.test(transcription);
  const recognizedSolution = Boolean(problem && problem.patterns.some((pattern) => pattern.test(transcription)));
  const correctnessScore = !hasText ? 0 : recognizedSolution ? 50 : hasSolutionStructure ? 20 : 10;
  const complexityScore = !hasText ? 0 : problem ? (recognizedSolution ? 30 : 18) : 10;
  const problemName = problem ? `${problem.number}. ${problem.title}` : 'Unmatched LeetCode problem';
  const problemUrl = problem ? `https://leetcode.com/problems/${problem.slug}/` : 'https://leetcode.com/problemset/';

  return {
    problemName,
    problemUrl,
    correctnessScore,
    complexityScore,
    readabilityScore: hasText ? 20 : 0,
    totalGrade: correctnessScore + complexityScore + (hasText ? 20 : 0),
    correctnessFeedback: !hasText
      ? 'No readable code was detected.'
      : problem
        ? recognizedSolution
          ? `Matched ${problem.title}. The detected function and algorithm markers are consistent with this problem. Run the solution against the official examples for final verification.`
          : `Matched ${problem.title}, but the expected solution markers were not clear in the OCR transcription. Review the code manually.`
        : 'The code was readable, but no supported LeetCode problem could be matched automatically. Enter the problem URL or number above the Run button for an exact match.',
    complexityFeedback: problem
      ? `Expected complexity for ${problem.title}: ${problem.complexity}. This prototype estimates complexity from the recognized code and does not execute it.`
      : 'Complexity could not be matched to a known problem. Provide the LeetCode URL or number to improve the check.',
    readabilityFeedback: hasText ? 'Text was detected and transcribed from the uploaded image.' : 'No readable code was detected.',
    timeComplexity: problem ? problem.complexity.split(' time,')[0] : 'Not matched',
    spaceComplexity: problem ? problem.complexity.split(', ')[1] : 'Not matched',
    optimizedCode: transcription,
    optimizedTimeComplexity: 'Not evaluated',
    optimizedSpaceComplexity: 'Not evaluated',
    language: 'Unknown',
  };
}

async function startServer() {
  const app = express();
  
  // Set larger limits for PDF/image base64 uploads.
  // PDFs can be much larger than 15 MB when uploaded as base64.
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Endpoint for analysis
  app.post('/api/analyze', async (req, res) => {
    try {
      const { image, problemHint } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const { words, pages } = await runEasyOcr(image);
      const transcription = words.map((word) => word.text).join(' ');
      res.json({ words, pages, transcription, evaluation: buildEvaluation(transcription, problemHint) });

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
