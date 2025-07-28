const HOTEL_API = 'http://localhost:4000/api/hotels';

export async function fetchHotels(
  destinationId: string,
  checkin: string,
  checkout: string,
  guests: string
) {
  const url = `${HOTEL_API}/search?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch merged hotel data");

  return res.json(); // returns: { hotels: [...], completed, destination_id, etc. }
}
