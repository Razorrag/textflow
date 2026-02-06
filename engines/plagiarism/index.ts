/**
 * Plagiarism Detection Module - Main Index
 */

export { TextPreprocessor, type PreprocessedText } from './TextPreprocessor';
export { ShinglingEngine, type ShinglingResult } from './ShinglingEngine';
export { WinnowingAlgorithm, type WinnowingResult } from './WinnowingAlgorithm';
export { SimilarityCalculator, type SimilarityResult } from './SimilarityCalculator';
export { SemanticAnalyzer, type SemanticResult } from './SemanticAnalyzer';

// Main Plagiarism Detector
import { TextPreprocessor } from './TextPreprocessor';
import { ShinglingEngine } from './ShinglingEngine';
import { WinnowingAlgorithm } from './WinnowingAlgorithm';
import { SimilarityCalculator } from './SimilarityCalculator';
import { SemanticAnalyzer } from './SemanticAnalyzer';

export interface PlagiarismMatch {
  source: string;
  similarity: number;
  matchedSegments: string[];
}

export interface PlagiarismReport {
  overallScore: number;
  exactMatches: PlagiarismMatch[];
  semanticMatches: PlagiarismMatch[];
  uniqueContent: number;
  recommendations: string[];
}

export interface DocumentFingerprint {
  text: string;
  shingles: string[];
  hashes: number[];
  fingerprint: number[];
  embedding: number[];
}

export class PlagiarismDetector {
  private preprocessor: TextPreprocessor;
  private shinglingEngine: ShinglingEngine;
  private winnowing: WinnowingAlgorithm;
  private similarity: SimilarityCalculator;
  private semantic: SemanticAnalyzer;

  // Local database for comparison
  private documentDatabase: Map<string, DocumentFingerprint> = new Map();

  constructor() {
    this.preprocessor = new TextPreprocessor();
    this.shinglingEngine = new ShinglingEngine(3);
    this.winnowing = new WinnowingAlgorithm(4);
    this.similarity = new SimilarityCalculator();
    this.semantic = new SemanticAnalyzer();
  }

  /**
   * Generate fingerprint for a document
   */
  fingerprint(text: string): DocumentFingerprint {
    const normalized = this.preprocessor.normalize(text);
    const tokens = this.preprocessor.tokenize(normalized);
    const shingles = this.shinglingEngine.generateShingles(normalized);
    const hashes = shingles.map(s => this.hashString(s));
    const fingerprint = this.winnowing.winnow(hashes);
    const embedding = this.semantic.generateEmbedding(tokens);

    return {
      text,
      shingles,
      hashes,
      fingerprint,
      embedding
    };
  }

  /**
   * Add document to local database
   */
  addToDatabase(id: string, text: string): void {
    const fingerprint = this.fingerprint(text);
    this.documentDatabase.set(id, fingerprint);
  }

  /**
   * Check for plagiarism against local database
   */
  checkLocal(text: string): PlagiarismReport {
    const queryFingerprint = this.fingerprint(text);
    const matches: PlagiarismMatch[] = [];

    for (const [id, doc] of this.documentDatabase) {
      const similarity = this.similarity.compareFingerprints(
        queryFingerprint.fingerprint,
        doc.fingerprint
      );

      if (similarity.dice > 0.1) {
        // Find matching segments
        const matchingSegments = this.findMatchingSegments(
          queryFingerprint.shingles,
          doc.shingles
        );

        matches.push({
          source: id,
          similarity: Math.round(similarity.dice * 1000) / 1000,
          matchedSegments: matchingSegments
        });
      }
    }

    // Sort by similarity
    matches.sort((a, b) => b.similarity - a.similarity);

    // Calculate overall score
    const overallScore = matches.length > 0
      ? Math.max(...matches.map(m => m.similarity))
      : 0;

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      exactMatches: matches.filter(m => m.similarity > 0.3),
      semanticMatches: matches.filter(m => m.similarity <= 0.3 && m.similarity > 0.1),
      uniqueContent: Math.round((1 - overallScore) * 100) / 100,
      recommendations: this.generateRecommendations(matches)
    };
  }

  /**
   * Compare two documents
   */
  compare(textA: string, textB: string): {
    shingleSimilarity: number;
    semanticSimilarity: number;
    overallSimilarity: number;
  } {
    const fpA = this.fingerprint(textA);
    const fpB = this.fingerprint(textB);

    const shingleSim = this.similarity.compareFingerprints(
      fpA.fingerprint,
      fpB.fingerprint
    );

    const semanticSim = this.semantic.cosineSimilarity(
      fpA.embedding,
      fpB.embedding
    );

    // Combined score
    const overall = shingleSim.dice * 0.6 + semanticSim * 0.4;

    return {
      shingleSimilarity: Math.round(shingleSim.dice * 1000) / 1000,
      semanticSimilarity: Math.round(semanticSim * 1000) / 1000,
      overallSimilarity: Math.round(overall * 1000) / 1000
    };
  }

  /**
   * Find matching segments between two shingle sets
   */
  private findMatchingSegments(shinglesA: string[], shinglesB: string[]): string[] {
    const setB = new Set(shinglesB);
    const matches: string[] = [];

    for (const shingle of shinglesA) {
      if (setB.has(shingle) && !matches.includes(shingle)) {
        matches.push(shingle);
      }
    }

    return matches.slice(0, 10); // Limit to top 10 matches
  }

  /**
   * Generate recommendations based on plagiarism check
   */
  private generateRecommendations(matches: PlagiarismMatch[]): string[] {
    const recommendations: string[] = [];

    if (matches.length === 0) {
      recommendations.push('No significant matches found - content appears original');
      return recommendations;
    }

    const highMatch = matches.find(m => m.similarity > 0.5);
    if (highMatch) {
      recommendations.push(`High similarity detected with "${highMatch.source}" - consider rewriting`);
    }

    const mediumMatches = matches.filter(m => m.similarity > 0.2 && m.similarity <= 0.5);
    if (mediumMatches.length > 0) {
      recommendations.push(`${mediumMatches.length} sources show moderate similarity - add more original content`);
    }

    recommendations.push('Consider adding more citations and quotes for referenced material');
    recommendations.push('Paraphrase content more thoroughly to increase uniqueness');

    return recommendations;
  }

  /**
   * Hash string to number
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const plagiarismDetector = new PlagiarismDetector();

export function checkPlagiarism(text: string): PlagiarismReport {
  return plagiarismDetector.checkLocal(text);
}

export function compareDocuments(textA: string, textB: string) {
  return plagiarismDetector.compare(textA, textB);
}
