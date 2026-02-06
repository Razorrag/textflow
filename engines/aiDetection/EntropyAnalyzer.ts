/**
 * Entropy Analyzer
 * 
 * Measures Shannon entropy and related metrics to detect AI-generated text.
 * AI tends to produce text with lower entropy (more predictable patterns).
 */

export interface EntropyResult {
  shannonEntropy: number;
  wordEntropy: number;
  conditionalEntropy: number;
  normalizedShannon: number;
  interpretation: 'low-entropy' | 'moderate-entropy' | 'high-entropy';
  byteEntropy?: number;
}

export class EntropyAnalyzer {
  /**
   * Calculate Shannon entropy of characters
   */
  shannonEntropy(text: string): number {
    const frequencies = this.getFrequencies(text.split(''));
    const total = text.length;
    
    let entropy = 0;
    for (const freq of Object.values(frequencies)) {
      const p = freq / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    
    return Math.round(entropy * 1000) / 1000;
  }

  /**
   * Calculate word entropy (vocabulary diversity)
   */
  wordEntropy(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const frequencies = this.getFrequencies(words);
    const total = words.length;
    
    let entropy = 0;
    for (const freq of Object.values(frequencies)) {
      const p = freq / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    
    return Math.round(entropy * 1000) / 1000;
  }

  /**
   * Calculate conditional entropy H(Y|X)
   * Measures how well the next word is predicted by previous words
   */
  conditionalEntropy(text: string, ngramSize: number = 2): number {
    const tokens = text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    
    if (tokens.length < ngramSize + 1) {
      return 0;
    }

    let totalConditionalEntropy = 0;
    let count = 0;
    
    for (let i = 0; i < tokens.length - ngramSize; i++) {
      const context = tokens.slice(i, i + ngramSize - 1).join(' ');
      const nextWord = tokens[i + ngramSize];
      
      // Calculate probability distribution for this context
      const contextProbs = this.getContextProbabilities(tokens, context, i);
      
      if (contextProbs[nextWord] !== undefined && contextProbs[nextWord] > 0) {
        totalConditionalEntropy -= Math.log2(contextProbs[nextWord]);
        count++;
      }
    }
    
    return count > 0 ? Math.round((totalConditionalEntropy / count) * 1000) / 1000 : 0;
  }

  /**
   * Calculate byte-level entropy (for compression-based detection)
   */
  byteEntropy(text: string): number {
    // Simple byte frequency analysis
    const frequencies: Map<number, number> = new Map();
    for (let i = 0; i < text.length; i++) {
      const byte = text.charCodeAt(i);
      frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
    }
    
    const total = text.length;
    let entropy = 0;
    
    for (const freq of frequencies.values()) {
      const p = freq / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    
    return Math.round(entropy * 1000) / 1000;
  }

  /**
   * Normalized entropy (0-1 scale)
   */
  normalizedEntropy(text: string): number {
    const entropy = this.shannonEntropy(text);
    const maxEntropy = Math.log2(Math.min(text.length, 256));
    return Math.round((entropy / maxEntropy) * 1000) / 1000;
  }

  /**
   * Complete entropy analysis
   */
  analyze(text: string): EntropyResult {
    const shannon = this.shannonEntropy(text);
    const wordEnt = this.wordEntropy(text);
    const conditional = this.conditionalEntropy(text, 2);
    const normalized = this.normalizedEntropy(text);
    
    let interpretation: EntropyResult['interpretation'];
    if (normalized < 0.85) {
      interpretation = 'low-entropy';
    } else if (normalized < 0.95) {
      interpretation = 'moderate-entropy';
    } else {
      interpretation = 'high-entropy';
    }
    
    return {
      shannonEntropy: shannon,
      wordEntropy: wordEnt,
      conditionalEntropy: conditional,
      normalizedShannon: normalized,
      interpretation,
      byteEntropy: this.byteEntropy(text)
    };
  }

  /**
   * Get frequency map from array
   */
  private getFrequencies<T>(arr: T[]): Map<T, number> {
    const frequencies: Map<T, number> = new Map();
    for (const item of arr) {
      frequencies.set(item, (frequencies.get(item) || 0) + 1);
    }
    return frequencies;
  }

  /**
   * Get probability distribution for a context
   */
  private getContextProbabilities(
    tokens: string[],
    context: string,
    startIndex: number
  ): Record<string, number> {
    const probs: Record<string, number> = {};
    let total = 0;
    
    // Count occurrences of each word following this context
    for (let i = 0; i < tokens.length - 1; i++) {
      const tokenContext = tokens.slice(i, i + context.split(' ').length).join(' ');
      if (tokenContext === context) {
        const nextWord = tokens[i + context.split(' ').length];
        probs[nextWord] = (probs[nextWord] || 0) + 1;
        total++;
      }
    }
    
    // Convert to probabilities
    if (total > 0) {
      for (const word of Object.keys(probs)) {
        probs[word] = probs[word] / total;
      }
    }
    
    return probs;
  }
}

export const entropyAnalyzer = new EntropyAnalyzer();
