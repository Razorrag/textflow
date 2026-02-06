/**
 * Web Worker for heavy text processing operations
 * Prevents UI freezing during AI detection and humanization
 */

import { 
  ScoringEngine, 
  AIDetectionResult 
} from '../engines/aiDetection/ScoringEngine';

import { 
  HumanizationEngine,
  HumanizationResult,
  HumanizationConfig 
} from '../engines/humanization';

import { 
  PlagiarismDetector,
  PlagiarismReport 
} from '../engines/plagiarism';

import { 
  RewriteMode,
  AnalysisResult 
} from '../types';

// Initialize engines once for reuse
const aiEngine = new ScoringEngine();
const humanizationEngine = new HumanizationEngine();
const plagiarismDetector = new PlagiarismDetector();

interface WorkerMessage {
  id: string;
  type: 'analyze' | 'humanize' | 'rewrite' | 'check-plagiarism';
  data: any;
}

interface WorkerResponse {
  id: string;
  type: 'success' | 'error';
  result?: any;
  error?: string;
}

// Main worker message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'analyze':
        result = await handleAnalyze(data);
        break;
        
      case 'humanize':
        result = await handleHumanize(data);
        break;
        
      case 'rewrite':
        result = await handleRewrite(data);
        break;
        
      case 'check-plagiarism':
        result = await handleCheckPlagiarism(data);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
    
    self.postMessage({
      id,
      type: 'success',
      result
    } as WorkerResponse);
    
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as WorkerResponse);
  }
};

/**
 * Handle text analysis request
 */
async function handleAnalyze(data: { text: string }): Promise<AnalysisResult> {
  const { text } = data;
  
  // AI Detection
  const aiResult = aiEngine.analyze(text);
  
  // Plagiarism Check (local only)
  const plagiarismResult = plagiarismDetector.checkLocal(text);

  // Legacy compatibility
  const readabilityScore = calculateReadabilityScore(text);

  return {
    aiAnalysis: convertAIDetectionResult(aiResult),
    plagiarismReport: plagiarismResult,
    aiScore: aiResult.aiProbability,
    humanScore: aiResult.humanProbability,
    plagiarismScore: Math.round((1 - plagiarismResult.overallScore) * 100),
    readabilityScore,
    verdict: aiResult.verdict,
    details: generateDetails(aiResult, plagiarismResult)
  };
}

/**
 * Handle text humanization request
 */
async function handleHumanize(data: { 
  text: string; 
  mode?: RewriteMode;
}): Promise<HumanizationResult> {
  const { text, mode } = data;
  
  // Configure based on mode
  const config: Partial<HumanizationConfig> = {};
  
  switch (mode) {
    case RewriteMode.HUMANIZE:
      config.increaseBurstiness = true;
      config.varyVocabulary = true;
      config.addImperfections = true;
      break;
    case RewriteMode.PLAG_REMOVER:
      config.varyVocabulary = true;
      config.restructureSentences = true;
      break;
    case RewriteMode.ACADEMIC:
      config.varyVocabulary = true;
      config.reduceTransitions = true;
      break;
    case RewriteMode.CREATIVE:
      config.varyVocabulary = true;
      config.restructureSentences = true;
      config.injectHedging = true;
      break;
    default:
      config.increaseBurstiness = true;
      config.varyVocabulary = true;
      config.reduceTransitions = true;
      config.addImperfections = true;
  }

  return humanizationEngine.humanize(text, config);
}

/**
 * Handle text rewrite request
 */
async function handleRewrite(data: { 
  text: string; 
  mode: RewriteMode;
}) {
  const { text, mode } = data;
  
  // Analyze original
  const originalAnalysis = aiEngine.analyze(text);
  
  let rewrittenText: string;
  let changes: string[];
  
  // Use TurnitinBypassEngine for ACADEMIC and PLAG_REMOVER modes
  if (mode === RewriteMode.ACADEMIC || mode === RewriteMode.PLAG_REMOVER) {
    const turnitinEngine = humanizationEngine['turnitinEngine'];
    const bypassResult = turnitinEngine.bypassTurnitin(text, {
      vocabularyEnhancement: 'high',
      paraphraseDepth: mode === RewriteMode.PLAG_REMOVER ? 'deep' : 'medium',
      hedgingLevel: 0.5,
      transitionDiversity: 'high',
      sentenceVariation: 0.6,
      formalityLevel: 0.8,
      preserveAcademicTone: true
    });
    
    rewrittenText = bypassResult.transformedText;
    changes = bypassResult.transformationsApplied.map(t => t.description);
  } else {
    // Use standard humanization for other modes
    const humanized = humanizationEngine.humanize(text, {
      increaseBurstiness: true,
      varyVocabulary: true,
      reduceTransitions: true,
      injectHedging: mode === RewriteMode.CREATIVE,
      addImperfections: mode === RewriteMode.HUMANIZE,
      restructureSentences: true,
      preserveMeaning: true
    });
    
    rewrittenText = humanized.transformedText;
    changes = humanized.changes;
  }
  
  // Analyze rewritten
  const rewrittenAnalysis = aiEngine.analyze(rewrittenText);
  
  return {
    original: text,
    rewritten: rewrittenText,
    changes,
    stats: {
      originalWordCount: text.split(/\s+/).length,
      newWordCount: rewrittenText.split(/\s+/).length,
      aiProbabilityBefore: originalAnalysis.aiProbability,
      aiProbabilityAfter: rewrittenAnalysis.aiProbability
    }
  };
}

/**
 * Handle plagiarism check request
 */
async function handleCheckPlagiarism(data: { text: string }): Promise<PlagiarismReport> {
  const { text } = data;
  return plagiarismDetector.checkLocal(text);
}

// Helper functions (moved from main service)
function convertAIDetectionResult(result: AIDetectionResult) {
  return {
    aiProbability: result.aiProbability,
    humanProbability: result.humanProbability,
    confidence: result.confidence,
    verdict: result.verdict,
    scores: result.scores,
    metrics: {
      perplexity: {
        score: result.metrics.perplexity.perplexity,
        interpretation: result.metrics.perplexity.interpretation
      },
      burstiness: {
        coefficient: result.metrics.burstiness.burstinessIndex,
        interpretation: result.metrics.burstiness.interpretation,
        isLow: result.metrics.burstiness.isLowBurstiness
      },
      entropy: {
        normalized: result.metrics.entropy.normalizedShannon,
        interpretation: result.metrics.entropy.interpretation
      },
      fingerprint: {
        markerCount: result.metrics.fingerprint.totalMarkers,
        density: result.metrics.fingerprint.density
      }
    },
    recommendations: result.recommendations,
    details: {
      keyIndicators: result.details.keyIndicators,
      warnings: result.details.warnings
    }
  };
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  // Flesch Reading Ease approximation
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

  return Math.round(Math.max(0, Math.min(100, score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function generateDetails(aiResult: AIDetectionResult, plagiarismResult: PlagiarismReport): string[] {
  const details: string[] = [];

  // AI Detection details
  details.push(`AI Probability: ${aiResult.aiProbability}%`);
  details.push(`Confidence: ${aiResult.confidence}`);
  details.push(`Verdict: ${aiResult.verdict}`);
  
  if (aiResult.metrics.perplexity.perplexity > 0) {
    details.push(`Text Predictability: ${aiResult.metrics.perplexity.interpretation}`);
  }
  
  if (aiResult.metrics.burstiness.burstinessIndex > 0) {
    details.push(`Sentence Variation: ${aiResult.metrics.burstiness.interpretation}`);
  }

  // Plagiarism details
  details.push(`Originality: ${Math.round(plagiarismResult.uniqueContent * 100)}%`);
  
  if (plagiarismResult.recommendations.length > 0) {
    details.push(...plagiarismResult.recommendations.slice(0, 3));
  }

  return details;
}

export {};
