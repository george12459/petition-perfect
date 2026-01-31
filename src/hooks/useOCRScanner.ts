import { useState, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import type { ValidationResult } from '@/types/petition';

interface OCRResult {
  name: string;
  address: string;
  city: string;
  zip: string;
  signature?: string;
  confidence: number;
}

interface ScannedSignature extends OCRResult {
  validationResult?: ValidationResult;
  isValidating: boolean;
}

export function useOCRScanner() {
  const { db } = useDatabase();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSignatures, setScannedSignatures] = useState<ScannedSignature[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simulate OCR processing on an image
  // In production, replace this with actual OCR API call
  const processImage = useCallback(async (imageData: string): Promise<OCRResult[]> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock OCR results - in production, this would call an OCR API
    // like Google Cloud Vision, AWS Textract, or Tesseract
    const mockResults: OCRResult[] = [
      {
        name: 'John Smith',
        address: '123 Main St',
        city: 'Springfield',
        zip: '12345',
        confidence: 0.95,
      },
      {
        name: 'Jane Doe',
        address: '456 Oak Ave',
        city: 'Springfield',
        zip: '12345',
        confidence: 0.92,
      },
      {
        name: 'Robt Johnson', // Intentional typo to test validation
        address: '789 Elm Blvd',
        city: 'Riverside',
        zip: '67890',
        confidence: 0.78,
      },
    ];

    return mockResults;
  }, []);

  // Validate a single signature against the voter database
  const validateSignature = useCallback(async (index: number) => {
    setScannedSignatures(prev => 
      prev.map((sig, i) => 
        i === index ? { ...sig, isValidating: true } : sig
      )
    );

    try {
      const signature = scannedSignatures[index];
      const result = await db.validateSignature(
        signature.name,
        signature.address,
        signature.city,
        signature.zip
      );

      setScannedSignatures(prev =>
        prev.map((sig, i) =>
          i === index 
            ? { ...sig, validationResult: result, isValidating: false }
            : sig
        )
      );
    } catch (err) {
      console.error('Validation error:', err);
      setScannedSignatures(prev =>
        prev.map((sig, i) =>
          i === index ? { ...sig, isValidating: false } : sig
        )
      );
    }
  }, [db, scannedSignatures]);

  // Validate all scanned signatures
  const validateAll = useCallback(async () => {
    for (let i = 0; i < scannedSignatures.length; i++) {
      await validateSignature(i);
    }
  }, [scannedSignatures.length, validateSignature]);

  // Main scan function
  const scanDocument = useCallback(async (imageData: string) => {
    setIsScanning(true);
    setError(null);

    try {
      const ocrResults = await processImage(imageData);
      
      const signatures: ScannedSignature[] = ocrResults.map(result => ({
        ...result,
        isValidating: false,
      }));

      setScannedSignatures(signatures);

      // Auto-validate all signatures
      for (let i = 0; i < signatures.length; i++) {
        setScannedSignatures(prev =>
          prev.map((sig, idx) =>
            idx === i ? { ...sig, isValidating: true } : sig
          )
        );

        const result = await db.validateSignature(
          signatures[i].name,
          signatures[i].address,
          signatures[i].city,
          signatures[i].zip
        );

        setScannedSignatures(prev =>
          prev.map((sig, idx) =>
            idx === i
              ? { ...sig, validationResult: result, isValidating: false }
              : sig
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan document');
    } finally {
      setIsScanning(false);
    }
  }, [db, processImage]);

  const clearResults = useCallback(() => {
    setScannedSignatures([]);
    setError(null);
  }, []);

  return {
    isScanning,
    scannedSignatures,
    error,
    scanDocument,
    validateSignature,
    validateAll,
    clearResults,
  };
}
