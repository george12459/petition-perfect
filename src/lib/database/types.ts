// Database abstraction layer types
// This allows easy swapping between different database implementations

import type { 
  SignatureEntry, 
  PetitionSheet, 
  Batch, 
  User, 
  ValidationResult 
} from '@/types/petition';

export interface DatabaseConfig {
  type: 'mock' | 'supabase' | 'firebase' | 'postgresql' | 'mongodb' | 'custom';
  connectionString?: string;
  apiKey?: string;
  projectId?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

// Abstract database interface - implement this for any database
export interface DatabaseAdapter {
  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Users
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Signatures
  getSignature(id: string): Promise<SignatureEntry | null>;
  getSignaturesBySheet(sheetId: string): Promise<SignatureEntry[]>;
  createSignature(signature: Omit<SignatureEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<SignatureEntry>;
  updateSignature(id: string, updates: Partial<SignatureEntry>): Promise<SignatureEntry>;

  // Petition Sheets
  getPetitionSheet(id: string): Promise<PetitionSheet | null>;
  getPetitionSheets(options?: QueryOptions): Promise<QueryResult<PetitionSheet>>;
  getPetitionSheetsByCirculator(circulatorId: string): Promise<PetitionSheet[]>;
  createPetitionSheet(sheet: Omit<PetitionSheet, 'id' | 'submittedAt'>): Promise<PetitionSheet>;
  updatePetitionSheet(id: string, updates: Partial<PetitionSheet>): Promise<PetitionSheet>;

  // Batches
  getBatch(id: string): Promise<Batch | null>;
  getBatches(options?: QueryOptions): Promise<QueryResult<Batch>>;
  createBatch(batch: Omit<Batch, 'id' | 'createdAt'>): Promise<Batch>;
  updateBatch(id: string, updates: Partial<Batch>): Promise<Batch>;

  // Validation
  validateSignature(name: string, address: string, city: string, zip: string): Promise<ValidationResult>;
}

// Factory function type for creating database adapters
export type DatabaseAdapterFactory = (config: DatabaseConfig) => DatabaseAdapter;
