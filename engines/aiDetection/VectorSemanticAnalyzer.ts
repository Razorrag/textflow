/**
 * Vector-Based Semantic Analyzer
 * 
 * Replaces the toy word-frequency approach with actual vector embeddings
 * to detect semantic monotony - a key indicator of AI-paraphrased text.
 * This approximates Turnitin's semantic skeleton detection.
 */

import { pipeline } from '@xenova/transformers';

export interface SemanticVectorResult {
  semanticMonotony: number;
  averageCosineDistance: number;
  distanceVariance: number;
  topicDrift: number;
  isAI: boolean;
  confidence: number;
  interpretation: string;
  sentenceVectors: number[][];
}

export class VectorSemanticAnalyzer {
  private embeddingModel: any = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2'; // Good balance of performance and size
  private isInitialized = false;

  /**
   * Initialize the embedding model
   */
  async initialize(): Promise<void> {
    try {
      console.log('Loading semantic embedding model...');
      this.embeddingModel = await pipeline('feature-extraction', this.modelName);
      this.isInitialized = true;
      console.log('Semantic embedding model loaded successfully');
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw new Error('Embedding model initialization failed');
    }
  }

  /**
   * Analyze semantic patterns using vector embeddings
   * This detects the "semantic skeleton" that AI paraphrasing preserves
   */
  async analyzeSemanticPatterns(text: string): Promise<SemanticVectorResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Split text into sentences
      const sentences = this.splitIntoSentences(text);
      if (sentences.length < 2) {
        return this.getMinimalResult(sentences);
      }

      // Generate embeddings for each sentence
      const sentenceVectors = await this.generateSentenceEmbeddings(sentences);
      
      // Calculate semantic distances between consecutive sentences
      const distances = this.calculateCosineDistances(sentenceVectors);
      
      // Analyze semantic patterns
      const averageDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
      const distanceVariance = this.calculateVariance(distances);
      
      // AI text typically has low semantic variance (monotonous)
      // Human text wanders more (higher variance)
      const semanticMonotony = 1 - (distanceVariance / 0.1); // Normalize to 0-1
      const topicDrift = this.calculateTopicDrift(sentenceVectors);
      
      // Determine AI likelihood
      const isAI = semanticMonotony > 0.6 && averageDistance < 0.3;
      const confidence = Math.min(0.9, Math.max(0.1, semanticMonotony));

      return {
        semanticMonotony: Math.round(semanticMonotony * 100) / 100,
        averageCosineDistance: Math.round(averageDistance * 1000) / 1000,
        distanceVariance: Math.round(distanceVariance * 10000) / 10000,
        topicDrift: Math.round(topicDrift * 100) / 100,
        isAI,
        confidence: Math.round(confidence * 100) / 100,
        interpretation: this.interpretSemanticPatterns(semanticMonotony, averageDistance, distanceVariance),
        sentenceVectors
      };
    } catch (error) {
      console.error('Error in semantic analysis:', error);
      return this.getFallbackResult(text);
    }
  }

  /**
   * Split text into meaningful sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Filter out very short fragments
      .slice(0, 20); // Limit to prevent memory issues
  }

  /**
   * Generate vector embeddings for sentences
   */
  private async generateSentenceEmbeddings(sentences: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const sentence of sentences) {
      try {
        const result = await this.embeddingModel(sentence, {
          pooling: 'mean',
          normalize: true
        });
        embeddings.push(Array.from(result.data));
      } catch (error) {
        console.error('Error embedding sentence:', error);
        // Add zero vector as fallback
        embeddings.push(new Array(384).fill(0)); // MiniLM-L6-v2 outputs 384 dimensions
      }
    }
    
    return embeddings;
  }

  /**
   * Calculate cosine distances between consecutive sentence vectors
   */
  private calculateCosineDistances(vectors: number[][]): number[] {
    const distances: number[] = [];
    
    for (let i = 0; i < vectors.length - 1; i++) {
      const distance = this.cosineDistance(vectors[i], vectors[i + 1]);
      distances.push(distance);
    }
    
    return distances;
  }

  /**
   * Calculate cosine distance between two vectors
   */
  private cosineDistance(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 1;
    
    const cosineSimilarity = dotProduct / (magnitudeA * magnitudeB);
    return 1 - cosineSimilarity; // Convert to distance
  }

  /**
   * Calculate variance of distances
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Calculate topic drift across the entire text
   */
  private calculateTopicDrift(vectors: number[][]): number {
    if (vectors.length < 3) return 0;
    
    // Compare first sentence to last sentence
    const firstVector = vectors[0];
    const lastVector = vectors[vectors.length - 1];
    
    return this.cosineDistance(firstVector, lastVector);
  }

  /**
   * Interpret semantic patterns
   */
  private interpretSemanticPatterns(monotony: number, avgDistance: number, variance: number): string {
    if (monotony > 0.8 && variance < 0.01) {
      return `Very high semantic monotony (${(monotony * 100).toFixed(1)}%) - AI paraphrasing detected`;
    } else if (monotony > 0.6 && variance < 0.02) {
      return `High semantic monotony (${(monotony * 100).toFixed(1)}%) - Consistent with AI patterns`;
    } else if (monotony > 0.4) {
      return `Moderate semantic patterns - Mixed characteristics`;
    } else {
      return `Low semantic monotony (${(monotony * 100).toFixed(1)}%) - Natural topic variation detected`;
    }
  }

  /**
   * Handle minimal text cases
   */
  private getMinimalResult(sentences: string[]): SemanticVectorResult {
    return {
      semanticMonotony: 0.5,
      averageCosineDistance: 0.5,
      distanceVariance: 0.01,
      topicDrift: 0.3,
      isAI: false,
      confidence: 0.3,
      interpretation: 'Insufficient text for semantic analysis',
      sentenceVectors: []
    };
  }

  /**
   * Fallback result if model fails
   */
  private getFallbackResult(text: string): SemanticVectorResult {
    const sentences = this.splitIntoSentences(text);
    const sentenceCount = sentences.length;
    
    // Simple heuristic based on sentence count and length variation
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentenceCount;
    const lengthVariance = this.calculateVariance(sentences.map(s => s.length));
    
    const estimatedMonotony = lengthVariance < 100 ? 0.7 : 0.3;
    
    return {
      semanticMonotony: estimatedMonotony,
      averageCosineDistance: 0.4,
      distanceVariance: 0.02,
      topicDrift: 0.3,
      isAI: estimatedMonotony > 0.5,
      confidence: 0.4,
      interpretation: 'Fallback analysis - based on sentence length patterns',
      sentenceVectors: []
    };
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; type: string; initialized: boolean } {
    return {
      name: this.modelName,
      type: 'sentence-transformer',
      initialized: this.isInitialized
    };
  }
}

// Singleton instance
export const vectorSemanticAnalyzer = new VectorSemanticAnalyzer();
