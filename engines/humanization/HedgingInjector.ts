/**
 * Academic Hedging Injector
 * 
 * Adds scholarly hedging expressions appropriate for academic writing.
 * Unlike casual hedging, academic hedging maintains formal tone while
 * acknowledging limitations and uncertainties in research claims.
 */

// Academic hedging phrases - formal and appropriate for scholarly writing
const ACADEMIC_HEDGING_PHRASES = [
  'it is arguable that',
  'there is evidence to suggest',
  'one could argue that',
  'it would appear that',
  'the data indicate that',
  'research findings point to',
  'it is possible that',
  'it may be the case that',
  'it seems reasonable to conclude',
  'these results imply that',
  'the literature suggests',
  'preliminary findings indicate',
  'there are reasons to believe',
  'it is likely that',
  'these observations suggest',
  'the analysis reveals that',
  'in the majority of cases',
  'to a considerable extent',
  'under certain conditions',
  'subject to certain limitations',
  'with some justification',
  'it is not unreasonable to suggest',
  'there is every reason to suppose',
  'the available evidence supports the view',
  'while this interpretation is tentative'
];

// Modal verbs and phrases for academic hedging
const ACADEMIC_HEDGING_MODALS = [
  { modal: 'may', force: 0.3, nuance: 'possibility' },
  { modal: 'might', force: 0.3, nuance: 'possibility' },
  { modal: 'could', force: 0.4, nuance: 'potential' },
  { modal: 'would', force: 0.5, nuance: 'conditional' },
  { modal: 'can', force: 0.6, nuance: 'ability or possibility' },
  { modal: 'appears to', force: 0.4, nuance: 'apparent' },
  { modal: 'seems to', force: 0.4, nuance: 'apparent' },
  { modal: 'tends to', force: 0.5, nuance: 'general tendency' },
  { modal: 'is likely to', force: 0.5, nuance: 'probability' },
  { modal: 'is thought to', force: 0.4, nuance: 'belief' },
  { modal: 'is believed to', force: 0.4, nuance: 'belief' },
  { modal: 'is generally accepted that', force: 0.6, nuance: 'consensus' }
];

// Verbs that benefit from hedging in academic writing
const HEDGEABLE_VERBS: { pattern: RegExp; replacements: { pattern: string; force: number }[] }[] = [
  {
    pattern: /\b(show|shows|showed|shown)\b/i,
    replacements: [
      { pattern: 'suggest suggests suggested suggested', force: 0.6 },
      { pattern: 'indicate indicates indicated indicated', force: 0.6 },
      { pattern: 'demonstrate demonstrates demonstrated demonstrated', force: 0.5 }
    ]
  },
  {
    pattern: /\b(prove|proves|proved|proven)\b/i,
    replacements: [
      { pattern: 'provide evidence for provide provides provided provided', force: 0.7 },
      { pattern: 'support supports supported supported', force: 0.6 },
      { pattern: 'lend support to lend lends lent lent', force: 0.7 }
    ]
  },
  {
    pattern: /\b(establish|establishes|established|established)\b/i,
    replacements: [
      { pattern: 'provide grounds for provide provides provided provided', force: 0.7 },
      { pattern: 'give reason to believe give gives gave given', force: 0.6 }
    ]
  },
  {
    pattern: /\b(determine|determines|determined|determined)\b/i,
    replacements: [
      { pattern: 'help to determine help helps helped helped', force: 0.5 },
      { pattern: 'contribute to determining contribute contributes contributed contributed', force: 0.5 }
    ]
  },
  {
    pattern: /\b(confirm|confirms|confirmed|confirmed)\b/i,
    replacements: [
      { pattern: 'provide confirmation of provide provides provided provided', force: 0.6 },
      { pattern: 'offer support for offer offers offered offered', force: 0.6 }
    ]
  }
];

// Assessment expressions for academic nuance
const ASSESSMENT_EXPRESSIONS = [
  'to a significant degree',
  'to a limited extent',
  'in a meaningful way',
  'with some degree of certainty',
  'within the limits of the available data',
  'subject to the constraints of the methodology',
  'as evidenced by',
  'on the basis of available evidence',
  'according to the findings',
  'in the view of the authors',
  'within the scope of this study',
  'given the parameters of the investigation'
];

export interface AcademicHedgingResult {
  text: string;
  injectedCount: number;
  changes: {
    type: 'phrase' | 'modal' | 'verb' | 'assessment';
    original: string;
    replacement: string;
    nuance: string;
  }[];
  hedgingScore: number;
}

export class AcademicHedgingInjector {
  /**
   * Inject academic hedging into text
   */
  inject(text: string, intensity: number = 0.4): AcademicHedgingResult {
    let result = text;
    let injectedCount = 0;
    const changes: AcademicHedgingResult['changes'] = [];
    
    // Strategy 1: Add hedging phrases to claim-making sentences
    const sentences = result.split(/(?<=[.!?])\s+/);
    const processedSentences = sentences.map((sentence, index) => {
      // Only hedge substantive sentences
      if (sentence.length < 40 || Math.random() > intensity) {
        return sentence;
      }
      
      // Check if sentence makes a claim that should be hedged
      if (this.isClaimSentence(sentence) && Math.random() < intensity * 0.6) {
        const hedgePhrase = ACADEMIC_HEDGING_PHRASES[
          Math.floor(Math.random() * ACADEMIC_HEDGING_PHRASES.length)
        ];
        
        const insertPoint = this.findHedgingInsertPoint(sentence);
        
        if (insertPoint > 0 && insertPoint < sentence.length / 2) {
          const before = sentence.substring(0, insertPoint);
          const after = sentence.substring(insertPoint);
          injectedCount++;
          changes.push({
            type: 'phrase',
            original: sentence.substring(insertPoint, insertPoint + 20),
            replacement: hedgePhrase,
            nuance: 'academic hedging'
          });
          return `${before} ${hedgePhrase} ${after.charAt(0).toLowerCase() + after.slice(1)}`;
        }
      }
      
      return sentence;
    });
    
    result = processedSentences.join(' ');
    
    // Strategy 2: Replace absolute verbs with hedged versions
    for (const { pattern, replacements } of HEDGEABLE_VERBS) {
      if (pattern.test(result)) {
        const matches = result.match(pattern);
        if (matches && Math.random() < intensity * 0.5) {
          const replacement = replacements[Math.floor(Math.random() * replacements.length)];
          
          result = result.replace(pattern, (match) => {
            injectedCount++;
            changes.push({
              type: 'verb',
              original: match,
              replacement: replacement.pattern.split(' ')[0],
              nuance: 'hedged verb'
            });
            return replacement.pattern.split(' ')[0];
          });
        }
      }
    }
    
    // Strategy 3: Add modal hedging to general statements
    const modalPatterns = /\b(is|are|was|were|has|have|had)\s+(\w+ed|shown|demonstrated|established|proven)\b/i;
    if (modalPatterns.test(result) && Math.random() < intensity * 0.4) {
      const modal = ACADEMIC_HEDGING_MODALS[Math.floor(Math.random() * ACADEMIC_HEDGING_MODALS.length)];
      result = result.replace(modalPatterns, `may ${modal.modal.split(' ')[0]} $2`);
      injectedCount++;
      changes.push({
        type: 'modal',
        original: modalPatterns.source,
        replacement: modal.modal,
        nuance: modal.nuance
      });
    }
    
    // Strategy 4: Add assessment expressions for nuanced claims
    if (Math.random() < intensity * 0.3) {
      const assessment = ASSESSMENT_EXPRESSIONS[
        Math.floor(Math.random() * ASSESSMENT_EXPRESSIONS.length)
      ];
      const sentences2 = result.split(/(?<=[.!?])\s+/);
      if (sentences2.length > 2) {
        const targetIndex = Math.floor(sentences2.length / 2);
        sentences2[targetIndex] = `${sentences2[targetIndex]}, ${assessment}`;
        injectedCount++;
        changes.push({
          type: 'assessment',
          original: '',
          replacement: assessment,
          nuance: 'nuanced assessment'
        });
        result = sentences2.join(' ');
      }
    }
    
    // Calculate hedging score
    const hedgingScore = Math.min(100, injectedCount * 12);
    
    return {
      text: result,
      injectedCount,
      changes,
      hedgingScore
    };
  }
  
  /**
   * Check if sentence makes a claim suitable for hedging
   */
  private isClaimSentence(sentence: string): boolean {
    const claimPatterns = [
      /\b(shows|demonstrates|proves|establishes|confirms|reveals|indicates|suggests)\b/i,
      /\b(the |this |these )+ (findings|data|results|evidence|analysis)\b/i,
      /\b(is|are|was|were)+ (significant|important|crucial|essential|fundamental)\b/i
    ];
    
    return claimPatterns.some(pattern => pattern.test(sentence));
  }
  
  /**
   * Find appropriate insertion point for hedging
   */
  private findHedgingInsertPoint(sentence: string): number {
    // Look for subject-verb boundary after first clause
    const subjectVerbPattern = /\b(\w+)\s+(is|are|was|were|has|have|had|shows|demonstrates|indicates|suggests)\b/i;
    const match = sentence.match(subjectVerbPattern);
    
    if (match && match.index! < sentence.length / 3) {
      return match.index! + match[0].length;
    }
    
    // Fall back to after first comma
    const commaIndex = sentence.indexOf(',');
    if (commaIndex > 15 && commaIndex < sentence.length / 3) {
      return commaIndex;
    }
    
    // Look for clause boundaries
    const clausePatterns = [
      /\b(which|that|who|whom|whose)\b/i,
      /\b(when|where|why|how)\b/i
    ];
    
    for (const pattern of clausePatterns) {
      const clauseMatch = sentence.match(pattern);
      if (clauseMatch && clauseMatch.index! < sentence.length / 3) {
        return clauseMatch.index!;
      }
    }
    
    return -1;
  }
}

export const academicHedgingInjector = new AcademicHedgingInjector();

// Export as HedgingInjector for backward compatibility
export const HedgingInjector = AcademicHedgingInjector;
