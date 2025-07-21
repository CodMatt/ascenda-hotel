// call both api via express backend
const HOTEL_API = 'http://localhost:4000/api/hotels';

export async function fetchHotelPrices(destinationId: string, checkin: string, checkout: string, guests: string) {
  const url = `${HOTEL_API}/prices?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch hotel prices");
  return res.json();
}

export async function fetchHotelsByDestination(destinationId: string) {
  const url = `${HOTEL_API}?destination_id=${destinationId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch hotel list");
  return res.json();
}
