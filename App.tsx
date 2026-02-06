import React, { useState, useCallback } from 'react';
import { 
  Sparkles, Fingerprint, AlertCircle, ArrowRightLeft, 
  BookOpen, Wand2, Cpu, BarChart3, CheckCircle2, Download,
  ShieldCheck, Activity, TrendingUp, AlertTriangle
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { TextArea } from './components/TextArea';
import { Button } from './components/Button';
import { textProcessorWorker } from './workers/workerManager';
import { rewriteText, analyzeText } from './services/textAnalysisService';
import { extractTextFromPdf } from './services/pdfService';
import { RewriteMode, RewriteResponse, AnalysisResult } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'refine' | 'analyze'>('refine');
  const [inputText, setInputText] = useState('');
  
  // Refine State
  const [rewriteResult, setRewriteResult] = useState<RewriteResponse | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [activeMode, setActiveMode] = useState<RewriteMode>(RewriteMode.HUMANIZE);

  // Analyze State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const countWords = (str: string) => str.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isTextTooShort = countWords(inputText) < 10;

  const handleRewrite = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsRewriting(true);
    setError(null);
    setRewriteResult(null);
    try {
      // Use Web Worker if available, fallback to direct service call
      const data = textProcessorWorker.isAvailable 
        ? await textProcessorWorker.rewriteText(inputText, activeMode)
        : await rewriteText(inputText, activeMode);
      setRewriteResult(data);
    } catch (err: any) {
      setError(err.message || "Processing failed.");
    } finally {
      setIsRewriting(false);
    }
  }, [inputText, activeMode]);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    try {
      // Use Web Worker if available, fallback to direct service call
      const data = textProcessorWorker.isAvailable 
        ? await textProcessorWorker.analyzeText(inputText)
        : await analyzeText(inputText);
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText]);

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setError(null);
    try {
        let text = "";
        if (file.type === "application/pdf") {
            text = await extractTextFromPdf(file);
        } else if (file.type === "text/plain") {
            text = await file.text();
        } else {
            throw new Error("Unsupported file format. Please use PDF or TXT.");
        }
        
        if (!text.trim()) {
            throw new Error("Could not extract text from file. It might be scanned or empty.");
        }
        setInputText(text);
    } catch (err: any) {
        setError(err.message || "Failed to import file.");
    } finally {
        setIsImporting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!rewriteResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Brand color
    doc.text("TextFlow Report", margin, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} • Mode: ${activeMode}`, margin, 28);

    doc.setDrawColor(200);
    doc.line(margin, 35, pageWidth - margin, 35);

    // Rewritten Text
    let yPos = 50;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Refined Output", margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60);
    const rewrittenLines = doc.splitTextToSize(rewriteResult.rewritten, maxLineWidth);
    doc.text(rewrittenLines, margin, yPos);
    
    yPos += rewrittenLines.length * 7 + 15;

    // Changes Report
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Optimization Summary", margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(80);
    rewriteResult.changes.forEach((change) => {
        doc.text(`• ${change}`, margin + 5, yPos);
        yPos += 7;
    });
    
    // Stats
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Word Count: ${rewriteResult.stats.newWordCount} (Original: ${rewriteResult.stats.originalWordCount})`, margin, yPos);

    doc.save("TextFlow_Report.pdf");
  };

  const handleClear = () => {
    setInputText('');
    setRewriteResult(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getModeDescription = (mode: RewriteMode) => {
    switch(mode) {
      case RewriteMode.HUMANIZE: return "Refines text using conversational patterns.";
      case RewriteMode.PARAPHRASE: return "Restructures content to improve uniqueness.";
      case RewriteMode.ACADEMIC: return "Elevates vocabulary for formal contexts (Strongest).";
      case RewriteMode.CREATIVE: return "Injects vivid synonyms for expression.";
      case RewriteMode.PLAG_REMOVER: return "Aggressively replaces terms to remove plagiarism risks.";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl text-white shadow-lg shadow-brand-500/30">
              <ArrowRightLeft size={20} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">TextFlow</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Advanced Local Engine</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setActiveTab('refine')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'refine' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Wand2 size={16} /> Refine
            </button>
            <button 
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'analyze' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart3 size={16} /> Check & Analyze
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-medium">
            <Cpu size={14} />
            <span>100% Offline • No AI</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB: REFINE */}
        {activeTab === 'refine' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: RewriteMode.HUMANIZE, icon: <Fingerprint size={18} />, label: "Humanizer" },
                      { id: RewriteMode.PARAPHRASE, icon: <ArrowRightLeft size={18} />, label: "Spinner" },
                      { id: RewriteMode.PLAG_REMOVER, icon: <ShieldCheck size={18} />, label: "Plag Remover" },
                      { id: RewriteMode.ACADEMIC, icon: <BookOpen size={18} />, label: "Academic" },
                      { id: RewriteMode.CREATIVE, icon: <Wand2 size={18} />, label: "Creative" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                          activeMode === mode.id
                            ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm ring-1 ring-brand-200'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="mr-2 opacity-75">{mode.icon}</span>
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                        onClick={handleRewrite} 
                        disabled={!inputText.trim()} 
                        isLoading={isRewriting}
                        icon={<Sparkles size={18} />}
                        className="w-full md:w-auto shadow-lg shadow-brand-500/20"
                    >
                        {isRewriting ? 'Refining...' : `Process Text`}
                    </Button>
                  </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 flex items-center gap-2">
                  <AlertCircle size={14} className="text-brand-500" />
                  <span>{getModeDescription(activeMode)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              <TextArea
                label="Input"
                placeholder={isImporting ? "Importing document..." : "Paste your academic text, essay, or email here..."}
                value={inputText}
                onChange={setInputText}
                wordCount={countWords(inputText)}
                onClear={handleClear}
                onImport={handleImport}
              />
              <div className="h-full flex flex-col gap-4">
                <TextArea
                  label="Refined Output"
                  readOnly={true}
                  value={rewriteResult?.rewritten || ''}
                  placeholder="Enhanced output will appear here..."
                  wordCount={rewriteResult ? countWords(rewriteResult.rewritten) : 0}
                />
                {rewriteResult && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-in slide-in-from-bottom-2 fade-in flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="bg-green-100 p-1 rounded-md text-green-600"><CheckCircle2 size={16} /></div>
                           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Report</h3>
                        </div>
                        <div className="space-y-1">
                           {rewriteResult.changes.slice(0, 3).map((c, i) => (
                             <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                               <span className="w-1 h-1 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                               {c}
                             </div>
                           ))}
                        </div>
                    </div>
                    <div>
                        <Button 
                            variant="secondary" 
                            onClick={handleDownloadPDF}
                            icon={<Download size={16}/>}
                            className="text-xs px-3 py-1.5"
                        >
                            PDF
                        </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ANALYZE */}
        {activeTab === 'analyze' && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
             <div className="mb-6 h-[300px]">
                <TextArea 
                   label="Content Analysis"
                   placeholder={isImporting ? "Importing document..." : "Enter text to analyze for AI patterns and plagiarism risks..."}
                   value={inputText}
                   onChange={setInputText}
                   wordCount={countWords(inputText)}
                   onClear={handleClear}
                   onImport={handleImport}
                   className="h-full"
                />
             </div>
             
             <div className="flex justify-end mb-8">
               <Button 
                  onClick={handleAnalyze} 
                  isLoading={isAnalyzing} 
                  disabled={!inputText.trim()}
                  icon={<BarChart3 size={18} />}
                  className="w-full md:w-auto"
                >
                  Run Analysis
               </Button>
             </div>

             {isTextTooShort && analysisResult && (
               <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                 <AlertTriangle className="text-amber-500 mt-0.5" size={20} />
                 <div>
                   <h4 className="font-semibold text-amber-800">Text Too Short for Reliable Analysis</h4>
                   <p className="text-sm text-amber-700">Texts under 10 words may produce unreliable results. Add more content for accurate AI pattern detection.</p>
                 </div>
               </div>
             )}

             {analysisResult && (
               <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 fade-in ${isTextTooShort ? 'opacity-50' : ''}`}>
                  
                  {/* Human Score Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Human Likelihood</h3>
                     <div className="relative flex items-center justify-center w-32 h-32 mb-4">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path className={`${analysisResult.humanScore > 70 ? 'text-green-500' : analysisResult.humanScore > 40 ? 'text-yellow-500' : 'text-red-500'}`} 
                                strokeDasharray={`${analysisResult.humanScore}, 100`} 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                fill="none" stroke="currentColor" strokeWidth="3" 
                          />
                        </svg>
                        <span className="absolute text-3xl font-bold text-slate-800">{analysisResult.humanScore}%</span>
                     </div>
                     <p className="text-sm text-slate-600 font-medium">{analysisResult.verdict}</p>
                  </div>

                  {/* Machine Pattern Score Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Machine Pattern Score</h3>
                     <div className="w-full flex-1 flex flex-col justify-center gap-4">
                        <div className="w-full">
                           <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                             <span>Low Risk</span>
                             <span>High Risk</span>
                           </div>
                           <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${analysisResult.aiScore > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${analysisResult.aiScore}%` }}
                              />
                           </div>
                        </div>
                        <p className="text-sm text-slate-600">
                          {analysisResult.aiScore > 50 ? "Text exhibits uniform patterns typical of AI." : "Text shows natural variance."}
                        </p>
                     </div>
                  </div>

                  {/* Detailed Metrics Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Detection Metrics</h3>
                     <div className="space-y-4 flex-1">
                        {/* Perplexity */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Activity size={16} className="text-brand-500" />
                             <span className="text-sm text-slate-600">Predictability</span>
                           </div>
                           <span className={`text-sm font-bold ${analysisResult.aiAnalysis.metrics.perplexity.interpretation === 'highly-predictable' ? 'text-red-500' : analysisResult.aiAnalysis.metrics.perplexity.interpretation === 'predictable' ? 'text-yellow-500' : 'text-green-500'}`}>
                             {analysisResult.aiAnalysis.metrics.perplexity.interpretation.replace('-', ' ')}
                           </span>
                        </div>
                        {/* Burstiness */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <TrendingUp size={16} className="text-brand-500" />
                             <span className="text-sm text-slate-600">Sentence Variation</span>
                           </div>
                           <span className={`text-sm font-bold ${analysisResult.aiAnalysis.metrics.burstiness.isLow ? 'text-red-500' : 'text-green-500'}`}>
                             {analysisResult.aiAnalysis.metrics.burstiness.interpretation}
                           </span>
                        </div>
                        {/* Fingerprint Markers */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Fingerprint size={16} className="text-brand-500" />
                             <span className="text-sm text-slate-600">AI Markers</span>
                           </div>
                           <span className={`text-sm font-bold ${analysisResult.aiAnalysis.metrics.fingerprint.markerCount > 3 ? 'text-red-500' : analysisResult.aiAnalysis.metrics.fingerprint.markerCount > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                             {analysisResult.aiAnalysis.metrics.fingerprint.markerCount} detected
                           </span>
                        </div>
                        {analysisResult.aiAnalysis.metrics.fingerprint.markerCount > 0 && (
                          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                            <div className="font-medium mb-1 text-slate-600">AI-typical words found:</div>
                            {analysisResult.aiAnalysis.details.keyIndicators.slice(0, 5).map((indicator, i) => (
                              <div key={i} className="mb-0.5">• {indicator}</div>
                            ))}
                          </div>
                        )}
                     </div>
                  </div>

               </div>
             )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 mx-auto max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
             <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
             <p className="text-sm">{error}</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
