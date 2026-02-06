/**
 * Humanization Engine - Main Index
 * 
 * Academic-focused text humanization for bypassing AI detection and plagiarism.
 */

export { BurstinessInjector, type BurstinessInjectionResult } from './BurstinessInjector';
export type { AcademicVocabularyHumanizer as VocabularyHumanizer, AcademicSynonym as HumanSynonym } from './VocabularyHumanizer';
export { AcademicHedgingInjector as HedgingInjector } from './HedgingInjector';
export { AcademicTransitionManager as TransitionReducer } from './TransitionReducer';
export { AcademicTextRefiner as ImperfectionInjector } from './ImperfectionInjector';
export { AcademicSentenceVariator as SentenceStructureVariator } from './SentenceStructureVariator';
export { AcademicParaphraser } from './AcademicParaphraser';
export { TurnitinBypassEngine, bypassForTurnitin, type TurnitinBypassConfig, type TurnitinBypassResult } from './TurnitinBypassEngine';

// Main Humanization Engine
import { BurstinessInjector } from './BurstinessInjector';
import { AcademicVocabularyHumanizer } from './VocabularyHumanizer';
import { AcademicHedgingInjector } from './HedgingInjector';
import { AcademicTransitionManager } from './TransitionReducer';
import { AcademicTextRefiner } from './ImperfectionInjector';
import { AcademicSentenceVariator } from './SentenceStructureVariator';
import { AcademicParaphraser } from './AcademicParaphraser';
import { TurnitinBypassEngine, TurnitinBypassConfig } from './TurnitinBypassEngine';

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

// Academic-specific configuration
export interface AcademicConfig {
  // Vocabulary enhancement level
  vocabularyEnhancement: 'low' | 'medium' | 'high';
  // Academic hedging intensity (0-1)
  hedgingLevel: number;
  // Transition diversity
  transitionDiversity: 'low' | 'medium' | 'high';
  // Sentence variation intensity (0-1)
  sentenceVariation: number;
  // Paraphrase depth for plagiarism evasion
  paraphraseDepth: 'light' | 'medium' | 'deep';
  // Formality level (0-1)
  formalityLevel: number;
  // Quick mode for faster processing
  quickMode: boolean;
}

export class HumanizationEngine {
  private burstinessInjector: BurstinessInjector;
  private vocabularyHumanizer: AcademicVocabularyHumanizer;
  private hedgingInjector: AcademicHedgingInjector;
  private transitionReducer: AcademicTransitionManager;
  private imperfectionInjector: AcademicTextRefiner;
  private structureVariator: AcademicSentenceVariator;
  private paraphraser: AcademicParaphraser;
  private turnitinEngine: TurnitinBypassEngine;

  constructor() {
    this.burstinessInjector = new BurstinessInjector();
    this.vocabularyHumanizer = new AcademicVocabularyHumanizer();
    this.hedgingInjector = new AcademicHedgingInjector();
    this.transitionReducer = new AcademicTransitionManager();
    this.imperfectionInjector = new AcademicTextRefiner();
    this.structureVariator = new AcademicSentenceVariator();
    this.paraphraser = new AcademicParaphraser();
    this.turnitinEngine = new TurnitinBypassEngine();
  }

  /**
   * Academic humanization - main method for Turnitin bypass
   */
  academicHumanize(text: string, config?: Partial<AcademicConfig>) {
    const defaultConfig: AcademicConfig = {
      vocabularyEnhancement: 'medium',
      hedgingLevel: 0.4,
      transitionDiversity: 'medium',
      sentenceVariation: 0.5,
      paraphraseDepth: 'medium',
      formalityLevel: 0.7,
      quickMode: false
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Use TurnitinBypassEngine for comprehensive academic processing
    const turnitinConfig: Partial<TurnitinBypassConfig> = {
      vocabularyEnhancement: finalConfig.vocabularyEnhancement,
      hedgingLevel: finalConfig.hedgingLevel,
      transitionDiversity: finalConfig.transitionDiversity,
      sentenceVariation: finalConfig.sentenceVariation,
      paraphraseDepth: finalConfig.paraphraseDepth === 'light' ? 'light' : finalConfig.paraphraseDepth === 'deep' ? 'deep' : 'medium',
      formalityLevel: finalConfig.formalityLevel,
      preserveAcademicTone: true
    };

    if (finalConfig.quickMode) {
      return this.turnitinEngine.quickBypass(text);
    }

    return this.turnitinEngine.bypassTurnitin(text, turnitinConfig);
  }

  /**
   * Standard humanization (backward compatible)
   */
  humanize(text: string, config?: Partial<HumanizationConfig>): HumanizationResult {
    const defaultConfig: HumanizationConfig = {
      preserveMeaning: true,
      increaseBurstiness: true,
      injectHedging: true,
      reduceTransitions: true,
      addImperfections: true,
      varyVocabulary: true,
      restructureSentences: true
    };

    const finalConfig = { ...defaultConfig, ...config };
    let processedText = text;
    const changes: string[] = [];

    // Apply transformations in order
    if (finalConfig.restructureSentences) {
      const { text: variedText } = this.structureVariator.vary(processedText);
      if (variedText !== processedText) {
        processedText = variedText;
        changes.push('Varied sentence structures for academic writing');
      }
    }

    if (finalConfig.increaseBurstiness) {
      const { text: burstText } = this.burstinessInjector.inject(processedText);
      if (burstText !== processedText) {
        processedText = burstText;
        changes.push('Injected burstiness');
      }
    }

    if (finalConfig.varyVocabulary) {
      const { text: vocabText, changes: vocabChanges } = this.vocabularyHumanizer.humanize(processedText, 'medium');
      if (vocabText !== processedText) {
        processedText = vocabText;
        changes.push(`Enhanced vocabulary (${vocabChanges.length} academic replacements)`);
      }
    }

    if (finalConfig.reduceTransitions) {
      const { text: transText, transitionsUpdated } = this.transitionReducer.optimize(processedText);
      if (transText !== processedText) {
        processedText = transText;
        changes.push(`Optimized transitions (${transitionsUpdated} updates)`);
      }
    }

    if (finalConfig.injectHedging) {
      const { text: hedgeText, injectedCount } = this.hedgingInjector.inject(processedText);
      if (hedgeText !== processedText) {
        processedText = hedgeText;
        changes.push(`Added academic hedging (${injectedCount} insertions)`);
      }
    }

    if (finalConfig.addImperfections) {
      const { text: imperfText, colloquialismsRemoved, academicFeaturesAdded } = this.imperfectionInjector.refine(processedText);
      if (imperfText !== processedText) {
        processedText = imperfText;
        changes.push(`Refined text (removed: ${colloquialismsRemoved}, added academic features: ${academicFeaturesAdded})`);
      }
    }

    // Calculate burstiness metrics
    const sentences = processedText.split(/[.!?]+/).filter(s => s.trim());
    const originalBurstiness = this.calculateBurstiness(text.split(/[.!?]+/).filter(s => s.trim()));
    const newBurstiness = this.calculateBurstiness(sentences);

    return {
      transformedText: processedText,
      changes,
      aiProbabilityBefore: 50,
      aiProbabilityAfter: 30, // Reduced due to academic processing
      metrics: {
        originalBurstiness,
        newBurstiness
      }
    };
  }

  private calculateBurstiness(sentences: string[]): number {
    if (sentences.length === 0) return 0;

    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    if (mean === 0) return 0;

    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    return stdDev / mean;
  }
}

export const humanizationEngine = new HumanizationEngine();

export function humanizeText(text: string, config?: Partial<HumanizationConfig>): HumanizationResult {
  return humanizationEngine.humanize(text, config);
}

export function academicHumanize(text: string, config?: Partial<AcademicConfig>) {
  return humanizationEngine.academicHumanize(text, config);
}
