/**
 * Database Connection Singleton
 * 
 * Uses raw PostgreSQL connection via pg package
 * This avoids Prisma 7.4.0 module resolution issues
 * 
 * Usage in API routes:
 * import { query, queryOne, queryAll } from '@/lib/db'
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId])
 */

import { Pool, QueryResult } from 'pg'

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

/**
 * Execute a SQL query
 * @param text - SQL query string with $1, $2, etc. for parameters
 * @param values - Array of parameter values
 * @returns Query result
 */
export async function query(text: string, values?: any[]): Promise<QueryResult> {
  const start = Date.now()
  try {
    const result = await pool.query(text, values)
    const duration = Date.now() - start
    
    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount })
    }
    
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Get a single row from a query
 * @param text - SQL query string
 * @param values - Array of parameter values
 * @returns Single row or null
 */
export async function queryOne<T = any>(text: string, values?: any[]): Promise<T | null> {
  const result = await query(text, values)
  return result.rows[0] || null
}

/**
 * Get all rows from a query
 * @param text - SQL query string
 * @param values - Array of parameter values
 * @returns Array of rows
 */
export async function queryAll<T = any>(text: string, values?: any[]): Promise<T[]> {
  const result = await query(text, values)
  return result.rows
}

/**
 * Execute a query and return the number of affected rows
 * @param text - SQL query string
 * @param values - Array of parameter values
 * @returns Number of affected rows
 */
export async function execute(text: string, values?: any[]): Promise<number> {
  const result = await query(text, values)
  return result.rowCount || 0
}

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  await pool.end()
}

export { pool }
