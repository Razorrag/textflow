import { RewriteMode, RewriteResponse, AnalysisResult } from "../types";

// ==========================================
// 1. EXTENSIVE LINGUISTIC DATABASE
// ==========================================

const SYNONYMS: Record<string, string[]> = {
  // Verbs
  "use": ["utilize", "employ", "leverage", "apply", "harness", "run with"],
  "used": ["utilized", "employed", "leveraged", "applied", "harnessed"],
  "using": ["utilizing", "employing", "leveraging", "applying"],
  "create": ["generate", "produce", "build", "form", "craft", "make", "forge", "design"],
  "created": ["generated", "produced", "built", "formed", "crafted", "made"],
  "show": ["demonstrate", "reveal", "display", "exhibit", "prove", "highlight", "showcase", "illustrate"],
  "shows": ["demonstrates", "reveals", "displays", "exhibits", "proves", "highlights"],
  "help": ["assist", "aid", "support", "boost", "facilitate", "serve", "back"],
  "change": ["alter", "modify", "shift", "adjust", "transform", "tweak", "revise", "rework"],
  "improve": ["enhance", "boost", "upgrade", "refine", "better", "elevate", "polish"],
  "need": ["require", "demand", "call for", "necessitate", "entail"],
  "explain": ["clarify", "describe", "define", "break down", "elucidate", "spell out"],
  "find": ["discover", "identify", "locate", "spot", "uncover", "detect"],
  "think": ["believe", "consider", "reckon", "feel", "suppose", "deem", "figure"],
  "say": ["state", "mention", "remark", "note", "claim", "assert", "argue"],
  "make": ["create", "form", "fashion", "produce", "generate"],
  "start": ["begin", "commence", "initiate", "launch", "kick off"],
  
  // Adjectives
  "important": ["crucial", "vital", "key", "major", "essential", "critical", "paramount", "significant", "central"],
  "good": ["solid", "strong", "positive", "beneficial", "valuable", "favorable", "sound"],
  "bad": ["negative", "poor", "adverse", "harmful", "subpar", "detrimental", "lousy"],
  "new": ["fresh", "novel", "modern", "recent", "current", "contemporary", "cutting-edge"],
  "different": ["various", "diverse", "distinct", "varied", "assorted", "disparate"],
  "big": ["large", "huge", "massive", "significant", "substantial", "considerable", "sizable"],
  "small": ["minor", "tiny", "limited", "slight", "minimal", "negligible"],
  "hard": ["tough", "difficult", "challenging", "complex", "arduous", "demanding"],
  "easy": ["simple", "straightforward", "clear", "smooth", "effortless", "painless"],
  "effective": ["efficient", "potent", "powerful", "successful", "productive"],
  "many": ["numerous", "countless", "multiple", "several", "various", "a host of"],
  
  // Connectors/Adverbs
  "also": ["plus", "too", "as well", "additionally", "on top of that", "furthermore", "moreover"],
  "but": ["however", "yet", "though", "although", "still", "nevertheless", "on the other hand"],
  "so": ["thus", "therefore", "hence", "consequently", "as a result", "accordingly"],
  "because": ["since", "as", "given that", "considering", "due to", "in light of"],
  "really": ["truly", "actually", "genuinely", "certainly", "undoubtedly", "absolutely"],
  "very": ["highly", "extremely", "incredibly", "super", "exceedingly", "remarkably"],
  "often": ["frequently", "commonly", "usually", "typically", "regularly"],
  "maybe": ["perhaps", "possibly", "potentially", "conceivably", "perchance"],
  "always": ["constantly", "consistently", "forever", "perpetually", "invariably"],
  
  // Academic Specific
  "study": ["research", "analysis", "investigation", "paper", "project", "inquiry", "study"],
  "result": ["outcome", "finding", "conclusion", "data", "effect", "consequence", "implication"],
  "problem": ["issue", "challenge", "difficulty", "hurdle", "obstacle", "dilemma"],
  "idea": ["concept", "notion", "theory", "view", "hypothesis", "premise"],
  "example": ["instance", "case", "illustration", "sample", "exemplar"],
  "method": ["approach", "technique", "strategy", "procedure", "methodology", "framework"],
  "system": ["structure", "scheme", "setup", "mechanism", "apparatus"]
};

const CONTRACTIONS: Record<string, string> = {
  "do not": "don't", "cannot": "can't", "will not": "won't",
  "should not": "shouldn't", "could not": "couldn't", "would not": "wouldn't",
  "is not": "isn't", "are not": "aren't", "was not": "wasn't", "were not": "weren't",
  "have not": "haven't", "has not": "hasn't", "had not": "hadn't",
  "it is": "it's", "that is": "that's", "there is": "there's", "what is": "what's",
  "i am": "I'm", "we are": "we're", "they are": "they're", "you are": "you're"
};

// Words often used by AI (Fingerprints)
const AI_BLACKLIST = [
  "delve", "tapestry", "landscape", "underscore", "paramount", 
  "nuanced", "multifaceted", "testament", "realm", "poised", 
  "unwavering", "meticulous", "harnessing", "leveraging", 
  "game-changer", "paradigm", "stark", "crucial role", "arguably",
  "notably", "subsequently", "foster", "cultivate", "myriad"
];

const HEDGING_WORDS = ["pretty", "kind of", "sort of", "maybe", "basically", "actually", "essentially", "roughly"];
const HUMAN_OPENERS = ["Look,", "Honestly,", "Truth is,", "Basically,", "To be fair,", "You know,", "In reality,", "As it happens,"];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const tokenize = (text: string) => text.split(/(\s+|[.,!?;:"])/).filter(Boolean);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isCapitalized = (w: string) => /^[A-Z]/.test(w);

const matchCase = (original: string, replacement: string) => {
  if (isCapitalized(original)) return capitalize(replacement);
  return replacement.toLowerCase();
};

// ==========================================
// 3. NUCLEAR ALGORITHMS (NON-AI)
// ==========================================

/**
 * STRUCTURE ATTACK: Reverses clauses.
 * "Since X, Y" -> "Y, since X"
 */
const swapClauses = (sentence: string): string => {
  const connectors = ["Because", "Since", "While", "Although", "If", "Whereas", "As"];
  
  // 1. Starts with connector: "Because it rained, I stayed." -> "I stayed because it rained."
  for (const conn of connectors) {
     if (sentence.startsWith(conn + " ")) {
         const parts = sentence.split(",");
         if (parts.length >= 2) {
             const dependent = parts[0].trim(); // "Because it rained"
             const independent = parts.slice(1).join(",").trim().replace(/[.!?]+$/, ""); // "I stayed"
             const punctuation = sentence.match(/[.!?]+$/)?.[0] || ".";
             
             // Lowercase the dependent clause's start
             const lowerDependent = dependent.charAt(0).toLowerCase() + dependent.slice(1);
             
             return `${capitalize(independent)} ${lowerDependent}${punctuation}`;
         }
     }
  }
  
  // 2. Connector in middle: "I stayed, because it rained." -> "Because it rained, I stayed."
  // Note: Only works if comma exists before connector
  const midConnectors = ["because", "since", "although", "while"];
  for (const conn of midConnectors) {
    const splitKey = `, ${conn} `;
    if (sentence.includes(splitKey)) {
        const parts = sentence.split(splitKey);
        if (parts.length === 2) {
            const first = parts[0].trim();
            const second = parts[1].replace(/[.!?]+$/, "").trim();
            const punctuation = sentence.match(/[.!?]+$/)?.[0] || ".";
            
            return `${capitalize(conn)} ${second}, ${first.charAt(0).toLowerCase() + first.slice(1)}${punctuation}`;
        }
    }
  }

  return sentence;
};

/**
 * N-GRAM ATTACK: Injects noise words to break 3-word sequences.
 */
const injectNoise = (text: string): string => {
    const words = text.split(" ");
    if (words.length < 5) return text;
    
    // POS Simulation: Inject before likely adjectives
    const adjectiveEndings = ["able", "ible", "al", "ful", "ic", "ive", "less", "ous"];
    const targets = ["good", "bad", "high", "low", "big", "small", "hard", "easy"];
    
    return words.map(w => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, "");
        const isAdj = targets.includes(clean) || adjectiveEndings.some(end => clean.endsWith(end));
        
        // 15% chance to inject noise word
        if (isAdj && Math.random() < 0.15) {
            const modifiers = ["very", "really", "quite", "rather", "pretty", "fairly"];
            const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
            return `${mod} ${w}`;
        }
        return w;
    }).join(" ");
};

/**
 * BURSTINESS ATTACK: Varies sentence length.
 */
const adjustBurstiness = (text: string): string => {
    // 1. Break long sentences
    let processed = text
        .replace(/, and /g, ". ")
        .replace(/, but /g, ". However, ")
        .replace(/, whereas /g, ". In contrast, ")
        .replace(/, which /g, ". This ");

    // 2. Merge short sentences (Naive approach)
    // "I ran. It was fast." -> "I ran, and it was fast."
    const sentences = processed.split(". ");
    const merged: string[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
        const curr = sentences[i];
        const next = sentences[i+1];
        
        if (next && curr.split(" ").length < 6 && next.split(" ").length < 8 && Math.random() > 0.5) {
            // Merge
            const cleanNext = next.charAt(0).toLowerCase() + next.slice(1);
            const conjunctions = ["and", "so", "plus"];
            const conn = conjunctions[Math.floor(Math.random() * conjunctions.length)];
            merged.push(`${curr}, ${conn} ${cleanNext}`);
            i++; // Skip next
        } else {
            merged.push(curr);
        }
    }
    
    return merged.join(". ");
};

/**
 * VOCABULARY SPINNER: The heavy lifter for rewriting.
 */
const spinVocabulary = (text: string, mode: RewriteMode): string => {
  const tokens = tokenize(text);
  
  return tokens.map(token => {
    const clean = token.toLowerCase().replace(/[^a-z]/g, '');
    
    // 1. AI Blacklist Nuke
    if (AI_BLACKLIST.includes(clean)) {
        if (SYNONYMS[clean]) {
             const opts = SYNONYMS[clean];
             return matchCase(token, opts[Math.floor(Math.random() * opts.length)]);
        }
        return "this"; // Fallback generic
    }

    // 2. Synonym Replacement
    if (SYNONYMS[clean]) {
      // PLAG_REMOVER: Aggressive (80% chance)
      // ACADEMIC: Moderate (50%)
      // HUMANIZE: Low (30%)
      let threshold = 0.3;
      if (mode === RewriteMode.PLAG_REMOVER) threshold = 0.8;
      if (mode === RewriteMode.ACADEMIC) threshold = 0.5;
      if (mode === RewriteMode.CREATIVE) threshold = 0.6;
      
      if (Math.random() < threshold) {
        const options = SYNONYMS[clean];
        const choice = options[Math.floor(Math.random() * options.length)];
        return matchCase(token, choice);
      }
    }
    return token;
  }).join('');
};

/**
 * HUMANIZER: Adds flow imperfections.
 */
const humanizeFlow = (text: string): string => {
  // 1. Force Contractions
  let processed = text;
  for (const [full, short] of Object.entries(CONTRACTIONS)) {
      const regex = new RegExp(`\\b${full}\\b`, 'gi');
      processed = processed.replace(regex, short);
  }
  
  // 2. Conversational Openers & Hedging
  const sentences = processed.split(/([.!?]\s+)/);
  processed = sentences.map((s, i) => {
      if (i % 2 === 0 && s.length > 20) {
          // Openers
          if (Math.random() < 0.12) {
              const opener = HUMAN_OPENERS[Math.floor(Math.random() * HUMAN_OPENERS.length)];
              return `${opener} ${s.charAt(0).toLowerCase() + s.slice(1)}`;
          }
          // Hedging
          if (Math.random() < 0.08) {
             const words = s.split(" ");
             if (words.length > 5) {
                 const idx = Math.floor(Math.random() * (words.length - 2)) + 1;
                 const hedge = HEDGING_WORDS[Math.floor(Math.random() * HEDGING_WORDS.length)];
                 words.splice(idx, 0, hedge);
                 return words.join(" ");
             }
          }
      }
      return s;
  }).join('');
  
  return processed;
};

// ==========================================
// 4. MAIN EXPORTS
// ==========================================

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate compute

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/);
  
  // 1. AI Fingerprint Scan
  let aiCount = 0;
  AI_BLACKLIST.forEach(w => {
      if (new RegExp(`\\b${w}\\b`, 'i').test(text)) aiCount++;
  });

  // 2. Burstiness (SD of sentence lengths)
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (lengths.length || 1);
  const stdDev = Math.sqrt(variance);

  // 3. Perplexity Proxy (Type-Token Ratio)
  // Humans use a wider variety of words in non-linear patterns
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const ttr = uniqueWords.size / (words.length || 1);

  // SCORING
  let humanScore = 50;
  
  // Burstiness Reward (AI usually < 4, Humans > 6)
  if (stdDev > 6) humanScore += 20;
  else if (stdDev < 3.5) humanScore -= 15;

  // AI Word Penalty
  humanScore -= (aiCount * 5);
  
  // Repetitive Penalty
  if (ttr < 0.4) humanScore -= 10;
  if (ttr > 0.6) humanScore += 10;

  humanScore = Math.min(99, Math.max(1, humanScore));
  const aiScore = 100 - humanScore;
  const plagiarismScore = Math.min(100, Math.max(0, 100 - (ttr * 150)));

  let verdict: AnalysisResult['verdict'] = 'Mixed';
  if (humanScore > 75) verdict = 'Likely Human';
  else if (aiScore > 70) verdict = 'Likely AI';
  else if (plagiarismScore > 60) verdict = 'Highly Repetitive';

  return {
    aiScore,
    humanScore,
    plagiarismScore: Math.round(plagiarismScore),
    readabilityScore: Math.round(ttr * 100),
    verdict,
    details: [
      `Sentence Variance (Burstiness): ${stdDev.toFixed(1)}`,
      `Vocabulary Richness: ${(ttr * 100).toFixed(0)}%`,
      `AI Patterns Detected: ${aiCount}`
    ]
  };
};

export const rewriteText = async (text: string, mode: RewriteMode): Promise<RewriteResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  let processed = text;
  const changes: string[] = [];
  const originalWordCount = text.split(/\s+/).length;

  // STEP 1: Anti-AI Sanitation (All modes)
  // Remove blacklisted words immediately
  const start = processed;
  AI_BLACKLIST.forEach(w => {
     if (new RegExp(`\\b${w}\\b`, 'i').test(processed)) {
         if (SYNONYMS[w]) {
             processed = processed.replace(new RegExp(`\\b${w}\\b`, 'gi'), (m) => matchCase(m, SYNONYMS[w][0]));
         }
     }
  });
  if (start !== processed) changes.push("Sanitized AI-specific vocabulary");

  // STEP 2: Structural Manipulation
  if (mode === RewriteMode.PLAG_REMOVER || mode === RewriteMode.HUMANIZE) {
      // Split/Merge sentences
      processed = adjustBurstiness(processed);
      changes.push("Restructured sentence lengths");
      
      // Clause Swapping (Nuclear option)
      const sent = processed.split(/([.!?]\s+)/);
      processed = sent.map(s => {
          if (s.length > 25 && Math.random() > 0.4) return swapClauses(s);
          return s;
      }).join('');
      changes.push("Reordered sentence clauses");
  }

  // STEP 3: Vocabulary Injection (The Spinner)
  processed = spinVocabulary(processed, mode);
  changes.push("Applied advanced synonym replacement");

  // STEP 4: Mode Specifics
  if (mode === RewriteMode.HUMANIZE) {
      processed = humanizeFlow(processed);
      changes.push("Injected conversational nuances");
  }
  
  if (mode === RewriteMode.PLAG_REMOVER) {
      processed = injectNoise(processed);
      changes.push("Injected structural noise to break N-grams");
  }

  // Final Polish
  processed = processed.replace(/\s+/g, ' ').trim();
  processed = processed.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, sep, char) => sep + char.toUpperCase());

  return {
    original: text,
    rewritten: processed,
    changes,
    stats: {
        originalWordCount,
        newWordCount: processed.split(/\s+/).length,
        perplexityScore: "Optimized"
    }
  };
};