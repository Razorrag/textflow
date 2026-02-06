/**
 * Similarity Calculator
 * 
 * Calculates various similarity metrics between documents.
 */

export interface SimilarityResult {
  jaccard: number;
  containmentA: number;
  containmentB: number;
  dice: number;
  matchingItems: number[];
}

export class SimilarityCalculator {
  /**
   * Calculate Jaccard similarity
   */
  jaccardSimilarity(setA: Set<any>, setB: Set<any>): number {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate containment (A in B)
   */
  containment(setA: Set<any>, setB: Set<any>): number {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return setA.size > 0 ? intersection.size / setA.size : 0;
  }

  /**
   * Calculate Dice coefficient
   */
  diceCoefficient(setA: Set<any>, setB: Set<any>): number {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return (setA.size + setB.size) > 0 ? (2 * intersection.size) / (setA.size + setB.size) : 0;
  }

  /**
   * Compare two sets of items
   */
  compare(setA: Set<any>, setB: Set<any>): SimilarityResult {
    const intersection = new Set([...setA].filter(x => setB.has(x)));

    return {
      jaccard: this.jaccardSimilarity(setA, setB),
      containmentA: this.containment(setA, setB),
      containmentB: this.containment(setB, setA),
      dice: this.diceCoefficient(setA, setB),
      matchingItems: [...intersection]
    };
  }

  /**
   * Compare fingerprints
   */
  compareFingerprints(fpA: number[], fpB: number[]): SimilarityResult {
    return this.compare(new Set(fpA), new Set(fpB));
  }

  /**
   * Calculate overlap coefficient
   */
  overlapCoefficient(setA: Set<any>, setB: Set<any>): number {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const minSize = Math.min(setA.size, setB.size);
    return minSize > 0 ? intersection.size / minSize : 0;
  }

  /**
   * Calculate cosine similarity for frequency vectors
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }
}

export const similarityCalculator = new SimilarityCalculator();
