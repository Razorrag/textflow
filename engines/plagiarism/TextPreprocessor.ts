/**
 * Text Preprocessor
 * 
 * Prepares text for plagiarism detection through normalization and tokenization.
 */

export interface PreprocessedText {
  original: string;
  normalized: string;
  tokens: string[];
  shingles: string[];
}

export class TextPreprocessor {
  /**
   * Preprocess text for plagiarism detection
   */
  preprocess(text: string): PreprocessedText {
    return {
      original: text,
      normalized: this.normalize(text),
      tokens: this.tokenize(text),
      shingles: []
    };
  }

  /**
   * Normalize text (lowercase, remove punctuation)
   */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
  }

  /**
   * Tokenize text
   */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Remove stop words
   */
  removeStopWords(tokens: string[]): string[] {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to',
      'of', 'for', 'with', 'by', 'from', 'as', 'it', 'that', 'this',
      'be', 'are', 'was', 'were', 'has', 'have', 'had', 'been',
      'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her',
      'my', 'your', 'his', 'its', 'our', 'their', 'what', 'which',
      'who', 'whom', 'where', 'when', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very',
      'can', 'just', 'do', 'does', 'did', 'doing', 'a', 'about',
      'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
      'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before',
      'being', 'below', 'between', 'both', 'but', 'by', 'could',
      'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few',
      'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he',
      'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
      'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
      'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now',
      'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
      'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
      'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
      'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
      'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
      'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
      'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself',
      'yourselves'
    ]);

    return tokens.filter(token => !stopWords.has(token.toLowerCase()));
  }

  /**
   * Generate n-grams from tokens
   */
  generateNGrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];

    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      ngrams.push(ngram);
    }

    return ngrams;
  }

  /**
   * Get word frequencies
   */
  getWordFrequencies(tokens: string[]): Map<string, number> {
    const frequencies: Map<string, number> = new Map();

    for (const token of tokens) {
      frequencies.set(token, (frequencies.get(token) || 0) + 1);
    }

    return frequencies;
  }
}

export const textPreprocessor = new TextPreprocessor();
