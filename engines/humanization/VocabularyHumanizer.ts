/**
 * Academic Vocabulary Humanizer
 * 
 * Replaces overused AI/generic vocabulary with sophisticated academic alternatives
 * while maintaining formal scholarly tone. Targets Turnitin's vocabulary-based detection.
 */

export interface AcademicSynonym {
  word: string;
  formality: 'formal' | 'semi-formal' | 'neutral';
  field: 'general' | 'science' | 'social' | 'humanities' | 'academic' | 'business' | 'mathematics';
  nuance: string;
}

// Common overused words mapped to academic alternatives
const COMMON_TO_ACADEMIC: Record<string, AcademicSynonym[]> = {
  'show': [
    { word: 'demonstrate', formality: 'formal', field: 'general', nuance: 'prove conclusively' },
    { word: 'illustrate', formality: 'formal', field: 'general', nuance: 'make clear with examples' },
    { word: 'indicate', formality: 'semi-formal', field: 'general', nuance: 'suggest indirectly' },
    { word: 'reveal', formality: 'formal', field: 'general', nuance: 'make known' }
  ],
  'think': [
    { word: 'contend', formality: 'formal', field: 'general', nuance: 'maintain' },
    { word: 'argue', formality: 'formal', field: 'general', nuance: 'present reasons' },
    { word: 'suggest', formality: 'semi-formal', field: 'general', nuance: 'put forward' },
    { word: 'posit', formality: 'formal', field: 'academic', nuance: 'put forward for consideration' }
  ],
  'look at': [
    { word: 'examine', formality: 'formal', field: 'general', nuance: 'investigate thoroughly' },
    { word: 'consider', formality: 'formal', field: 'general', nuance: 'give attention to' },
    { word: 'analyze', formality: 'formal', field: 'general', nuance: 'break down systematically' },
    { word: 'explore', formality: 'formal', field: 'general', nuance: 'investigate thoroughly' }
  ],
  'use': [
    { word: 'utilize', formality: 'formal', field: 'general', nuance: 'make practical use of' },
    { word: 'employ', formality: 'formal', field: 'general', nuance: 'take on or use' },
    { word: 'apply', formality: 'semi-formal', field: 'general', nuance: 'put into practical use' },
    { word: 'leverage', formality: 'semi-formal', field: 'business', nuance: 'use advantageously' }
  ],
  'important': [
    { word: 'significant', formality: 'formal', field: 'general', nuance: 'notable' },
    { word: 'crucial', formality: 'formal', field: 'general', nuance: 'decisively important' },
    { word: 'paramount', formality: 'formal', field: 'general', nuance: 'more important than anything else' },
    { word: 'essential', formality: 'formal', field: 'general', nuance: 'absolutely necessary' }
  ],
  'good': [
    { word: 'advantageous', formality: 'formal', field: 'general', nuance: 'producing benefit' },
    { word: 'beneficial', formality: 'formal', field: 'general', nuance: 'favorable' },
    { word: 'favorable', formality: 'formal', field: 'general', nuance: 'expressing approval' },
    { word: 'optimal', formality: 'formal', field: 'mathematics', nuance: 'best possible' }
  ],
  // FIELD-SPECIFIC CYBERSECURITY/IDS VOCABULARY
  'detect': [
    { word: 'identify', formality: 'formal', field: 'general', nuance: 'recognize and classify' },
    { word: 'recognize', formality: 'formal', field: 'general', nuance: 'perceive and identify' },
    { word: 'ascertain', formality: 'formal', field: 'science', nuance: 'determine with certainty' },
    { word: 'discern', formality: 'formal', field: 'science', nuance: 'perceive or recognize' },
    { word: 'triangulate', formality: 'formal', field: 'science', nuance: 'determine using multiple sources' }
  ],
  'attack': [
    { word: 'intrusion', formality: 'formal', field: 'science', nuance: 'unauthorized access attempt' },
    { word: 'breach', formality: 'formal', field: 'science', nuance: 'security violation' },
    { word: 'exploitation', formality: 'formal', field: 'science', nuance: 'taking advantage of vulnerability' },
    { word: 'compromise', formality: 'formal', field: 'science', nuance: 'security breach' },
    { word: 'adversarial action', formality: 'formal', field: 'science', nuance: 'hostile activity' }
  ],
  'system': [
    { word: 'infrastructure', formality: 'formal', field: 'science', nuance: 'underlying framework' },
    { word: 'architecture', formality: 'formal', field: 'science', nuance: 'structural design' },
    { word: 'framework', formality: 'formal', field: 'science', nuance: 'supporting structure' },
    { word: 'ecosystem', formality: 'formal', field: 'science', nuance: 'interconnected system' }
  ],
  'data': [
    { word: 'information', formality: 'formal', field: 'general', nuance: 'processed facts' },
    { word: 'dataset', formality: 'formal', field: 'science', nuance: 'structured collection' },
    { word: 'observations', formality: 'formal', field: 'science', nuance: 'measured values' },
    { word: 'metrics', formality: 'formal', field: 'science', nuance: 'quantitative measures' },
    { word: 'attributes', formality: 'formal', field: 'science', nuance: 'characteristic properties' }
  ],
  'method': [
    { word: 'methodology', formality: 'formal', field: 'academic', nuance: 'systematic approach' },
    { word: 'approach', formality: 'formal', field: 'academic', nuance: 'way of dealing with' },
    { word: 'framework', formality: 'formal', field: 'academic', nuance: 'conceptual structure' },
    { word: 'paradigm', formality: 'formal', field: 'academic', nuance: 'model or pattern' },
    { word: 'algorithm', formality: 'formal', field: 'mathematics', nuance: 'step-by-step procedure' }
  ],
  'analyze': [
    { word: 'evaluate', formality: 'formal', field: 'general', nuance: 'assess value or significance' },
    { word: 'assess', formality: 'formal', field: 'general', nuance: 'evaluate or estimate' },
    { word: 'scrutinize', formality: 'formal', field: 'science', nuance: 'examine critically' },
    { word: 'dissect', formality: 'formal', field: 'science', nuance: 'analyze in detail' },
    { word: 'corroborate', formality: 'formal', field: 'science', nuance: 'confirm with evidence' }
  ],
  'network': [
    { word: 'topology', formality: 'formal', field: 'science', nuance: 'network structure' },
    { word: 'infrastructure', formality: 'formal', field: 'science', nuance: 'underlying framework' },
    { word: 'architecture', formality: 'formal', field: 'science', nuance: 'structural design' },
    { word: 'ecosystem', formality: 'formal', field: 'science', nuance: 'interconnected environment' }
  ],
  'security': [
    { word: 'protection', formality: 'formal', field: 'general', nuance: 'safeguarding measure' },
    { word: 'safeguarding', formality: 'formal', field: 'science', nuance: 'protective measures' },
    { word: 'fortification', formality: 'formal', field: 'science', nuance: 'strengthening defenses' },
    { word: 'resilience', formality: 'formal', field: 'science', nuance: 'ability to withstand attacks' }
  ],
  'algorithm': [
    { word: 'methodology', formality: 'formal', field: 'academic', nuance: 'systematic approach' },
    { word: 'framework', formality: 'formal', field: 'academic', nuance: 'conceptual structure' },
    { word: 'paradigm', formality: 'formal', field: 'academic', nuance: 'model or pattern' },
    { word: 'heuristic', formality: 'formal', field: 'science', nuance: 'problem-solving approach' },
    { word: 'protocol', formality: 'formal', field: 'science', nuance: 'established procedure' }
  ],
  'idea': [
    { word: 'concept', formality: 'formal', field: 'general', nuance: 'abstract idea' },
    { word: 'notion', formality: 'formal', field: 'general', nuance: 'understanding' },
    { word: 'theory', formality: 'formal', field: 'academic', nuance: 'systematic explanation' },
    { word: 'proposition', formality: 'formal', field: 'academic', nuance: 'statement to be proved' }
  ],
  'part': [
    { word: 'component', formality: 'formal', field: 'general', nuance: 'constituent element' },
    { word: 'segment', formality: 'formal', field: 'general', nuance: 'distinct part' },
    { word: 'portion', formality: 'formal', field: 'general', nuance: 'share of something' },
    { word: 'section', formality: 'formal', field: 'academic', nuance: 'division of document' }
  ],
  'place': [
    { word: 'location', formality: 'formal', field: 'general', nuance: 'position' },
    { word: 'site', formality: 'formal', field: 'general', nuance: 'place of location' },
    { word: 'area', formality: 'semi-formal', field: 'general', nuance: 'region' },
    { word: 'setting', formality: 'formal', field: 'general', nuance: 'context or environment' }
  ],
  'group': [
    { word: 'collective', formality: 'formal', field: 'general', nuance: 'group as single entity' },
    { word: 'category', formality: 'formal', field: 'academic', nuance: 'classification' },
    { word: 'set', formality: 'formal', field: 'mathematics', nuance: 'defined collection' },
    { word: 'cohort', formality: 'formal', field: 'academic', nuance: 'group sharing characteristic' }
  ],
  'different': [
    { word: 'distinct', formality: 'formal', field: 'general', nuance: 'clearly different' },
    { word: 'diverse', formality: 'formal', field: 'general', nuance: 'showing variety' },
    { word: 'varied', formality: 'formal', field: 'general', nuance: 'of different types' },
    { word: 'dissimilar', formality: 'formal', field: 'academic', nuance: 'not alike' }
  ],
  'same': [
    { word: 'identical', formality: 'formal', field: 'general', nuance: 'exactly the same' },
    { word: 'equivalent', formality: 'formal', field: 'general', nuance: 'equal in value' },
    { word: 'uniform', formality: 'formal', field: 'general', nuance: 'remaining the same' },
    { word: 'comparable', formality: 'formal', field: 'academic', nuance: 'similar in nature' }
  ],
  'bad': [
    { word: 'detrimental', formality: 'formal', field: 'general', nuance: 'causing harm' },
    { word: 'adverse', formality: 'formal', field: 'general', nuance: 'unfavorable' },
    { word: 'unfavorable', formality: 'formal', field: 'general', nuance: 'negative' },
    { word: 'deleterious', formality: 'formal', field: 'science', nuance: 'harmful effect' }
  ],
  'big': [
    { word: 'substantial', formality: 'formal', field: 'general', nuance: 'large in size' },
    { word: 'considerable', formality: 'formal', field: 'general', nuance: 'notably large' },
    { word: 'significant', formality: 'formal', field: 'general', nuance: 'important in size' },
    { word: 'extensive', formality: 'formal', field: 'general', nuance: 'covering large area' }
  ],
  'small': [
    { word: 'minimal', formality: 'formal', field: 'general', nuance: 'smallest possible' },
    { word: 'negligible', formality: 'formal', field: 'general', nuance: 'so small as to be insignificant' },
    { word: 'insignificant', formality: 'formal', field: 'general', nuance: 'unimportant' },
    { word: 'marginal', formality: 'formal', field: 'academic', nuance: 'minor in importance' }
  ],
  'many': [
    { word: 'numerous', formality: 'formal', field: 'general', nuance: 'very many' },
    { word: 'a multitude of', formality: 'formal', field: 'general', nuance: 'large number' },
    { word: 'substantial numbers of', formality: 'formal', field: 'academic', nuance: 'significant quantity' },
    { word: 'countless', formality: 'formal', field: 'general', nuance: 'too many to count' }
  ],
  'thing': [
    { word: 'factor', formality: 'formal', field: 'general', nuance: 'circumstance' },
    { word: 'element', formality: 'formal', field: 'general', nuance: 'component' },
    { word: 'aspect', formality: 'formal', field: 'general', nuance: 'particular area' },
    { word: 'phenomenon', formality: 'formal', field: 'science', nuance: 'observable occurrence' }
  ],
  'way': [
    { word: 'method', formality: 'formal', field: 'general', nuance: 'systematic approach' },
    { word: 'approach', formality: 'semi-formal', field: 'general', nuance: 'manner of doing' },
    { word: 'mechanism', formality: 'formal', field: 'science', nuance: 'process' },
    { word: 'procedure', formality: 'formal', field: 'general', nuance: 'series of steps' }
  ],
  'make': [
    { word: 'generate', formality: 'formal', field: 'science', nuance: 'produce' },
    { word: 'create', formality: 'formal', field: 'general', nuance: 'bring into existence' },
    { word: 'produce', formality: 'formal', field: 'general', nuance: 'make or manufacture' },
    { word: 'effect', formality: 'formal', field: 'academic', nuance: 'bring about' }
  ],
  'get': [
    { word: 'obtain', formality: 'formal', field: 'general', nuance: 'acquire' },
    { word: 'acquire', formality: 'formal', field: 'general', nuance: 'gain possession of' },
    { word: 'receive', formality: 'formal', field: 'general', nuance: 'be given' },
    { word: 'procure', formality: 'formal', field: 'academic', nuance: 'obtain with effort' }
  ],
  'need': [
    { word: 'require', formality: 'formal', field: 'general', nuance: 'need for purpose' },
    { word: 'necessitate', formality: 'formal', field: 'general', nuance: 'make necessary' },
    { word: 'demand', formality: 'formal', field: 'general', nuance: 'require as essential' },
    { word: 'call for', formality: 'semi-formal', field: 'general', nuance: 'require' }
  ],
  'help': [
    { word: 'facilitate', formality: 'formal', field: 'general', nuance: 'make easier' },
    { word: 'assist', formality: 'formal', field: 'general', nuance: 'aid or support' },
    { word: 'aid', formality: 'formal', field: 'general', nuance: 'help actively' },
    { word: 'enable', formality: 'formal', field: 'general', nuance: 'make possible' }
  ],
  'change': [
    { word: 'alter', formality: 'formal', field: 'general', nuance: 'modify slightly' },
    { word: 'modify', formality: 'formal', field: 'general', nuance: 'make partial changes' },
    { word: 'transform', formality: 'formal', field: 'general', nuance: 'change completely' },
    { word: 'revise', formality: 'formal', field: 'academic', nuance: 'amend and update' }
  ],
  'start': [
    { word: 'commence', formality: 'formal', field: 'general', nuance: 'begin formally' },
    { word: 'initiate', formality: 'formal', field: 'general', nuance: 'cause to begin' },
    { word: 'begin', formality: 'semi-formal', field: 'general', nuance: 'commence' },
    { word: 'originate', formality: 'formal', field: 'academic', nuance: 'have origin' }
  ],
  'end': [
    { word: 'conclude', formality: 'formal', field: 'general', nuance: 'bring to an end' },
    { word: 'terminate', formality: 'formal', field: 'general', nuance: 'bring to an end formally' },
    { word: 'cease', formality: 'formal', field: 'general', nuance: 'stop completely' },
    { word: 'finalize', formality: 'semi-formal', field: 'general', nuance: 'complete finally' }
  ],
  'problem': [
    { word: 'challenge', formality: 'formal', field: 'general', nuance: 'difficult situation' },
    { word: 'issue', formality: 'semi-formal', field: 'general', nuance: 'matter of concern' },
    { word: 'obstacle', formality: 'formal', field: 'general', nuance: 'impediment' },
    { word: 'difficulty', formality: 'formal', field: 'general', nuance: 'problem encountered' }
  ],
  'result': [
    { word: 'outcome', formality: 'formal', field: 'general', nuance: 'final result' },
    { word: 'consequence', formality: 'formal', field: 'academic', nuance: 'result of action' },
    { word: 'implication', formality: 'formal', field: 'academic', nuance: 'suggested meaning' },
    { word: 'ramification', formality: 'formal', field: 'academic', nuance: 'complex consequence' }
  ]
};

// AI overused phrases with academic alternatives - fixed key format
const AI_PHRASE_TO_ACADEMIC: Record<string, { replacement: string; nuance: string }[]> = {
  'in conclusion': [
    { replacement: 'to summarize', nuance: 'brief recapitulation' },
    { replacement: 'ultimately', nuance: 'as the final point' },
    { replacement: 'in the final analysis', nuance: 'considering all factors' }
  ],
  'on the other hand': [
    { replacement: 'conversely', nuance: 'in contrast' },
    { replacement: 'alternatively', nuance: 'as another possibility' },
    { replacement: 'from an alternative perspective', nuance: 'different viewpoint' }
  ],
  'it is important to note': [
    { replacement: 'notably', nuance: 'worthy of attention' },
    { replacement: 'it should be emphasized', nuance: 'give emphasis' },
    { replacement: 'particularly significant is', nuance: 'highlight importance' }
  ],
  'it is worth mentioning': [
    { replacement: 'of particular relevance', nuance: 'germane to discussion' },
    { replacement: 'it merits attention that', nuance: 'deserves notice' },
    { replacement: 'notably', nuance: 'worth noting' }
  ],
  'first and foremost': [
    { replacement: 'primarily', nuance: 'of first importance' },
    { replacement: 'principally', nuance: 'mainly' },
    { replacement: 'most significantly', nuance: 'main point' }
  ],
  'all things considered': [
    { replacement: 'upon comprehensive examination', nuance: 'after full analysis' },
    { replacement: 'taking all factors into account', nuance: 'considering everything' },
    { replacement: 'in light of the evidence presented', nuance: 'based on evidence' }
  ],
  'needless to say': [
    { replacement: 'as is well established', nuance: 'commonly known' },
    { replacement: 'it is self-evident that', nuance: 'obvious' },
    { replacement: 'clearly', nuance: 'obviously true' }
  ],
  'last but not least': [
    { replacement: 'finally and of significance', nuance: 'final important point' },
    { replacement: 'additionally it is noteworthy', nuance: 'another point' }
  ],
  'a wide range of': [
    { replacement: 'a diverse array of', nuance: 'variety of options' },
    { replacement: 'numerous', nuance: 'many' },
    { replacement: 'a broad spectrum of', nuance: 'wide variety' }
  ],
  'plays a crucial role': [
    { replacement: 'is central to', nuance: 'key importance' },
    { replacement: 'is fundamental to', nuance: 'basic importance' },
    { replacement: 'serves as a cornerstone of', nuance: 'essential foundation' }
  ],
  'it can be argued': [
    { replacement: 'one may contend that', nuance: 'possible argument' },
    { replacement: 'a compelling case can be made that', nuance: 'supported argument' },
    { replacement: 'evidence suggests', nuance: 'indications point to' }
  ],
  'in contemporary times': [
    { replacement: 'contemporarily', nuance: 'in current times' },
    { replacement: 'in the contemporary era', nuance: 'present period' },
    { replacement: 'at present', nuance: 'currently' }
  ],
  'more and more': [
    { replacement: 'increasingly', nuance: 'growing amount' },
    { replacement: 'to an ever greater extent', nuance: 'growing scale' },
    { replacement: 'progressively', nuance: 'advancing' }
  ],
  'time and time again': [
    { replacement: 'repeatedly', nuance: 'many times' },
    { replacement: 'consistently', nuance: 'uniformly' },
    { replacement: 'persistently', nuance: 'continuing over time' }
  ],
  'at the end of the day': [
    { replacement: 'ultimately', nuance: 'in the final analysis' },
    { replacement: 'when all factors are weighed', nuance: 'after consideration' },
    { replacement: 'in essence', nuance: 'fundamentally' }
  ],
  'in a nutshell': [
    { replacement: 'in essence', nuance: 'fundamentally' },
    { replacement: 'to summarize briefly', nuance: 'concise summary' },
    { replacement: 'in brief', nuance: 'short form' }
  ],
  'going forward': [
    { replacement: 'henceforth', nuance: 'from this point' },
    { replacement: 'prospectively', nuance: 'in the future' },
    { replacement: 'moving forward', nuance: 'advancing' }
  ]
};

// Field-specific vocabulary extensions
const FIELD_SPECIFIC_VOCAB: Record<string, Record<string, string>> = {
  science: {
    'study': 'investigation',
    'found': 'established',
    'showed': 'demonstrated',
    'looked at': 'examined',
    'used': 'employed',
    'things': 'factors',
    'proved': 'established empirically'
  },
  social: {
    'people': 'individuals',
    'society': 'social structures',
    'groups': 'collectives',
    'said': 'stated',
    'believed': 'maintained',
    'wanted': 'desired'
  },
  humanities: {
    'meant': 'signified',
    'showed': 'evidenced',
    'looked at': 'interpreted',
    'understood': 'comprehended'
  }
};

export interface AcademicVocabularyResult {
  text: string;
  changes: {
    original: string;
    replacement: string;
    nuance: string;
    position: number;
  }[];
  vocabularyScore: number;
  formalityLevel: number;
}

export class AcademicVocabularyHumanizer {
  private field: string;
  
  constructor(field: string = 'general') {
    this.field = field;
  }
  
  /**
   * Humanize vocabulary to academic level
   */
  humanize(text: string, intensity: 'low' | 'medium' | 'high' = 'medium'): AcademicVocabularyResult {
    const threshold = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7;
    const changes: AcademicVocabularyResult['changes'] = [];
    
    let result = text;
    
    // Process common words
    for (const [commonWord, academicOptions] of Object.entries(COMMON_TO_ACADEMIC)) {
      const pattern = new RegExp(`\\b${commonWord}\\b`, 'gi');
      
      if (pattern.test(result)) {
        const matches = result.match(pattern);
        if (matches && matches.length > 0) {
          const applyCount = Math.ceil(matches.length * threshold);
          
          let applied = 0;
          result = result.replace(pattern, (match) => {
            if (applied >= applyCount) return match;
            
            const academicOption = this.selectBestAcademicSynonym(academicOptions);
            const replacement = this.matchCase(match, academicOption.word);
            
            changes.push({
              original: match,
              replacement,
              nuance: academicOption.nuance,
              position: result.indexOf(match)
            });
            
            applied++;
            return replacement;
          });
        }
      }
    }
    
    // Process AI phrases
    for (const [aiPhrase, academicOptions] of Object.entries(AI_PHRASE_TO_ACADEMIC)) {
      const pattern = new RegExp(this.escapeRegex(aiPhrase), 'gi');
      
      if (pattern.test(result)) {
        const matches = result.match(pattern);
        if (matches && matches.length > 0) {
          const applyCount = Math.ceil(matches.length * threshold);
          
          let applied = 0;
          result = result.replace(pattern, (match) => {
            if (applied >= applyCount) return match;
            
            const academicOption = academicOptions[Math.floor(Math.random() * academicOptions.length)];
            
            changes.push({
              original: match,
              replacement: academicOption.replacement,
              nuance: academicOption.nuance,
              position: result.indexOf(match)
            });
            
            applied++;
            return academicOption.replacement;
          });
        }
      }
    }
    
    // Add field-specific vocabulary if applicable
    if (this.field !== 'general' && FIELD_SPECIFIC_VOCAB[this.field]) {
      const fieldVocab = FIELD_SPECIFIC_VOCAB[this.field];
      for (const [commonWord, academicWord] of Object.entries(fieldVocab)) {
        if (Math.random() < threshold * 0.5) {
          const pattern = new RegExp(`\\b${commonWord}\\b`, 'gi');
          result = result.replace(pattern, academicWord);
        }
      }
    }
    
    // Calculate scores
    const vocabularyScore = Math.min(100, changes.length * 8);
    const formalityLevel = 70 + (changes.length * 2);
    
    return {
      text: result,
      changes,
      vocabularyScore,
      formalityLevel
    };
  }
  
  /**
   * Select best academic synonym based on context (simplified)
   */
  private selectBestAcademicSynonym(synonyms: AcademicSynonym[]): AcademicSynonym {
    // Prefer formal synonyms for academic context
    const formalOptions = synonyms.filter(s => s.formality === 'formal');
    if (formalOptions.length > 0) {
      return formalOptions[Math.floor(Math.random() * formalOptions.length)];
    }
    
    // Fall back to semi-formal
    const semiFormalOptions = synonyms.filter(s => s.formality === 'semi-formal');
    if (semiFormalOptions.length > 0) {
      return semiFormalOptions[Math.floor(Math.random() * semiFormalOptions.length)];
    }
    
    return synonyms[0];
  }
  
  /**
   * Match case of original word
   */
  private matchCase(original: string, replacement: string): string {
    if (/^[A-Z][a-z]+/.test(original)) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    if (/^[A-Z]+$/.test(original)) {
      return replacement.toUpperCase();
    }
    return replacement;
  }
  
  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const academicVocabularyHumanizer = new AcademicVocabularyHumanizer();

// Export as VocabularyHumanizer for backward compatibility
export const VocabularyHumanizer = AcademicVocabularyHumanizer;
export type { AcademicSynonym as HumanSynonym };
