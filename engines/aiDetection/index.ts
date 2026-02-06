/**
 * AI Detection Engine - Main Index
 */

export type { PerplexityResult } from './PerplexityCalculator';
export { PerplexityCalculator } from './PerplexityCalculator';

export type { BurstinessResult, LengthDistribution } from './BurstinessAnalyzer';
export { BurstinessAnalyzer } from './BurstinessAnalyzer';

export type { EntropyResult } from './EntropyAnalyzer';
export { EntropyAnalyzer } from './EntropyAnalyzer';

export type { StylometricFeatures } from './StylometricAnalyzer';
export { StylometricAnalyzer } from './StylometricAnalyzer';

export type { AIFingerprintResult, DetectedMarker } from './AIFingerprintDetector';
export { AIFingerprintDetector } from './AIFingerprintDetector';

export type { AIDetectionResult, ScoringWeights } from './ScoringEngine';
export { ScoringEngine } from './ScoringEngine';

// Convenience exports
import { ScoringEngine } from './ScoringEngine';
import { AIDetectionResult } from './ScoringEngine';

export const aiDetectionEngine = new ScoringEngine();

export function analyzeAI(text: string): AIDetectionResult {
  return aiDetectionEngine.analyze(text);
}
