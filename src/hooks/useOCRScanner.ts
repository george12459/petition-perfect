import { useState, useCallback } from 'react';
import { extractSignaturesFromImage, type DetectedSignature } from '@/lib/ocr';

interface ScannedSignature extends DetectedSignature {
  isValidating: boolean;
}

export function useOCRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedSignatures, setScannedSignatures] = useState<ScannedSignature[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const scanDocument = useCallback(async (imageData: string) => {
    setIsScanning(true);
    setError(null);
    setScannedSignatures([]);
    setRawText('');
    setScanProgress(10);

    try {
      console.log('Starting local Tesseract OCR...');
      setScanProgress(30);
      const result = await extractSignaturesFromImage(imageData);
      setScanProgress(90);

      console.log('OCR result:', result);

      const signatures: ScannedSignature[] = result.signatures.map(sig => ({
        ...sig,
        isValidating: false,
      }));

      setScannedSignatures(signatures);
      setRawText(result.rawText);
      setScanProgress(100);
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
    setScanProgress(0);
  }, []);

  return {
    isScanning,
    scanProgress,
    scannedSignatures,
    rawText,
    error,
    scanDocument,
    clearResults,
  };
}
