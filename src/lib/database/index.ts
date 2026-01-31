// Database abstraction layer - single entry point
// To implement a new database, create an adapter and update this file

import type { DatabaseAdapter, DatabaseConfig } from './types';
import { createMockAdapter } from './mock-adapter';

export * from './types';
export { createMockAdapter } from './mock-adapter';

// Current database configuration
// MODIFY THIS to change database backends
const currentConfig: DatabaseConfig = {
  type: 'mock',
  // Add your configuration here when switching databases:
  // connectionString: 'your-connection-string',
  // apiKey: 'your-api-key',
};

let currentAdapter: DatabaseAdapter | null = null;

/**
 * Get the current database adapter
 * This is the main function you'll use throughout the app
 */
export function getDatabase(): DatabaseAdapter {
  if (!currentAdapter) {
    currentAdapter = createDatabaseAdapter(currentConfig);
  }
  return currentAdapter;
}

/**
 * Create a database adapter based on configuration
 * Add new database types here
 */
export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.type) {
    case 'mock':
      return createMockAdapter(config);
    
    // ========================================
    // ADD YOUR DATABASE IMPLEMENTATIONS HERE
    // ========================================
    
    // case 'supabase':
    //   return createSupabaseAdapter(config);
    
    // case 'firebase':
    //   return createFirebaseAdapter(config);
    
    // case 'postgresql':
    //   return createPostgresAdapter(config);
    
    // case 'mongodb':
    //   return createMongoAdapter(config);
    
    default:
      console.warn(`Unknown database type: ${config.type}, falling back to mock`);
      return createMockAdapter(config);
  }
}

/**
 * Initialize the database connection
 * Call this at app startup
 */
export async function initDatabase(): Promise<void> {
  const db = getDatabase();
  await db.connect();
}

/**
 * Close database connection
 * Call this on app shutdown
 */
export async function closeDatabase(): Promise<void> {
  if (currentAdapter) {
    await currentAdapter.disconnect();
    currentAdapter = null;
  }
}

// ==========================================
// IMPLEMENTATION GUIDE
// ==========================================
// 
// To add a new database (e.g., Supabase):
// 
// 1. Create a new file: src/lib/database/supabase-adapter.ts
// 
// 2. Implement the DatabaseAdapter interface:
//    export function createSupabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
//      const supabase = createClient(config.connectionString!, config.apiKey!);
//      return {
//        async connect() { /* ... */ },
//        async getUser(id) { /* ... */ },
//        // ... implement all methods
//      };
//    }
// 
// 3. Import and add to the switch statement above
// 
// 4. Update currentConfig with your credentials
// 
// That's it! The rest of the app will use your new database.
// ==========================================
