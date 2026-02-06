/**
 * Professional Rhetorical Restructuring Engine
 * 
 * Implements deep rhetorical restructuring instead of simple word swapping.
 * Mimics Quillbot's sentence-level transformation approach.
 */

export interface RhetoricalTransformation {
  type: 'causal-restructure' | 'passive-active' | 'conditional-rephrase' | 'comparative-shift' | 'temporal-reorder';
  original: string;
  transformed: string;
  rhetoricalStrategy: string;
  complexity: number;
}

export interface RhetoricalRestructuringResult {
  text: string;
  transformations: RhetoricalTransformation[];
  rhetoricalDiversity: number;
  structuralComplexity: number;
  humanizationScore: number;
}

export class RhetoricalRestructuringEngine {
  private readonly rhetoricalPatterns = {
    // Professional rhetorical strategies
    causal: [
      {
        pattern: /(\w+)\s+(causes|leads to|results in|creates|produces)\s+(\w+)/gi,
        strategies: [
          'The relationship between $1 and $3 is defined by $2',
          '$3 emerges as a consequence of $1',
          'When $1 occurs, $3 follows',
          'The connection between $1 and $3 establishes $2'
        ]
      },
      {
        pattern: /(\w+)\s+(is caused by|results from|stems from)\s+(\w+)/gi,
        strategies: [
          '$1 can be attributed to $3',
          'The origins of $1 trace back to $3',
          '$3 serves as the foundation for $1',
          'Understanding $1 requires examining $3'
        ]
      }
    ],
    
    conditional: [
      {
        pattern: /if\s+(\w+)\s+(then\s+)?(\w+)/gi,
        strategies: [
          'In the event that $1, $3',
          'Should $1 occur, $3',
          'The condition of $1 necessitates $3',
          'When $1 is present, $3 follows'
        ]
      },
      {
        pattern: /(\w+)\s+(provided that|as long as)\s+(\w+)/gi,
        strategies: [
          '$1 operates under the condition that $3',
          'The effectiveness of $1 depends on $3',
          '$3 establishes the parameters for $1',
          'Within the context of $3, $1 functions'
        ]
      }
    ],
    
    comparative: [
      {
        pattern: /(\w+)\s+(is|are)\s+(more|less)\s+(\w+)\s+than\s+(\w+)/gi,
        strategies: [
          'When compared to $5, $1 demonstrates $2 $4 characteristics',
          'The comparison between $1 and $5 reveals $2 $4 qualities',
          '$1 exhibits $2 $4 properties in relation to $5',
          'In contrast to $5, $1 shows $2 $4 attributes'
        ]
      }
    ],
    
    temporal: [
      {
        pattern: /(\w+)\s+(before|after|during|while)\s+(\w+)/gi,
        strategies: [
          'The temporal sequence places $1 $2 $3',
          'In the timeframe $2 $3, $1 occurs',
          'The chronology establishes $1 $2 $3',
          'Time-based analysis shows $1 $2 $3'
        ]
      }
    ]
  };

  /**
   * Professional rhetorical restructuring
   * Goes beyond simple word swapping to deep structural changes
   */
  async restructureRhetorically(
    text: string, 
    intensity: number = 0.7,
    preserveMeaning: boolean = true
  ): Promise<RhetoricalRestructuringResult> {
    const transformations: RhetoricalTransformation[] = [];
    let processedText = text;

    // Step 1: Causal restructuring (most impactful)
    const causalResult = this.applyCausalRestructuring(processedText, intensity * 0.4);
    processedText = causalResult.text;
    transformations.push(...causalResult.transformations);

    // Step 2: Conditional rephrasing
    const conditionalResult = this.applyConditionalRestructuring(processedText, intensity * 0.3);
    processedText = conditionalResult.text;
    transformations.push(...conditionalResult.transformations);

    // Step 3: Comparative shifts
    const comparativeResult = this.applyComparativeRestructuring(processedText, intensity * 0.2);
    processedText = comparativeResult.text;
    transformations.push(...comparativeResult.transformations);

    // Step 4: Temporal reordering
    const temporalResult = this.applyTemporalRestructuring(processedText, intensity * 0.1);
    processedText = temporalResult.text;
    transformations.push(...temporalResult.transformations);

    // Step 5: Calculate metrics
    const rhetoricalDiversity = this.calculateRhetoricalDiversity(transformations);
    const structuralComplexity = this.calculateStructuralComplexity(processedText);
    const humanizationScore = this.calculateHumanizationScore(transformations, intensity);

    return {
      text: processedText,
      transformations,
      rhetoricalDiversity,
      structuralComplexity,
      humanizationScore
    };
  }

  /**
   * Apply causal restructuring patterns
   */
  private applyCausalRestructuring(text: string, intensity: number): { text: string; transformations: RhetoricalTransformation[] } {
    const transformations: RhetoricalTransformation[] = [];
    let processedText = text;

    for (const patternGroup of this.rhetoricalPatterns.causal) {
      const matches = text.match(patternGroup.pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const strategy = patternGroup.strategies[Math.floor(Math.random() * patternGroup.strategies.length)];
            const transformed = match.replace(patternGroup.pattern, strategy);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'causal-restructure',
              original: match,
              transformed,
              rhetoricalStrategy: 'causal-relation',
              complexity: this.calculateComplexity(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply conditional restructuring patterns
   */
  private applyConditionalRestructuring(text: string, intensity: number): { text: string; transformations: RhetoricalTransformation[] } {
    const transformations: RhetoricalTransformation[] = [];
    let processedText = text;

    for (const patternGroup of this.rhetoricalPatterns.conditional) {
      const matches = text.match(patternGroup.pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const strategy = patternGroup.strategies[Math.floor(Math.random() * patternGroup.strategies.length)];
            const transformed = match.replace(patternGroup.pattern, strategy);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'conditional-rephrase',
              original: match,
              transformed,
              rhetoricalStrategy: 'conditional-logic',
              complexity: this.calculateComplexity(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply comparative restructuring patterns
   */
  private applyComparativeRestructuring(text: string, intensity: number): { text: string; transformations: RhetoricalTransformation[] } {
    const transformations: RhetoricalTransformation[] = [];
    let processedText = text;

    for (const patternGroup of this.rhetoricalPatterns.comparative) {
      const matches = text.match(patternGroup.pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const strategy = patternGroup.strategies[Math.floor(Math.random() * patternGroup.strategies.length)];
            const transformed = match.replace(patternGroup.pattern, strategy);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'comparative-shift',
              original: match,
              transformed,
              rhetoricalStrategy: 'comparative-analysis',
              complexity: this.calculateComplexity(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply temporal restructuring patterns
   */
  private applyTemporalRestructuring(text: string, intensity: number): { text: string; transformations: RhetoricalTransformation[] } {
    const transformations: RhetoricalTransformation[] = [];
    let processedText = text;

    for (const patternGroup of this.rhetoricalPatterns.temporal) {
      const matches = text.match(patternGroup.pattern);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const strategy = patternGroup.strategies[Math.floor(Math.random() * patternGroup.strategies.length)];
            const transformed = match.replace(patternGroup.pattern, strategy);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'temporal-reorder',
              original: match,
              transformed,
              rhetoricalStrategy: 'temporal-sequence',
              complexity: this.calculateComplexity(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Calculate transformation complexity
   */
  private calculateComplexity(sentence: string): number {
    const words = sentence.split(/\s+/).length;
    const clauses = sentence.split(/[,;]/).length;
    const subordinations = (sentence.match(/\b(although|because|since|while|if|when|where|though|unless)\b/gi) || []).length;
    
    return (words * 0.3 + clauses * 0.4 + subordinations * 0.3) / 10;
  }

  /**
   * Calculate rhetorical diversity
   */
  private calculateRhetoricalDiversity(transformations: RhetoricalTransformation[]): number {
    if (transformations.length === 0) return 0;
    
    const types = new Set(transformations.map(t => t.type));
    const strategies = new Set(transformations.map(t => t.rhetoricalStrategy));
    
    return ((types.size / 4) + (strategies.size / 4)) * 100;
  }

  /**
   * Calculate structural complexity
   */
  private calculateStructuralComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/);
    const complexities = sentences.map(s => this.calculateComplexity(s));
    
    const avgComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const variance = complexities.reduce((sum, c) => sum + Math.pow(c - avgComplexity, 2), 0) / complexities.length;
    
    return (avgComplexity * 0.7 + Math.sqrt(variance) * 0.3) * 100;
  }

  /**
   * Calculate humanization score
   */
  private calculateHumanizationScore(transformations: RhetoricalTransformation[], intensity: number): number {
    if (transformations.length === 0) return 0;
    
    const avgComplexity = transformations.reduce((sum, t) => sum + t.complexity, 0) / transformations.length;
    const diversityScore = this.calculateRhetoricalDiversity(transformations);
    
    return (avgComplexity * 0.6 + diversityScore * 0.4) * intensity;
  }

  /**
   * Advanced rhetorical transformation for complex sentences
   */
  transformComplexStructure(sentence: string): string {
    const complexPatterns = [
      // Passive to active
      {
        from: /(\w+)\s+(is|are|was|were)\s+(\w+ed)\s+by\s+(\w+)/gi,
        to: '$4 $3 $1'
      },
      
      // Active to passive (for variety)
      {
        from: /(\w+)\s+(\w+ed)\s+(\w+)/gi,
        to: '$3 is $2ed by $1'
      },
      
      // Nominalization to verbal
      {
        from: /the\s+(\w+tion)\s+of\s+(\w+)/gi,
        to: '$2 $1s'
      },
      
      // Verbal to nominalization
      {
        from: /(\w+)\s+(\w+ed)\s+(\w+)/gi,
        to: 'the $2tion of $1 by $3'
      }
    ];

    let transformed = sentence;
    
    for (const pattern of complexPatterns) {
      if (Math.random() < 0.3) { // 30% chance to apply each pattern
        transformed = transformed.replace(pattern.from, pattern.to);
      }
    }
    
    return transformed;
  }
}

// Singleton instance
export const rhetoricalRestructuringEngine = new RhetoricalRestructuringEngine();
