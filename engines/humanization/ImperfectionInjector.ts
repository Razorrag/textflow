/**
 * Academic Text Refiner
 * 
 * Adds scholarly elements appropriate for academic writing instead of casual imperfections.
 * Focuses on citation patterns, research qualifiers, and academic discourse markers.
 * Removes colloquialisms and conversational elements that trigger AI detection.
 */

// Colloquialisms to REMOVE from AI text
const COLLOQUIAL_TO_REMOVE: { pattern: RegExp; replacement: string; severity: 'high' | 'medium' | 'low' }[] = [
  { pattern: /\b(kind of|kinda)\b/gi, replacement: 'somewhat', severity: 'medium' },
  { pattern: /\b(sort of|sorta)\b/gi, replacement: 'rather', severity: 'medium' },
  { pattern: /\b(pretty much)\b/gi, replacement: 'substantially', severity: 'low' },
  { pattern: /\b(basically)\b/gi, replacement: 'fundamentally', severity: 'medium' },
  { pattern: /\b(actually)\b/gi, replacement: 'in fact', severity: 'low' },
  { pattern: /\b(literally)\b/gi, replacement: '', severity: 'medium' },
  { pattern: /\b(you know)\b/gi, replacement: '', severity: 'high' },
  { pattern: /\b(I mean)\b/gi, replacement: '', severity: 'medium' },
  { pattern: /\b(like)\b/gi, replacement: '', severity: 'low' },
  { pattern: /\b(stuff)\b/gi, replacement: 'aspects', severity: 'medium' },
  { pattern: /\b(things)\b/gi, replacement: 'elements', severity: 'low' },
  { pattern: /\b(a bunch of)\b/gi, replacement: 'numerous', severity: 'medium' },
  { pattern: /\b(tons of)\b/gi, replacement: 'substantial', severity: 'medium' },
  { pattern: /\b(loads of)\b/gi, replacement: 'considerable', severity: 'medium' },
  { pattern: /\b(a lot)\b/gi, replacement: 'significantly', severity: 'low' },
  { pattern: /\b(gonna)\b/gi, replacement: 'going to', severity: 'medium' },
  { pattern: /\b(wanna)\b/gi, replacement: 'want to', severity: 'medium' },
  { pattern: /\b(gotta)\b/gi, replacement: 'must', severity: 'medium' },
  { pattern: /\b(kinda)\b/gi, replacement: 'somewhat', severity: 'medium' },
  { pattern: /\b(dunno)\b/gi, replacement: 'unknown', severity: 'high' },
  { pattern: /\b(yeah)\b/gi, replacement: 'yes', severity: 'medium' },
  { pattern: /\b(nope)\b/gi, replacement: 'no', severity: 'medium' },
  { pattern: /\b(hey)\b/gi, replacement: '', severity: 'high' },
  { pattern: /\b(look)\b/gi, replacement: 'consider', severity: 'medium' },
  { pattern: /\b(honestly)\b/gi, replacement: 'in truth', severity: 'low' },
  { pattern: /\b(really)\b/gi, replacement: 'indeed', severity: 'low' },
  { pattern: /\b(very much)\b/gi, replacement: 'considerably', severity: 'low' }
];

// Conversational openers to remove
const CONVERSATIONAL_OPENERS_TO_REMOVE: RegExp[] = [
  /\b(Well,)\b/,
  /\b(So,)\b/,
  /\b(Now,)\b/,
  /\b(Right,)\b/,
  /\b(Okay,)\b/,
  /\b(Alright,)\b/,
  /\b(Truth is,)\b/,
  /\b(Look,)\b/,
  /\b(Basically,)\b/,
  /\b(The thing is,)\b/,
  /\b(Here is the thing,)\b/,
  /\b(Honestly,)\b/,
  /\b(To be fair,)\b/,
  /\b(In reality,)\b/,
  /\b(As it happens,)\b/
];

// Academic discourse markers to ADD (appropriate scholarly features)
const ACADEMIC_DISCOURSE_MARKERS = [
  { marker: 'as previously discussed', function: 'continuity' },
  { marker: 'as noted above', function: 'continuity' },
  { marker: 'as illustrated in figure', function: 'reference' },
  { marker: 'as demonstrated previously', function: 'continuity' },
  { marker: 'as the data reveal', function: 'evidence' },
  { marker: 'as the literature suggests', function: 'authority' },
  { marker: 'on the basis of these findings', function: 'reasoning' },
  { marker: 'in light of the evidence', function: 'reasoning' },
  { marker: 'given the limitations of this study', function: 'limitation' },
  { marker: 'it should be acknowledged that', function: 'acknowledgment' },
  { marker: 'it is noteworthy that', function: 'emphasis' },
  { marker: 'it is perhaps surprising that', function: 'emphasis' },
  { marker: 'as one would expect', function: 'expectation' },
  { marker: 'counterintuitively', function: 'contrast' },
  { marker: 'paradoxically', function: 'contrast' },
  { marker: 'uniquely', function: 'emphasis' },
  { marker: 'in particular', function: 'emphasis' },
  { marker: 'specifically', function: 'emphasis' },
  { marker: 'most notably', function: 'emphasis' },
  { marker: 'of particular significance', function: 'emphasis' }
];

// Research qualifiers for academic rigor
const RESEARCH_QUALIFIERS = [
  'preliminary findings suggest',
  'preliminary evidence indicates',
  'while these results are promising',
  'further research is warranted',
  'additional studies are needed',
  'with the caveat that',
  'subject to certain limitations',
  'within the constraints of the methodology',
  'pending further investigation',
  'provided that',
  'assuming that',
  'based on the assumption that',
  'conditional upon'
];

// Citation-style attributions
const CITATION_ATTRIBUTIONS = [
  'as argued by',
  'according to',
  'as proposed by',
  'as suggested by',
  'as maintained by',
  'as contended by',
  'as noted by',
  'as observed by',
  'as demonstrated by',
  'as reported by',
  'as discovered by',
  'as established by'
];

export interface AcademicRefinementResult {
  text: string;
  colloquialismsRemoved: number;
  academicFeaturesAdded: number;
  changes: {
    type: 'remove' | 'add';
    original?: string;
    replacement?: string;
    function: string;
  }[];
  refinementScore: number;
  formalityScore: number;
}

export class AcademicTextRefiner {
  /**
   * Refine text for academic writing
   */
  refine(text: string, intensity: number = 0.4): AcademicRefinementResult {
    let result = text;
    let colloquialismsRemoved = 0;
    let academicFeaturesAdded = 0;
    const changes: AcademicRefinementResult['changes'] = [];
    
    // Strategy 1: Remove colloquialisms
    for (const { pattern, replacement, severity } of COLLOQUIAL_TO_REMOVE) {
      const applyChance = severity === 'high' ? intensity : intensity * 0.7;
      
      if (pattern.test(result) && Math.random() < applyChance) {
        const matches = result.match(pattern);
        if (matches) {
          result = result.replace(pattern, replacement);
          colloquialismsRemoved += matches.length;
          
          for (const match of matches) {
            changes.push({
              type: 'remove',
              original: match,
              replacement,
              function: 'remove colloquialism'
            });
          }
        }
      }
    }
    
    // Strategy 2: Remove conversational openers
    for (const pattern of CONVERSATIONAL_OPENERS_TO_REMOVE) {
      if (pattern.test(result) && Math.random() < intensity * 0.6) {
        const matches = result.match(pattern);
        if (matches) {
          result = result.replace(pattern, '');
          colloquialismsRemoved += matches.length;
          
          for (const match of matches) {
            changes.push({
              type: 'remove',
              original: match,
              function: 'remove conversational opener'
            });
          }
        }
      }
    }
    
    // Strategy 3: Add academic discourse markers
    const paragraphs = result.split(/\n\n+/);
    const processedParagraphs = paragraphs.map((paragraph, index) => {
      if (paragraph.length < 50 || Math.random() > intensity) {
        return paragraph;
      }
      
      // Add discourse marker to beginning or transition
      const markerObj = ACADEMIC_DISCOURSE_MARKERS[
        Math.floor(Math.random() * ACADEMIC_DISCOURSE_MARKERS.length)
      ];
      const marker = markerObj.marker;
      
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      if (sentences.length >= 2) {
        // Add after first sentence for continuity
        sentences[1] = `${marker}, ${sentences[1].charAt(0).toLowerCase() + sentences[1].slice(1)}`;
        academicFeaturesAdded++;
        changes.push({
          type: 'add',
          replacement: marker,
          function: markerObj.function
        });
        return sentences.join(' ');
      }
      
      return paragraph;
    });
    
    result = processedParagraphs.join('\n\n');
    
    // Strategy 4: Add research qualifiers to claims
    if (Math.random() < intensity * 0.4) {
      const qualifier = RESEARCH_QUALIFIERS[
        Math.floor(Math.random() * RESEARCH_QUALIFIERS.length)
      ];
      const sentences = result.split(/(?<=[.!?])\s+/);
      
      // Add to second half of text
      const targetIndex = Math.floor(sentences.length * 0.5);
      if (targetIndex < sentences.length) {
        sentences[targetIndex] = `${qualifier}, ${sentences[targetIndex].toLowerCase()}`;
        academicFeaturesAdded++;
        changes.push({
          type: 'add',
          replacement: qualifier,
          function: 'research qualifier'
        });
        result = sentences.join(' ');
      }
    }
    
    // Strategy 5: Expand contractions to formal versions (academic writing uses full forms)
    const contractionsToExpand: Record<string, string> = {
      "don't": 'do not',
      "doesn't": 'does not',
      "didn't": 'did not',
      "won't": 'will not',
      "wouldn't": 'would not',
      "couldn't": 'could not',
      "shouldn't": 'should not',
      "can't": 'cannot',
      "cannot": 'cannot',
      "it's": 'it is',
      "that's": 'that is',
      "there's": 'there is',
      "he's": 'he is',
      "she's": 'she is',
      "I'm": 'I am',
      "we're": 'we are',
      "they're": 'they are',
      "you're": 'you are',
      "isn't": 'is not',
      "aren't": 'are not',
      "wasn't": 'was not',
      "weren't": 'were not',
      "hasn't": 'has not',
      "haven't": 'have not',
      "hadn't": 'had not'
    };
    
    for (const [contraction, full] of Object.entries(contractionsToExpand)) {
      const pattern = new RegExp(`\\b${contraction}\\b`, 'gi');
      if (pattern.test(result) && Math.random() < intensity * 0.3) {
        const matches = result.match(pattern);
        if (matches) {
          result = result.replace(pattern, full);
          changes.push({
            type: 'remove',
            original: contraction,
            replacement: full,
            function: 'expand contraction'
          });
        }
      }
    }
    
    // Clean up
    result = result.replace(/\s+/g, ' ').trim();
    
    // Calculate scores
    const refinementScore = Math.min(100, colloquialismsRemoved * 10 + academicFeaturesAdded * 8);
    const formalityScore = Math.min(100, 70 + colloquialismsRemoved * 3 + academicFeaturesAdded * 4);
    
    return {
      text: result,
      colloquialismsRemoved,
      academicFeaturesAdded,
      changes,
      refinementScore,
      formalityScore
    };
  }
  
  /**
   * Remove all contractions for formal academic writing
   */
  expandAllContractions(text: string): string {
    const contractionsToExpand: Record<string, string> = {
      "don't": 'do not',
      "doesn't": 'does not',
      "didn't": 'did not',
      "won't": 'will not',
      "wouldn't": 'would not',
      "couldn't": 'could not',
      "shouldn't": 'should not',
      "can't": 'cannot',
      "it's": 'it is',
      "that's": 'that is',
      "there's": 'there is',
      "he's": 'he is',
      "she's": 'she is',
      "I'm": 'I am',
      "we're": 'we are',
      "they're": 'they are',
      "you're": 'you are',
      "isn't": 'is not',
      "aren't": 'are not',
      "wasn't": 'was not',
      "weren't": 'were not',
      "hasn't": 'has not',
      "haven't": 'have not',
      "hadn't": 'had not',
      "let's": 'let us',
      "could've": 'could have',
      "would've": 'would have',
      "should've": 'should have',
      "might've": 'might have',
      "must've": 'must have'
    };
    
    let result = text;
    for (const [contraction, full] of Object.entries(contractionsToExpand)) {
      const pattern = new RegExp(`\\b${contraction}\\b`, 'gi');
      result = result.replace(pattern, full);
    }
    
    return result;
  }
}

export const academicTextRefiner = new AcademicTextRefiner();

// Export as ImperfectionInjector for backward compatibility
export const ImperfectionInjector = AcademicTextRefiner;
