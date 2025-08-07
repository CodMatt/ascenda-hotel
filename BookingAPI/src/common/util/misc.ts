
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
