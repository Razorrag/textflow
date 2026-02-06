/**
 * Perplexity Calculator
 * 
 * Calculates perplexity scores based on n-gram language models.
 * Perplexity measures how "predictable" text is - AI-generated text
 * tends to have lower perplexity (more predictable).
 * 
 * NOTE: This is a simplified implementation for demonstration purposes.
 * Real perplexity calculation requires large language models trained
 * on billions of tokens. This implementation uses a small corpus
 * and should be considered educational rather than production-ready.
 */

export interface PerplexityResult {
  perplexity: number;
  logProbability: number;
  tokenCount: number;
  interpretation: 'highly-predictable' | 'predictable' | 'natural' | 'highly-variable';
}

// Expanded training corpus with more diverse text patterns
// In production, this should be replaced with a large, diverse corpus
const TRAINING_CORPUS = [
  // Academic writing patterns
  'the quick brown fox jumps over the lazy dog',
  'research shows that many factors contribute to outcomes',
  'studies have demonstrated various approaches to solving problems',
  'in conclusion evidence suggests several important findings',
  'furthermore additional research reveals new insights about',
  'these findings indicate that future work should explore',
  'however there are limitations that should be considered',
  'moreover results contribute to our understanding of',
  'nevertheless this study provides valuable evidence for',
  'the data analysis reveals significant patterns in results',
  'on the other hand some researchers argue that',
  'it is important to note that these results show',
  'subsequent experiments confirmed these initial observations',
  'despite these challenges methodology proved effective',
  'the theoretical framework suggests that relationships exist between',
  'empirical evidence supports the hypothesis that',
  'statistical analysis demonstrates correlation between variables',
  'qualitative data reveals nuanced insights about',
  'quantitative measurements indicate substantial variation in',
  'preliminary findings suggest potential applications for',
  
  // Conversational and informal patterns
  'hey what\'s up I was wondering if you could help',
  'thanks so much for your time and consideration',
  'I think this is a really interesting point',
  'to be honest I\'m not completely sure about this',
  'let me know what you think when you get a chance',
  'sorry for the delay in getting back to you',
  'that makes sense I hadn\'t thought of it that way',
  'great idea let\'s definitely move forward with that',
  'I appreciate you bringing this to my attention',
  'no worries at all these things happen',
  
  // Creative and narrative patterns
  'the old house stood silently against the stormy sky',
  'she walked through the garden remembering childhood memories',
  'music filled the room with warmth and nostalgia',
  'the city lights reflected in the puddles below',
  'time seemed to slow down as the moment approached',
  'his words hung in the air like fragile glass',
  'the story unfolded like a carefully crafted tapestry',
  'shadows danced across the walls in the moonlight',
  'the scent of rain brought back forgotten feelings',
  'every corner held secrets waiting to be discovered',
  
  // Technical and professional patterns
  'the system architecture supports multiple concurrent users',
  'implementation requires careful consideration of edge cases',
  'performance metrics indicate significant improvement over baseline',
  'the API documentation provides comprehensive usage examples',
  'debugging revealed several memory allocation issues',
  'the deployment process includes automated testing stages',
  'security protocols must be strictly enforced at all levels',
  'the database schema normalization reduces redundancy',
  'code review identified potential optimization opportunities',
  'the integration test suite covers all major use cases',
  
  // Mixed complexity sentences
  'although the initial results were promising further investigation revealed unexpected complications',
  'despite extensive preparation the project encountered numerous challenges that required immediate attention',
  'the comprehensive analysis demonstrated clear correlations between variables previously thought to be independent',
  'while the theoretical framework provides a solid foundation practical implementation requires additional considerations',
  'given the complexity of the issue a multidisciplinary approach offers the most promising path forward'
];

// N-gram frequency maps
class NGramModel {
  private n: number;
  private frequencies: Map<string, Map<string, number>> = new Map();
  private contextCounts: Map<string, number> = new Map();
  private totalTokens: number = 0;

  constructor(n: number) {
    this.n = n;
  }

  train(corpus: string[]): void {
    for (const text of corpus) {
      const tokens = this.tokenize(text);
      
      for (let i = 0; i <= tokens.length - this.n; i++) {
        const context = tokens.slice(i, i + this.n - 1).join(' ');
        const word = tokens[i + this.n - 1];
        
        // Update context counts
        this.contextCounts.set(context, (this.contextCounts.get(context) || 0) + 1);
        
        // Update word frequencies for this context
        if (!this.frequencies.has(context)) {
          this.frequencies.set(context, new Map());
        }
        const contextFreq = this.frequencies.get(context)!;
        contextFreq.set(word, (contextFreq.get(word) || 0) + 1);
        
        this.totalTokens++;
      }
    }
  }

  /**
   * Get probability of word given context using Kneser-Ney smoothing
   */
  probability(word: string, context: string[]): number {
    const contextStr = context.join(' ');
    
    // Absolute discounting
    const D = 0.75; // Discounting constant
    const contextCount = this.contextCounts.get(contextStr) || 0;
    
    if (contextCount === 0) {
      // Backoff to lower-order model
      return this.backoffProbability(word, context);
    }
    
    const contextFreq = this.frequencies.get(contextStr);
    if (!contextFreq) {
      return this.backoffProbability(word, context);
    }
    
    const wordCount = contextFreq.get(word) || 0;
    const uniqueWords = contextFreq.size;
    
    // Kneser-Ney formula
    const discountedCount = Math.max(0, wordCount - D);
    const continuationProbability = this.continuationProbability(word);
    
    return (discountedCount / contextCount) + 
           (D * uniqueWords / contextCount) * continuationProbability;
  }

  private backoffProbability(word: string, context: string[]): number {
    // Simple backoff to unigram model
    const shorterContext = context.slice(1);
    if (shorterContext.length === 0) {
      // Unigram probability
      let totalCount = 0;
      let wordCount = 0;
      
      for (const [ctx, freqMap] of this.frequencies.entries()) {
        totalCount += this.contextCounts.get(ctx) || 0;
        wordCount += freqMap.get(word) || 0;
      }
      
      return (wordCount + 0.1) / (totalCount + this.frequencies.size * 0.1);
    }
    
    return this.probability(word, shorterContext);
  }

  private continuationProbability(word: string): number {
    // Count how many contexts this word appears as continuation
    let continuationCount = 0;
    let totalContinuationCount = 0;
    
    for (const [ctx, freqMap] of this.frequencies.entries()) {
      totalContinuationCount += this.contextCounts.get(ctx) || 0;
      if (freqMap.has(word)) {
        continuationCount += this.contextCounts.get(ctx) || 0;
      }
    }
    
    return (continuationCount + 0.1) / (totalContinuationCount + this.frequencies.size * 0.1);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}

export class PerplexityCalculator {
  private ngramModel: NGramModel;

  constructor(trainingCorpus: string[] = TRAINING_CORPUS) {
    this.ngramModel = new NGramModel(3); // Trigram model
    this.ngramModel.train(trainingCorpus);
  }

  calculate(text: string): PerplexityResult {
    const tokens = this.tokenize(text);
    
    if (tokens.length < 5) {
      return {
        perplexity: 0,
        logProbability: 0,
        tokenCount: tokens.length,
        interpretation: 'natural'
      };
    }

    let logProbabilities: number[] = [];
    let validTokens = 0;

    for (let i = 0; i < tokens.length; i++) {
      const context = tokens.slice(Math.max(0, i - 2), i);
      const word = tokens[i];
      
      const prob = this.ngramModel.probability(word, context);
      
      if (prob > 0) {
        logProbabilities.push(Math.log2(prob));
        validTokens++;
      }
    }

    if (logProbabilities.length === 0) {
      return {
        perplexity: 100, // Default neutral value
        logProbability: 0,
        tokenCount: tokens.length,
        interpretation: 'natural'
      };
    }

    const avgLogProb = logProbabilities.reduce((a, b) => a + b, 0) / logProbabilities.length;
    const perplexity = Math.pow(2, -avgLogProb);

    return {
      perplexity: Math.round(perplexity * 100) / 100,
      logProbability: Math.round(avgLogProb * 100) / 100,
      tokenCount: validTokens,
      interpretation: this.interpretPerplexity(perplexity)
    };
  }

  private interpretPerplexity(perplexity: number): PerplexityResult['interpretation'] {
    if (perplexity < 15) return 'highly-predictable';
    if (perplexity < 30) return 'predictable';
    if (perplexity < 70) return 'natural';
    return 'highly-variable';
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
}

export const perplexityCalculator = new PerplexityCalculator();
