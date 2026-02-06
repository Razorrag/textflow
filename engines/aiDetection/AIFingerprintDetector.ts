/**
 * AI Fingerprint Detector
 * 
 * Detects known AI-specific markers, phrases, and patterns that are
 * commonly found in AI-generated text.
 */

export interface AIFingerprintResult {
  markerWordCount: number;
  markerPhraseCount: number;
  patternMatchCount: number;
  totalMarkers: number;
  normalizedScore: number;
  density: number;
  detectedMarkers: DetectedMarker[];
  isHighDensity: boolean;
  interpretation: string;
}

export interface DetectedMarker {
  type: 'word' | 'phrase' | 'pattern';
  value: string;
  position: number;
  context: string;
}

// Known AI-specific words and phrases
const AI_MARKER_WORDS = new Set([
  'delve', 'tapestry', 'landscape', 'underscore', 'paramount',
  'nuanced', 'multifaceted', 'testament', 'realm', 'poised',
  'unwavering', 'meticulous', 'harnessing', 'leveraging',
  'game-changer', 'paradigm', 'stark', 'crucial role', 'arguably',
  'notably', 'subsequently', 'foster', 'cultivate', 'myriad',
  'intersection', 'dichotomy', 'juxtapose', 'elucidate',
  'disseminate', 'ameliorate', 'exacerbate', 'proliferation',
  'comprehensively', 'meticulously', 'meticulous', 'meticulously',
  'seamlessly', 'effortlessly', 'intriguingly', 'fascinatingly',
  'noteworthily', 'significantly', 'substantially', 'considerably',
  'paradigmatic', 'epitomize', 'exemplify', 'characterize',
  'reverberate', 'transcend', 'transcending', 'transcended',
  'democratize', 'revolutionize', 'pioneer', 'groundbreaking'
]);

const AI_MARKER_PHRASES = [
  'it is important to note',
  'in conclusion',
  'it is worth noting',
  'on the other hand',
  'at the end of the day',
  'all things considered',
  'needless to say',
  'last but not least',
  'first and foremost',
  'in a nutshell',
  'plays a crucial role',
  'it can be argued',
  'from a theoretical perspective',
  'it is evident that',
  'research has shown',
  'studies have demonstrated',
  'it is clear that',
  'this suggests that',
  'it is worth mentioning',
  'it should be noted',
  'with this in mind',
  'taking this into account',
  'in light of this',
  'given these considerations',
  'for the purposes of',
  'in the realm of',
  'at its core',
  'in essence',
  'to sum up',
  'in summary',
  'moving forward',
  'going forward',
  'it is essential to',
  'it is imperative that',
  'it is crucial that',
  'there are several factors',
  'a multitude of',
  'a plethora of',
  'a wide range of',
  'time and time again',
  'over the course of',
  'in the face of',
  'with regard to',
  'pertaining to',
  'in terms of',
  'by and large',
  'to a large extent',
  'in a significant way',
  'in meaningful ways',
  'in profound ways',
  'in tangible ways'
];

// Structural patterns commonly found in AI text
const AI_PATTERNS = [
  { pattern: /\b(the|a)\s+\w+\s+(is|are)\s+(characterized by|defined as)/gi },
  { pattern: /\b(therefore|thus|hence)\s*,\s+/gi },
  { pattern: /\b(moreover|furthermore|additionally)\s*,\s+/gi },
  { pattern: /\b(first|second|third|finally)\s*,\s+/gi },
  { pattern: /\bin\s+(\w+)\s+(way|manner|fashion)\b/gi },
  { pattern: /\bit\s+(is|has|was)\s+\w+\s+(that|which|who)\b/gi },
  { pattern: /\bthis\s+\w+\s+(suggests|demonstrates|indicates|reveals)\b/gi },
  { pattern: /\bto\s+conclude\b/gi },
  { pattern: /\bin\s+closing\b/gi },
  { pattern: /\b(to|a)\s+(\w+\s+){1,2}(degree|extent)\b/gi }
];

export class AIFingerprintDetector {
  /**
   * Detect AI fingerprints in text
   */
  detect(text: string): AIFingerprintResult {
    const wordMatches = this.detectMarkerWords(text);
    const phraseMatches = this.detectMarkerPhrases(text);
    const patternMatches = this.detectPatterns(text);
    
    const detectedMarkers: DetectedMarker[] = [
      ...wordMatches.map(m => ({ type: 'word' as const, ...m })),
      ...phraseMatches.map(m => ({ type: 'phrase' as const, ...m })),
      ...patternMatches.map(m => ({ type: 'pattern' as const, ...m }))
    ];
    
    const totalMarkers = detectedMarkers.length;
    const wordCount = text.split(/\s+/).length;
    const density = (totalMarkers / wordCount) * 100; // per 100 words
    
    // Normalize score (0-100 scale based on density)
    const normalizedScore = Math.min(100, Math.round(density * 25));
    
    return {
      markerWordCount: wordMatches.length,
      markerPhraseCount: phraseMatches.length,
      patternMatchCount: patternMatches.length,
      totalMarkers,
      normalizedScore,
      density: Math.round(density * 100) / 100,
      detectedMarkers,
      isHighDensity: density > 2,
      interpretation: this.interpretDensity(density)
    };
  }

  /**
   * Detect AI-specific words
   */
  private detectMarkerWords(text: string): Omit<DetectedMarker, 'type'>[] {
    const matches: Omit<DetectedMarker, 'type'>[] = [];
    const lowerText = text.toLowerCase();
    
    for (const word of AI_MARKER_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Get context (50 chars before and after)
        const start = Math.max(0, match.index - 50);
        const end = Math.min(text.length, match.index + match[0].length + 50);
        const context = text.substring(start, end).replace(/\s+/g, ' ').trim();
        
        matches.push({
          value: match[0],
          position: match.index,
          context
        });
      }
    }
    
    return matches;
  }

  /**
   * Detect AI-specific phrases
   */
  private detectMarkerPhrases(text: string): Omit<DetectedMarker, 'type'>[] {
    const matches: Omit<DetectedMarker, 'type'>[] = [];
    
    for (const phrase of AI_MARKER_PHRASES) {
      const regex = new RegExp(this.escapeRegex(phrase), 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const start = Math.max(0, match.index - 50);
        const end = Math.min(text.length, match.index + match[0].length + 50);
        const context = text.substring(start, end).replace(/\s+/g, ' ').trim();
        
        matches.push({
          value: match[0],
          position: match.index,
          context
        });
      }
    }
    
    return matches;
  }

  /**
   * Detect AI-specific patterns
   */
  private detectPatterns(text: string): Omit<DetectedMarker, 'type'>[] {
    const matches: Omit<DetectedMarker, 'type'>[] = [];
    
    for (const { pattern } of AI_PATTERNS) {
      let match;
      
      while ((match = pattern.exec(text)) !== null) {
        const start = Math.max(0, match.index - 30);
        const end = Math.min(text.length, match.index + match[0].length + 30);
        const context = text.substring(start, end).replace(/\s+/g, ' ').trim();
        
        matches.push({
          value: match[0],
          position: match.index,
          context
        });
      }
    }
    
    return matches;
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Interpret density score
   */
  private interpretDensity(density: number): string {
    if (density < 0.5) {
      return 'Very few AI markers - likely human-written';
    } else if (density < 1.5) {
      return 'Few AI markers detected - possibly edited by human';
    } else if (density < 3) {
      return 'Moderate AI markers - likely AI-assisted or lightly edited';
    } else if (density < 5) {
      return 'Many AI markers - likely AI-generated with minimal editing';
    } else {
      return 'Very high AI marker density - strongly characteristic of AI-generated text';
    }
  }
}

export const aiFingerprintDetector = new AIFingerprintDetector();
