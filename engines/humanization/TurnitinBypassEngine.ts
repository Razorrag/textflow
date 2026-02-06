/**
 * Turnitin Bypass Engine - Comprehensive Academic Text Transformation
 * 
 * Integrates all academic humanization techniques to produce text that:
 * 1. Bypasses AI detection (low AI probability)
 * 2. Avoids plagiarism detection (low similarity)
 * 3. Maintains academic quality and scholarly tone
 * 4. Preserves original meaning
 */

import { AcademicVocabularyHumanizer } from './VocabularyHumanizer';
import { AcademicHedgingInjector } from './HedgingInjector';
import { AcademicTransitionManager } from './TransitionReducer';
import { AcademicTextRefiner } from './ImperfectionInjector';
import { AcademicSentenceVariator } from './SentenceStructureVariator';
import { AcademicParaphraser } from './AcademicParaphraser';

// Turnitin-specific detection targets
interface TurnitinDetectionMetrics {
  aiProbability: number;
  similarityScore: number;
  vocabularyOriginality: number;
  structureNaturalness: number;
  overallRisk: 'low' | 'medium' | 'high';
}

export interface TurnitinBypassConfig {
  vocabularyEnhancement: 'low' | 'medium' | 'high';
  hedgingLevel: number;
  transitionDiversity: 'low' | 'medium' | 'high';
  sentenceVariation: number;
  paraphraseDepth: 'light' | 'medium' | 'deep';
  formalityLevel: number;
  preserveAcademicTone: boolean;
}

export interface TurnitinBypassResult {
  transformedText: string;
  originalText: string;
  metrics: TurnitinDetectionMetrics;
  transformationsApplied: {
    category: string;
    count: number;
    description: string;
  }[];
  bypassScore: number;
  recommendations: string[];
}

// Default academic bypass configuration
const DEFAULT_CONFIG: TurnitinBypassConfig = {
  vocabularyEnhancement: 'medium',
  hedgingLevel: 0.4,
  transitionDiversity: 'medium',
  sentenceVariation: 0.5,
  paraphraseDepth: 'medium',
  formalityLevel: 0.7,
  preserveAcademicTone: true
};

export class TurnitinBypassEngine {
  private vocabularyHumanizer: AcademicVocabularyHumanizer;
  private hedgingInjector: AcademicHedgingInjector;
  private transitionManager: AcademicTransitionManager;
  private textRefiner: AcademicTextRefiner;
  private sentenceVariator: AcademicSentenceVariator;
  private paraphraser: AcademicParaphraser;
  
  constructor() {
    this.vocabularyHumanizer = new AcademicVocabularyHumanizer();
    this.hedgingInjector = new AcademicHedgingInjector();
    this.transitionManager = new AcademicTransitionManager();
    this.textRefiner = new AcademicTextRefiner();
    this.sentenceVariator = new AcademicSentenceVariator();
    this.paraphraser = new AcademicParaphraser();
  }
  
  /**
   * Comprehensive Turnitin bypass transformation
   */
  bypassTurnitin(
    originalText: string,
    config: Partial<TurnitinBypassConfig> = {}
  ): TurnitinBypassResult {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    let processedText = originalText;
    const transformations: TurnitinBypassResult['transformationsApplied'] = [];
    
    // Step 1: Remove colloquialisms and add academic features
    const refinementResult = this.textRefiner.refine(processedText, finalConfig.formalityLevel);
    if (refinementResult.text !== processedText) {
      processedText = refinementResult.text;
      transformations.push({
        category: 'colloquialism-removal',
        count: refinementResult.colloquialismsRemoved,
        description: 'Removed colloquialisms and added academic discourse markers'
      });
    }
    
    // Step 2: Vocabulary enhancement
    const vocabResult = this.vocabularyHumanizer.humanize(processedText, finalConfig.vocabularyEnhancement);
    if (vocabResult.text !== processedText) {
      processedText = vocabResult.text;
      transformations.push({
        category: 'vocabulary-enhancement',
        count: vocabResult.changes.length,
        description: 'Enhanced vocabulary with academic alternatives'
      });
    }
    
    // Step 3: Sentence structure variation
    const sentenceResult = this.sentenceVariator.vary(processedText, finalConfig.sentenceVariation);
    if (sentenceResult.text !== processedText) {
      processedText = sentenceResult.text;
      transformations.push({
        category: 'sentence-variation',
        count: sentenceResult.transformationsApplied,
        description: 'Varied sentence structures for natural flow'
      });
    }
    
    // Step 4: Academic hedging
    const hedgingResult = this.hedgingInjector.inject(processedText, finalConfig.hedgingLevel);
    if (hedgingResult.text !== processedText) {
      processedText = hedgingResult.text;
      transformations.push({
        category: 'hedging',
        count: hedgingResult.injectedCount,
        description: 'Added scholarly hedging for appropriate academic caution'
      });
    }
    
    // Step 5: Transition diversity
    const transitionResult = this.transitionManager.optimize(processedText, finalConfig.transitionDiversity);
    if (transitionResult.text !== processedText) {
      processedText = transitionResult.text;
      transformations.push({
        category: 'transition-diversity',
        count: transitionResult.transitionsUpdated,
        description: 'Optimized transitions for academic flow'
      });
    }
    
    // Step 6: Deep paraphrasing for plagiarism evasion
    let paraphraseIntensity: 'low' | 'medium' | 'high' = 'low';
    if (finalConfig.paraphraseDepth === 'medium') paraphraseIntensity = 'medium';
    if (finalConfig.paraphraseDepth === 'deep') paraphraseIntensity = 'high';
    
    const paraphraseResult = this.paraphraser.paraphrase(processedText, paraphraseIntensity);
    if (paraphraseResult.text !== processedText) {
      processedText = paraphraseResult.text;
      transformations.push({
        category: 'paraphrasing',
        count: paraphraseResult.paraphrasesApplied,
        description: 'Deep semantic rewriting to reduce similarity'
      });
    }
    
    // Step 7: Final refinement pass
    const finalRefinement = this.textRefiner.refine(processedText, 0.3);
    if (finalRefinement.text !== processedText) {
      processedText = finalRefinement.text;
      transformations.push({
        category: 'final-refinement',
        count: finalRefinement.academicFeaturesAdded,
        description: 'Final polish for academic consistency'
      });
    }
    
    // Calculate metrics
    const metrics = this.calculateMetrics(originalText, processedText, transformations);
    const bypassScore = this.calculateBypassScore(metrics);
    const recommendations = this.generateRecommendations(metrics, bypassScore);
    
    return {
      transformedText: processedText,
      originalText,
      metrics,
      transformationsApplied: transformations,
      bypassScore,
      recommendations
    };
  }
  
  /**
   * Quick bypass for faster processing with moderate effectiveness
   */
  quickBypass(originalText: string): TurnitinBypassResult {
    return this.bypassTurnitin(originalText, {
      vocabularyEnhancement: 'medium',
      hedgingLevel: 0.3,
      transitionDiversity: 'low',
      sentenceVariation: 0.4,
      paraphraseDepth: 'light',
      formalityLevel: 0.6,
      preserveAcademicTone: true
    });
  }
  
  /**
   * Maximum bypass for highest evasion (slower processing)
   */
  maximumBypass(originalText: string): TurnitinBypassResult {
    return this.bypassTurnitin(originalText, {
      vocabularyEnhancement: 'high',
      hedgingLevel: 0.5,
      transitionDiversity: 'high',
      sentenceVariation: 0.7,
      paraphraseDepth: 'deep',
      formalityLevel: 0.8,
      preserveAcademicTone: true
    });
  }
  
  /**
   * Calculate detection metrics
   */
  private calculateMetrics(
    original: string,
    transformed: string,
    appliedTransformations: TurnitinBypassResult['transformationsApplied']
  ): TurnitinDetectionMetrics {
    // Estimate AI probability reduction based on transformations
    const aiReduction = Math.min(60, appliedTransformations.reduce((sum, t) => {
      switch (t.category) {
        case 'vocabulary-enhancement': return sum + 15;
        case 'sentence-variation': return sum + 12;
        case 'hedging': return sum + 10;
        case 'paraphrasing': return sum + 20;
        case 'colloquialism-removal': return sum + 8;
        default: return sum + 5;
      }
    }, 0));
    
    // Estimate similarity reduction
    const similarityReduction = Math.min(70, appliedTransformations.reduce((sum, t) => {
      if (t.category === 'paraphrasing') return sum + 25;
      if (t.category === 'vocabulary-enhancement') return sum + 15;
      if (t.category === 'sentence-variation') return sum + 10;
      return sum + 5;
    }, 0));
    
    // Calculate vocabulary originality
    const vocabScore = appliedTransformations.find(t => t.category === 'vocabulary-enhancement')?.count || 0;
    const vocabularyOriginality = Math.min(100, vocabScore * 8 + 50);
    
    // Calculate structure naturalness
    const structureScore = appliedTransformations.find(t => t.category === 'sentence-variation')?.count || 0;
    const structureNaturalness = Math.min(100, structureScore * 10 + 40);
    
    // Determine overall risk
    const aiProbability = Math.max(5, 70 - aiReduction);
    const similarityScore = Math.max(5, 60 - similarityReduction);
    
    let overallRisk: 'low' | 'medium' | 'high' = 'high';
    if (aiProbability < 20 && similarityScore < 20) {
      overallRisk = 'low';
    } else if (aiProbability < 40 && similarityScore < 40) {
      overallRisk = 'medium';
    }
    
    return {
      aiProbability,
      similarityScore,
      vocabularyOriginality,
      structureNaturalness,
      overallRisk
    };
  }
  
  /**
   * Calculate overall bypass score
   */
  private calculateBypassScore(metrics: TurnitinDetectionMetrics): number {
    const aiScore = (100 - metrics.aiProbability) * 0.4;
    const similarityScore = (100 - metrics.similarityScore) * 0.4;
    const vocabularyScore = metrics.vocabularyOriginality * 0.1;
    const structureScore = metrics.structureNaturalness * 0.1;
    
    return Math.round(aiScore + similarityScore + vocabularyScore + structureScore);
  }
  
  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(
    metrics: TurnitinDetectionMetrics,
    bypassScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (metrics.aiProbability > 25) {
      recommendations.push('Consider adding more hedging and varied sentence structures');
    }
    if (metrics.similarityScore > 20) {
      recommendations.push('Deep paraphrasing recommended for further similarity reduction');
    }
    if (metrics.vocabularyOriginality < 70) {
      recommendations.push('Increase vocabulary enhancement for more unique word choices');
    }
    if (metrics.structureNaturalness < 60) {
      recommendations.push('Vary sentence lengths and structures more for natural flow');
    }
    if (bypassScore < 70) {
      recommendations.push('Consider running multiple passes for improved bypass');
    }
    if (recommendations.length === 0) {
      recommendations.push('Excellent bypass achieved! Text is well-optimized for Turnitin evasion');
    }
    
    return recommendations;
  }
}

export const turnitinBypassEngine = new TurnitinBypassEngine();

export function bypassForTurnitin(
  text: string,
  config?: Partial<TurnitinBypassConfig>
): TurnitinBypassResult {
  return turnitinBypassEngine.bypassTurnitin(text, config);
}
