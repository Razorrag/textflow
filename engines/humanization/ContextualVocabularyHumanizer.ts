/**
 * Professional Contextual Vocabulary Humanizer
 * 
 * Uses BERT-based semantic understanding to find contextually appropriate
 * synonyms that break AI detection patterns. This mimics Quillbot's
 * contextual thesaurus approach.
 */

import { pipeline } from '@xenova/transformers';

export interface ContextualSynonymResult {
  original: string;
  replacement: string;
  context: string;
  confidence: number;
  semanticDistance: number;
}

export interface ContextualVocabularyResult {
  text: string;
  changes: ContextualSynonymResult[];
  perplexityImprovement: number;
  burstinessImpact: number;
  overallHumanization: number;
}

export class ContextualVocabularyHumanizer {
  private fillMaskPipeline: any = null;
  private embeddingPipeline: any = null;
  private isInitialized = false;
  
  // Professional-grade synonym strategies
  private readonly synonymStrategies = {
    academic: {
      intensity: 'high',
      preserveField: true,
      avoidCommonAI: true,
      semanticVariance: 0.7
    },
    professional: {
      intensity: 'medium', 
      preserveField: false,
      avoidCommonAI: true,
      semanticVariance: 0.5
    },
    natural: {
      intensity: 'low',
      preserveField: false,
      avoidCommonAI: false,
      semanticVariance: 0.3
    }
  };

  async initialize(): Promise<void> {
    try {
      console.log('Loading contextual vocabulary models...');
      this.fillMaskPipeline = await pipeline('fill-mask', 'Xenova/bert-base-uncased');
      this.embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.isInitialized = true;
      console.log('Contextual vocabulary models loaded successfully');
    } catch (error) {
      console.error('Failed to load contextual models:', error);
      throw new Error('Contextual vocabulary model initialization failed');
    }
  }

  /**
   * Professional-grade contextual vocabulary humanization
   * Mimics Quillbot's semantic approach
   */
  async humanizeContextual(
    text: string, 
    strategy: keyof typeof this.synonymStrategies = 'academic',
    intensity: number = 0.6
  ): Promise<ContextualVocabularyResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const config = this.synonymStrategies[strategy];
    const changes: ContextualSynonymResult[] = [];
    let processedText = text;

    // Step 1: Identify AI-like patterns and common words
    const targetWords = this.identifyAITargetWords(text, config);
    
    // Step 2: Process each word with contextual understanding
    for (const targetWord of targetWords) {
      if (Math.random() < intensity) {
        const contextualSynonym = await this.findContextualSynonym(
          targetWord.word, 
          targetWord.context, 
          config
        );
        
        if (contextualSynonym && this.isContextuallyAppropriate(contextualSynonym, targetWord.context)) {
          processedText = processedText.replace(
            new RegExp(`\\b${targetWord.word}\\b`, 'gi'),
            contextualSynonym.replacement
          );
          
          changes.push(contextualSynonym);
        }
      }
    }

    // Step 3: Calculate impact metrics
    const perplexityImprovement = this.calculatePerplexityImpact(text, processedText);
    const burstinessImpact = this.calculateBurstinessImpact(text, processedText);
    const overallHumanization = this.calculateOverallHumanization(changes, config);

    return {
      text: processedText,
      changes,
      perplexityImprovement,
      burstinessImpact,
      overallHumanization
    };
  }

  /**
   * Identify words that trigger AI detection
   */
  private identifyAITargetWords(text: string, config: any): Array<{word: string, context: string}> {
    const aiTriggerWords = [
      // Common AI markers
      'delve', 'tapestry', 'underscore', 'testament', 'realm', 'landscape',
      'holistic', 'comprehensive', 'multifaceted', 'nuanced', 'robust',
      'leverage', 'utilize', 'facilitate', 'optimize', 'streamline',
      
      // Overused academic transitions
      'furthermore', 'moreover', 'consequently', 'nevertheless', 'nonetheless',
      'in conclusion', 'to summarize', 'in essence', 'ultimately',
      
      // Generic academic verbs
      'show', 'demonstrate', 'indicate', 'suggest', 'reveal', 'illustrate',
      'highlight', 'emphasize', 'stress', 'underscore', 'point out',
      
      // Common AI adjectives
      'significant', 'important', 'crucial', 'essential', 'vital', 'key',
      'major', 'substantial', 'considerable', 'notable', 'remarkable'
    ];

    const words: Array<{word: string, context: string}> = [];
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      for (const word of sentenceWords) {
        if (aiTriggerWords.includes(word) || 
            (config.avoidCommonAI && this.isCommonAIWord(word))) {
          words.push({
            word: word,
            context: sentence.trim()
          });
        }
      }
    }
    
    return words;
  }

  /**
   * Find contextual synonym using BERT fill-mask
   */
  private async findContextualSynonym(
    word: string, 
    context: string, 
    config: any
  ): Promise<ContextualSynonymResult | null> {
    try {
      // Create masked sentence
      const maskedContext = context.replace(new RegExp(`\\b${word}\\b`, 'gi'), '[MASK]');
      
      // Get BERT predictions
      const predictions = await this.fillMaskPipeline(maskedContext, {
        topK: 10
      });

      // Filter and score predictions
      const candidates = predictions
        .filter((pred: any) => pred.token_str !== word)
        .filter((pred: any) => this.isAcademicAppropriate(pred.token_str, config))
        .slice(0, 5);

      if (candidates.length === 0) return null;

      // Select best candidate based on semantic distance
      const originalEmbedding = await this.getEmbedding(word);
      const bestCandidate = await this.selectBestSemanticCandidate(
        candidates, 
        originalEmbedding, 
        config.semanticVariance
      );

      return {
        original: word,
        replacement: bestCandidate.token_str,
        context: context,
        confidence: bestCandidate.score,
        semanticDistance: bestCandidate.distance
      };
    } catch (error) {
      console.error('Error finding contextual synonym:', error);
      return null;
    }
  }

  /**
   * Get word embedding for semantic comparison
   */
  private async getEmbedding(word: string): Promise<number[]> {
    const result = await this.embeddingPipeline(word, {
      pooling: 'mean',
      normalize: true
    });
    return Array.from(result.data);
  }

  /**
   * Select best semantic candidate based on desired variance
   */
  private async selectBestSemanticCandidate(
    candidates: any[], 
    originalEmbedding: number[], 
    targetVariance: number
  ): Promise<any> {
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const candidateEmbedding = await this.getEmbedding(candidate.token_str);
        const semanticDistance = this.cosineDistance(originalEmbedding, candidateEmbedding);
        
        // Score based on how close to target variance
        const varianceScore = 1 - Math.abs(semanticDistance - targetVariance);
        const combinedScore = (candidate.score * 0.6) + (varianceScore * 0.4);
        
        return {
          ...candidate,
          distance: semanticDistance,
          combinedScore
        };
      })
    );

    return scoredCandidates.sort((a, b) => b.combinedScore - a.combinedScore)[0];
  }

  /**
   * Calculate cosine distance between embeddings
   */
  private cosineDistance(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 1;
    
    const cosineSimilarity = dotProduct / (magnitudeA * magnitudeB);
    return 1 - cosineSimilarity;
  }

  /**
   * Check if word is commonly used by AI
   */
  private isCommonAIWord(word: string): boolean {
    const commonAIWords = [
      'indeed', 'certainly', 'obviously', 'clearly', 'notably',
      'significantly', 'substantially', 'considerably', 'remarkably',
      'furthermore', 'moreover', 'additionally', 'likewise'
    ];
    return commonAIWords.includes(word);
  }

  /**
   * Check if synonym is academically appropriate
   */
  private isAcademicAppropriate(synonym: string, config: any): boolean {
    // Avoid overly casual or inappropriate terms
    const inappropriateTerms = [
      'cool', 'awesome', 'great', 'bad', 'good', 'nice', 'okay',
      'stuff', 'things', 'stuff', 'crap', 'weird', 'strange'
    ];
    
    if (inappropriateTerms.includes(synonym.toLowerCase())) {
      return false;
    }

    // For academic strategy, ensure formal language
    if (config.intensity === 'high') {
      const casualTerms = ['get', 'do', 'make', 'take', 'have', 'go'];
      return !casualTerms.includes(synonym.toLowerCase());
    }

    return true;
  }

  /**
   * Check contextual appropriateness
   */
  private isContextuallyAppropriate(
    synonym: ContextualSynonymResult, 
    context: string
  ): boolean {
    // Basic context checks
    if (synonym.confidence < 0.3) return false;
    if (synonym.semanticDistance > 0.8) return false;
    
    // Check if replacement maintains sentence coherence
    const testSentence = context.replace(synonym.original, synonym.replacement);
    return testSentence.length > 10 && testSentence.includes(' ');
  }

  /**
   * Calculate impact on perplexity
   */
  private calculatePerplexityImpact(original: string, processed: string): number {
    // Simple heuristic: more diverse vocabulary = higher perplexity
    const originalUnique = new Set(original.toLowerCase().split(/\s+/)).size;
    const processedUnique = new Set(processed.toLowerCase().split(/\s+/)).size;
    
    return ((processedUnique - originalUnique) / originalUnique) * 100;
  }

  /**
   * Calculate impact on burstiness
   */
  private calculateBurstinessImpact(original: string, processed: string): number {
    const originalSentences = original.split(/[.!?]+/);
    const processedSentences = processed.split(/[.!?]+/);
    
    const originalLengths = originalSentences.map(s => s.trim().length);
    const processedLengths = processedSentences.map(s => s.trim().length);
    
    const originalCV = this.calculateCoefficientOfVariation(originalLengths);
    const processedCV = this.calculateCoefficientOfVariation(processedLengths);
    
    return ((processedCV - originalCV) / originalCV) * 100;
  }

  /**
   * Calculate coefficient of variation
   */
  private calculateCoefficientOfVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean;
  }

  /**
   * Calculate overall humanization score
   */
  private calculateOverallHumanization(
    changes: ContextualSynonymResult[], 
    config: any
  ): number {
    if (changes.length === 0) return 0;
    
    const avgConfidence = changes.reduce((sum, change) => sum + change.confidence, 0) / changes.length;
    const avgSemanticDistance = changes.reduce((sum, change) => sum + change.semanticDistance, 0) / changes.length;
    
    return (avgConfidence * 0.6 + avgSemanticDistance * 0.4) * 100;
  }
}

// Singleton instance
export const contextualVocabularyHumanizer = new ContextualVocabularyHumanizer();
