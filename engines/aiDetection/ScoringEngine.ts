/**
 * AI Detection Scoring Engine
 * 
 * Combines all detection metrics into a unified AI probability score.
 */

import { PerplexityCalculator, PerplexityResult } from './PerplexityCalculator';
import { BurstinessAnalyzer, BurstinessResult } from './BurstinessAnalyzer';
import { EntropyAnalyzer, EntropyResult } from './EntropyAnalyzer';
import { StylometricAnalyzer, StylometricFeatures } from './StylometricAnalyzer';
import { AIFingerprintDetector, AIFingerprintResult } from './AIFingerprintDetector';

export interface AIDetectionResult {
  aiProbability: number;
  humanProbability: number;
  scores: {
    perplexity: number;
    burstiness: number;
    entropy: number;
    stylometry: number;
    fingerprint: number;
  };
  metrics: {
    perplexity: PerplexityResult;
    burstiness: BurstinessResult;
    entropy: EntropyResult;
    stylometry: StylometricFeatures;
    fingerprint: AIFingerprintResult;
  };
  confidence: 'high' | 'medium' | 'low';
  verdict: 'Definitely AI' | 'Likely AI' | 'Possibly AI' | 'Uncertain' | 'Possibly Human' | 'Likely Human' | 'Definitely Human';
  recommendations: string[];
  details: {
    reason: string;
    keyIndicators: string[];
    warnings: string[];
  };
}

export interface ScoringWeights {
  perplexity: number;
  burstiness: number;
  entropy: number;
  stylometry: number;
  fingerprint: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  perplexity: 0.30,    // Strong indicator
  burstiness: 0.25,   // Strong indicator
  entropy: 0.15,       // Supporting indicator
  stylometry: 0.15,    // Supporting indicator
  fingerprint: 0.15    // Supporting indicator
};

export class ScoringEngine {
  private perplexity: PerplexityCalculator;
  private burstiness: BurstinessAnalyzer;
  private entropy: EntropyAnalyzer;
  private stylometry: StylometricAnalyzer;
  private fingerprint: AIFingerprintDetector;
  private weights: ScoringWeights;

  constructor(weights: Partial<ScoringWeights> = {}) {
    this.perplexity = new PerplexityCalculator();
    this.burstiness = new BurstinessAnalyzer();
    this.entropy = new EntropyAnalyzer();
    this.stylometry = new StylometricAnalyzer();
    this.fingerprint = new AIFingerprintDetector();
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  /**
   * Analyze text and return comprehensive AI detection result
   */
  analyze(text: string): AIDetectionResult {
    // Skip very short texts
    if (text.split(/\s+/).length < 10) {
      return this.shortTextResult();
    }

    // Calculate all metrics
    const perplexityMetrics = this.perplexity.calculate(text);
    const burstinessMetrics = this.burstiness.analyze(text);
    const entropyMetrics = this.entropy.analyze(text);
    const stylometryMetrics = this.stylometry.extractFeatures(text);
    const fingerprintMetrics = this.fingerprint.detect(text);

    // Calculate individual scores (0-100, higher = more likely AI)
    const scores = {
      perplexity: this.scorePerplexity(perplexityMetrics),
      burstiness: this.scoreBurstiness(burstinessMetrics),
      entropy: this.scoreEntropy(entropyMetrics),
      stylometry: this.scoreStylometry(stylometryMetrics),
      fingerprint: this.scoreFingerprint(fingerprintMetrics)
    };

    // Combine scores using weights
    const aiProbability = this.combineScores(scores);

    // Calculate confidence based on metrics quality
    const confidence = this.calculateConfidence(
      perplexityMetrics,
      burstinessMetrics,
      entropyMetrics
    );

    // Determine verdict
    const verdict = this.determineVerdict(aiProbability, confidence);

    // Generate recommendations
    const recommendations = this.generateRecommendations(scores, {
      perplexity: perplexityMetrics,
      burstiness: burstinessMetrics,
      entropy: entropyMetrics,
      stylometry: stylometryMetrics,
      fingerprint: fingerprintMetrics
    });

    // Build details
    const details = this.buildDetails(scores, {
      perplexity: perplexityMetrics,
      burstiness: burstinessMetrics,
      entropy: entropyMetrics,
      stylometry: stylometryMetrics,
      fingerprint: fingerprintMetrics
    });

    return {
      aiProbability: Math.round(aiProbability),
      humanProbability: Math.round(100 - aiProbability),
      scores,
      metrics: {
        perplexity: perplexityMetrics,
        burstiness: burstinessMetrics,
        entropy: entropyMetrics,
        stylometry: stylometryMetrics,
        fingerprint: fingerprintMetrics
      },
      confidence,
      verdict,
      recommendations,
      details
    };
  }

  /**
   * Score perplexity (lower perplexity = more likely AI)
   */
  private scorePerplexity(metrics: PerplexityResult): number {
    // Map perplexity to AI probability (0-100)
    // Very low perplexity (<15) = high AI probability
    // Very high perplexity (>80) = low AI probability
    
    if (metrics.perplexity === 0) return 50; // Neutral for very short text

    if (metrics.perplexity < 10) return 95;
    if (metrics.perplexity < 20) return 85;
    if (metrics.perplexity < 30) return 70;
    if (metrics.perplexity < 45) return 55;
    if (metrics.perplexity < 60) return 40;
    if (metrics.perplexity < 80) return 25;
    return 10;
  }

  /**
   * Score burstiness (lower burstiness = more likely AI)
   */
  private scoreBurstiness(metrics: BurstinessResult): number {
    // Low CV = more uniform = more likely AI
    const cv = metrics.coefficientOfVariation;
    
    if (cv < 0.2) return 90;
    if (cv < 0.3) return 75;
    if (cv < 0.4) return 60;
    if (cv < 0.5) return 45;
    if (cv < 0.6) return 30;
    if (cv < 0.75) return 20;
    return 10;
  }

  /**
   * Score entropy (lower normalized entropy = more likely AI)
   */
  private scoreEntropy(metrics: EntropyResult): number {
    const norm = metrics.normalizedShannon;
    
    if (norm < 0.8) return 85;
    if (norm < 0.85) return 70;
    if (norm < 0.9) return 55;
    if (norm < 0.95) return 40;
    return 25;
  }

  /**
   * Score stylometry (combines multiple features)
   */
  private scoreStylometry(metrics: StylometricFeatures): number {
    let score = 50;

    // Low TTR in long texts suggests AI
    if (metrics.typeTokenRatio < 0.3) score += 20;
    else if (metrics.typeTokenRatio < 0.5) score += 10;
    else if (metrics.typeTokenRatio > 0.7) score -= 15;

    // Very high function word ratio
    if (metrics.functionWordRatio > 0.5) score += 15;
    if (metrics.functionWordRatio > 0.6) score += 10;

    // Low polysyllable ratio
    if (metrics.polysyllableRatio < 0.1) score += 15;
    if (metrics.polysyllableRatio < 0.15) score += 10;

    // Uniform sentence length
    if (metrics.averageSentenceLength > 15 && metrics.averageSentenceLength < 25) {
      // Suspiciously uniform
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score fingerprint (higher marker count = more likely AI)
   */
  private scoreFingerprint(metrics: AIFingerprintResult): number {
    return metrics.normalizedScore;
  }

  /**
   * Combine all scores using weights
   */
  private combineScores(scores: { perplexity: number; burstiness: number; entropy: number; stylometry: number; fingerprint: number }): number {
    return (
      scores.perplexity * this.weights.perplexity +
      scores.burstiness * this.weights.burstiness +
      scores.entropy * this.weights.entropy +
      scores.stylometry * this.weights.stylometry +
      scores.fingerprint * this.weights.fingerprint
    );
  }

  /**
   * Calculate confidence based on metrics quality
   */
  private calculateConfidence(
    perplexity: PerplexityResult,
    burstiness: BurstinessResult,
    entropy: EntropyResult
  ): 'high' | 'medium' | 'low' {
    // Higher confidence when we have more clear signals
    const perplexitySignal = Math.abs(perplexity.perplexity - 50) / 50;
    const burstinessSignal = Math.abs(burstiness.burstinessIndex - 0.5) / 0.5;
    
    const avgSignal = (perplexitySignal + burstinessSignal) / 2;
    
    if (avgSignal > 0.5) return 'high';
    if (avgSignal > 0.25) return 'medium';
    return 'low';
  }

  /**
   * Determine verdict based on AI probability and confidence
   */
  private determineVerdict(aiProbability: number, confidence: 'high' | 'medium' | 'low'): AIDetectionResult['verdict'] {
    const threshold = confidence === 'high' ? 10 : confidence === 'medium' ? 15 : 20;
    
    if (aiProbability >= 85) return 'Definitely AI';
    if (aiProbability >= 70) return 'Likely AI';
    if (aiProbability >= 55) return 'Possibly AI';
    if (aiProbability >= 45) return 'Uncertain';
    if (aiProbability >= 30) return 'Possibly Human';
    if (aiProbability >= 15) return 'Likely Human';
    return 'Definitely Human';
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(
    scores: { perplexity: number; burstiness: number; entropy: number; stylometry: number; fingerprint: number },
    metrics: { perplexity: PerplexityResult; burstiness: BurstinessResult; entropy: EntropyResult; stylometry: StylometricFeatures; fingerprint: AIFingerprintResult }
  ): string[] {
    const recommendations: string[] = [];

    if (scores.perplexity > 60) {
      recommendations.push('Text shows highly predictable patterns - consider varying sentence structures');
    }

    if (scores.burstiness > 60) {
      recommendations.push('Sentence lengths are very uniform - introduce more variation');
    }

    if (scores.fingerprint > 40) {
      recommendations.push(`Detected ${metrics.fingerprint.markerWordCount} AI-specific words - replace with more natural alternatives`);
    }

    if (scores.stylometry > 60) {
      recommendations.push('Writing shows AI-typical patterns - add more personal voice and variation');
    }

    if (scores.entropy < 30) {
      recommendations.push('Text entropy is low - introduce more vocabulary diversity');
    }

    if (recommendations.length === 0) {
      recommendations.push('Text shows natural human writing patterns');
    }

    return recommendations;
  }

  /**
   * Build detailed analysis
   */
  private buildDetails(
    scores: { perplexity: number; burstiness: number; entropy: number; stylometry: number; fingerprint: number },
    metrics: { perplexity: PerplexityResult; burstiness: BurstinessResult; entropy: EntropyResult; stylometry: StylometricFeatures; fingerprint: AIFingerprintResult }
  ): AIDetectionResult['details'] {
    const keyIndicators: string[] = [];
    const warnings: string[] = [];

    // Identify key indicators
    if (scores.perplexity > 70) {
      keyIndicators.push(`Very predictable text (perplexity: ${metrics.perplexity.perplexity})`);
    }

    if (scores.burstiness > 70) {
      keyIndicators.push(`Extremely uniform sentence lengths (CV: ${metrics.burstiness.coefficientOfVariation.toFixed(3)})`);
    }

    if (scores.fingerprint > 50) {
      keyIndicators.push(`Contains ${metrics.fingerprint.totalMarkers} AI-specific markers`);
    }

    if (metrics.stylometry.typeTokenRatio < 0.4) {
      warnings.push('Low vocabulary diversity detected');
    }

    if (metrics.fingerprint.isHighDensity) {
      warnings.push('High density of AI-typical phrases and patterns');
    }

    let reason = '';
    if (scores.perplexity >= scores.burstiness && scores.perplexity >= scores.fingerprint) {
      reason = 'Primary indicator is text predictability (perplexity analysis)';
    } else if (scores.burstiness >= scores.perplexity && scores.burstiness >= scores.fingerprint) {
      reason = 'Primary indicator is uniform sentence structure (burstiness analysis)';
    } else {
      reason = 'Primary indicator is AI-specific linguistic markers (fingerprint analysis)';
    }

    return {
      reason,
      keyIndicators,
      warnings
    };
  }

  /**
   * Result for very short texts
   */
  private shortTextResult(): AIDetectionResult {
    return {
      aiProbability: 50,
      humanProbability: 50,
      scores: {
        perplexity: 50,
        burstiness: 50,
        entropy: 50,
        stylometry: 50,
        fingerprint: 50
      },
      metrics: {
        perplexity: {
          perplexity: 0,
          logProbability: 0,
          tokenCount: 0,
          interpretation: 'natural'
        },
        burstiness: {
          sentenceMean: 0,
          sentenceStdDev: 0,
          coefficientOfVariation: 0,
          burstinessIndex: 0,
          lengthDistribution: {
            min: 0,
            max: 0,
            median: 0,
            mode: 0,
            quartiles: [0, 0, 0],
            histogram: []
          },
          paragraphBurstiness: { mean: 0, stdDev: 0 },
          isLowBurstiness: false,
          isHumanBurstiness: false,
          interpretation: 'Text too short for reliable analysis'
        },
        entropy: {
          shannonEntropy: 0,
          wordEntropy: 0,
          conditionalEntropy: 0,
          normalizedShannon: 0,
          interpretation: 'moderate-entropy'
        },
        stylometry: {
          typeTokenRatio: 0,
          hapaxLegemnaRatio: 0,
          yulesK: 0,
          simpsonsIndex: 0,
          averageSentenceLength: 0,
          averageClauseCount: 0,
          subordinateClauseRatio: 0,
          averageWordLength: 0,
          polysyllableRatio: 0,
          punctuationVariety: 0,
          commaToSentenceRatio: 0,
          functionWordRatio: 0,
          stopWordFrequency: 0,
          verbRatio: 0,
          nounRatio: 0,
          adjectiveRatio: 0
        },
        fingerprint: {
          markerWordCount: 0,
          markerPhraseCount: 0,
          patternMatchCount: 0,
          totalMarkers: 0,
          normalizedScore: 0,
          density: 0,
          detectedMarkers: [],
          isHighDensity: false,
          interpretation: 'Text too short for reliable analysis'
        }
      },
      confidence: 'low',
      verdict: 'Uncertain',
      recommendations: ['Text is too short for reliable AI detection'],
      details: {
        reason: 'Insufficient text length for analysis',
        keyIndicators: [],
        warnings: ['Analysis may be unreliable for texts under 10 words']
      }
    };
  }
}

export const scoringEngine = new ScoringEngine();
