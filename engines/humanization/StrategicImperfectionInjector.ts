/**
 * Strategic Imperfection Injector
 * 
 * Injects carefully controlled imperfections to break AI's "too perfect" patterns.
 * This mimics human writing quirks that professional tools like Grammarly
 * and Humanize Pro use to evade detection.
 */

export interface Imperfection {
  type: 'contraction' | 'casual-transition' | 'minor-grammar' | 'punctuation-quirk' | 'word-choice';
  original: string;
  transformed: string;
  subtlety: number; // 0-1, how subtle the imperfection is
  humanizationImpact: number;
}

export interface StrategicImperfectionResult {
  text: string;
  imperfections: Imperfection[];
  overallHumanization: number;
  aiPatternBreakdown: number;
  readabilityImpact: number;
}

export class StrategicImperfectionInjector {
  private readonly imperfectionStrategies = {
    // Professional-grade imperfection patterns
    subtle: {
      contractionRate: 0.1,    // 10% contractions
      casualTransitionRate: 0.05, // 5% casual transitions
      minorGrammarRate: 0.02,   // 2% minor grammar quirks
      punctuationQuirkRate: 0.03, // 3% punctuation quirks
      wordChoiceRate: 0.04      // 4% slightly less formal words
    },
    moderate: {
      contractionRate: 0.15,
      casualTransitionRate: 0.08,
      minorGrammarRate: 0.04,
      punctuationQuirkRate: 0.05,
      wordChoiceRate: 0.06
    },
    aggressive: {
      contractionRate: 0.20,
      casualTransitionRate: 0.12,
      minorGrammarRate: 0.06,
      punctuationQuirkRate: 0.08,
      wordChoiceRate: 0.10
    }
  };

  private readonly contractionPatterns = [
    { formal: 'do not', informal: "don't" },
    { formal: 'does not', informal: "doesn't" },
    { formal: 'did not', informal: "didn't" },
    { formal: 'will not', informal: "won't" },
    { formal: 'cannot', informal: "can't" },
    { formal: 'could not', informal: "couldn't" },
    { formal: 'would not', informal: "wouldn't" },
    { formal: 'should not', informal: "shouldn't" },
    { formal: 'might not', informal: "mightn't" },
    { formal: 'must not', informal: "mustn't" },
    { formal: 'have not', informal: "haven't" },
    { formal: 'has not', informal: "hasn't" },
    { formal: 'had not', informal: "hadn't" },
    { formal: 'are not', informal: "aren't" },
    { formal: 'is not', informal: "isn't" },
    { formal: 'was not', informal: "wasn't" },
    { formal: 'were not', informal: "weren't" }
  ];

  private readonly casualTransitions = [
    'So,',
    'Well,',
    'Now,',
    'Then,',
    'But then again,',
    'That said,',
    'Still,',
    'Even so,',
    'At any rate,',
    'In any case,'
  ];

  private readonly minorGrammarQuirks = [
    // Split infinitives (human-like)
    { pattern: /to\s+(\w+ly)\s+(\w+)/gi, replacement: 'to $1ly $2' },
    // Preposition at end (acceptable in academic contexts)
    { pattern: /(\w+)\s+(\w+)\s+which\s+(\w+)\s+(\w+)/gi, replacement: '$1 $2 $3 $4 $5, which $3 $5' },
    // Slightly awkward but human phrasing
    { pattern: /it\s+is\s+(\w+)\s+that/gi, replacement: 'it\'s $1 that' }
  ];

  private readonly punctuationQuirks = [
    // Occasional em dash for emphasis
    { pattern: /(\w+)\s+—\s+(\w+)/gi, replacement: '$1 — $2' },
    // Strategic semicolon usage
    { pattern: /(\w+)\s+\.\s+(\w+)/gi, replacement: '$1; $2' },
    // Occasional parenthetical asides
    { pattern: /(\w+)\s+(\w+)/gi, replacement: '$1 ($2)' }
  ];

  private readonly wordChoiceReplacements = [
    { formal: 'utilize', informal: 'use' },
    { formal: 'demonstrate', informal: 'show' },
    { formal: 'indicate', informal: 'suggest' },
    { formal: 'facilitate', informal: 'help' },
    { formal: 'optimize', informal: 'improve' },
    { formal: 'leverage', informal: 'use' },
    { formal: 'implement', informal: 'put in place' },
    { formal: 'establish', informal: 'set up' },
    { formal: 'subsequently', informal: 'then' },
    { formal: 'furthermore', informal: 'also' },
    { formal: 'nevertheless', informal: 'still' },
    { formal: 'consequently', informal: 'so' }
  ];

  /**
   * Strategic imperfection injection
   * Breaks AI's perfect patterns while maintaining academic credibility
   */
  injectStrategicImperfections(
    text: string,
    intensity: number = 0.6,
    strategy: keyof typeof this.imperfectionStrategies = 'moderate'
  ): StrategicImperfectionResult {
    const config = this.imperfectionStrategies[strategy];
    const imperfections: Imperfection[] = [];
    let processedText = text;

    // Step 1: Inject strategic contractions
    const contractionResult = this.injectContractions(processedText, config.contractionRate * intensity);
    processedText = contractionResult.text;
    imperfections.push(...contractionResult.imperfections);

    // Step 2: Add casual transitions
    const transitionResult = this.injectCasualTransitions(processedText, config.casualTransitionRate * intensity);
    processedText = transitionResult.text;
    imperfections.push(...transitionResult.imperfections);

    // Step 3: Add minor grammar quirks
    const grammarResult = this.injectGrammarQuirks(processedText, config.minorGrammarRate * intensity);
    processedText = grammarResult.text;
    imperfections.push(...grammarResult.imperfections);

    // Step 4: Add punctuation quirks
    const punctuationResult = this.injectPunctuationQuirks(processedText, config.punctuationQuirkRate * intensity);
    processedText = punctuationResult.text;
    imperfections.push(...punctuationResult.imperfections);

    // Step 5: Add word choice variations
    const wordChoiceResult = this.injectWordChoiceVariations(processedText, config.wordChoiceRate * intensity);
    processedText = wordChoiceResult.text;
    imperfections.push(...wordChoiceResult.imperfections);

    // Step 6: Calculate metrics
    const overallHumanization = this.calculateOverallHumanization(imperfections, intensity);
    const aiPatternBreakdown = this.calculateAIPatternBreakdown(text, processedText);
    const readabilityImpact = this.calculateReadabilityImpact(text, processedText);

    return {
      text: processedText,
      imperfections,
      overallHumanization,
      aiPatternBreakdown,
      readabilityImpact
    };
  }

  /**
   * Inject strategic contractions
   */
  private injectContractions(text: string, rate: number): { text: string; imperfections: Imperfection[] } {
    const imperfections: Imperfection[] = [];
    let processedText = text;

    for (const contraction of this.contractionPatterns) {
      if (Math.random() < rate) {
        const occurrences = (processedText.match(new RegExp(contraction.formal, 'gi')) || []).length;
        const toReplace = Math.ceil(occurrences * rate);

        let replaced = 0;
        processedText = processedText.replace(new RegExp(contraction.formal, 'gi'), (match) => {
          if (replaced >= toReplace) return match;
          replaced++;
          
          imperfections.push({
            type: 'contraction',
            original: match,
            transformed: contraction.informal,
            subtlety: 0.8,
            humanizationImpact: 0.6
          });
          
          return contraction.informal;
        });
      }
    }

    return { text: processedText, imperfections };
  }

  /**
   * Inject casual transitions
   */
  private injectCasualTransitions(text: string, rate: number): { text: string; imperfections: Imperfection[] } {
    const imperfections: Imperfection[] = [];
    let processedText = text;
    const sentences = text.split(/[.!?]+/);

    const transitionsToAdd = Math.ceil(sentences.length * rate);
    
    for (let i = 0; i < transitionsToAdd && i < sentences.length; i++) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      const sentence = sentences[randomIndex];
      const transition = this.casualTransitions[Math.floor(Math.random() * this.casualTransitions.length)];
      
      const transformed = `${transition} ${sentence}`;
      processedText = processedText.replace(sentence, transformed);
      
      imperfections.push({
        type: 'casual-transition',
        original: sentence,
        transformed,
        subtlety: 0.7,
        humanizationImpact: 0.8
      });
    }

    return { text: processedText, imperfections };
  }

  /**
   * Inject minor grammar quirks
   */
  private injectGrammarQuirks(text: string, rate: number): { text: string; imperfections: Imperfection[] } {
    const imperfections: Imperfection[] = [];
    let processedText = text;

    for (const quirk of this.minorGrammarQuirks) {
      if (Math.random() < rate) {
        const matches = text.match(quirk.pattern);
        if (matches && matches.length > 0) {
          const match = matches[Math.floor(Math.random() * matches.length)];
          const transformed = match.replace(quirk.pattern, quirk.replacement);
          
          processedText = processedText.replace(match, transformed);
          
          imperfections.push({
            type: 'minor-grammar',
            original: match,
            transformed,
            subtlety: 0.6,
            humanizationImpact: 0.7
          });
        }
      }
    }

    return { text: processedText, imperfections };
  }

  /**
   * Inject punctuation quirks
   */
  private injectPunctuationQuirks(text: string, rate: number): { text: string; imperfections: Imperfection[] } {
    const imperfections: Imperfection[] = [];
    let processedText = text;

    for (const quirk of this.punctuationQuirks) {
      if (Math.random() < rate) {
        const matches = text.match(quirk.pattern);
        if (matches && matches.length > 0) {
          const match = matches[Math.floor(Math.random() * matches.length)];
          const transformed = match.replace(quirk.pattern, quirk.replacement);
          
          processedText = processedText.replace(match, transformed);
          
          imperfections.push({
            type: 'punctuation-quirk',
            original: match,
            transformed,
            subtlety: 0.5,
            humanizationImpact: 0.6
          });
        }
      }
    }

    return { text: processedText, imperfections };
  }

  /**
   * Inject word choice variations
   */
  private injectWordChoiceVariations(text: string, rate: number): { text: string; imperfections: Imperfection[] } {
    const imperfections: Imperfection[] = [];
    let processedText = text;

    for (const replacement of this.wordChoiceReplacements) {
      if (Math.random() < rate) {
        const occurrences = (processedText.match(new RegExp(replacement.formal, 'gi')) || []).length;
        const toReplace = Math.ceil(occurrences * rate);

        let replaced = 0;
        processedText = processedText.replace(new RegExp(replacement.formal, 'gi'), (match) => {
          if (replaced >= toReplace) return match;
          replaced++;
          
          imperfections.push({
            type: 'word-choice',
            original: match,
            transformed: replacement.informal,
            subtlety: 0.7,
            humanizationImpact: 0.5
          });
          
          return replacement.informal;
        });
      }
    }

    return { text: processedText, imperfections };
  }

  /**
   * Calculate overall humanization score
   */
  private calculateOverallHumanization(imperfections: Imperfection[], intensity: number): number {
    if (imperfections.length === 0) return 0;
    
    const avgSubtlety = imperfections.reduce((sum, imp) => sum + imp.subtlety, 0) / imperfections.length;
    const avgImpact = imperfections.reduce((sum, imp) => sum + imp.humanizationImpact, 0) / imperfections.length;
    const diversityScore = this.calculateImperfectionDiversity(imperfections);
    
    return (avgSubtlety * 0.3 + avgImpact * 0.4 + diversityScore * 0.3) * intensity * 100;
  }

  /**
   * Calculate AI pattern breakdown
   */
  private calculateAIPatternBreakdown(original: string, processed: string): number {
    // AI patterns to break
    const aiPatterns = [
      /\b(it is important to note|it should be noted|it is worth mentioning)\b/gi,
      /\b(furthermore|moreover|additionally|in addition)\b/gi,
      /\b(the results show|the findings indicate|the data demonstrates)\b/gi,
      /\b(in conclusion|to summarize|in summary)\b/gi
    ];

    let originalScore = 0;
    let processedScore = 0;

    for (const pattern of aiPatterns) {
      const originalMatches = (original.match(pattern) || []).length;
      const processedMatches = (processed.match(pattern) || []).length;
      
      originalScore += originalMatches;
      processedScore += processedMatches;
    }

    const totalWords = original.split(/\s+/).length;
    const reduction = (originalScore - processedScore) / totalWords;
    
    return Math.max(0, reduction * 100);
  }

  /**
   * Calculate readability impact
   */
  private calculateReadabilityImpact(original: string, processed: string): number {
    const originalSentences = original.split(/[.!?]+/);
    const processedSentences = processed.split(/[.!?]+/);
    
    const originalAvgLength = originalSentences.reduce((sum, s) => sum + s.length, 0) / originalSentences.length;
    const processedAvgLength = processedSentences.reduce((sum, s) => sum + s.length, 0) / processedSentences.length;
    
    // Ideal human writing has varied sentence lengths
    const lengthVariation = Math.abs(processedAvgLength - originalAvgLength) / originalAvgLength;
    return Math.min(lengthVariation * 100, 50); // Cap at 50% impact
  }

  /**
   * Calculate imperfection diversity
   */
  private calculateImperfectionDiversity(imperfections: Imperfection[]): number {
    if (imperfections.length === 0) return 0;
    
    const types = new Set(imperfections.map(imp => imp.type));
    return (types.size / 5) * 100;
  }

  /**
   * Validate imperfection subtlety
   */
  private validateSubtlety(imperfection: Imperfection): boolean {
    // Ensure imperfections are subtle enough for academic context
    return imperfection.subtlety >= 0.4 && imperfection.humanizationImpact <= 0.8;
  }

  /**
   * Balance imperfection density
   */
  private balanceImperfectionDensity(text: string, imperfections: Imperfection[]): Imperfection[] {
    const wordCount = text.split(/\s+/).length;
    const idealDensity = 0.05; // 5% of words should have imperfections
    const targetCount = Math.floor(wordCount * idealDensity);
    
    if (imperfections.length > targetCount) {
      // Keep only the most subtle imperfections
      return imperfections
        .sort((a, b) => b.subtlety - a.subtlety)
        .slice(0, targetCount);
    }
    
    return imperfections;
  }
}

// Singleton instance
export const strategicImperfectionInjector = new StrategicImperfectionInjector();
