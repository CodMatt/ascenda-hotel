// server/utils/fetchWithRetry.ts 
export async function fetchWithRetry(url: string, maxAttempts = 15, delayMs = 1500): Promise<any> {
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
        console.log(`Attempt ${attempt} - Retrieved ${hotelCount} hotels`);
  
        // If at least one hotel is found, return the data immediately
        if (hotelCount > 0) return data;
      } catch (err) {
        console.warn(`Attempt ${attempt} - Fetch error:`, err);
      }

      // Wait before the next attempt
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // All attempts exhausted, return fallback empty result
    console.warn("All fetch attempts completed without results.");
    return { hotels: [], completed: true };
  }
  