/**
 * Shingling Engine
 * 
 * Generates n-gram fingerprints for document comparison.
 */

export interface ShinglingResult {
  shingles: string[];
  hashes: number[];
}

export class ShinglingEngine {
  private shingleSize: number;

  constructor(shingleSize: number = 3) {
    this.shingleSize = shingleSize;
  }

  /**
   * Generate shingles from text
   */
  generateShingles(text: string): string[] {
    const tokens = this.tokenize(text);
    const shingles: string[] = [];

    for (let i = 0; i <= tokens.length - this.shingleSize; i++) {
      const shingle = tokens.slice(i, i + this.shingleSize).join(' ');
      shingles.push(shingle);
    }

    return shingles;
  }

  /**
   * Generate hashed shingles (for efficiency)
   */
  generateHashedShingles(text: string): number[] {
    const shingles = this.generateShingles(text);
    return shingles.map(shingle => this.rabinHash(shingle));
  }

  /**
   * Rabin rolling hash function
   */
  private rabinHash(input: string): number {
    let hash = 0;
    const base = 256;
    const mod = 2 ** 32;

    for (let i = 0; i < input.length; i++) {
      hash = (hash * base + input.charCodeAt(i)) % mod;
    }

    return Math.abs(hash);
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  /**
   * Generate shingled fingerprint
   */
  generateFingerprint(text: string): {
    shingles: string[];
    hashes: number[];
  } {
    const shingles = this.generateShingles(text);
    const hashes = shingles.map(shingle => this.rabinHash(shingle));

    return { shingles, hashes };
  }
}

export const shinglingEngine = new ShinglingEngine(3);
