/**
 * PDF Text Extractor using pdfjs-dist v3.11.174
 * Extracts text content from uploaded PDF files client-side.
 * 
 * NOTE: pdfjs-dist is imported dynamically to avoid Vite bundling issues.
 * The import is lazy-loaded only when a PDF is actually uploaded.
 */

let pdfjsLib = null;
let pdfjsLoading = null;

/**
 * Dynamically import pdfjs-dist only when needed
 */
async function loadPdfjs() {
  if (pdfjsLib) {
    return pdfjsLib;
  }
  if (pdfjsLoading) {
    return pdfjsLoading;
  }
  pdfjsLoading = import('pdfjs-dist').then(module => {
    // Set up the worker source using CDN
    module.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfjsLib = module;
    return module;
  }).catch(err => {
    pdfjsLib = null;
    pdfjsLoading = null;
    console.error('Failed to load pdfjs-dist:', err);
    throw new Error('PDF library failed to load. PDF extraction is temporarily unavailable. You can still use demo data.');
  });
  return pdfjsLoading;
}

/**
 * Extract all text from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} Clean text content, truncated to 8000 characters
 */
export async function extractTextFromPDF(file) {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please upload a valid PDF file');
  }

  try {
    // Dynamically load pdfjs-dist
    const pdfjs = await loadPdfjs();

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += `\n--- Page ${pageNum} ---\n${pageText}`;
    }

    // Clean up the text: remove excessive whitespace
    const cleanedText = fullText.replace(/\s+/g, ' ').trim();

    // Truncate to 8000 characters maximum
    if (cleanedText.length > 8000) {
      return cleanedText.substring(0, 8000) + '\n\n... [truncated for length]';
    }

    return cleanedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Get the number of pages in a PDF file
 * @param {File} file - The PDF file
 * @returns {Promise<number>} Number of pages
 */
export async function getPdfPageCount(file) {
  if (!file || file.type !== 'application/pdf') {
    return 0;
  }

  try {
    // Dynamically load pdfjs-dist
    const pdfjs = await loadPdfjs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('PDF page count error:', error);
    return 0;
  }
}
