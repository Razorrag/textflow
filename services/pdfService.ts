import * as pdfjsLib from 'pdfjs-dist';

// Robustly resolve the library object
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Force the worker source to the matching version from jsDelivr.
// This is critical: The worker must be a "classic" script (not a module) to work with importScripts
// and must match the main library version to avoid the "fake worker" error.
try {
    if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
} catch (e) {
    console.warn("Could not set PDF worker source", e);
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the document with the resolved pdfjs instance
    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str || "")
            .join(' ');
            
        fullText += pageText + "\n\n";
    }
    
    const trimmed = fullText.trim();
    if (!trimmed) {
        throw new Error("The PDF document appears to be empty or contains scanned images without text.");
    }

    return trimmed;

  } catch (error: any) {
    console.error("PDF Service Error:", error);
    
    if (error.name === 'MissingPDFException') {
        throw new Error("Invalid PDF file.");
    }
    if (error.message && error.message.includes('worker')) {
         throw new Error("PDF processing engine failed to initialize. Please try refreshing the page.");
    }
    
    throw new Error(error.message || "Failed to extract text from PDF.");
  }
};