/**
 * Semantic Analyzer
 * 
 * Analyzes semantic similarity between texts using word embeddings.
 */

export interface SemanticResult {
  similarity: number;
  embeddingA: number[];
  embeddingB: number[];
}

export class SemanticAnalyzer {
  private vocabularySize: number;

  constructor(vocabularySize: number = 10000) {
    this.vocabularySize = vocabularySize;
  }

  /**
   * Generate simple embedding using word frequencies
   */
  generateEmbedding(tokens: string[]): number[] {
    const embedding = new Array(this.vocabularySize).fill(0);

    // Build frequency vector
    for (const token of tokens) {
      const hash = this.hashToken(token) % this.vocabularySize;
      embedding[hash] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  /**
   * Calculate cosine similarity between two embeddings
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

  /**
   * Analyze semantic similarity between two texts
   */
  analyzeSimilarity(textA: string, textB: string): SemanticResult {
    const tokensA = this.tokenize(textA);
    const tokensB = this.tokenize(textB);

    const embeddingA = this.generateEmbedding(tokensA);
    const embeddingB = this.generateEmbedding(tokensB);

    const similarity = this.cosineSimilarity(embeddingA, embeddingB);

    return {
      similarity: Math.round(similarity * 1000) / 1000,
      embeddingA,
      embeddingB
    };
  }

  /**
   * Hash a token to an integer
   */
  private hashToken(token: string): number {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }
}

export const semanticAnalyzer = new SemanticAnalyzer();
