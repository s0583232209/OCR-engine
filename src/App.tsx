import { useState, useRef, useEffect } from "react";
import { 
  Upload, FileText, CheckCircle, TrendingUp, Maximize2, 
  Eye, EyeOff, Grid, ExternalLink, Copy, Sparkles, 
  Code, Award, Terminal, User, Mail, RefreshCw, X, AlertCircle, Check
} from "lucide-react";
import { PRELOADED_SAMPLES, PreloadedSample, OCRWord, LeetCodeEvaluation } from "./samples";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("sample-1");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState<string>("");
  const [customResult, setCustomResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Toggles for Bounding Box Overlays
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showGridlines, setShowGridlines] = useState<boolean>(true);
  const [hoveredWord, setHoveredWord] = useState<OCRWord | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Tab for technical interviewer feedback panels
  const [interviewerTab, setInterviewerTab] = useState<"transcribe" | "correctness" | "complexity" | "legibility">("transcribe");

  // Copy states
  const [copiedTranscribed, setCopiedTranscribed] = useState<boolean>(false);
  const [copiedOptimized, setCopiedOptimized] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states when changing tabs
  useEffect(() => {
    setHoveredWord(null);
    setHoveredIndex(null);
    setApiError(null);
  }, [activeTab]);

  // Handle Copy Actions
  const handleCopy = (text: string, type: "transcribed" | "optimized") => {
    navigator.clipboard.writeText(text);
    if (type === "transcribed") {
      setCopiedTranscribed(true);
      setTimeout(() => setCopiedTranscribed(false), 2000);
    } else {
      setCopiedOptimized(true);
      setTimeout(() => setCopiedOptimized(false), 2000);
    }
  };

  // Handle custom image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setCustomFilename(file.name);
        setCustomResult(null);
        setApiError(null);
        setActiveTab("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setCustomFilename(file.name);
        setCustomResult(null);
        setApiError(null);
        setActiveTab("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger analysis on the uploaded image
  const analyzeImage = async () => {
    if (!customImage) return;
    setIsAnalyzing(true);
    setApiError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: customImage,
          filename: customFilename
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred during analysis.");
      }

      setCustomResult(data);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to contact the server or model.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Active dataset resolver
  const isPreloaded = activeTab.startsWith("sample-");
  const currentSample = isPreloaded 
    ? PRELOADED_SAMPLES.find(s => s.id === activeTab) 
    : null;

  const currentResult = isPreloaded 
    ? currentSample 
    : (customResult ? {
        id: "custom",
        title: customResult.evaluation.problemName,
        studentName: "Custom Submission",
        email: customFilename,
        language: customResult.evaluation.language,
        words: customResult.words,
        transcription: customResult.transcription,
        evaluation: customResult.evaluation
      } : null);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Editorial Navigation Brand */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-editorial tracking-tight font-extrabold text-slate-900">
                Lumina OCR <span className="font-sans text-xs font-medium tracking-widest text-slate-400 uppercase ml-2">Interview Engine</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Optical character mapping & senior engineer grading for handwritten LeetCode code snippets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Input field helper */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={triggerFileInput}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white transition"
            >
              <Upload className="w-4 h-4" />
              Upload Code Image
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Hand-written Code & Annotations (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Workspace Tabs & Mode Selector */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("sample-1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === "sample-1" 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Sample 1: Reverse List
              </button>
              <button
                onClick={() => setActiveTab("sample-2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === "sample-2" 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Sample 2: Valid Parentheses
              </button>
              {customImage && (
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === "custom" 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Custom Upload
                </button>
              )}
            </div>

            {/* Quick configuration buttons */}
            <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                title={showOverlays ? "Hide OCR bounding boxes" : "Show OCR bounding boxes"}
                className={`p-1.5 rounded-lg transition ${
                  showOverlays ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                title={showAnnotations ? "Hide textual mapping overlay" : "Show textual mapping overlay"}
                className={`p-1.5 rounded-lg transition ${
                  showAnnotations ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
              {isPreloaded && (
                <button
                  onClick={() => setShowGridlines(!showGridlines)}
                  title={showGridlines ? "Hide notebook gridlines" : "Show notebook gridlines"}
                  className={`p-1.5 rounded-lg transition ${
                    showGridlines ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Core Code Canvas Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
            
            {/* Sheet Sub-Header Metadata (Zero-Pills layout) */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">SUBMISSION:</span>
                <span>{isPreloaded ? currentSample?.studentName : "Custom Image"}</span>
                <span>·</span>
                <span>{isPreloaded ? currentSample?.email : customFilename || "User Upload"}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                OCR Coordinates: Normalized 1000x1000
              </span>
            </div>

            {/* Display Body */}
            <div className="relative flex-1 p-6 flex flex-col justify-center items-center bg-[#FDFDFD]">
              
              {/* Preloaded Simulated Handwriting Note */}
              {isPreloaded && currentSample && (
                <div 
                  className={`w-full max-w-xl aspect-[4/5] p-8 relative rounded-lg border border-slate-200/60 shadow-inner ${
                    showGridlines ? "lined-paper" : "bg-white"
                  }`}
                  style={{
                    boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02), 0 4px 20px rgba(0,0,0,0.03)"
                  }}
                >
                  {/* Visual Left Margin Line */}
                  {showGridlines && (
                    <div className="absolute top-0 bottom-0 left-[3.5rem] border-l-2 border-red-200/80 pointer-events-none" />
                  )}

                  {/* Handwriting content with layout aligned to grid lines */}
                  <div className="relative h-full text-slate-800 font-handwriting text-xl leading-[2rem] select-none pl-[2.5rem]">
                    {currentSample.lines.map((line, idx) => (
                      <div 
                        key={idx} 
                        className="h-[2rem] flex items-center whitespace-pre text-slate-700 font-medium"
                        style={{
                          letterSpacing: "0.01em"
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>

                  {/* Bounding Box Hover & Click Overlay (0-1000 scale relative mapping) */}
                  {showOverlays && (
                    <div className="absolute inset-0 z-20 pointer-events-auto">
                      {currentSample.words.map((w, idx) => {
                        const [ymin, xmin, ymax, xmax] = w.box;
                        const top = `${ymin / 10}%`;
                        const left = `${xmin / 10}%`;
                        const height = `${(ymax - ymin) / 10}%`;
                        const width = `${(xmax - xmin) / 10}%`;
                        const isHovered = hoveredIndex === idx;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => {
                              setHoveredWord(w);
                              setHoveredIndex(idx);
                            }}
                            onMouseLeave={() => {
                              setHoveredWord(null);
                              setHoveredIndex(null);
                            }}
                            className={`absolute border rounded cursor-pointer transition-all duration-150 ${
                              isHovered 
                                ? "bg-emerald-500/15 border-emerald-500 z-30 scale-105 shadow-md" 
                                : "bg-blue-500/5 border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10"
                            }`}
                            style={{ top, left, width, height }}
                          >
                            {/* Floating mapping overlay: place recognized text directly above handwritten word */}
                            {showAnnotations && (isHovered || showAnnotations) && (
                              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none tracking-tight shadow-sm border border-slate-200 font-sans pointer-events-none ${
                                isHovered 
                                  ? "bg-slate-900 text-white border-slate-900 z-40 scale-110" 
                                  : "bg-white text-slate-700 bg-white/95"
                              }`}>
                                {w.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Image View */}
              {activeTab === "custom" && customImage && (
                <div className="w-full h-full flex flex-col justify-center items-center gap-4">
                  
                  {/* Analysis trigger toolbar when not analyzed yet */}
                  {!customResult && !isAnalyzing && (
                    <div className="w-full max-w-md p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-4 text-center">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Analyze Uploaded Code</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">
                          Run the OCR word mapping engine and technical interview evaluator on your submission.
                        </p>
                      </div>
                      <button
                        onClick={analyzeImage}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        Run OCR & Technical Interview
                      </button>
                    </div>
                  )}

                  {/* Loading status */}
                  {isAnalyzing && (
                    <div className="w-full max-w-md p-8 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-950 animate-spin" />
                        <Sparkles className="w-5 h-5 text-slate-950 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Processing Hand-written Submission...</h3>
                        <p className="text-xs text-slate-400 mt-1.5 animate-pulse">
                          Running layout mapping, bounding box tokenization, and LeetCode scoring algorithms
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Notification */}
                  {apiError && (
                    <div className="w-full max-w-md p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 text-xs">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="font-semibold">Analysis Failed</p>
                        <p className="mt-1 text-red-700/90">{apiError}</p>
                      </div>
                    </div>
                  )}

                  {/* Image Display & BBox Canvas */}
                  <div className="relative w-full max-w-xl max-h-[550px] overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex items-center justify-center">
                    <img 
                      src={customImage} 
                      alt="Uploaded handwritten submission" 
                      className="max-w-full max-h-[550px] object-contain select-none"
                    />

                    {/* OCR Bounding Boxes on top of image */}
                    {customResult && showOverlays && (
                      <div className="absolute inset-0 w-full h-full pointer-events-auto">
                        {customResult.words.map((w: OCRWord, idx: number) => {
                          const [ymin, xmin, ymax, xmax] = w.box;
                          const top = `${ymin / 10}%`;
                          const left = `${xmin / 10}%`;
                          const height = `${(ymax - ymin) / 10}%`;
                          const width = `${(xmax - xmin) / 10}%`;
                          const isHovered = hoveredIndex === idx;

                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => {
                                setHoveredWord(w);
                                setHoveredIndex(idx);
                              }}
                              onMouseLeave={() => {
                                setHoveredWord(null);
                                setHoveredIndex(null);
                              }}
                              className={`absolute border rounded cursor-pointer transition-all duration-150 ${
                                isHovered 
                                  ? "bg-emerald-500/20 border-emerald-400 z-30 scale-105 shadow-md" 
                                  : "bg-blue-500/5 border-blue-500/20 hover:border-blue-400 hover:bg-blue-500/10"
                              }`}
                              style={{ top, left, width, height }}
                            >
                              {/* Overlay Word annotation */}
                              {showAnnotations && (isHovered || showAnnotations) && (
                                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none tracking-tight shadow-sm border border-slate-200 pointer-events-none ${
                                  isHovered 
                                    ? "bg-slate-900 text-white border-slate-900 z-40 scale-110" 
                                    : "bg-white text-slate-700"
                                }`}>
                                  {w.text}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {customResult && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setCustomResult(null);
                          setCustomImage(null);
                          setActiveTab("sample-1");
                        }}
                        className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-semibold bg-white transition"
                      >
                        Reset & Clear
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Hover Word Status Bar */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hoveredWord ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                <span className="text-slate-500">
                  {hoveredWord ? "Token Highlighted:" : "Hover OCR elements to examine coordinate metrics."}
                </span>
                {hoveredWord && (
                  <span className="font-mono bg-slate-200/60 px-2 py-0.5 rounded text-slate-800 font-semibold">
                    &ldquo;{hoveredWord.text}&rdquo;
                  </span>
                )}
              </div>
              {hoveredWord && (
                <div className="text-slate-400 font-mono text-[10px]">
                  y:[{hoveredWord.box[0]}, {hoveredWord.box[2]}] · x:[{hoveredWord.box[1]}, {hoveredWord.box[3]}]
                </div>
              )}
            </div>

          </div>

          {/* Simple Instruction Card */}
          <div className="bg-slate-900/5 border border-slate-200/50 p-4 rounded-2xl flex gap-3 text-xs text-slate-600">
            <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Visual Annotation Mapping Instruction</p>
              <p className="mt-1 text-slate-500">
                Lumina maps the normalized coordinates of the OCR directly to the canvas elements. Hover or toggle overlays in the top right to verify exact spatial alignment. Click "Upload Code" to evaluate your own paper drawings.
              </p>
            </div>
          </div>

        </section>

        {/* Right Column: AI Interview Evaluation Panel (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Main Interview Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col flex-1">
            
            {/* Interviewer Banner Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-editorial text-lg tracking-tight font-bold">Interviewer Evaluation</h2>
                  <p className="text-[10px] text-slate-300/80 font-sans uppercase tracking-wider mt-0.5">LeetCode Code Assessment</p>
                </div>
              </div>
              <div className="text-right">
                {currentResult && (
                  <span className="font-mono text-xl font-bold tracking-tight text-emerald-400 tabular-nums">
                    {currentResult.evaluation.totalGrade}/100
                  </span>
                )}
              </div>
            </div>

            {/* Empty state / Prompt to trigger analysis */}
            {!currentResult && (
              <div className="flex-1 flex flex-col justify-center items-center p-8 text-center text-slate-500 min-h-[400px]">
                <div className="p-4 bg-slate-50 rounded-full border border-slate-100 text-slate-400 mb-4 animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">Analysis Missing</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Please upload a hand-written code snippet image and click "Run OCR & Technical Interview" or switch to preloaded samples to see evaluation reports.
                </p>
              </div>
            )}

            {currentResult && (
              <div className="flex flex-col flex-1">
                
                {/* Identified Problem Summary */}
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Detected Challenge</p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">
                      {currentResult.evaluation.problemName}
                    </p>
                  </div>
                  <a
                    href={currentResult.evaluation.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition font-medium"
                  >
                    LeetCode <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Tabbed Score Breakdown (No Static Pills style) */}
                <div className="p-5 border-b border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Correctness</p>
                    <p className="text-lg font-mono font-bold text-slate-800 mt-1 tabular-nums">
                      {currentResult.evaluation.correctnessScore}<span className="text-slate-300 text-xs font-normal">/50</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Complexity</p>
                    <p className="text-lg font-mono font-bold text-slate-800 mt-1 tabular-nums">
                      {currentResult.evaluation.complexityScore}<span className="text-slate-300 text-xs font-normal">/30</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Legibility</p>
                    <p className="text-lg font-mono font-bold text-slate-800 mt-1 tabular-nums">
                      {currentResult.evaluation.readabilityScore}<span className="text-slate-300 text-xs font-normal">/20</span>
                    </p>
                  </div>
                </div>

                {/* Panel Sub-Tabs Navigation */}
                <div className="border-b border-slate-100 bg-slate-50/50 p-1 flex items-center">
                  <button
                    onClick={() => setInterviewerTab("transcribe")}
                    className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
                      interviewerTab === "transcribe" 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Transcription
                  </button>
                  <button
                    onClick={() => setInterviewerTab("correctness")}
                    className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
                      interviewerTab === "correctness" 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Logic & Bugs
                  </button>
                  <button
                    onClick={() => setInterviewerTab("complexity")}
                    className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
                      interviewerTab === "complexity" 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Complexity
                  </button>
                  <button
                    onClick={() => setInterviewerTab("legibility")}
                    className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
                      interviewerTab === "legibility" 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Style & Whiteboard
                  </button>
                </div>

                {/* Sub-Panel Content Viewports */}
                <div className="p-5 flex-1 overflow-y-auto max-h-[500px]">
                  
                  {/* TAB 1: Transcription Code Block */}
                  {interviewerTab === "transcribe" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                          Clean OCR Code Stream ({currentResult.evaluation.language})
                        </span>
                        <button
                          onClick={() => handleCopy(currentResult.transcription, "transcribed")}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition"
                        >
                          {copiedTranscribed ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Clean Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-950">
                        <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-600 uppercase">
                          {currentResult.evaluation.language}
                        </div>
                        <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-300">
                          <code>{currentResult.transcription}</code>
                        </pre>
                      </div>

                      <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-slate-700">
                        <p className="font-semibold text-emerald-800">Engine Transcription Summary</p>
                        <p className="mt-1 leading-relaxed text-slate-600">
                          This transcription is the clean text decoded line-by-line from the handwriting's character layout, keeping indentations and syntax structure for compilation evaluation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Correctness and Bug Critiques */}
                  {interviewerTab === "correctness" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-slate-800">
                        <CheckCircle className="w-4.5 h-4.5 text-blue-500" />
                        <h3 className="font-semibold text-sm">Technical Correctness Feedback</h3>
                      </div>
                      
                      <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 space-y-4">
                        {currentResult.evaluation.correctnessFeedback.split('\n\n').map((para: string, i: number) => (
                          <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-semibold">$1</code>') }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Complexity & Optimizations */}
                  {interviewerTab === "complexity" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-slate-800">
                        <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                        <h3 className="font-semibold text-sm">Algorithmic Big-O Assessment</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Their Time Complexity</p>
                          <p className="text-sm font-mono font-bold text-slate-800 mt-1">{currentResult.evaluation.timeComplexity}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Their Space Complexity</p>
                          <p className="text-sm font-mono font-bold text-slate-800 mt-1">{currentResult.evaluation.spaceComplexity}</p>
                        </div>
                      </div>

                      <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 space-y-3 border-b border-slate-100 pb-4">
                        {currentResult.evaluation.complexityFeedback.split('\n\n').map((para: string, i: number) => (
                          <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-semibold">$1</code>') }} />
                        ))}
                      </div>

                      {/* Optimized Code Block section */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
                            Optimized Solution (Recommended)
                          </span>
                          <button
                            onClick={() => handleCopy(currentResult.evaluation.optimizedCode, "optimized")}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition"
                          >
                            {copiedOptimized ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center mb-1">
                          <div className="py-2 px-3 bg-emerald-50 border border-emerald-100/50 rounded-xl">
                            <p className="text-[9px] text-emerald-600 uppercase font-semibold">Optimized Time</p>
                            <p className="text-xs font-mono font-bold text-emerald-800 mt-0.5">{currentResult.evaluation.optimizedTimeComplexity}</p>
                          </div>
                          <div className="py-2 px-3 bg-emerald-50 border border-emerald-100/50 rounded-xl">
                            <p className="text-[9px] text-emerald-600 uppercase font-semibold">Optimized Space</p>
                            <p className="text-xs font-mono font-bold text-emerald-800 mt-0.5">{currentResult.evaluation.optimizedSpaceComplexity}</p>
                          </div>
                        </div>

                        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-950">
                          <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-300">
                            <code>{currentResult.evaluation.optimizedCode}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Legibility & Whiteboard Tips */}
                  {interviewerTab === "legibility" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-slate-800">
                        <User className="w-4.5 h-4.5 text-blue-500" />
                        <h3 className="font-semibold text-sm">Whiteboard Presence & Style Report</h3>
                      </div>

                      <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-600 space-y-4">
                        {currentResult.evaluation.readabilityFeedback.split('\n\n').map((para: string, i: number) => (
                          <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-semibold">$1</code>') }} />
                        ))}
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                        <p className="font-semibold text-slate-800">💡 Professional Interview Tips:</p>
                        <ul className="mt-2 space-y-2 list-disc list-inside text-slate-600">
                          <li>Always announce your space and time complexity <strong>before</strong> writing code.</li>
                          <li>Avoid erasing large blocks with messy crossing lines; draw a single line or ask the interviewer if you can rewrite.</li>
                          <li>Add brief inline notes to explain complex modular operations on the whiteboard.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </section>

      </main>

      {/* Modern, clean footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Lumina Interview Labs. All rights reserved.</p>
          <div className="flex gap-4 text-slate-400 hover:text-slate-600">
            <span>Security</span>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
