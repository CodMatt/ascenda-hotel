import { Pool, PoolClient } from 'pg';  // Correct import from 'pg'
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ce3q1',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

class Database {
  private static pool: Pool;

  static initialize() {
    this.pool = new Pool(dbConfig);
    
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
    
    console.log('PostgreSQL connection pool created');
  }

  static getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  static async testConnection() {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('SELECT 1');
      console.log('PostgreSQL connection test successful');
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    } finally {
      if (client) client.release();
    }
  }
}

export default Database;