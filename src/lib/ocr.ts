// Local OCR using Tesseract.js - no external API needed
import Tesseract from 'tesseract.js';

export interface DetectedSignature {
  name: string;
  address: string;
  city: string;
  zip: string;
  confidence: number;
}

export interface OCRResult {
  signatures: DetectedSignature[];
  rawText: string;
}

/**
 * Extract text from an image using Tesseract.js (runs entirely in-browser).
 * Parses detected text to find name/address patterns from petition sheets.
 */
export async function extractSignaturesFromImage(imageData: string): Promise<OCRResult> {
  const result = await Tesseract.recognize(imageData, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR progress: ${Math.round((m.progress || 0) * 100)}%`);
      }
    },
  });

  const rawText = result.data.text;
  const overallConfidence = (result.data.confidence || 0) / 100;

  console.log('Tesseract raw text:', rawText);

  const signatures = parseSignatures(rawText, overallConfidence);

  return { signatures, rawText };
}

/**
 * Parse raw OCR text into structured signature entries.
 * Looks for patterns: lines with names, addresses, city/zip combinations.
 */
function parseSignatures(rawText: string, baseConfidence: number): DetectedSignature[] {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  if (lines.length === 0) return [];

  const signatures: DetectedSignature[] = [];

  // Strategy: group consecutive non-empty lines into signature blocks
  // Each block is assumed to be: name, address, city/zip
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    // Skip lines that look like headers or instructions
    if (isHeaderLine(line)) continue;

    currentBlock.push(line);

    // If we see a zip code pattern, end the block
    if (/\b\d{5}(-\d{4})?\b/.test(line)) {
      blocks.push([...currentBlock]);
      currentBlock = [];
    }
  }

  // If there's remaining text, treat it as a block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  for (const block of blocks) {
    const sig = parseBlock(block, baseConfidence);
    if (sig) signatures.push(sig);
  }

  // Fallback: if no structured blocks found, treat each line as a name
  if (signatures.length === 0 && lines.length > 0) {
    for (const line of lines) {
      if (!isHeaderLine(line) && isLikelyName(line)) {
        signatures.push({
          name: line,
          address: 'Not detected',
          city: 'Not detected',
          zip: 'Not detected',
          confidence: baseConfidence * 0.5,
        });
      }
    }
  }

  return signatures;
}

function parseBlock(lines: string[], baseConfidence: number): DetectedSignature | null {
  if (lines.length === 0) return null;

  let name = '';
  let address = '';
  let city = '';
  let zip = '';

  for (const line of lines) {
    const zipMatch = line.match(/\b(\d{5}(-\d{4})?)\b/);
    const addressMatch = line.match(/^\d+\s+\w/);

    if (zipMatch) {
      zip = zipMatch[1];
      // The rest of this line is likely the city
      city = line.replace(zipMatch[0], '').replace(/[,]/g, '').trim();
    } else if (addressMatch) {
      address = line;
    } else if (!name && isLikelyName(line)) {
      name = line;
    }
  }

  if (!name && !address) return null;

  const filledFields = [name, address, city, zip].filter(f => f && f !== 'Not detected').length;

  return {
    name: name || 'Unknown',
    address: address || 'Not detected',
    city: city || 'Not detected',
    zip: zip || 'Not detected',
    confidence: baseConfidence * (filledFields / 4),
  };
}

function isHeaderLine(line: string): boolean {
  const headers = ['petition', 'signature', 'sign here', 'printed name', 'date', 'address', '#', 'no.'];
  const lower = line.toLowerCase();
  return headers.some(h => lower.includes(h) && line.length < 40);
}

function isLikelyName(line: string): boolean {
  // A name is likely 2-4 words, mostly letters, no numbers at start
  const words = line.split(/\s+/);
  if (words.length < 1 || words.length > 6) return false;
  if (/^\d/.test(line)) return false; // starts with number = address
  if (line.length < 3) return false;
  // Mostly alphabetic
  const alphaRatio = (line.replace(/[^a-zA-Z]/g, '').length) / line.length;
  return alphaRatio > 0.7;
}
