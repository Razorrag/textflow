/**
 * Academic Transition Manager
 * 
 * Manages transition words appropriate for academic writing.
 * Varies transitions with sophisticated academic alternatives to avoid
 * AI-typical repetitive transition patterns.
 */

// Primary academic transitions (formal and scholarly)
const ACADEMIC_TRANSITIONS: Record<string, { alternatives: string[]; category: string }> = {
  // Addition/Continuation
  'furthermore': {
    alternatives: ['Moreover', 'Additionally', 'Furthermore', 'In addition', 'Building upon this'],
    category: 'addition'
  },
  'moreover': {
    alternatives: ['Furthermore', 'Additionally', 'What is more', 'In similar fashion', 'Likewise'],
    category: 'addition'
  },
  'additionally': {
    alternatives: ['Furthermore', 'Moreover', 'In addition', 'Along these lines', 'Similarly'],
    category: 'addition'
  },
  'in addition': {
    alternatives: ['Additionally', 'Furthermore', 'Moreover', 'As a further point', 'Further to this'],
    category: 'addition'
  },
  
  // Contrast
  'however': {
    alternatives: ['Nevertheless', 'Nonetheless', 'In spite of this', 'Having said that', 'Yet'],
    category: 'contrast'
  },
  'nevertheless': {
    alternatives: ['Nonetheless', 'Even so', 'Despite this', 'Be that as it may', 'On the contrary'],
    category: 'contrast'
  },
  'on the other hand': {
    alternatives: ['Conversely', 'By contrast', 'Alternatively', 'From a different perspective', 'In juxtaposition'],
    category: 'contrast'
  },
  'conversely': {
    alternatives: ['By contrast', 'On the contrary', 'In opposition to this', 'Alternatively'],
    category: 'contrast'
  },

  // Cause and Effect
  'therefore': {
    alternatives: ['Consequently', 'As a result', 'Thus', 'Hence', 'For this reason'],
    category: 'cause-effect'
  },
  'thus': {
    alternatives: ['Therefore', 'Consequently', 'As a result', 'Hence', 'For this reason'],
    category: 'cause-effect'
  },
  'consequently': {
    alternatives: ['As a result', 'Therefore', 'Hence', 'For this reason', 'It follows that'],
    category: 'cause-effect'
  },
  'hence': {
    alternatives: ['Therefore', 'Thus', 'Consequently', 'For this reason', 'It follows'],
    category: 'cause-effect'
  },

  // Sequence/Ordering
  'first': {
    alternatives: ['Initially', 'To begin with', 'First and foremost', 'In the first instance', 'To commence'],
    category: 'sequence'
  },
  'second': {
    alternatives: ['Secondly', 'Next', 'Furthermore', 'Following this', 'In the second place'],
    category: 'sequence'
  },
  'third': {
    alternatives: ['Thirdly', 'Additionally', 'Moreover', 'Furthermore', 'In the third instance'],
    category: 'sequence'
  },
  'finally': {
    alternatives: ['Lastly', 'To conclude', 'In conclusion', 'Lastly', 'Ultimately'],
    category: 'sequence'
  },
  'in conclusion': {
    alternatives: ['To summarize', 'Ultimately', 'In the final analysis', 'To bring this to a close', 'As a final point'],
    category: 'sequence'
  },

  // Emphasis
  'importantly': {
    alternatives: ['Significantly', 'Notably', 'Of particular importance', 'It should be emphasized', 'Crucially'],
    category: 'emphasis'
  },
  'notably': {
    alternatives: ['Significantly', 'Particularly', 'Especially', 'Of note', 'Worth highlighting'],
    category: 'emphasis'
  },
  'significantly': {
    alternatives: ['Importantly', 'Notably', 'Crucially', 'Of significance', 'It is significant that'],
    category: 'emphasis'
  },

  // Comparison
  'similarly': {
    alternatives: ['Likewise', 'In like manner', 'Correspondingly', 'Analogously', 'In a similar vein'],
    category: 'comparison'
  },
  'likewise': {
    alternatives: ['Similarly', 'In like manner', 'Correspondingly', 'Analogously', 'In the same way'],
    category: 'comparison'
  },

  // Explanation
  'for example': {
    alternatives: ['For instance', 'To illustrate', 'As an example', 'This is exemplified by', 'Consider for example'],
    category: 'explanation'
  },
  'for instance': {
    alternatives: ['For example', 'To illustrate', 'As an illustration', 'This is demonstrated by', 'Consider'],
    category: 'explanation'
  }
};

// Common AI overused transition patterns to avoid
interface TransitionPattern {
  pattern: RegExp;
  severity: 'high' | 'medium' | 'low';
}

const AI_TRANSITION_PATTERNS: TransitionPattern[] = [
  { pattern: /\b(firstly|secondly|thirdly)\b/gi, severity: 'medium' },
  { pattern: /\bit is (important|worth|essential|crucial) to note\b/gi, severity: 'high' },
  { pattern: /\bit should be (noted|mentioned|emphasized)\b/gi, severity: 'medium' },
  { pattern: /\bneedless to say\b/gi, severity: 'medium' },
  { pattern: /\blast but not least\b/gi, severity: 'low' },
  { pattern: /\ball things considered\b/gi, severity: 'medium' },
  { pattern: /\bin a nutshell\b/gi, severity: 'low' },
  { pattern: /\bto sum up\b/gi, severity: 'low' },
  { pattern: /\bmoving forward\b/gi, severity: 'high' },
  { pattern: /\bgoing forward\b/gi, severity: 'high' }
];

// Academic alternatives for AI transition patterns
const ACADEMIC_PATTERN_REPLACEMENTS: Record<string, string> = {
  'firstly': 'Initially',
  'secondly': 'Subsequently',
  'thirdly': 'Finally',
  'it is important to note': 'Notably',
  'it is worth noting': 'It should be noted that',
  'it is essential to note': 'It is significant that',
  'needless to say': 'As is well established',
  'all things considered': 'Upon comprehensive examination',
  'in a nutshell': 'In essence',
  'to sum up': 'To summarize',
  'last but not least': 'Finally and of significance',
  'moving forward': 'Prospectively',
  'going forward': 'Henceforth'
};

export interface AcademicTransitionResult {
  text: string;
  transitionsUpdated: number;
  changes: {
    original: string;
    replacement: string;
    category: string;
  }[];
  transitionScore: number;
  diversityScore: number;
}

export class AcademicTransitionManager {
  private transitionCounts: Map<string, number>;
  
  constructor() {
    this.transitionCounts = new Map();
  }
  
  /**
   * Optimize transitions for academic writing
   */
  optimize(text: string, intensity: 'low' | 'medium' | 'high' = 'medium'): AcademicTransitionResult {
    let result = text;
    const changes: AcademicTransitionResult['changes'] = [];
    let transitionsUpdated = 0;
    
    // Reset transition counts
    this.transitionCounts = new Map();
    
    const threshold = intensity === 'low' ? 0.4 : intensity === 'medium' ? 0.6 : 0.8;
    
    // Process standard transitions with varied alternatives
    for (const [standard, { alternatives, category }] of Object.entries(ACADEMIC_TRANSITIONS)) {
      const pattern = new RegExp(`\\b${standard}\\b`, 'gi');
      
      if (pattern.test(result)) {
        const matches = result.match(pattern);
        if (matches && matches.length > 0) {
          const applyCount = Math.ceil(matches.length * threshold);
          
          // Check current usage of this transition
          const currentCount = this.transitionCounts.get(standard.toLowerCase()) || 0;
          
          if (currentCount >= 2 || Math.random() < threshold) {
            let applied = 0;
            result = result.replace(pattern, (match) => {
              if (applied >= applyCount) return match;
              
              // Select alternative not recently used
              const alternative = this.selectBestAlternative(alternatives, standard);
              
              changes.push({
                original: match,
                replacement: alternative,
                category
              });
              
              transitionsUpdated++;
              this.transitionCounts.set(standard.toLowerCase(), currentCount + applied + 1);
              applied++;
              
              return alternative;
            });
          }
        }
      }
    }
    
    // Replace AI-specific patterns with academic alternatives
    for (const { pattern, severity } of AI_TRANSITION_PATTERNS) {
      if (pattern.test(result)) {
        const applyChance = severity === 'high' ? threshold : threshold * 0.7;
        
        if (Math.random() < applyChance) {
          result = result.replace(pattern, (match) => {
            const lowerMatch = match.toLowerCase();
            const replacement = ACADEMIC_PATTERN_REPLACEMENTS[lowerMatch] || match;
            
            if (replacement !== match) {
              changes.push({
                original: match,
                replacement,
                category: 'ai-pattern-replacement'
              });
              transitionsUpdated++;
            }
            
            return replacement;
          });
        }
      }
    }
    
    // Calculate scores
    const transitionScore = Math.min(100, transitionsUpdated * 10);
    const uniqueTransitions = new Set(changes.map(c => c.replacement.toLowerCase())).size;
    const diversityScore = Math.min(100, (uniqueTransitions / Math.max(1, changes.length)) * 100);
    
    return {
      text: result,
      transitionsUpdated,
      changes,
      transitionScore,
      diversityScore
    };
  }
  
  /**
   * Select best alternative avoiding repetition
   */
  private selectBestAlternative(alternatives: string[], original: string): string {
    // Sort by least recently used
    const sorted = alternatives.sort((a, b) => {
      const countA = this.transitionCounts.get(a.toLowerCase()) || 0;
      const countB = this.transitionCounts.get(b.toLowerCase()) || 0;
      return countA - countB;
    });
    
    return sorted[0];
  }
}

export const academicTransitionManager = new AcademicTransitionManager();

// Export as TransitionReducer for backward compatibility
export const TransitionReducer = AcademicTransitionManager;
