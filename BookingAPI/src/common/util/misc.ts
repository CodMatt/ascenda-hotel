import { isAwaitKeyword } from 'typescript';
import db from '../../models/db'
/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get a random number between 1 and 1,000,000,000,000
 */
export function getRandomInt(): number {
  return Math.floor(Math.random() * 1_000_000_000_000);
}


export async function fetchWithRetry(
  url: string,
  maxAttempts = 15,
  delayMs = 2000
): Promise<any> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Attempt ${attempt}/${maxAttempts} - Fetching: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Request failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      const hotelCount = data?.hotels?.length ?? 0;
      const isCompleted = data?.completed ?? false;

      console.log(`Attempt ${attempt} - completed: ${isCompleted}, hotels: ${hotelCount}`);

      // Only return when API explicitly says it's completed
      if (isCompleted) {
        return data; // Can be empty or filled — both are valid if completed = true
      }
    } catch (err) {
      console.warn(`Attempt ${attempt} - Fetch error:`, err);
    }

    // Wait before the next attempt
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // All attempts exhausted, fallback
  console.warn("All fetch attempts completed without completed: true");
  return { hotels: [], completed: false };
}

// export async function atomicTransaction<T>(operation: (client:any)=> Promise<T>):Promise<T>{
//   const client = await db.getPool().connect()
//   try{
//     await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
//     const result = await operation(client);
//     await client.query('COMMIT');
//     return result;
//   }
//   catch(error){
//     await client.query('ROLLBACK');
//     throw error;
//   } finally{
//     client.release();
//   }
// }


export async function atomicTransaction<T>(
  operation: (client: any) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    const client = await db.getPool().connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      
      // Check if it's a serialization failure
      if (error.code === '40001' || error.message.includes('could not serialize access')) {
        retryCount++;
        if (retryCount >= maxRetries) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount)));
        continue;
      }
      
      throw error;
    } finally {
      client.release();
    }
  }
  
  throw new Error('Max retries exceeded');
}