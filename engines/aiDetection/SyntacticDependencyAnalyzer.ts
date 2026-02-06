/**
 * Syntactic Dependency Analyzer
 * 
 * Replaces simple sentence length analysis with dependency tree parsing
 * to detect AI's "too perfect" grammar patterns. This approximates Turnitin's
 * syntactic structure analysis.
 */

import nlp from 'compromise';

export interface SyntacticPatternResult {
  syntacticUniformity: number;
  averageTreeDepth: number;
  depthVariance: number;
  clauseComplexity: number;
  brokenClauseCount: number;
  isAI: boolean;
  confidence: number;
  interpretation: string;
  sentencePatterns: string[];
}

interface SentenceAnalysis {
  text: string;
  treeDepth: number;
  clauseCount: number;
  hasBrokenClauses: boolean;
  pattern: string;
  complexity: number;
}

export class SyntacticDependencyAnalyzer {
  private commonAIPatterns = [
    'Subject-Verb-Object',
    'Introductory-Subject-Verb',
    'Subject-Verb-Object-Conjunction',
    'Although-Subject-Verb',
    'Because-Subject-Verb'
  ];

  private humanPatterns = [
    'Broken-Clause-Main',
    'Parenthetical-Main',
    'Dangling-Modifier',
    'Fragment-Sentence',
    'Interrupted-Structure'
  ];

  /**
   * Analyze syntactic patterns to detect AI's perfect grammar
   */
  async analyzeSyntacticPatterns(text: string): Promise<SyntacticPatternResult> {
    try {
      const sentences = this.extractSentences(text);
      if (sentences.length < 3) {
        return this.getMinimalResult();
      }

      const sentenceAnalyses: SentenceAnalysis[] = [];
      
      for (const sentence of sentences) {
        const analysis = this.analyzeSentenceStructure(sentence);
        sentenceAnalyses.push(analysis);
      }

      // Calculate syntactic metrics
      const depths = sentenceAnalyses.map(s => s.treeDepth);
      const averageDepth = depths.reduce((sum, d) => sum + d, 0) / depths.length;
      const depthVariance = this.calculateVariance(depths);
      
      const complexities = sentenceAnalyses.map(s => s.complexity);
      const averageComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
      
      // Count broken clauses (human-like imperfections)
      const brokenClauses = sentenceAnalyses.filter(s => s.hasBrokenClauses).length;
      
      // Analyze pattern uniformity
      const patterns = sentenceAnalyses.map(s => s.pattern);
      const patternUniformity = this.calculatePatternUniformity(patterns);
      
      // AI typically has high uniformity, low variance, few broken clauses
      const syntacticUniformity = patternUniformity;
      const isAI = syntacticUniformity > 0.7 && depthVariance < 0.5 && brokenClauses < sentences.length * 0.1;
      const confidence = Math.min(0.9, Math.max(0.1, syntacticUniformity));

      return {
        syntacticUniformity: Math.round(syntacticUniformity * 100) / 100,
        averageTreeDepth: Math.round(averageDepth * 10) / 10,
        depthVariance: Math.round(depthVariance * 100) / 100,
        clauseComplexity: Math.round(averageComplexity * 100) / 100,
        brokenClauseCount: brokenClauses,
        isAI,
        confidence: Math.round(confidence * 100) / 100,
        interpretation: this.interpretSyntacticPatterns(syntacticUniformity, depthVariance, brokenClauses),
        sentencePatterns: patterns
      };
    } catch (error) {
      console.error('Error in syntactic analysis:', error);
      return this.getFallbackResult(text);
    }
  }

  /**
   * Extract sentences using compromise
   */
  private extractSentences(text: string): string[] {
    const doc = nlp(text);
    return doc.sentences().out('array').filter(s => s.length > 15);
  }

  /**
   * Analyze individual sentence structure
   */
  private analyzeSentenceStructure(sentence: string): SentenceAnalysis {
    const doc = nlp(sentence);
    
    // Parse sentence structure
    const verbs = doc.verbs().out('array');
    const subjects = doc.nouns().out('array');
    const clauses = this.identifyClauses(sentence);
    const treeDepth = this.estimateTreeDepth(sentence);
    const pattern = this.identifySyntacticPattern(sentence, verbs, subjects);
    const hasBrokenClauses = this.detectBrokenClauses(sentence);
    const complexity = this.calculateComplexity(clauses, treeDepth, hasBrokenClauses);

    return {
      text: sentence,
      treeDepth,
      clauseCount: clauses.length,
      hasBrokenClauses,
      pattern,
      complexity
    };
  }

  /**
   * Identify clauses in a sentence
   */
  private identifyClauses(sentence: string): string[] {
    // Simple clause identification based on conjunctions and punctuation
    const clauseMarkers = ['and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'while', 'when', 'because', 'although', 'since'];
    const clauses = sentence.split(new RegExp(`\\b(?:${clauseMarkers.join('|')})\\b`, 'i'));
    return clauses.filter(c => c.trim().length > 0);
  }

  /**
   * Estimate syntactic tree depth
   */
  private estimateTreeDepth(sentence: string): number {
    const doc = nlp(sentence);
    
    // Simple heuristic based on sentence complexity
    let depth = 1; // Base level
    
    // Add depth for subordinate clauses
    const subordinateMarkers = ['that', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'if', 'whether', 'although', 'because', 'since', 'while', 'unless'];
    for (const marker of subordinateMarkers) {
      if (sentence.toLowerCase().includes(marker)) {
        depth += 0.5;
      }
    }
    
    // Add depth for complex phrases
    const phrases = doc.prepositions().out('array').length + doc.conjunctions().out('array').length;
    depth += phrases * 0.3;
    
    return Math.min(depth, 5); // Cap at reasonable maximum
  }

  /**
   * Identify syntactic pattern type
   */
  private identifySyntacticPattern(sentence: string, verbs: string[], subjects: string[]): string {
    const lowerSentence = sentence.toLowerCase();
    
    // Check for common AI patterns
    if (lowerSentence.startsWith('although ') || lowerSentence.startsWith('while ') || lowerSentence.startsWith('because ')) {
      return 'Introductory-Subject-Verb';
    }
    
    if (subjects.length === 1 && verbs.length === 1) {
      return 'Subject-Verb-Object';
    }
    
    if (lowerSentence.includes(' and ') || lowerSentence.includes(' but ')) {
      return 'Subject-Verb-Object-Conjunction';
    }
    
    // Check for human-like patterns
    if (this.detectBrokenClauses(sentence)) {
      return 'Broken-Clause-Main';
    }
    
    if (sentence.includes('(') && sentence.includes(')')) {
      return 'Parenthetical-Main';
    }
    
    if (sentence.endsWith(',') || lowerSentence.startsWith('so ') || lowerSentence.startsWith('and ')) {
      return 'Fragment-Sentence';
    }
    
    return 'Complex-Structure';
  }

  /**
   * Detect broken clauses and other human-like imperfections
   */
  private detectBrokenClauses(sentence: string): boolean {
    // Look for common human errors
    const brokenPatterns = [
      /\s,\s*$/, // Trailing comma
      /^\s*(and|but|so|or|nor)\s+/i, // Starting with conjunction
      /\s+(and|but|so|or|nor)\s*$/i, // Ending with conjunction
      /\s{2,}/, // Double spaces
      /\.\s*\w+\s*\./, // Sentence fragment
    ];
    
    return brokenPatterns.some(pattern => pattern.test(sentence));
  }

  /**
   * Calculate sentence complexity
   */
  private calculateComplexity(clauses: string[], treeDepth: number, hasBrokenClauses: boolean): number {
    let complexity = treeDepth;
    complexity += clauses.length * 0.5;
    if (hasBrokenClauses) complexity += 0.3;
    return complexity;
  }

  /**
   * Calculate pattern uniformity across sentences
   */
  private calculatePatternUniformity(patterns: string[]): number {
    if (patterns.length < 2) return 0.5;
    
    // Count pattern frequency
    const patternCounts = new Map<string, number>();
    for (const pattern of patterns) {
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }
    
    // Calculate uniformity (higher = more repetitive/AI-like)
    const maxCount = Math.max(...patternCounts.values());
    const uniformity = maxCount / patterns.length;
    
    return uniformity;
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Interpret syntactic patterns
   */
  private interpretSyntacticPatterns(uniformity: number, variance: number, brokenClauses: number): string {
    if (uniformity > 0.8 && variance < 0.3 && brokenClauses === 0) {
      return `Very high syntactic uniformity (${(uniformity * 100).toFixed(1)}%) - Perfect AI grammar detected`;
    } else if (uniformity > 0.6 && variance < 0.5) {
      return `High syntactic uniformity (${(uniformity * 100).toFixed(1)}%) - Consistent with AI patterns`;
    } else if (brokenClauses > 0) {
      return `Human-like imperfections detected (${brokenClauses} broken clauses)`;
    } else {
      return `Varied syntactic patterns - Natural writing characteristics`;
    }
  }

  /**
   * Handle minimal text cases
   */
  private getMinimalResult(): SyntacticPatternResult {
    return {
      syntacticUniformity: 0.5,
      averageTreeDepth: 2.0,
      depthVariance: 0.5,
      clauseComplexity: 1.5,
      brokenClauseCount: 0,
      isAI: false,
      confidence: 0.3,
      interpretation: 'Insufficient text for syntactic analysis',
      sentencePatterns: []
    };
  }

  /**
   * Fallback result if analysis fails
   */
  private getFallbackResult(text: string): SyntacticPatternResult {
    const sentences = this.extractSentences(text);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    // Simple heuristic based on sentence length consistency
    const lengthVariance = this.calculateVariance(sentences.map(s => s.length));
    const estimatedUniformity = lengthVariance < 50 ? 0.7 : 0.4;
    
    return {
      syntacticUniformity: estimatedUniformity,
      averageTreeDepth: 2.5,
      depthVariance: 0.3,
      clauseComplexity: 2.0,
      brokenClauseCount: 0,
      isAI: estimatedUniformity > 0.5,
      confidence: 0.4,
      interpretation: 'Fallback analysis - based on sentence length patterns',
      sentencePatterns: []
    };
  }
}

// Singleton instance
export const syntacticDependencyAnalyzer = new SyntacticDependencyAnalyzer();
