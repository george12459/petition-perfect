// Core petition data types for Circulight

export type ValidationStatus = 'G' | 'B' | 'X' | 'D' | 'P';

export interface SignatureEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  signatureImageUrl?: string;
  validationStatus: ValidationStatus;
  validationMessage?: string;
  confidenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetitionSheet {
  id: string;
  circulatorId: string;
  batchId?: string;
  sheetNumber: number;
  scannedImageUrl: string;
  signatures: SignatureEntry[];
  totalSignatures: number;
  validCount: number;
  invalidCount: number;
  pendingCount: number;
  status: 'pending' | 'validated' | 'approved' | 'rejected';
  submittedAt: Date;
  validatedAt?: Date;
}

export interface Batch {
  id: string;
  coordinatorId: string;
  name: string;
  petitionSheets: PetitionSheet[];
  totalSheets: number;
  totalSignatures: number;
  validSignatures: number;
  invalidSignatures: number;
  status: 'pending' | 'reviewing' | 'approved' | 'mailed';
  createdAt: Date;
  approvedAt?: Date;
  mailedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'circulator' | 'coordinator' | 'admin';
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  status: ValidationStatus;
  message: string;
  suggestions?: string[];
  confidenceScore: number;
}

// Status code meanings
export const STATUS_LABELS: Record<ValidationStatus, string> = {
  G: 'Valid',      // Good - validated successfully
  B: 'Invalid',    // Bad - failed validation
  X: 'Manual',     // Needs manual review
  D: 'Duplicate',  // Duplicate entry found
  P: 'Pending',    // Awaiting validation
};

export const STATUS_COLORS: Record<ValidationStatus, string> = {
  G: 'bg-status-valid',
  B: 'bg-status-invalid',
  X: 'bg-status-manual',
  D: 'bg-status-duplicate',
  P: 'bg-status-pending',
};
