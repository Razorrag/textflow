/**
 * Burstiness Injector
 * 
 * Introduces natural variation in sentence lengths to mimic human writing patterns.
 */

export interface BurstinessInjectionResult {
  originalBurstiness: number;
  newBurstiness: number;
  changes: string[];
}

export class BurstinessInjector {
  /**
   * Inject burstiness into text by varying sentence lengths
   */
  inject(text: string, targetBurstiness: number = 0.6): {
    text: string;
    result: BurstinessInjectionResult;
  } {
    const sentences = this.splitIntoSentences(text);
    const originalBurstiness = this.calculateBurstiness(sentences);
    
    let processedSentences: string[] = [];
    const changes: string[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const words = sentence.split(/\s+/);
      
      // Strategy 1: Split long sentences
      if (words.length > 25 && originalBurstiness < targetBurstiness) {
        const split = this.splitLongSentence(sentence);
        if (split.length > 1) {
          processedSentences.push(...split);
          changes.push(`Split long sentence into ${split.length} parts`);
          continue;
        }
      }
      
      // Strategy 2: Merge very short sentences
      if (words.length < 8 && i < sentences.length - 1) {
        const nextSentence = sentences[i + 1];
        if (this.countWords(nextSentence) < 12) {
          const merged = this.mergeSentences(sentence, nextSentence);
          processedSentences.push(merged);
          changes.push('Merged two short sentences');
          i++; // Skip next sentence
          continue;
        }
      }
      
      // Strategy 3: Vary structure
      if (Math.random() < 0.3) {
        processedSentences.push(this.varySentenceStructure(sentence));
      } else {
        processedSentences.push(sentence);
      }
    }
    
    const newBurstiness = this.calculateBurstiness(processedSentences);
    
    return {
      text: processedSentences.join(' '),
      result: {
        originalBurstiness: Math.round(originalBurstiness * 1000) / 1000,
        newBurstiness: Math.round(newBurstiness * 1000) / 1000,
        changes
      }
    };
  }

  /**
   * Split long sentences into shorter ones
   */
  private splitLongSentence(sentence: string): string[] {
    // Split on conjunctions and relative pronouns
    const splitPatterns = [
      { marker: ', and ', replacement: '. ' },
      { marker: ', but ', replacement: '. However, ' },
      { marker: ', which ', replacement: '. This ' },
      { marker: ', because ', replacement: '. Since ' },
      { marker: '; ', replacement: '. ' },
      { marker: ', therefore ', replacement: '. Therefore, ' }
    ];
    
    let result = sentence;
    for (const { marker, replacement } of splitPatterns) {
      if (result.includes(marker)) {
        const parts = result.split(marker);
        result = parts.join(replacement);
        break;
      }
    }
    
    return result.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Merge two short sentences
   */
  private mergeSentences(s1: string, s2: string): string {
    const conjunctions = ['and', 'so', 'but', 'plus', 'yet'];
    const cleanS2 = s2.charAt(0).toLowerCase() + s2.slice(1);
    const conn = conjunctions[Math.floor(Math.random() * conjunctions.length)];
    
    return `${s1}, ${conn} ${cleanS2}`;
  }

  /**
   * Vary sentence structure
   */
  private varySentenceStructure(sentence: string): string {
    // Randomly change between statement and question (for applicable sentences)
    if (sentence.endsWith('.') && Math.random() < 0.1) {
      if (sentence.toLowerCase().startsWith('the ') || 
          sentence.toLowerCase().startsWith('this ') ||
          sentence.toLowerCase().startsWith('these ')) {
        return sentence.replace(/\.$/, '?').replace(/^the /i, 'Do the ');
      }
    }
    
    return sentence;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Count words in a string
   */
  private countWords(str: string): number {
    return str.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Calculate burstiness (coefficient of variation)
   */
  private calculateBurstiness(sentences: string[]): number {
    const lengths = sentences.map(s => this.countWords(s));
    if (lengths.length === 0) return 0;
    
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    if (mean === 0) return 0;
    
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / mean;
  }
}

export const burstinessInjector = new BurstinessInjector();
