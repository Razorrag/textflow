/**
 * Stylometric Analyzer
 * 
 * Extracts and analyzes stylometric features from text for authorship
 * and AI-detection analysis.
 */

export interface StylometricFeatures {
  // Vocabulary Richness
  typeTokenRatio: number;
  hapaxLegemnaRatio: number;
  yulesK: number;
  simpsonsIndex: number;
  
  // Sentence Complexity
  averageSentenceLength: number;
  averageClauseCount: number;
  subordinateClauseRatio: number;
  
  // Word Complexity
  averageWordLength: number;
  polysyllableRatio: number;
  
  // Punctuation Patterns
  punctuationVariety: number;
  commaToSentenceRatio: number;
  
  // Function Word Analysis
  functionWordRatio: number;
  stopWordFrequency: number;
  
  // Part-of-Speech Distribution (simplified)
  verbRatio: number;
  nounRatio: number;
  adjectiveRatio: number;
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to',
  'of', 'for', 'with', 'by', 'from', 'as', 'it', 'that', 'this',
  'be', 'are', 'was', 'were', 'has', 'have', 'had', 'been',
  'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her',
  'my', 'your', 'his', 'its', 'our', 'their', 'what', 'which',
  'who', 'whom', 'where', 'when', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such'
]);

const FUNCTION_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else',
  'when', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its',
  'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might',
  'must', 'ought', 'need', 'dare', 'let', 'please'
]);

export class StylometricAnalyzer {
  /**
   * Extract all stylometric features from text
   */
  extractFeatures(text: string): StylometricFeatures {
    const words = this.tokenize(text);
    const sentences = this.extractSentences(text);
    
    return {
      // Vocabulary Richness
      typeTokenRatio: this.calculateTTR(words),
      hapaxLegemnaRatio: this.calculateHapaxLegemna(words),
      yulesK: this.calculateYulesK(words),
      simpsonsIndex: this.calculateSimpsonsIndex(words),
      
      // Sentence Complexity
      averageSentenceLength: this.averageSentenceLength(text, sentences),
      averageClauseCount: this.averageClauseCount(sentences),
      subordinateClauseRatio: this.subordinateClauseRatio(sentences),
      
      // Word Complexity
      averageWordLength: this.averageWordLength(words),
      polysyllableRatio: this.polysyllableRatio(words),
      
      // Punctuation Patterns
      punctuationVariety: this.punctuationVariety(text),
      commaToSentenceRatio: this.commaToSentenceRatio(text, sentences),
      
      // Function Word Analysis
      functionWordRatio: this.functionWordRatio(words),
      stopWordFrequency: this.stopWordFrequency(words),
      
      // Part-of-Speech Distribution (simplified)
      verbRatio: this.verbRatio(words),
      nounRatio: this.nounRatio(words),
      adjectiveRatio: this.adjectiveRatio(words)
    };
  }

  /**
   * Type-Token Ratio (TTR)
   * TTR = Unique Words / Total Words
   */
  private calculateTTR(words: string[]): number {
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    return Math.round((uniqueWords.size / words.length) * 1000) / 1000;
  }

  /**
   * Hapax Legemna Ratio
   * Ratio of words appearing only once
   */
  private calculateHapaxLegemna(words: string[]): number {
    const frequencies = this.getWordFrequencies(words);
    const hapaxCount = Array.from(frequencies.values()).filter(f => f === 1).length;
    return Math.round((hapaxCount / words.length) * 1000) / 1000;
  }

  /**
   * Yule's K Measure
   * K = 10,000 * (M² - Σ(nᵢ²)) / M²
   */
  private calculateYulesK(words: string[]): number {
    const frequencies = this.getWordFrequencies(words);
    const M = words.length;
    
    let sumSquares = 0;
    for (const freq of frequencies.values()) {
      sumSquares += freq * freq;
    }
    
    const k = 10000 * (M * M - sumSquares) / (M * M);
    return Math.round(k * 100) / 100;
  }

  /**
   * Simpson's Index
   * D = Σ n(n-1) / N(N-1)
   */
  private calculateSimpsonsIndex(words: string[]): number {
    const frequencies = this.getWordFrequencies(words);
    const N = words.length;
    
    let sum = 0;
    for (const freq of frequencies.values()) {
      sum += freq * (freq - 1);
    }
    
    const d = sum / (N * (N - 1));
    return Math.round((1 - d) * 1000) / 1000;
  }

  /**
   * Average sentence length
   */
  private averageSentenceLength(text: string, sentences: string[]): number {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return Math.round((words.length / sentences.length) * 10) / 10;
  }

  /**
   * Average clause count per sentence (simplified)
   */
  private averageClauseCount(sentences: string[]): number {
    let totalClauses = 0;
    for (const sentence of sentences) {
      // Count commas and semicolons as clause indicators
      const clauses = (sentence.match(/[,;]/g) || []).length + 1;
      totalClauses += clauses;
    }
    return Math.round((totalClauses / sentences.length) * 10) / 10;
  }

  /**
   * Subordinate clause ratio
   */
  private subordinateClauseRatio(sentences: string[]): number {
    let subordinateCount = 0;
    let totalClauses = 0;
    
    for (const sentence of sentences) {
      // Count subordinate conjunctions
      const subordinateMatches = sentence.match(/\b(that|which|who|whom|whose|where|when|why|how|because|since|although|though|while|if|unless|until|before|after|once|than)\b/gi);
      subordinateCount += subordinateMatches ? subordinateMatches.length : 0;
      
      totalClauses += (sentence.match(/[,;]/g) || []).length + 1;
    }
    
    return totalClauses > 0 ? Math.round((subordinateCount / totalClauses) * 1000) / 1000 : 0;
  }

  /**
   * Average word length
   */
  private averageWordLength(words: string[]): number {
    const totalLength = words.reduce((sum, w) => sum + w.length, 0);
    return Math.round((totalLength / words.length) * 100) / 100;
  }

  /**
   * Ratio of polysyllabic words (3+ syllables)
   */
  private polysyllableRatio(words: string[]): number {
    const polysyllabic = words.filter(w => this.countSyllables(w) >= 3);
    return Math.round((polysyllabic.length / words.length) * 1000) / 1000;
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * Punctuation variety (unique punctuation marks / total)
   */
  private punctuationVariety(text: string): number {
    const punctuation = text.match(/[.,;:!?()[\]{}'"-]/g) || [];
    const unique = new Set(punctuation.map(p => p));
    return unique.size;
  }

  /**
   * Comma to sentence ratio
   */
  private commaToSentenceRatio(text: string, sentences: string[]): number {
    const commas = (text.match(/,/g) || []).length;
    return sentences.length > 0 ? Math.round((commas / sentences.length) * 100) / 100 : 0;
  }

  /**
   * Function word ratio
   */
  private functionWordRatio(words: string[]): number {
    const functionWords = words.filter(w => FUNCTION_WORDS.has(w.toLowerCase()));
    return Math.round((functionWords.length / words.length) * 1000) / 1000;
  }

  /**
   * Stop word frequency
   */
  private stopWordFrequency(words: string[]): number {
    const stopWords = words.filter(w => STOP_WORDS.has(w.toLowerCase()));
    return Math.round((stopWords.length / words.length) * 1000) / 1000;
  }

  /**
   * Verb ratio (simplified detection)
   */
  private verbRatio(words: string[]): number {
    const verbs = words.filter(w => 
      /\b(am|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|shall|should|can|could|may|might|must|need|dare|ought|used)\b/i.test(w)
    );
    return Math.round((verbs.length / words.length) * 1000) / 1000;
  }

  /**
   * Noun ratio (simplified detection)
   */
  private nounRatio(words: string[]): number {
    const nouns = words.filter(w => 
      /\b(\w+ing|\w+tion|\w+ness|\w+ment|\w+ity|\w+ty|\w+er|\w+or)\b/i.test(w) ||
      /\b(\w+[ae]s)\b/i.test(w)
    );
    return Math.round((nouns.length / words.length) * 1000) / 1000;
  }

  /**
   * Adjective ratio (simplified detection)
   */
  private adjectiveRatio(words: string[]): number {
    const adjectives = words.filter(w => 
      /\b(\w+ful|\w+less|\w+ous|\w+ive|\w+able|\w+ible|\w+ent|\w+ant|\w+ic|\w+al)\b/i.test(w)
    );
    return Math.round((adjectives.length / words.length) * 1000) / 1000;
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Extract sentences
   */
  private extractSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Get word frequencies
   */
  private getWordFrequencies(words: string[]): Map<string, number> {
    const frequencies: Map<string, number> = new Map();
    for (const word of words) {
      const lower = word.toLowerCase();
      frequencies.set(lower, (frequencies.get(lower) || 0) + 1);
    }
    return frequencies;
  }
}

export const stylometricAnalyzer = new StylometricAnalyzer();
