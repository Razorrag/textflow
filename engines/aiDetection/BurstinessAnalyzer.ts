/**
 * Burstiness Analyzer
 * 
 * Measures the variance in writing patterns. Humans exhibit "bursty" writing
 * with varied sentence lengths, while AI produces more uniform output.
 */

export interface BurstinessResult {
  sentenceMean: number;
  sentenceStdDev: number;
  coefficientOfVariation: number;
  burstinessIndex: number;
  lengthDistribution: LengthDistribution;
  paragraphBurstiness: {
    mean: number;
    stdDev: number;
  };
  isLowBurstiness: boolean;
  isHumanBurstiness: boolean;
  interpretation: string;
}

export interface LengthDistribution {
  min: number;
  max: number;
  median: number;
  mode: number;
  quartiles: [number, number, number];
  histogram: number[];
}

export class BurstinessAnalyzer {
  /**
   * Analyze burstiness of text
   */
  analyze(text: string): BurstinessResult {
    const sentences = this.extractSentences(text);
    const sentenceLengths = sentences.map(s => this.countWords(s));
    
    const mean = this.mean(sentenceLengths);
    const variance = this.variance(sentenceLengths, mean);
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;
    const burstinessIndex = cv;
    
    const lengthDistribution = this.analyzeLengthDistribution(sentenceLengths);
    
    const paragraphs = this.extractParagraphs(text);
    const paragraphLengths = paragraphs.map(p => this.countWords(p));
    const paragraphMean = this.mean(paragraphLengths);
    const paragraphStdDev = Math.sqrt(this.variance(paragraphLengths, paragraphMean));
    
    const isLowBurstiness = burstinessIndex < 0.35;
    const isHumanBurstiness = burstinessIndex > 0.5;
    
    return {
      sentenceMean: Math.round(mean * 10) / 10,
      sentenceStdDev: Math.round(stdDev * 10) / 10,
      coefficientOfVariation: Math.round(cv * 1000) / 1000,
      burstinessIndex: Math.round(burstinessIndex * 1000) / 1000,
      lengthDistribution,
      paragraphBurstiness: {
        mean: Math.round(paragraphMean * 10) / 10,
        stdDev: Math.round(paragraphStdDev * 10) / 10
      },
      isLowBurstiness,
      isHumanBurstiness,
      interpretation: this.interpretBurstiness(burstinessIndex)
    };
  }

  /**
   * Extract sentences from text
   */
  private extractSentences(text: string): string[] {
    // Split on sentence-ending punctuation
    const sentences = text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    return sentences;
  }

  /**
   * Extract paragraphs from text
   */
  private extractParagraphs(text: string): string[] {
    return text.split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Count words in a string
   */
  private countWords(str: string): number {
    return str.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Calculate mean
   */
  private mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calculate variance
   */
  private variance(arr: number[], mean: number): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  }

  /**
   * Calculate median
   */
  private median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate mode
   */
  private mode(arr: number[]): number {
    if (arr.length === 0) return 0;
    const frequency: Map<number, number> = new Map();
    for (const num of arr) {
      frequency.set(num, (frequency.get(num) || 0) + 1);
    }
    let maxFreq = 0;
    let mode = arr[0];
    for (const [num, freq] of frequency) {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = num;
      }
    }
    return mode;
  }

  /**
   * Calculate quartiles
   */
  private quartiles(arr: number[]): [number, number, number] {
    if (arr.length === 0) return [0, 0, 0];
    const sorted = [...arr].sort((a, b) => a - b);
    const q1 = this.percentile(sorted, 25);
    const q2 = this.percentile(sorted, 50);
    const q3 = this.percentile(sorted, 75);
    return [q1, q2, q3];
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Create histogram of lengths
   */
  private createHistogram(lengths: number[]): number[] {
    const bins = 10;
    const max = Math.max(...lengths);
    const binSize = Math.ceil(max / bins);
    const histogram = new Array(bins).fill(0);
    
    for (const length of lengths) {
      const binIndex = Math.min(Math.floor(length / binSize), bins - 1);
      histogram[binIndex]++;
    }
    
    return histogram;
  }

  /**
   * Analyze length distribution
   */
  private analyzeLengthDistribution(lengths: number[]): LengthDistribution {
    return {
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      median: this.median(lengths),
      mode: this.mode(lengths),
      quartiles: this.quartiles(lengths),
      histogram: this.createHistogram(lengths)
    };
  }

  /**
   * Interpret burstiness score
   */
  private interpretBurstiness(index: number): string {
    if (index < 0.25) {
      return 'Very uniform sentence lengths - highly characteristic of AI-generated text';
    } else if (index < 0.35) {
      return 'Low burstiness - likely AI-generated or highly edited text';
    } else if (index < 0.5) {
      return 'Moderate burstiness - possibly human with some editing';
    } else if (index < 0.7) {
      return 'Good burstiness - characteristic of natural human writing';
    } else {
      return 'High burstiness - typical of casual or spontaneous human writing';
    }
  }
}

export const burstinessAnalyzer = new BurstinessAnalyzer();
