/**
 * Professional Burstiness Injector
 * 
 * Enhanced burstiness injection that mimics professional tools like Humanize Pro.
 * Creates dramatic sentence length variations to break AI detection patterns.
 */

export interface ProfessionalBurstinessResult {
  text: string;
  burstinessScore: number;
  sentenceLengthVariance: number;
  rhythmComplexity: number;
  changes: BurstinessChange[];
  professionalMetrics: {
    shortSentenceRatio: number;
    longSentenceRatio: number;
    fragmentCount: number;
    complexityScore: number;
  };
}

interface BurstinessChange {
  type: 'fragment-injection' | 'sentence-splitting' | 'clause-expansion' | 'rhythm-variation';
  original: string;
  transformed: string;
  impact: number;
}

export class ProfessionalBurstinessInjector {
  private readonly professionalPatterns = {
    // Pro-level burstiness strategies
    aggressive: {
      shortTarget: 0.3,    // 30% sentences < 10 words
      longTarget: 0.2,     // 20% sentences > 30 words  
      fragmentTarget: 0.15, // 15% intentional fragments
      varianceTarget: 0.8   // High variance
    },
    moderate: {
      shortTarget: 0.2,
      longTarget: 0.15,
      fragmentTarget: 0.1,
      varianceTarget: 0.6
    },
    conservative: {
      shortTarget: 0.15,
      longTarget: 0.1,
      fragmentTarget: 0.05,
      varianceTarget: 0.4
    }
  };

  /**
   * Professional-grade burstiness injection
   * Mimics Humanize Pro's aggressive approach
   */
  inject(text: string, intensity: number = 0.7, strategy: keyof typeof this.professionalPatterns = 'aggressive'): ProfessionalBurstinessResult {
    const config = this.professionalPatterns[strategy];
    const changes: BurstinessChange[] = [];
    let processedText = text;

    // Step 1: Analyze current sentence patterns
    const sentences = this.extractSentences(processedText);
    const currentMetrics = this.analyzeSentencePatterns(sentences);

    // Step 2: Inject short, punchy sentences (pro technique)
    const shortSentenceResult = this.injectShortSentences(processedText, config.shortTarget * intensity, currentMetrics);
    processedText = shortSentenceResult.text;
    changes.push(...shortSentenceResult.changes);

    // Step 3: Create long, complex sentences
    const longSentenceResult = this.expandLongSentences(processedText, config.longTarget * intensity, currentMetrics);
    processedText = longSentenceResult.text;
    changes.push(...longSentenceResult.changes);

    // Step 4: Add intentional fragments (human-like)
    const fragmentResult = this.injectFragments(processedText, config.fragmentTarget * intensity);
    processedText = fragmentResult.text;
    changes.push(...fragmentResult.changes);

    // Step 5: Vary rhythm and flow
    const rhythmResult = this.varyRhythm(processedText, intensity);
    processedText = rhythmResult.text;
    changes.push(...rhythmResult.changes);

    // Step 6: Calculate final metrics
    const finalSentences = this.extractSentences(processedText);
    const finalMetrics = this.analyzeSentencePatterns(finalSentences);
    const burstinessScore = this.calculateBurstinessScore(finalMetrics, config);
    const professionalMetrics = this.calculateProfessionalMetrics(finalSentences);

    return {
      text: processedText,
      burstinessScore,
      sentenceLengthVariance: finalMetrics.lengthVariance,
      rhythmComplexity: finalMetrics.rhythmComplexity,
      changes,
      professionalMetrics
    };
  }

  /**
   * Extract sentences with context preservation
   */
  private extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Analyze current sentence patterns
   */
  private analyzeSentencePatterns(sentences: string[]): any {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      averageLength: mean,
      lengthVariance: variance / (mean * mean), // Coefficient of variation
      shortSentenceRatio: lengths.filter(len => len < 10).length / lengths.length,
      longSentenceRatio: lengths.filter(len => len > 30).length / lengths.length,
      rhythmComplexity: this.calculateRhythmComplexity(sentences)
    };
  }

  /**
   * Inject short, punchy sentences (pro technique)
   */
  private injectShortSentences(text: string, targetRatio: number, currentMetrics: any): { text: string; changes: BurstinessChange[] } {
    const changes: BurstinessChange[] = [];
    let processedText = text;
    const sentences = this.extractSentences(processedText);
    
    const currentShortRatio = currentMetrics.shortSentenceRatio;
    const neededShortSentences = Math.floor((targetRatio - currentShortRatio) * sentences.length);
    
    if (neededShortSentences > 0) {
      // Professional short sentence patterns
      const shortPatterns = [
        'Clearly.',
        'Indeed.',
        'Notably.',
        'Specifically.',
        'However.',
        'Therefore.',
        'Moreover.',
        'Furthermore.',
        'Consequently.',
        'Nevertheless.',
        'In fact.',
        'Thus.',
        'Hence.',
        'Yet.',
        'Still.',
        'Even so.',
        'As such.',
        'For now.',
        'Later.',
        'Then.',
        'Now.',
        'Here.',
        'There.',
        'Why?',
        'How?',
        'When?',
        'Where?'
      ];

      for (let i = 0; i < neededShortSentences && i < sentences.length; i++) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[randomIndex];
        const shortPattern = shortPatterns[Math.floor(Math.random() * shortPatterns.length)];
        
        // Insert short sentence before or after
        const insertBefore = Math.random() < 0.5;
        const originalText = sentence;
        
        if (insertBefore) {
          processedText = processedText.replace(sentence, `${shortPattern} ${sentence}`);
        } else {
          processedText = processedText.replace(sentence, `${sentence} ${shortPattern}`);
        }
        
        changes.push({
          type: 'fragment-injection',
          original: originalText,
          transformed: insertBefore ? `${shortPattern} ${sentence}` : `${sentence} ${shortPattern}`,
          impact: 0.8
        });
      }
    }

    return { text: processedText, changes };
  }

  /**
   * Expand sentences to create long, complex structures
   */
  private expandLongSentences(text: string, targetRatio: number, currentMetrics: any): { text: string; changes: BurstinessChange[] } {
    const changes: BurstinessChange[] = [];
    let processedText = text;
    const sentences = this.extractSentences(processedText);
    
    const currentLongRatio = currentMetrics.longSentenceRatio;
    const neededLongSentences = Math.floor((targetRatio - currentLongRatio) * sentences.length);
    
    if (neededLongSentences > 0) {
      // Professional expansion patterns
      const expansionPatterns = [
        ', which significantly impacts the overall outcome',
        ', thereby creating a more comprehensive understanding',
        ', leading to substantial improvements in the field',
        ', which fundamentally alters our perspective on',
        ', consequently affecting multiple aspects of',
        ', thus establishing a new paradigm for',
        ', which requires careful consideration of various factors',
        ', resulting in a more nuanced approach to',
        ', ultimately contributing to the advancement of',
        ', which has far-reaching implications for'
      ];

      for (let i = 0; i < neededLongSentences && i < sentences.length; i++) {
        const mediumSentences = sentences.filter(s => s.split(/\s+/).length >= 15 && s.split(/\s+/).length <= 25);
        if (mediumSentences.length === 0) break;
        
        const targetSentence = mediumSentences[Math.floor(Math.random() * mediumSentences.length)];
        const expansion = expansionPatterns[Math.floor(Math.random() * expansionPatterns.length)];
        
        const expandedSentence = targetSentence.replace('.', expansion + '.');
        processedText = processedText.replace(targetSentence, expandedSentence);
        
        changes.push({
          type: 'clause-expansion',
          original: targetSentence,
          transformed: expandedSentence,
          impact: 0.9
        });
      }
    }

    return { text: processedText, changes };
  }

  /**
   * Inject intentional fragments (human-like imperfection)
   */
  private injectFragments(text: string, targetRatio: number): { text: string; changes: BurstinessChange[] } {
    const changes: BurstinessChange[] = [];
    let processedText = text;
    
    const fragmentPatterns = [
      'A critical point.',
      'Essential context.',
      'Key insight here.',
      'Important note.',
      'Crucial distinction.',
      'Significant finding.',
      'Notable exception.',
      'Relevant detail.',
      'Specific case.',
      'Clear example.',
      'Strong evidence.',
      'Compelling argument.',
      'Valid concern.',
      'Alternative view.',
      'Different perspective.'
    ];

    const fragmentCount = Math.floor(targetRatio * 10); // Approximate
    const sentences = this.extractSentences(processedText);
    
    for (let i = 0; i < fragmentCount && i < sentences.length; i++) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      const sentence = sentences[randomIndex];
      const fragment = fragmentPatterns[Math.floor(Math.random() * fragmentPatterns.length)];
      
      // Insert fragment as separate thought
      const insertionPoint = Math.random() < 0.5 ? 'before' : 'after';
      const originalText = sentence;
      
      if (insertionPoint === 'before') {
        processedText = processedText.replace(sentence, `${fragment} ${sentence}`);
      } else {
        processedText = processedText.replace(sentence, `${sentence} ${fragment}`);
      }
      
      changes.push({
        type: 'fragment-injection',
        original: originalText,
        transformed: insertionPoint === 'before' ? `${fragment} ${sentence}` : `${sentence} ${fragment}`,
        impact: 0.7
      });
    }

    return { text: processedText, changes };
  }

  /**
   * Vary rhythm and flow for natural reading
   */
  private varyRhythm(text: string, intensity: number): { text: string; changes: BurstinessChange[] } {
    const changes: BurstinessChange[] = [];
    let processedText = text;
    
    // Rhythm variation patterns
    const rhythmPatterns = [
      { original: /(\w+)\s+(\w+)\s+(\w+)\s+(\w+)/g, replacement: '$1 $2. $3 $4' },
      { original: /(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)/g, replacement: '$1 $2, $3 $4 $5' },
      { original: /(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)/g, replacement: '$1 $2 $3. $4 $5 $6 $7' }
    ];

    if (Math.random() < intensity) {
      const pattern = rhythmPatterns[Math.floor(Math.random() * rhythmPatterns.length)];
      const matches = processedText.match(pattern.original);
      
      if (matches && matches.length > 0) {
        const targetMatch = matches[Math.floor(Math.random() * matches.length)];
        const transformed = targetMatch.replace(pattern.original, pattern.replacement);
        
        processedText = processedText.replace(targetMatch, transformed);
        
        changes.push({
          type: 'rhythm-variation',
          original: targetMatch,
          transformed,
          impact: 0.6
        });
      }
    }

    return { text: processedText, changes };
  }

  /**
   * Calculate rhythm complexity
   */
  private calculateRhythmComplexity(sentences: string[]): number {
    const rhythms = sentences.map(s => s.split(/[,\s]+/).length);
    const mean = rhythms.reduce((sum, r) => sum + r, 0) / rhythms.length;
    const variance = rhythms.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rhythms.length;
    return Math.sqrt(variance) / mean;
  }

  /**
   * Calculate professional burstiness score
   */
  private calculateBurstinessScore(metrics: any, config: any): number {
    const varianceScore = Math.min(metrics.lengthVariance / config.varianceTarget, 1) * 100;
    const shortScore = (metrics.shortSentenceRatio / config.shortTarget) * 100;
    const longScore = (metrics.longSentenceRatio / config.longTarget) * 100;
    
    return (varianceScore * 0.5 + shortScore * 0.25 + longScore * 0.25);
  }

  /**
   * Calculate professional metrics
   */
  private calculateProfessionalMetrics(sentences: string[]): any {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const fragments = sentences.filter(s => s.split(/\s+/).length < 5).length;
    
    return {
      shortSentenceRatio: lengths.filter(len => len < 10).length / lengths.length,
      longSentenceRatio: lengths.filter(len => len > 30).length / lengths.length,
      fragmentCount: fragments,
      complexityScore: this.calculateRhythmComplexity(sentences) * 100
    };
  }
}

// Singleton instance
export const professionalBurstinessInjector = new ProfessionalBurstinessInjector();
