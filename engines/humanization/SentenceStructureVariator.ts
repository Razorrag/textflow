/**
 * Academic Sentence Structure Variator
 * 
 * Varies sentence structures to create natural academic writing patterns.
 * Academic writing benefits from varied but sophisticated sentence structures
 * that maintain scholarly tone while avoiding AI-typical uniformity.
 */

export interface AcademicSentenceResult {
  text: string;
  transformationsApplied: number;
  structures: {
    type: string;
    count: number;
  }[];
  varietyScore: number;
}

export class AcademicSentenceVariator {
  /**
   * Vary sentence structures for academic writing
   */
  vary(text: string, intensity: number = 0.4): AcademicSentenceResult {
    const sentences = this.splitIntoSentences(text);
    const transformations: string[] = [];
    
    const processedSentences = sentences.map((sentence, index) => {
      // Only transform longer sentences
      if (sentence.length < 50 || Math.random() > intensity) {
        return sentence;
      }
      
      // Apply transformation based on position and context
      const transformType = this.selectAppropriateTransform(sentence, index, sentences.length);
      
      switch (transformType) {
        case 'passive_to_active':
          return this.convertPassiveToActive(sentence);
        case 'active_to_passive':
          return this.convertActiveToPassive(sentence);
        case 'split_long':
          return this.splitLongAcademicSentence(sentence);
        case 'combine_short':
          return this.combineWithAcademicConnector(sentence, sentences[index + 1]);
        case 'move_clause':
          return this.moveAcademicClause(sentence);
        case 'add_parenthetical':
          return this.addAcademicParenthetical(sentence);
        case 'hedge_claim':
          return this.addAcademicHedging(sentence);
        case 'vary_opening':
          return this.varySentenceOpening(sentence);
        default:
          return sentence;
      }
    });
    
    // Count transformation types
    const structures = this.categorizeStructures(processedSentences);
    const varietyScore = this.calculateVarietyScore(structures, sentences.length);
    
    return {
      text: processedSentences.join(' '),
      transformationsApplied: transformations.length,
      structures,
      varietyScore
    };
  }
  
  /**
   * Select appropriate transformation based on context
   */
  private selectAppropriateTransform(sentence: string, index: number, total: number): string {
    const transformations = [
      'passive_to_active',
      'active_to_passive',
      'split_long',
      'combine_short',
      'move_clause',
      'add_parenthetical',
      'hedge_claim',
      'vary_opening'
    ];
    
    // First sentence - prefer opening variation
    if (index === 0) {
      return 'vary_opening';
    }
    
    // Last sentence - prefer hedging or strong conclusion
    if (index === total - 1) {
      return Math.random() > 0.5 ? 'hedge_claim' : 'split_long';
    }
    
    // Long sentences - prefer splitting
    if (sentence.length > 150) {
      return Math.random() > 0.5 ? 'split_long' : 'add_parenthetical';
    }
    
    // Short sentences - prefer combining or voice change
    if (sentence.length < 80) {
      return 'combine_short';
    }
    
    return transformations[Math.floor(Math.random() * transformations.length)];
  }
  
  /**
   * Convert passive voice to active (or vice versa) for variety
   */
  private convertPassiveToActive(sentence: string): string {
    // Pattern: "was/were + past participle"
    const passivePattern = /\b(\w+)\s+(was|were)\s+(\w+ed)\b/i;
    const match = sentence.match(passivePattern);
    
    if (match) {
      const subject = match[1];
      const verb = match[3];
      // Simple conversion: "was studied" -> "researchers studied"
      return sentence.replace(passivePattern, `researchers ${verb} ${subject}`);
    }
    
    return sentence;
  }
  
  /**
   * Convert active to passive
   */
  private convertActiveToPassive(sentence: string): string {
    const activePattern = /^(\w+)\s+(has|have|will|would)\s+(\w+)\s+(the|a|an)\s+(\w+)/i;
    const match = sentence.match(activePattern);
    
    if (match && sentence.length > 60) {
      const subject = match[1];
      const modal = match[2];
      const verb = match[3];
      const article = match[4];
      const object = match[5];
      
      return `the ${object} ${modal} be ${verb}ed by ${subject}`;
    }
    
    return sentence;
  }
  
  /**
   * Split long academic sentences
   */
  private splitLongAcademicSentence(sentence: string): string {
    const splitPatterns = [
      // Split on semicolons
      { pattern: /^(.+?);\s*(.+)$/, separator: '. Furthermore, ' },
      // Split on complex clauses
      { pattern: /^(.+?),\s+which\s+(.+)$/, separator: '. This ' },
      // Split on participial phrases
      { pattern: /^(.+?),\s+indicating\s+(.+)$/, separator: '. This indicates ' },
      // Split on contrast
      { pattern: /^(.+?),\s+however,\s+(.+)$/, separator: '. However, ' },
      // Split on result
      { pattern: /^(.+?),\s+as\s+a\s+result,\s+(.+)$/, separator: '. As a result, ' }
    ];
    
    for (const { pattern, separator } of splitPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1].length > 30 && match[2].length > 20) {
        return `${match[1]}${separator}${match[2].charAt(0).toUpperCase() + match[2].slice(1)}`;
      }
    }
    
    return sentence;
  }
  
  /**
   * Combine short sentences with academic connectors
   */
  private combineWithAcademicConnector(s1: string, s2?: string): string {
    if (!s2 || s2.length < 30) return s1;
    
    const connectors = [
      { connector: ', which suggests that', type: 'inference' },
      { connector: ', indicating that', type: 'evidence' },
      { connector: ', implying that', type: 'implication' },
      { connector: ', demonstrating that', type: 'evidence' },
      { connector: ', thereby showing that', type: 'result' },
      { connector: '; furthermore,', type: 'addition' },
      { connector: '; consequently,', type: 'result' },
      { connector: ', as demonstrated by', type: 'evidence' }
    ];
    
    const selected = connectors[Math.floor(Math.random() * connectors.length)];
    
    // Clean up s2
    const cleanS2 = s2.charAt(0).toLowerCase() + s2.slice(1);
    
    return `${s1}${selected.connector} ${cleanS2}`;
  }
  
  /**
   * Move clauses for variation
   */
  private moveAcademicClause(sentence: string): string {
    // Move conditional or causal clauses
    const patterns = [
      { regex: /^(Because|Since|Although|While|If)\s+(.+),\s*(.+)$/i, intro: 1 },
      { regex: /^(When|Where|Why|How)\s+(.+),\s*(.+)$/i, intro: 1 },
      { regex: /^(Provided that|Insofar as|Whereas|While)\s+(.+),\s*(.+)$/i, intro: 1 }
    ];
    
    for (const { regex, intro } of patterns) {
      const match = sentence.match(regex);
      if (match) {
        const clausePart = match[2];
        const mainPart = match[3];
        
        if (mainPart && mainPart.length > 20) {
          return `${intro === 1 ? match[1] : match[1]} ${clausePart}, ${mainPart.charAt(0).toLowerCase() + mainPart.slice(1)}`;
        }
      }
    }
    
    return sentence;
  }
  
  /**
   * Add academic parenthetical expressions
   */
  private addAcademicParenthetical(sentence: string): string {
    const parentheticals = [
      ', as the literature indicates,',
      ', as previous research has shown,',
      ', as noted in the methodology,',
      ', in accordance with the theoretical framework,',
      ', consistent with earlier findings,',
      ', as suggested by the data,',
      ', following established protocols,',
      ', within the scope of this investigation,'
    ];
    
    const phrases = sentence.split(/,|;|:/);
    if (phrases.length >= 2 && phrases[0].length > 20) {
      const phrase = parentheticals[Math.floor(Math.random() * parentheticals.length)];
      return `${phrases[0]}${phrase} ${phrases.slice(1).join(',')}`;
    }
    
    return sentence;
  }
  
  /**
   * Add academic hedging to claims
   */
  private addAcademicHedging(sentence: string): string {
    const hedgings = [
      'it appears that',
      'there is evidence to suggest',
      'preliminary findings indicate',
      'it may be that',
      'these results point to',
      'the data support the view that'
    ];
    
    const hedging = hedgings[Math.floor(Math.random() * hedgings.length)];
    
    // Insert at beginning or after subject
    const insertPattern = /^(This|These|The|An?|It)\s+(\w+)/i;
    
    return sentence.replace(insertPattern, `${hedging}, $1 $2`);
  }
  
  /**
   * Vary sentence openings
   */
  private varySentenceOpening(sentence: string): string {
    const openingPatterns: { pattern: RegExp; replacement: string | null }[] = [
      // Begin with subordinate clause
      { pattern: /^(Although|Because|While|Since|If|When|Whereas|Insofar as)/, replacement: null },
      // Begin with prepositional phrase
      { pattern: /^(In |On |At |Under |Through |Between |Among |Over |Pursuant to |In accordance with)/i, replacement: null },
      // Begin with participial phrase
      { pattern: /^(Having|Shown|Demonstrated|Examining|Investigating|Analyzing)/, replacement: null }
    ];
    
    for (const { pattern } of openingPatterns) {
      if (pattern.test(sentence)) {
        // Sentence already starts with variety element
        return sentence;
      }
    }
    
    // Add variety by prepending
    const varietyOpeners = [
      'Historically,',
      'According to the literature,',
      'Within the framework of this study,',
      'From a methodological perspective,',
      'As evidenced by the data,',
      'In the context of this investigation,'
    ];
    
    const opener = varietyOpeners[Math.floor(Math.random() * varietyOpeners.length)];
    
    return `${opener} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
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
   * Categorize sentence structures
   */
  private categorizeStructures(sentences: string[]): { type: string; count: number }[] {
    const categories: Record<string, number> = {};
    
    for (const sentence of sentences) {
      let type = 'simple';
      
      if (/\b(was|were|has been|have been|had been)\b/i.test(sentence)) {
        type = 'passive';
      }
      if (/,|;|:/.test(sentence)) {
        type = 'compound';
      }
      if (/\b(although|because|since|while|if|when|whereas|provided that)\b/i.test(sentence)) {
        type = 'complex';
      }
      if (/\b(although|because|since|while|if|when)\b.*,.*\b(and|but|or)\b/i.test(sentence)) {
        type = 'compound-complex';
      }
      
      categories[type] = (categories[type] || 0) + 1;
    }
    
    return Object.entries(categories).map(([type, count]) => ({ type, count }));
  }
  
  /**
   * Calculate variety score based on structure distribution
   */
  private calculateVarietyScore(structures: { type: string; count: number }[], total: number): number {
    if (total === 0) return 0;
    
    const uniqueTypes = structures.length;
    const distribution = structures.reduce((sum, s) => sum + Math.pow(s.count / total, 2), 0);
    
    // Lower distribution = higher variety
    const variety = (1 - distribution) * 100;
    
    return Math.round(variety);
  }
}

export const academicSentenceVariator = new AcademicSentenceVariator();

// Export as SentenceStructureVariator for backward compatibility
export const SentenceStructureVariator = AcademicSentenceVariator;
