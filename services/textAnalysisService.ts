/**
 * Unified Text Analysis Service
 * 
 * Combines AI Detection, Humanization, and Plagiarism Detection engines.
 */

import { 
  AIAnalysisResult, 
  HumanizationResult, 
  HumanizationConfig,
  AnalysisResult,
  RewriteMode
} from '../types';

// AI Detection Engine
import { 
  ScoringEngine, 
  AIDetectionResult,
  analyzeAI 
} from '../engines/aiDetection';

// Humanization Engine
import { 
  HumanizationEngine 
} from '../engines/humanization';

// Plagiarism Detection
import { 
  PlagiarismDetector, 
  PlagiarismReport 
} from '../engines/plagiarism';

export class TextAnalysisService {
  private aiEngine: ScoringEngine;
  private humanizationEngine: HumanizationEngine;
  private plagiarismDetector: PlagiarismDetector;

  constructor() {
    this.aiEngine = new ScoringEngine();
    this.humanizationEngine = new HumanizationEngine();
    this.plagiarismDetector = new PlagiarismDetector();
  }

  /**
   * Complete text analysis (AI + Plagiarism)
   */
  analyze(text: string): AnalysisResult {
    // AI Detection
    const aiResult = this.aiEngine.analyze(text);
    
    // Plagiarism Check (local only)
    const plagiarismResult = this.plagiarismDetector.checkLocal(text);

    // Legacy compatibility
    const readabilityScore = this.calculateReadabilityScore(text);

    return {
      aiAnalysis: this.convertAIDetectionResult(aiResult),
      plagiarismReport: plagiarismResult,
      aiScore: aiResult.aiProbability,
      humanScore: aiResult.humanProbability,
      plagiarismScore: Math.round((1 - plagiarismResult.overallScore) * 100),
      readabilityScore,
      verdict: aiResult.verdict,
      details: this.generateDetails(aiResult, plagiarismResult)
    };
  }

  /**
   * Humanize text
   */
  humanize(text: string, mode?: RewriteMode): HumanizationResult {
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

    return this.humanizationEngine.humanize(text, config);
  }

  /**
   * Rewrite text (humanize + improve)
   */
  rewrite(text: string, mode: RewriteMode = RewriteMode.HUMANIZE): {
    original: string;
    rewritten: string;
    changes: string[];
    stats: {
      originalWordCount: number;
      newWordCount: number;
      aiProbabilityBefore: number;
      aiProbabilityAfter: number;
    };
  } {
    // Analyze original
    const originalAnalysis = this.aiEngine.analyze(text);
    
    // Humanize
    const humanized = this.humanizationEngine.humanize(text, {
      increaseBurstiness: true,
      varyVocabulary: true,
      reduceTransitions: true,
      injectHedging: mode !== RewriteMode.ACADEMIC,
      addImperfections: mode === RewriteMode.HUMANIZE,
      restructureSentences: true,
      preserveMeaning: true
    });
    
    // Analyze rewritten
    const rewrittenAnalysis = this.aiEngine.analyze(humanized.transformedText);
    
    return {
      original: text,
      rewritten: humanized.transformedText,
      changes: humanized.changes.map(c => c.description),
      stats: {
        originalWordCount: text.split(/\s+/).length,
        newWordCount: humanized.transformedText.split(/\s+/).length,
        aiProbabilityBefore: originalAnalysis.aiProbability,
        aiProbabilityAfter: rewrittenAnalysis.aiProbability
      }
    };
  }

  /**
   * Check for plagiarism
   */
  checkPlagiarism(text: string): PlagiarismReport {
    return this.plagiarismDetector.checkLocal(text);
  }

  /**
   * Add document to plagiarism database
   */
  addToDatabase(id: string, text: string): void {
    this.plagiarismDetector.addToDatabase(id, text);
  }

  /**
   * Compare two documents
   */
  compareDocuments(textA: string, textB: string): {
    similarity: number;
    shingleSimilarity: number;
    semanticSimilarity: number;
  } {
    const result = this.plagiarismDetector.compare(textA, textB);
    return {
      similarity: result.overallSimilarity,
      shingleSimilarity: result.shingleSimilarity,
      semanticSimilarity: result.semanticSimilarity
    };
  }

  /**
   * Convert AI detection result to app format
   */
  private convertAIDetectionResult(result: AIDetectionResult): AIAnalysisResult {
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

  /**
   * Calculate readability score (simplified)
   */
  private calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 50;

    // Flesch Reading Ease approximation
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Count syllables in a word
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * Generate details for display
   */
  private generateDetails(aiResult: AIDetectionResult, plagiarismResult: PlagiarismReport): string[] {
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
}

export const textAnalysisService = new TextAnalysisService();

// Convenience functions
export function analyzeText(text: string): AnalysisResult {
  return textAnalysisService.analyze(text);
}

export function rewriteText(text: string, mode: RewriteMode = RewriteMode.HUMANIZE) {
  return textAnalysisService.rewrite(text, mode);
}

export function checkPlagiarismReport(text: string): PlagiarismReport {
  return textAnalysisService.checkPlagiarism(text);
}

export function analyzeAIProbability(text: string): AIDetectionResult {
  return analyzeAI(text);
}
