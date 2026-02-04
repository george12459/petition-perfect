import { useState, useCallback } from 'react';
import { extractSignaturesFromImage, type DetectedSignature } from '@/lib/gemini';

interface ScannedSignature extends DetectedSignature {
  isValidating: boolean;
}

export function useOCRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSignatures, setScannedSignatures] = useState<ScannedSignature[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Main scan function using Gemini API
  const scanDocument = useCallback(async (imageData: string) => {
    setIsScanning(true);
    setError(null);
    setScannedSignatures([]);
    setRawText('');

    try {
      console.log('Starting Gemini OCR...');
      const result = await extractSignaturesFromImage(imageData);
      
      console.log('Gemini OCR result:', result);
      
      const signatures: ScannedSignature[] = result.signatures.map(sig => ({
        ...sig,
        isValidating: false,
      }));

      setScannedSignatures(signatures);
      setRawText(result.rawText);
      
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan document');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setScannedSignatures([]);
    setRawText('');
    setError(null);
  }, []);

  return {
    isScanning,
    scannedSignatures,
    rawText,
    error,
    scanDocument,
    clearResults,
  };
}
