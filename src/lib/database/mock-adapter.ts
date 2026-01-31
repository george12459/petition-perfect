// Mock database adapter for local development and testing
// Replace this with your actual database implementation

import type { 
  SignatureEntry, 
  PetitionSheet, 
  Batch, 
  User, 
  ValidationResult,
  ValidationStatus 
} from '@/types/petition';
import type { 
  DatabaseAdapter, 
  DatabaseConfig, 
  QueryOptions, 
  QueryResult 
} from './types';

// In-memory storage
const storage = {
  users: new Map<string, User>(),
  signatures: new Map<string, SignatureEntry>(),
  sheets: new Map<string, PetitionSheet>(),
  batches: new Map<string, Batch>(),
};

// Mock voter database for validation
const mockVoterDatabase: Array<{ name: string; address: string; city: string; zip: string }> = [
  { name: 'John Smith', address: '123 Main St', city: 'Springfield', zip: '12345' },
  { name: 'Jane Doe', address: '456 Oak Ave', city: 'Springfield', zip: '12345' },
  { name: 'Robert Johnson', address: '789 Elm Blvd', city: 'Riverside', zip: '67890' },
  { name: 'Mary Williams', address: '321 Pine Dr', city: 'Riverside', zip: '67890' },
  { name: 'Michael Brown', address: '654 Cedar Ln', city: 'Lakeside', zip: '11111' },
  { name: 'Sarah Davis', address: '987 Maple Way', city: 'Lakeside', zip: '11111' },
  { name: 'David Miller', address: '147 Birch Ct', city: 'Hilltown', zip: '22222' },
  { name: 'Emily Wilson', address: '258 Ash Rd', city: 'Hilltown', zip: '22222' },
  { name: 'James Taylor', address: '369 Walnut St', city: 'Valleyview', zip: '33333' },
  { name: 'Lisa Anderson', address: '741 Cherry Ln', city: 'Valleyview', zip: '33333' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function findBestMatch(
  name: string, 
  address: string, 
  city: string, 
  zip: string
): { match: typeof mockVoterDatabase[0] | null; score: number; suggestions: string[] } {
  const normalizedName = normalizeString(name);
  const normalizedAddress = normalizeString(address);
  const normalizedCity = normalizeString(city);
  const normalizedZip = zip.trim();
  
  let bestMatch: typeof mockVoterDatabase[0] | null = null;
  let bestScore = 0;
  const suggestions: string[] = [];
  
  for (const voter of mockVoterDatabase) {
    const voterName = normalizeString(voter.name);
    const voterAddress = normalizeString(voter.address);
    const voterCity = normalizeString(voter.city);
    
    // Calculate similarity scores
    const nameDistance = levenshteinDistance(normalizedName, voterName);
    const nameSimilarity = 1 - (nameDistance / Math.max(normalizedName.length, voterName.length));
    
    const addressDistance = levenshteinDistance(normalizedAddress, voterAddress);
    const addressSimilarity = 1 - (addressDistance / Math.max(normalizedAddress.length, voterAddress.length));
    
    const citySimilarity = normalizedCity === voterCity ? 1 : 
      1 - (levenshteinDistance(normalizedCity, voterCity) / Math.max(normalizedCity.length, voterCity.length));
    
    const zipMatch = normalizedZip === voter.zip ? 1 : 0;
    
    // Weighted score
    const score = (nameSimilarity * 0.4) + (addressSimilarity * 0.3) + (citySimilarity * 0.15) + (zipMatch * 0.15);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = voter;
    }
    
    // Add to suggestions if close match but not exact
    if (nameSimilarity > 0.7 && nameSimilarity < 1) {
      suggestions.push(`Did you mean "${voter.name}"?`);
    }
  }
  
  return { match: bestMatch, score: bestScore, suggestions: suggestions.slice(0, 3) };
}

export function createMockAdapter(_config: DatabaseConfig): DatabaseAdapter {
  let connected = false;

  return {
    async connect() {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 100));
      connected = true;
      console.log('[MockDB] Connected to mock database');
    },

    async disconnect() {
      connected = false;
      console.log('[MockDB] Disconnected from mock database');
    },

    isConnected() {
      return connected;
    },

    // Users
    async getUser(id: string) {
      return storage.users.get(id) || null;
    },

    async getUserByEmail(email: string) {
      for (const user of storage.users.values()) {
        if (user.email === email) return user;
      }
      return null;
    },

    async createUser(userData) {
      const user: User = {
        ...userData,
        id: generateId(),
        createdAt: new Date(),
      };
      storage.users.set(user.id, user);
      return user;
    },

    async updateUser(id, updates) {
      const user = storage.users.get(id);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...updates };
      storage.users.set(id, updated);
      return updated;
    },

    // Signatures
    async getSignature(id: string) {
      return storage.signatures.get(id) || null;
    },

    async getSignaturesBySheet(sheetId: string) {
      const signatures: SignatureEntry[] = [];
      for (const sig of storage.signatures.values()) {
        // This is a simplified lookup - in real implementation, 
        // signatures would have a sheetId field
        signatures.push(sig);
      }
      return signatures;
    },

    async createSignature(signatureData) {
      const signature: SignatureEntry = {
        ...signatureData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.signatures.set(signature.id, signature);
      return signature;
    },

    async updateSignature(id, updates) {
      const signature = storage.signatures.get(id);
      if (!signature) throw new Error('Signature not found');
      const updated = { ...signature, ...updates, updatedAt: new Date() };
      storage.signatures.set(id, updated);
      return updated;
    },

    // Petition Sheets
    async getPetitionSheet(id: string) {
      return storage.sheets.get(id) || null;
    },

    async getPetitionSheets(options?: QueryOptions): Promise<QueryResult<PetitionSheet>> {
      let sheets = Array.from(storage.sheets.values());
      
      if (options?.orderBy) {
        sheets.sort((a, b) => {
          const aVal = a[options.orderBy as keyof PetitionSheet];
          const bVal = b[options.orderBy as keyof PetitionSheet];
          const direction = options.orderDirection === 'desc' ? -1 : 1;
          return aVal > bVal ? direction : -direction;
        });
      }
      
      const offset = options?.offset || 0;
      const limit = options?.limit || sheets.length;
      const paginatedSheets = sheets.slice(offset, offset + limit);
      
      return {
        data: paginatedSheets,
        count: sheets.length,
        hasMore: offset + limit < sheets.length,
      };
    },

    async getPetitionSheetsByCirculator(circulatorId: string) {
      const sheets: PetitionSheet[] = [];
      for (const sheet of storage.sheets.values()) {
        if (sheet.circulatorId === circulatorId) sheets.push(sheet);
      }
      return sheets;
    },

    async createPetitionSheet(sheetData) {
      const sheet: PetitionSheet = {
        ...sheetData,
        id: generateId(),
        submittedAt: new Date(),
      };
      storage.sheets.set(sheet.id, sheet);
      return sheet;
    },

    async updatePetitionSheet(id, updates) {
      const sheet = storage.sheets.get(id);
      if (!sheet) throw new Error('Petition sheet not found');
      const updated = { ...sheet, ...updates };
      storage.sheets.set(id, updated);
      return updated;
    },

    // Batches
    async getBatch(id: string) {
      return storage.batches.get(id) || null;
    },

    async getBatches(options?: QueryOptions): Promise<QueryResult<Batch>> {
      let batches = Array.from(storage.batches.values());
      
      const offset = options?.offset || 0;
      const limit = options?.limit || batches.length;
      const paginatedBatches = batches.slice(offset, offset + limit);
      
      return {
        data: paginatedBatches,
        count: batches.length,
        hasMore: offset + limit < batches.length,
      };
    },

    async createBatch(batchData) {
      const batch: Batch = {
        ...batchData,
        id: generateId(),
        createdAt: new Date(),
      };
      storage.batches.set(batch.id, batch);
      return batch;
    },

    async updateBatch(id, updates) {
      const batch = storage.batches.get(id);
      if (!batch) throw new Error('Batch not found');
      const updated = { ...batch, ...updates };
      storage.batches.set(id, updated);
      return updated;
    },

    // Validation - The core logic for checking signatures
    async validateSignature(name: string, address: string, city: string, zip: string): Promise<ValidationResult> {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      const { match, score, suggestions } = findBestMatch(name, address, city, zip);
      
      let status: ValidationStatus;
      let message: string;
      let isValid: boolean;
      
      if (score >= 0.95) {
        // Exact or near-exact match
        status = 'G';
        message = 'Voter verified in database';
        isValid = true;
      } else if (score >= 0.8) {
        // Likely match with minor discrepancies
        status = 'X';
        message = 'Possible match found - manual review recommended';
        isValid = false;
      } else if (score >= 0.6) {
        // Partial match - might be typos
        status = 'X';
        message = 'Partial match - check for typos or handwriting errors';
        isValid = false;
      } else {
        // No match found
        status = 'B';
        message = 'No matching voter found in database';
        isValid = false;
      }
      
      // Check for duplicates in submitted signatures
      const existingSignatures = Array.from(storage.signatures.values());
      const normalizedName = normalizeString(name);
      const isDuplicate = existingSignatures.some(sig => 
        normalizeString(sig.name) === normalizedName && 
        normalizeString(sig.address) === normalizeString(address)
      );
      
      if (isDuplicate) {
        status = 'D';
        message = 'Duplicate signature detected';
        isValid = false;
      }
      
      return {
        isValid,
        status,
        message,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        confidenceScore: score,
      };
    },
  };
}
