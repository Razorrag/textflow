/**
 * Semantic Analyzer
 * 
 * Analyzes semantic similarity between texts using word embeddings.
 * 
 * NOTE: This is a simplified implementation for demonstration purposes.
 * Real semantic analysis requires pre-trained word embeddings (like Word2Vec,
 * GloVe, BERT) trained on large corpora. This implementation uses
 * a frequency-based approach that captures lexical overlap rather than true
 * semantic meaning. It should be considered educational rather than production-ready.
 */

export interface SemanticResult {
  similarity: number;
  embeddingA: number[];
  embeddingB: number[];
}

// Simple semantic mapping for common word relationships
const SEMANTIC_GROUPS = {
  // Academic verbs
  academic_verbs: ['analyze', 'examine', 'investigate', 'explore', 'study', 'research', 'evaluate', 'assess'],
  // Common synonyms
  good_words: ['good', 'excellent', 'great', 'wonderful', 'fantastic', 'amazing', 'outstanding', 'superb'],
  // Research terms
  research_terms: ['research', 'study', 'investigation', 'analysis', 'examination', 'exploration', 'inquiry'],
  // Time expressions
  time_words: ['now', 'then', 'today', 'tomorrow', 'yesterday', 'currently', 'recently', 'previously'],
  // Size descriptors
  size_words: ['big', 'large', 'huge', 'enormous', 'small', 'tiny', 'little', 'massive'],
  // Quality descriptors
  quality_words: ['good', 'bad', 'excellent', 'poor', 'high', 'low', 'superior', 'inferior']
};

export class SemanticAnalyzer {
  private vocabularySize: number;
  private semanticGroups: Map<string, string[]>;

  constructor(vocabularySize: number = 10000) {
    this.vocabularySize = vocabularySize;
    this.semanticGroups = new Map(Object.entries(SEMANTIC_GROUPS));
  }

  /**
   * Generate enhanced embedding using frequency + semantic grouping
   */
  generateEmbedding(tokens: string[]): number[] {
    const embedding = new Array(this.vocabularySize).fill(0);
    const semanticVector = new Array(this.semanticGroups.size).fill(0);

    // Build frequency vector
    for (const token of tokens) {
      const hash = this.hashToken(token) % this.vocabularySize;
      embedding[hash] += 1;
      
      // Add semantic group features
      let groupIndex = 0;
      for (const [groupName, groupWords] of this.semanticGroups.entries()) {
        if (groupWords.includes(token)) {
          semanticVector[groupIndex] += 1;
        }
        groupIndex++;
      }
    }

    // Combine frequency and semantic features
    const semanticStart = this.vocabularySize - this.semanticGroups.size;
    for (let i = 0; i < semanticVector.length; i++) {
      embedding[semanticStart + i] = semanticVector[i];
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
   * Calculate Jaccard similarity as additional semantic measure
   */
  jaccardSimilarity(textA: string, textB: string): number {
    const tokensA = new Set(this.tokenize(textA));
    const tokensB = new Set(this.tokenize(textB));
    
    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Enhanced similarity analysis combining multiple metrics
   */
  enhancedSimilarity(textA: string, textB: string): {
    cosineSimilarity: number;
    jaccardSimilarity: number;
    combinedScore: number;
  } {
    const semanticResult = this.analyzeSimilarity(textA, textB);
    const jaccardSim = this.jaccardSimilarity(textA, textB);
    
    // Weighted combination (cosine is more important for semantic similarity)
    const combinedScore = semanticResult.similarity * 0.7 + jaccardSim * 0.3;
    
    return {
      cosineSimilarity: semanticResult.similarity,
      jaccardSimilarity: jaccardSim,
      combinedScore: Math.round(combinedScore * 1000) / 1000
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
   * Tokenize text with enhanced preprocessing
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
      .filter(token => !this.isStopWord(token));
  }

  /**
   * Simple stop word filter
   */
  private isStopWord(token: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every'
    ]);
    return stopWords.has(token);
  }
}

export const semanticAnalyzer = new SemanticAnalyzer();
