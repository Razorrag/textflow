/**
 * Neural Perplexity Calculator
 * 
 * Replaces the toy N-Gram model with actual transformer-based perplexity
 * calculation using @xenova/transformers. This approximates Turnitin's
 * neural perplexity detection capabilities.
 */

import { pipeline, AutoTokenizer, AutoModelForCausalLM } from '@xenova/transformers';

export interface NeuralPerplexityResult {
  perplexity: number;
  averageLogProbability: number;
  confidence: number;
  modelUsed: string;
  isAI: boolean;
  interpretation: string;
}

export class NeuralPerplexityCalculator {
  private model: any = null;
  private tokenizer: any = null;
  private modelName = 'Xenova/gpt2'; // Small model for browser compatibility
  private isInitialized = false;

  /**
   * Initialize the neural model
   */
  async initialize(): Promise<void> {
    try {
      console.log('Loading neural perplexity model...');
      this.model = await AutoModelForCausalLM.from_pretrained(this.modelName);
      this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
      this.isInitialized = true;
      console.log('Neural perplexity model loaded successfully');
    } catch (error) {
      console.error('Failed to load neural model:', error);
      throw new Error('Neural model initialization failed');
    }
  }

  /**
   * Calculate perplexity using transformer model
   * This approximates how Turnitin calculates neural perplexity
   */
  async calculatePerplexity(text: string): Promise<NeuralPerplexityResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Tokenize the text
      const inputs = this.tokenizer(text, { 
        return_tensors: 'pt',
        truncation: true,
        max_length: 512
      });

      // Get model outputs
      const outputs = await this.model(inputs);
      const logits = outputs.logits;
      
      // Calculate log probabilities
      const logProbs = this.calculateLogProbabilities(logits, inputs.input_ids);
      const averageLogProb = logProbs.reduce((sum: number, prob: number) => sum + prob, 0) / logProbs.length;
      
      // Convert to perplexity (lower is more predictable/AI-like)
      const perplexity = Math.exp(-averageLogProb);
      
      // Determine AI likelihood based on perplexity
      // AI text typically has perplexity < 20, human text > 30
      const isAI = perplexity < 25;
      const confidence = Math.max(0, Math.min(1, (35 - perplexity) / 20));

      return {
        perplexity: Math.round(perplexity * 100) / 100,
        averageLogProbability: Math.round(averageLogProb * 1000) / 1000,
        confidence: Math.round(confidence * 100) / 100,
        modelUsed: this.modelName,
        isAI,
        interpretation: this.interpretPerplexity(perplexity, isAI)
      };
    } catch (error) {
      console.error('Error calculating neural perplexity:', error);
      // Fallback to heuristic calculation if model fails
      return this.getFallbackResult(text);
    }
  }

  /**
   * Calculate log probabilities from model logits
   */
  private calculateLogProbabilities(logits: any, inputIds: any): number[] {
    const logProbs: number[] = [];
    const sequenceLength = inputIds.shape[1];
    
    for (let i = 1; i < sequenceLength; i++) {
      const targetTokenId = inputIds.data[i];
      const predictedLogits = logits.data.slice((i - 1) * logits.size[2], i * logits.size[2]);
      
      // Apply softmax to get probabilities
      const maxLogit = Math.max(...predictedLogits);
      const expLogits = predictedLogits.map((logit: number) => Math.exp(logit - maxLogit));
      const sumExp = expLogits.reduce((sum: number, exp: number) => sum + exp, 0);
      const probabilities = expLogits.map((exp: number) => exp / sumExp);
      
      // Get log probability of the actual token
      const tokenProbability = probabilities[targetTokenId] || 1e-10;
      logProbs.push(Math.log(tokenProbability));
    }
    
    return logProbs;
  }

  /**
   * Interpret perplexity score
   */
  private interpretPerplexity(perplexity: number, isAI: boolean): string {
    if (perplexity < 15) {
      return `Very low perplexity (${perplexity}) - Highly predictable AI pattern detected`;
    } else if (perplexity < 25) {
      return `Low perplexity (${perplexity}) - Consistent with AI-generated text`;
    } else if (perplexity < 35) {
      return `Moderate perplexity (${perplexity}) - Mixed human/AI characteristics`;
    } else if (perplexity < 50) {
      return `High perplexity (${perplexity}) - Consistent with human writing`;
    } else {
      return `Very high perplexity (${perplexity}) - Highly unpredictable human-like text`;
    }
  }

  /**
   * Fallback calculation if neural model fails
   */
  private getFallbackResult(text: string): NeuralPerplexityResult {
    // Simple heuristic fallback
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const vocabularyDiversity = uniqueWords / wordCount;
    
    // Estimate perplexity based on vocabulary diversity
    const estimatedPerplexity = 50 / vocabularyDiversity;
    const isAI = vocabularyDiversity < 0.4;
    
    return {
      perplexity: Math.round(estimatedPerplexity * 100) / 100,
      averageLogProbability: -Math.log(estimatedPerplexity / 50),
      confidence: 0.5,
      modelUsed: 'heuristic-fallback',
      isAI,
      interpretation: `Fallback calculation - ${isAI ? 'AI-like' : 'Human-like'} vocabulary diversity detected`
    };
  }

  /**
   * Batch calculate perplexity for multiple texts
   */
  async batchCalculatePerplexity(texts: string[]): Promise<NeuralPerplexityResult[]> {
    const results: NeuralPerplexityResult[] = [];
    
    for (const text of texts) {
      const result = await this.calculatePerplexity(text);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; type: string; initialized: boolean } {
    return {
      name: this.modelName,
      type: 'transformer-causal-lm',
      initialized: this.isInitialized
    };
  }
}

// Singleton instance
export const neuralPerplexityCalculator = new NeuralPerplexityCalculator();
