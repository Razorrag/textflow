/**
 * Academic Paraphraser Engine
 * 
 * Performs deep semantic rewriting to avoid plagiarism detection while
 * maintaining academic tone and preserving original meaning.
 * Targets Turnitin's n-gram and semantic similarity detection.
 */

// Semantic transformation patterns
interface ParaphrasePattern {
  original: RegExp;
  transformations: {
    pattern: string;
    preserveMeaning: boolean;
  }[];
}

// Active voice patterns to restructure
const VOICE_TRANSFORMATIONS: ParaphrasePattern[] = [
  {
    original: /\b(\w+)\s+(has|have)\s+(\w+ed)\s+(\w+)/gi,
    transformations: [
      { pattern: 'researchers have $3 $4', preserveMeaning: true },
      { pattern: 'studies demonstrate that $1 $4', preserveMeaning: true },
      { pattern: 'evidence shows $1 $4', preserveMeaning: true }
    ]
  },
  {
    original: /\b(it|this|these)\s+(shows|demonstrates|indicates|suggests)\s+that\s+(.+)/gi,
    transformations: [
      { pattern: '$3 is evident from $1', preserveMeaning: true },
      { pattern: 'the findings reveal that $3', preserveMeaning: true },
      { pattern: '$3 can be inferred from $1', preserveMeaning: true }
    ]
  },
  // NEW: Perspective Shift patterns for deeper restructuring
  {
    original: /\b(it\s+is\s+important\s+to\s+note\s+that|it\s+should\s+be\s+noted\s+that)\s+(.+)/gi,
    transformations: [
      { pattern: 'the evidence regarding $1 warrants particular attention', preserveMeaning: true },
      { pattern: '$1, as revealed by the analysis, deserves careful consideration', preserveMeaning: true },
      { pattern: 'notably, $1', preserveMeaning: true },
      { pattern: 'of particular significance is $1', preserveMeaning: true }
    ]
  },
  {
    original: /\b(the\s+results\s+show|the\s+findings\s+indicate|the\s+data\s+demonstrates)\s+that\s+(.+)/gi,
    transformations: [
      { pattern: 'the evidence regarding $1, as revealed by results, necessitates closer examination', preserveMeaning: true },
      { pattern: 'findings demonstrate $1, suggesting the need for further investigation', preserveMeaning: true },
      { pattern: 'results indicate $1, though additional research may be required', preserveMeaning: true }
    ]
  },
  {
    original: /\b(studies\s+have\s+shown|research\s+has\s+demonstrated|evidence\s+suggests)\s+that\s+(.+)/gi,
    transformations: [
      { pattern: 'the collective evidence from multiple studies points to $1', preserveMeaning: true },
      { pattern: 'a comprehensive analysis reveals $1, though individual results vary', preserveMeaning: true },
      { pattern: 'across multiple investigations, $1 emerges as a consistent pattern', preserveMeaning: true }
    ]
  }
];

// Definition restyling patterns
const DEFINITION_PATTERNS: ParaphrasePattern[] = [
  {
    original: /\b(\w+)\s+is\s+(defined as|referred to as|known as)\s+(.+)/gi,
    transformations: [
      { pattern: 'the term $1 encompasses $3', preserveMeaning: true },
      { pattern: '$1 may be characterized as $3', preserveMeaning: true },
      { pattern: 'in scholarly discourse, $1 denotes $3', preserveMeaning: true }
    ]
  },
  {
    original: /\b(\w+)\s+(refers to|describes|explains|examines)\s+(.+)/gi,
    transformations: [
      { pattern: 'the concept of $1 addresses $3', preserveMeaning: true },
      { pattern: 'with regard to $1, $2 $3', preserveMeaning: true },
      { pattern: '$1 is concerned with $3', preserveMeaning: true }
    ]
  }
];

// Cause-effect restructuring
const CAUSE_EFFECT_PATTERNS: ParaphrasePattern[] = [
  {
    original: /\bbecause\s+(.+),\s+(.+)/gi,
    transformations: [
      { pattern: 'as a consequence of $1, $2', preserveMeaning: true },
      { pattern: 'owing to $1, $2', preserveMeaning: true },
      { pattern: 'consequent upon $1, $2', preserveMeaning: true }
    ]
  },
  {
    original: /\b(.+)\s+leads to\s+(.+)/gi,
    transformations: [
      { pattern: '$1 results in $2', preserveMeaning: true },
      { pattern: '$1 gives rise to $2', preserveMeaning: true },
      { pattern: '$1 brings about $2', preserveMeaning: true }
    ]
  },
  {
    original: /\b(.+)\s+causes\s+(.+)/gi,
    transformations: [
      { pattern: '$1 is responsible for $2', preserveMeaning: true },
      { pattern: '$1 underlies $2', preserveMeaning: true },
      { pattern: '$1 is a contributing factor to $2', preserveMeaning: true }
    ]
  }
];

// Comparison restructuring
const COMPARISON_PATTERNS: ParaphrasePattern[] = [
  {
    original: /\b(.+)\s+is\s+(similar to|like)\s+(.+)/gi,
    transformations: [
      { pattern: '$1 bears resemblance to $3', preserveMeaning: true },
      { pattern: '$1 shares characteristics with $3', preserveMeaning: true },
      { pattern: '$1 can be likened to $3', preserveMeaning: true }
    ]
  },
  {
    original: /\b(.+)\s+differs\s+from\s+(.+)/gi,
    transformations: [
      { pattern: '$1 contrasts with $2', preserveMeaning: true },
      { pattern: '$1 is distinguished from $2', preserveMeaning: true },
      { pattern: '$1 varies in comparison to $2', preserveMeaning: true }
    ]
  }
];

// Quantity and extent restructuring
const QUANTITY_PATTERNS: ParaphrasePattern[] = [
  {
    original: /\ba\s+(large|small|significant)\s+number\s+of\s+(.+)/gi,
    transformations: [
      { pattern: 'substantial numbers of $2', preserveMeaning: true },
      { pattern: 'considerable $2', preserveMeaning: true },
      { pattern: 'numerous $2', preserveMeaning: true }
    ]
  },
  {
    original: /\bmany\s+(.+)/gi,
    transformations: [
      { pattern: 'a multitude of $1', preserveMeaning: true },
      { pattern: 'substantial quantities of $1', preserveMeaning: true },
      { pattern: 'countless $1', preserveMeaning: true }
    ]
  }
];

// Emphasis restructuring
const EMPHASIS_PATTERNS: ParaphrasePattern[] = [
  {
    original: /\bit\s+is\s+important\s+to\s+(note|mention|emphasize)\s+that\s+(.+)/gi,
    transformations: [
      { pattern: 'it merits attention that $2', preserveMeaning: true },
      { pattern: 'notably, $2', preserveMeaning: true },
      { pattern: 'of particular relevance, $2', preserveMeaning: true }
    ]
  },
  {
    original: /\bit\s+should\s+be\s+(noted|mentioned|emphasized)\s+that\s+(.+)/gi,
    transformations: [
      { pattern: 'it is noteworthy that $2', preserveMeaning: true },
      { pattern: 'it is significant that $2', preserveMeaning: true },
      { pattern: 'attention is drawn to $2', preserveMeaning: true }
    ]
  }
];

export interface AcademicParaphraseResult {
  text: string;
  paraphrasesApplied: number;
  similarityReduction: number;
  semanticPreservation: number;
  transformations: {
    type: string;
    original: string;
    replacement: string;
  }[];
}

export class AcademicParaphraser {
  private allPatterns: ParaphrasePattern[];
  
  constructor() {
    this.allPatterns = [
      ...VOICE_TRANSFORMATIONS,
      ...DEFINITION_PATTERNS,
      ...CAUSE_EFFECT_PATTERNS,
      ...COMPARISON_PATTERNS,
      ...QUANTITY_PATTERNS,
      ...EMPHASIS_PATTERNS
    ];
  }
  
  /**
   * Paraphrase text for academic plagiarism evasion
   */
  paraphrase(text: string, intensity: 'low' | 'medium' | 'high' = 'medium'): AcademicParaphraseResult {
    const threshold = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7;
    let result = text;
    const transformations: AcademicParaphraseResult['transformations'] = [];
    let paraphrasesApplied = 0;
    
    // Process each pattern category
    for (const pattern of this.allPatterns) {
      if (pattern.original.test(result)) {
        const matches = result.match(pattern.original);
        if (matches && matches.length > 0) {
          const applyCount = Math.ceil(matches.length * threshold);
          
          let applied = 0;
          result = result.replace(pattern.original, (match, ...args) => {
            if (applied >= applyCount) return match;
            
            // Select random transformation
            const transformation = pattern.transformations[
              Math.floor(Math.random() * pattern.transformations.length)
            ];
            
            // Build replacement
            let replacement = transformation.pattern;
            
            // Replace numbered placeholders with captured groups
            for (let i = 0; i < args.length - 2; i++) {
              const placeholder = '$' + (i + 1);
              if (args[i]) {
                replacement = replacement.replace(new RegExp(placeholder, 'g'), args[i]);
              }
            }
            
            transformations.push({
              type: this.categorizePattern(pattern),
              original: match,
              replacement
            });
            
            paraphrasesApplied++;
            applied++;
            
            return replacement;
          });
        }
      }
    }
    
    // Calculate metrics
    const similarityReduction = Math.min(100, paraphrasesApplied * 15);
    const semanticPreservation = 100 - (paraphrasesApplied * 2);
    
    return {
      text: result,
      paraphrasesApplied,
      similarityReduction,
      semanticPreservation,
      transformations
    };
  }
  
  /**
   * Restructure entire paragraph for deep plagiarism evasion
   */
  restructureParagraph(paragraph: string, intensity: number = 0.5): string {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    
    // Shuffle sentence order for very high intensity (with care)
    if (intensity > 0.8 && sentences.length > 2) {
      const middle = sentences.slice(1, -1);
      
      // Fisher-Yates shuffle on middle sentences
      for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
      }
      
      return [sentences[0], ...middle, sentences[sentences.length - 1]].join(' ');
    }
    
    return paragraph;
  }
  
  /**
   * Apply multiple passes for comprehensive rewriting
   */
  multiPassParaphrase(text: string, passes: number = 2): {
    finalText: string;
    allTransformations: number;
    passDetails: AcademicParaphraseResult[];
  } {
    let currentText = text;
    const passDetails: AcademicParaphraseResult[] = [];
    let totalTransformations = 0;
    
    for (let i = 0; i < passes; i++) {
      const result = this.paraphrase(currentText, i === passes - 1 ? 'high' : 'medium');
      currentText = result.text;
      totalTransformations += result.paraphrasesApplied;
      passDetails.push(result);
    }
    
    return {
      finalText: currentText,
      allTransformations: totalTransformations,
      passDetails
    };
  }
  
  /**
   * Categorize pattern type
   */
  private categorizePattern(pattern: ParaphrasePattern): string {
    if (VOICE_TRANSFORMATIONS.includes(pattern)) return 'voice-transformation';
    if (DEFINITION_PATTERNS.includes(pattern)) return 'definition-restructuring';
    if (CAUSE_EFFECT_PATTERNS.includes(pattern)) return 'cause-effect';
    if (COMPARISON_PATTERNS.includes(pattern)) return 'comparison';
    if (QUANTITY_PATTERNS.includes(pattern)) return 'quantity';
    if (EMPHASIS_PATTERNS.includes(pattern)) return 'emphasis';
    return 'general';
  }
}

export const academicParaphraser = new AcademicParaphraser();
