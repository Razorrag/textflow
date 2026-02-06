/**
 * Advanced Academic Hedging Engine
 * 
 * Adds intentional hedging and academic qualifiers to mimic human scholarly caution.
 * This breaks the "too certain" AI pattern that Turnitin detects.
 */

export interface HedgingTransformation {
  type: 'certainty-qualifier' | 'scope-limiter' | 'evidence-hedge' | 'temporal-qualifier' | 'methodological-caution';
  original: string;
  transformed: string;
  hedgeCategory: string;
  academicImpact: number;
}

export interface AdvancedHedgingResult {
  text: string;
  transformations: HedgingTransformation[];
  hedgingDiversity: number;
  academicCredibility: number;
  certaintyReduction: number;
}

export class AdvancedHedgingEngine {
  private readonly hedgeCategories = {
    certaintyQualifiers: {
      patterns: [
        { original: /(\w+)\s+is\s+(\w+)/gi, hedges: [
          '$1 appears to be $2',
          '$1 seems to be $2', 
          '$1 may be $2',
          '$1 could be $2',
          '$1 is likely $2',
          '$1 is possibly $2',
          '$1 is arguably $2',
          '$1 is potentially $2'
        ]},
        { original: /(\w+)\s+(demonstrates|shows|proves|indicates)\s+(\w+)/gi, hedges: [
          '$1 suggests $3',
          '$1 implies $3',
          '$1 points to $3',
          '$1 provides evidence for $3',
          '$1 supports the conclusion that $3',
          '$1 lends credence to $3'
        ]}
      ]
    },
    
    scopeLimiters: {
      patterns: [
        { original: /(\w+)\s+(affects|impacts|influences)\s+(\w+)/gi, hedges: [
          '$1 primarily affects $3',
          '$1 mainly impacts $3',
          '$1 largely influences $3',
          '$1 to some extent affects $3',
          '$1 in many cases impacts $3',
          '$1 under certain conditions influences $3'
        ]},
        { original: /(\w+)\s+(improves|enhances|boosts)\s+(\w+)/gi, hedges: [
          '$1 tends to improve $3',
          '$1 generally enhances $3',
          '$1 typically boosts $3',
          '$1 often improves $3',
          '$1 frequently enhances $3'
        ]}
      ]
    },
    
    evidenceHedges: {
      patterns: [
        { original: /(\w+)\s+(shows|demonstrates|reveals)\s+(\w+)/gi, hedges: [
          'According to the evidence, $1 $2 $3',
          'Based on available data, $1 $2 $3',
          'The current evidence suggests that $1 $2 $3',
          'Preliminary findings indicate that $1 $2 $3',
          'Initial observations show that $1 $2 $3'
        ]},
        { original: /(\w+)\s+(is|are)\s+(\w+)/gi, hedges: [
          'Research indicates that $1 $2 $3',
          'Studies suggest that $1 $2 $3',
          'Analysis reveals that $1 $2 $3',
          'Investigation shows that $1 $2 $3',
          'Examination demonstrates that $1 $2 $3'
        ]}
      ]
    },
    
    temporalQualifiers: {
      patterns: [
        { original: /(\w+)\s+(will|shall)\s+(\w+)/gi, hedges: [
          '$1 is expected to $3',
          '$1 is projected to $3',
          '$1 is anticipated to $3',
          '$1 is likely to $3',
          '$1 may $3 in the future',
          '$1 could potentially $3'
        ]},
        { original: /(\w+)\s+(has|have)\s+(\w+ed)/gi, hedges: [
          '$1 has recently $3ed',
          '$1 has so far $3ed',
          '$1 to date has $3ed',
          '$1 up to this point has $3ed',
          '$1 in recent times has $3ed'
        ]}
      ]
    },
    
    methodologicalCautions: {
      patterns: [
        { original: /(\w+)\s+(is|are)\s+(\w+)/gi, hedges: [
          'Within the scope of this study, $1 $2 $3',
          'Given the current methodology, $1 $2 $3',
          'Based on the approach used, $1 $2 $3',
          'Considering the limitations, $1 $2 $3',
          'Under the experimental conditions, $1 $2 $3'
        ]},
        { original: /(\w+)\s+(results in|leads to)\s+(\w+)/gi, hedges: [
          '$1 typically results in $3',
          '$1 generally leads to $3',
          '$1 usually results in $3',
          '$1 commonly leads to $3',
          '$1 in most cases results in $3'
        ]}
      ]
    }
  };

  /**
   * Advanced academic hedging with strategic placement
   */
  applyAdvancedHedging(
    text: string, 
    intensity: number = 0.6,
    academicLevel: 'undergraduate' | 'graduate' | 'professional' = 'graduate'
  ): AdvancedHedgingResult {
    const transformations: HedgingTransformation[] = [];
    let processedText = text;

    // Step 1: Apply certainty qualifiers (most important for AI detection)
    const certaintyResult = this.applyCertaintyQualifiers(processedText, intensity * 0.4);
    processedText = certaintyResult.text;
    transformations.push(...certaintyResult.transformations);

    // Step 2: Apply scope limiters
    const scopeResult = this.applyScopeLimiters(processedText, intensity * 0.25);
    processedText = scopeResult.text;
    transformations.push(...scopeResult.transformations);

    // Step 3: Apply evidence hedges
    const evidenceResult = this.applyEvidenceHedges(processedText, intensity * 0.2);
    processedText = evidenceResult.text;
    transformations.push(...evidenceResult.transformations);

    // Step 4: Apply temporal qualifiers
    const temporalResult = this.applyTemporalQualifiers(processedText, intensity * 0.1);
    processedText = temporalResult.text;
    transformations.push(...temporalResult.transformations);

    // Step 5: Apply methodological cautions (for professional level)
    if (academicLevel === 'professional') {
      const methodResult = this.applyMethodologicalCautions(processedText, intensity * 0.05);
      processedText = methodResult.text;
      transformations.push(...methodResult.transformations);
    }

    // Step 6: Calculate metrics
    const hedgingDiversity = this.calculateHedgingDiversity(transformations);
    const academicCredibility = this.calculateAcademicCredibility(transformations, academicLevel);
    const certaintyReduction = this.calculateCertaintyReduction(text, processedText);

    return {
      text: processedText,
      transformations,
      hedgingDiversity,
      academicCredibility,
      certaintyReduction
    };
  }

  /**
   * Apply certainty qualifiers
   */
  private applyCertaintyQualifiers(text: string, intensity: number): { text: string; transformations: HedgingTransformation[] } {
    const transformations: HedgingTransformation[] = [];
    let processedText = text;

    for (const pattern of this.hedgeCategories.certaintyQualifiers.patterns) {
      const matches = text.match(pattern.original);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const hedge = pattern.hedges[Math.floor(Math.random() * pattern.hedges.length)];
            const transformed = match.replace(pattern.original, hedge);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'certainty-qualifier',
              original: match,
              transformed,
              hedgeCategory: 'certainty',
              academicImpact: this.calculateAcademicImpact(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply scope limiters
   */
  private applyScopeLimiters(text: string, intensity: number): { text: string; transformations: HedgingTransformation[] } {
    const transformations: HedgingTransformation[] = [];
    let processedText = text;

    for (const pattern of this.hedgeCategories.scopeLimiters.patterns) {
      const matches = text.match(pattern.original);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const hedge = pattern.hedges[Math.floor(Math.random() * pattern.hedges.length)];
            const transformed = match.replace(pattern.original, hedge);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'scope-limiter',
              original: match,
              transformed,
              hedgeCategory: 'scope',
              academicImpact: this.calculateAcademicImpact(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply evidence hedges
   */
  private applyEvidenceHedges(text: string, intensity: number): { text: string; transformations: HedgingTransformation[] } {
    const transformations: HedgingTransformation[] = [];
    let processedText = text;

    for (const pattern of this.hedgeCategories.evidenceHedges.patterns) {
      const matches = text.match(pattern.original);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const hedge = pattern.hedges[Math.floor(Math.random() * pattern.hedges.length)];
            const transformed = match.replace(pattern.original, hedge);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'evidence-hedge',
              original: match,
              transformed,
              hedgeCategory: 'evidence',
              academicImpact: this.calculateAcademicImpact(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply temporal qualifiers
   */
  private applyTemporalQualifiers(text: string, intensity: number): { text: string; transformations: HedgingTransformation[] } {
    const transformations: HedgingTransformation[] = [];
    let processedText = text;

    for (const pattern of this.hedgeCategories.temporalQualifiers.patterns) {
      const matches = text.match(pattern.original);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const hedge = pattern.hedges[Math.floor(Math.random() * pattern.hedges.length)];
            const transformed = match.replace(pattern.original, hedge);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'temporal-qualifier',
              original: match,
              transformed,
              hedgeCategory: 'temporal',
              academicImpact: this.calculateAcademicImpact(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Apply methodological cautions
   */
  private applyMethodologicalCautions(text: string, intensity: number): { text: string; transformations: HedgingTransformation[] } {
    const transformations: HedgingTransformation[] = [];
    let processedText = text;

    for (const pattern of this.hedgeCategories.methodologicalCautions.patterns) {
      const matches = text.match(pattern.original);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (Math.random() < intensity) {
            const hedge = pattern.hedges[Math.floor(Math.random() * pattern.hedges.length)];
            const transformed = match.replace(pattern.original, hedge);
            
            processedText = processedText.replace(match, transformed);
            
            transformations.push({
              type: 'methodological-caution',
              original: match,
              transformed,
              hedgeCategory: 'methodological',
              academicImpact: this.calculateAcademicImpact(transformed)
            });
          }
        }
      }
    }

    return { text: processedText, transformations };
  }

  /**
   * Calculate academic impact of a hedge
   */
  private calculateAcademicImpact(sentence: string): number {
    const academicIndicators = [
      'suggests', 'implies', 'indicates', 'appears', 'seems', 'may', 'could',
      'likely', 'possibly', 'arguably', 'potentially', 'tends to', 'generally',
      'typically', 'often', 'frequently', 'primarily', 'mainly', 'largely',
      'according to', 'based on', 'research indicates', 'studies suggest',
      'evidence shows', 'preliminary', 'initial', 'expected to', 'projected to',
      'anticipated to', 'within the scope', 'given the current', 'considering'
    ];

    const words = sentence.toLowerCase().split(/\s+/);
    const academicWords = words.filter(word => 
      academicIndicators.some(indicator => indicator.includes(word))
    );

    return Math.min(academicWords.length / words.length * 100, 100);
  }

  /**
   * Calculate hedging diversity
   */
  private calculateHedgingDiversity(transformations: HedgingTransformation[]): number {
    if (transformations.length === 0) return 0;
    
    const types = new Set(transformations.map(t => t.type));
    const categories = new Set(transformations.map(t => t.hedgeCategory));
    
    return ((types.size / 5) + (categories.size / 5)) * 100;
  }

  /**
   * Calculate academic credibility
   */
  private calculateAcademicCredibility(transformations: HedgingTransformation[], academicLevel: string): number {
    if (transformations.length === 0) return 0;
    
    const avgImpact = transformations.reduce((sum, t) => sum + t.academicImpact, 0) / transformations.length;
    const diversityScore = this.calculateHedgingDiversity(transformations);
    
    const levelMultiplier = {
      'undergraduate': 0.7,
      'graduate': 1.0,
      'professional': 1.3
    }[academicLevel];
    
    return (avgImpact * 0.6 + diversityScore * 0.4) * levelMultiplier;
  }

  /**
   * Calculate certainty reduction
   */
  private calculateCertaintyReduction(original: string, processed: string): number {
    const certaintyWords = ['is', 'are', 'will', 'shall', 'must', 'always', 'never', 'proves', 'demonstrates'];
    const hedgingWords = ['may', 'might', 'could', 'would', 'suggests', 'indicates', 'appears', 'seems'];
    
    const originalCertainty = original.toLowerCase().split(/\s+/).filter(word => 
      certaintyWords.includes(word)
    ).length;
    
    const processedHedging = processed.toLowerCase().split(/\s+/).filter(word => 
      hedgingWords.includes(word)
    ).length;
    
    const totalWords = original.split(/\s+/).length;
    return ((processedHedging - originalCertainty) / totalWords) * 100;
  }

  /**
   * Strategic hedge placement for maximum impact
   */
  placeStrategicHedges(sentence: string): string {
    // Place hedges at strategic positions to break AI patterns
    const hedgePositions = [
      { position: 'start', hedges: ['It appears that', 'It seems that', 'Evidence suggests that'] },
      { position: 'middle', hedges: ['may', 'might', 'could', 'typically', 'generally'] },
      { position: 'end', hedges: ['to some extent', 'in many cases', 'under certain conditions'] }
    ];

    const words = sentence.split(/\s+/);
    if (words.length < 5) return sentence;

    const position = hedgePositions[Math.floor(Math.random() * hedgePositions.length)];
    const hedge = position.hedges[Math.floor(Math.random() * position.hedges.length)];

    switch (position.position) {
      case 'start':
        return `${hedge} ${sentence}`;
      case 'middle':
        const middleIndex = Math.floor(words.length / 2);
        words.splice(middleIndex, 0, hedge);
        return words.join(' ');
      case 'end':
        return `${sentence} ${hedge}`;
      default:
        return sentence;
    }
  }
}

// Singleton instance
export const advancedHedgingEngine = new AdvancedHedgingEngine();
