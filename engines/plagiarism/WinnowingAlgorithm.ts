/**
 * Winnowing Algorithm
 * 
 * Selects minimal fingerprints from document hashes for efficient comparison.
 */

export interface WinnowingResult {
  fingerprints: number[];
}

export class WinnowingAlgorithm {
  private windowSize: number;

  constructor(windowSize: number = 4) {
    this.windowSize = windowSize;
  }

  /**
   * Winnow hashes to minimal fingerprint
   */
  winnow(hashes: number[]): number[] {
    if (hashes.length < this.windowSize) {
      return hashes;
    }

    const fingerprints: number[] = [];

    for (let i = 0; i <= hashes.length - this.windowSize; i++) {
      const window = hashes.slice(i, i + this.windowSize);
      const minIndex = this.findMinIndex(window);
      const selectedHash = hashes[i + minIndex];

      // Avoid consecutive duplicates
      if (fingerprints.length === 0 || selectedHash !== fingerprints[fingerprints.length - 1]) {
        fingerprints.push(selectedHash);
      }
    }

    return fingerprints;
  }

  /**
   * Find index of minimum value in array
   */
  private findMinIndex(arr: number[]): number {
    let minIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[minIndex]) {
        minIndex = i;
      }
    }
    return minIndex;
  }

  /**
   * Generate fingerprint from text
   */
  generateFingerprint(text: string): number[] {
    const shinglingEngine = {
      generateHashedShingles: (t: string): number[] => {
        const tokens = t.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((x: string) => x.length > 0);
        const shingles: string[] = [];
        const n = 3;
        for (let i = 0; i <= tokens.length - n; i++) {
          shingles.push(tokens.slice(i, i + n).join(' '));
        }
        return shingles.map((s: string) => {
          let hash = 0;
          for (let j = 0; j < s.length; j++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(j);
            hash |= 0;
          }
          return Math.abs(hash);
        });
      }
    };

    const hashes = shinglingEngine.generateHashedShingles(text);
    return this.winnow(hashes);
  }
}

export const winnowingAlgorithm = new WinnowingAlgorithm(4);
