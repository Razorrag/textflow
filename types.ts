export enum RewriteMode {
  HUMANIZE = 'HUMANIZE',
  PARAPHRASE = 'PARAPHRASE',
  ACADEMIC = 'ACADEMIC',
  CREATIVE = 'CREATIVE',
  PLAG_REMOVER = 'PLAG_REMOVER'
}

// ====================
// AI Detection Types
// ====================

export interface AIAnalysisResult {
  aiProbability: number;      // 0-100 (Higher = more likely AI)
  humanProbability: number;   // 0-100 (Higher = more likely human)
  confidence: 'high' | 'medium' | 'low';
  verdict: 'Definitely AI' | 'Likely AI' | 'Possibly AI' | 'Uncertain' | 'Possibly Human' | 'Likely Human' | 'Definitely Human';
  
  // Detailed metrics
  scores: {
    perplexity: number;        // Based on text predictability
    burstiness: number;        // Based on sentence length variance
    entropy: number;           // Based on information density
    stylometry: number;        // Based on writing style
    fingerprint: number;       // Based on AI markers
  };
  
  // Detailed breakdowns
  metrics: {
    perplexity: {
      score: number;
      interpretation: 'highly-predictable' | 'predictable' | 'natural' | 'highly-variable';
    };
    burstiness: {
      coefficient: number;
      interpretation: string;
      isLow: boolean;
    };
    entropy: {
      normalized: number;
      interpretation: 'low-entropy' | 'moderate-entropy' | 'high-entropy';
    };
    fingerprint: {
      markerCount: number;
      density: number;
    };
  };
  
  recommendations: string[];
  details: {
    keyIndicators: string[];
    warnings: string[];
  };
}

// ====================
// Humanization Types
// ====================

export interface HumanizationConfig {
  preserveMeaning: boolean;
  increaseBurstiness: boolean;
  injectHedging: boolean;
  reduceTransitions: boolean;
  addImperfections: boolean;
  varyVocabulary: boolean;
  restructureSentences: boolean;
}

export interface HumanizationResult {
  transformedText: string;
  changes: string[];
  aiProbabilityBefore: number;
  aiProbabilityAfter: number;
  metrics: {
    originalBurstiness: number;
    newBurstiness: number;
  };
}

// ====================
// Plagiarism Detection Types
// ====================

export interface PlagiarismReport {
  overallScore: number;        // 0-1 (Higher = more similar)
  uniqueContent: number;       // 0-1 (Higher = more unique)
  
  exactMatches: PlagiarismMatch[];
  semanticMatches: PlagiarismMatch[];
  
  recommendations: string[];
}

export interface PlagiarismMatch {
  source: string;
  similarity: number;         // 0-1
  matchedSegments: string[];
}

// ====================
// Rewrite/Response Types
// ====================

export interface RewriteResponse {
  rewritten: string;
  changes: string[];
  stats: {
    originalWordCount: number;
    newWordCount: number;
    [key: string]: number | string;
  };
}

// ====================
// Analysis Result Types
// ====================

export interface AnalysisResult {
  aiAnalysis: AIAnalysisResult;
  plagiarismReport: PlagiarismReport;
  
  // Legacy compatibility
  aiScore: number;
  humanScore: number;
  plagiarismScore: number;
  readabilityScore: number;
  verdict: string;
  details: string[];
}

// ====================
// Processing Types
// ====================

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  progress: number;
  stage: 'idle' | 'analyzing' | 'humanizing' | 'checking-plagiarism' | 'complete';
}
