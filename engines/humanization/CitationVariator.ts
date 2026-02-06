/**
 * Citation Variator
 * 
 * Randomly varies citation patterns to avoid AI-like consistency.
 * Turnitin's AI detector looks for repetitive, perfect citation formats.
 */

export interface CitationVariatorResult {
  text: string;
  citationsVaried: number;
  variations: {
    original: string;
    varied: string;
    type: 'parenthetical' | 'narrative' | 'integrated';
  }[];
}

export class CitationVariator {
  /**
   * Vary citation patterns to mimic human academic writing
   */
  varyCitations(text: string): CitationVariatorResult {
    const variations: CitationVariatorResult['variations'] = [];
    let variedText = text;
    let citationsVaried = 0;

    // Pattern 1: Parenthetical citations (Author, Year)
    const parentheticalPattern = /\(([^)]+)\s*,\s*(\d{4})\)/g;
    variedText = variedText.replace(parentheticalPattern, (match, author, year) => {
      if (Math.random() < 0.5) {
        // Convert to narrative style
        const narrativeForm = this.convertToNarrative(author.trim(), year.trim());
        variations.push({
          original: match,
          varied: narrativeForm,
          type: 'narrative'
        });
        citationsVaried++;
        return narrativeForm;
      }
      return match;
    });

    // Pattern 2: Narrative citations (Author (Year) argued...)
    const narrativePattern = /\b([A-Z][a-z]+\s+(?:et\s+al\.?)?\s*\([^)]+\s*\d{4}\))\s+(argued|stated|noted|observed|found|demonstrated|suggested|proposed|claimed|contended|maintained|reported)/g;
    variedText = variedText.replace(narrativePattern, (match, authorYear, verb) => {
      if (Math.random() < 0.4) {
        // Convert to parenthetical style
        const authorMatch = authorYear.match(/([A-Z][a-z]+\s+(?:et\s+al\.?)?)/);
        const yearMatch = authorYear.match(/(\d{4})/);
        if (authorMatch && yearMatch) {
          const parentheticalForm = `(${authorMatch[1]}, ${yearMatch[1]})`;
          variations.push({
            original: match,
            varied: parentheticalForm,
            type: 'parenthetical'
          });
          citationsVaried++;
          return parentheticalForm + ' ' + verb;
        }
      }
      return match;
    });

    // Pattern 3: Integrated citations (According to Author (Year)...)
    const integratedPattern = /\b(according\s+to|based\s+on|as\s+noted\s+by|as\s+suggested\s+by|following)\s+([A-Z][a-z]+\s+(?:et\s+al\.?)?\s*\([^)]+\s*\d{4}\))/g;
    variedText = variedText.replace(integratedPattern, (match, prefix, authorYear) => {
      if (Math.random() < 0.3) {
        // Convert to different integrated form
        const authorMatch = authorYear.match(/([A-Z][a-z]+\s+(?:et\s+al\.?)?)/);
        const yearMatch = authorYear.match(/(\d{4})/);
        if (authorMatch && yearMatch) {
          const alternatives = [
            `${authorMatch[1]} (${yearMatch[1]}) provides evidence that`,
            `Research by ${authorMatch[1]} (${yearMatch[1]}) indicates`,
            `${authorMatch[1]} (${yearMatch[1]})'s analysis demonstrates`
          ];
          const newForm = alternatives[Math.floor(Math.random() * alternatives.length)];
          variations.push({
            original: match,
            varied: newForm,
            type: 'integrated'
          });
          citationsVaried++;
          return newForm;
        }
      }
      return match;
    });

    // Pattern 4: Multiple citations in same sentence
    const multiCitationPattern = /([^.]*)\(([^)]+\s*\d{4})\)[^.]*(?:\s*\([^)]+\s*\d{4}\))?[^.]*/g;
    variedText = variedText.replace(multiCitationPattern, (match, firstPart, firstCitation, secondCitation) => {
      if (Math.random() < 0.6 && secondCitation) {
        // Split into separate sentences with different citation styles
        const author1 = firstCitation.match(/([^,]+)/);
        const year1 = firstCitation.match(/(\d{4})/);
        const author2 = secondCitation.match(/([^,]+)/);
        const year2 = secondCitation.match(/(\d{4})/);
        
        if (author1 && year1 && author2 && year2) {
          const newSentence = `${firstPart} (${author1[1]}, ${year1[1]}). Additionally, (${author2[1]}, ${year2[1]}) suggest different perspectives.`;
          variations.push({
            original: match,
            varied: newSentence,
            type: 'narrative'
          });
          citationsVaried++;
          return newSentence;
        }
      }
      return match;
    });

    return {
      text: variedText,
      citationsVaried,
      variations
    };
  }

  private convertToNarrative(author: string, year: string): string {
    const verbs = [
      'argued that',
      'contended that',
      'suggested that',
      'noted that',
      'observed that',
      'found that',
      'demonstrated that',
      'proposed that',
      'claimed that',
      'maintained that',
      'reported that',
      'indicated that',
      'concluded that'
    ];
    
    const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
    return `${author} (${year}) ${randomVerb}`;
  }
}

export const citationVariator = new CitationVariator();
